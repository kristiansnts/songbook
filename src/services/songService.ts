import { Song, CreateSongRequest, UpdateSongRequest, SongFilters, SongListResponse } from '@/types/song'

const BASE_URL = 'https://songbanks-v1-1.vercel.app/api'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const ALL_SONGS_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours for all songs cache

interface CachedResponse<T> {
  data: T
  timestamp: number
  key: string
}

export class SongService {
  private static cache = new Map<string, CachedResponse<any>>()
  private static allSongsCache: SongListResponse | null = null
  private static allSongsCacheTimestamp: number = 0

  private static isExpired(cachedItem: CachedResponse<any>, customDuration?: number): boolean {
    const duration = customDuration || CACHE_DURATION
    return Date.now() - cachedItem.timestamp > duration
  }

  private static getCacheKey(method: string, params?: any): string {
    return `${method}:${JSON.stringify(params || {})}`
  }

  private static getFromCache<T>(key: string, customDuration?: number): T | null {
    const cached = this.cache.get(key)
    if (cached && !this.isExpired(cached, customDuration)) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key) // Remove expired cache
    }
    return null
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    })
  }

  private static clearCacheByPattern(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  public static clearAllCache(): void {
    this.cache.clear()
  }

  public static clearSongsCache(): void {
    // Clear all song-related caches when user logs in
    for (const [key] of this.cache) {
      if (key.includes('getAllSongs') || key.includes('getSong')) {
        this.cache.delete(key)
      }
    }

    // Clear the special all-songs cache
    this.allSongsCache = null
    this.allSongsCacheTimestamp = 0

    // Clear from localStorage too
    if (typeof window !== 'undefined') {
      localStorage.removeItem('allSongsCache')
      localStorage.removeItem('allSongsCacheTimestamp')
    }

    console.log('🎵 Songs cache cleared on login')
  }

  private static getAllSongsFromCache(): SongListResponse | null {
    // Check memory cache first
    if (this.allSongsCache && this.allSongsCacheTimestamp) {
      const isExpired = Date.now() - this.allSongsCacheTimestamp > ALL_SONGS_CACHE_DURATION
      if (!isExpired) {
        console.log('🎵 Using memory cached all songs')
        return this.allSongsCache
      }
    }

    // Check localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem('allSongsCache')
        const cachedTimestamp = localStorage.getItem('allSongsCacheTimestamp')

        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp)
          const isExpired = Date.now() - timestamp > ALL_SONGS_CACHE_DURATION

          if (!isExpired) {
            const parsedData = JSON.parse(cachedData)
            // Also update memory cache
            this.allSongsCache = parsedData
            this.allSongsCacheTimestamp = timestamp
            console.log('🎵 Using localStorage cached all songs')
            return parsedData
          }
        }
      } catch (error) {
        console.warn('Error reading from localStorage cache:', error)
      }
    }

    return null
  }

  private static setAllSongsCache(data: SongListResponse): void {
    const timestamp = Date.now()

    // Set memory cache
    this.allSongsCache = data
    this.allSongsCacheTimestamp = timestamp

    // Set localStorage cache (only if data is not too large)
    if (typeof window !== 'undefined') {
      try {
        const dataSize = JSON.stringify(data).length
        // Only cache in localStorage if less than 2MB to avoid performance issues
        if (dataSize < 2 * 1024 * 1024) {
          localStorage.setItem('allSongsCache', JSON.stringify(data))
          localStorage.setItem('allSongsCacheTimestamp', timestamp.toString())
          console.log(`🎵 All songs cached (${Math.round(dataSize / 1024)}KB)`)
        } else {
          console.log('🎵 All songs cached in memory only (too large for localStorage)')
        }
      } catch (error) {
        console.warn('Error writing to localStorage cache:', error)
      }
    }
  }

  private getAuthToken(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return localStorage.getItem('token') || ''
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async getAllSongs(filters?: SongFilters): Promise<SongListResponse> {
    // Check if this is a request for all songs (large limit, no pagination)
    const isAllSongsRequest = filters?.limit && filters.limit >= 1000

    // Define cacheKey for regular requests
    const cacheKey = !isAllSongsRequest ? SongService.getCacheKey('getAllSongs', filters) : null

    if (isAllSongsRequest) {
      // For all-songs requests, use special cache and do client-side filtering
      const cachedAllSongs = SongService.getAllSongsFromCache()
      if (cachedAllSongs) {
        // Apply client-side filtering to cached data
        return this.filterSongsClientSide(cachedAllSongs, filters)
      }
    } else {
      // For regular requests, use normal cache
      const cachedResult = SongService.getFromCache<SongListResponse>(cacheKey!, CACHE_DURATION)
      if (cachedResult) {
        console.log('🎵 Using cached filtered songs data')
        return cachedResult
      }
    }

    try {
      console.log(`🎵 Fetching ${isAllSongsRequest ? 'all songs' : 'songs'} from API`)
      const url = new URL(`${BASE_URL}/songs`)

      if (filters?.search && filters.search.trim()) {
        url.searchParams.set('search', filters.search.trim())
      }
      if (filters?.base_chord) {
        url.searchParams.set('base_chord', filters.base_chord)
      }
      if (filters?.tag_ids) {
        url.searchParams.set('tag_ids', filters.tag_ids)
      }
      if (filters?.page) {
        url.searchParams.set('page', filters.page.toString())
      }
      if (filters?.limit) {
        url.searchParams.set('limit', filters.limit.toString())
      }
      if (filters?.sort_by) {
        url.searchParams.set('sort_by', filters.sort_by)
      }
      if (filters?.sort_order) {
        url.searchParams.set('sort_order', filters.sort_order)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.status}`)
      }

      const result = await response.json()

      if (result.code === 200 && Array.isArray(result.data)) {
        const songs = result.data.map(this.transformSongData)

        // Create pagination metadata from response
        const pagination = {
          currentPage: result.pagination?.currentPage || filters?.page || 1,
          totalPages: result.pagination?.totalPages || 1,
          totalItems: result.pagination?.totalItems || songs.length,
          itemsPerPage: result.pagination?.itemsPerPage || filters?.limit || 10,
          hasNextPage: result.pagination?.hasNextPage || false,
          hasPrevPage: result.pagination?.hasPrevPage || false,
        }

        const response_data: SongListResponse = {
          data: songs,
          pagination
        }

        // Cache the result
        if (isAllSongsRequest) {
          // Cache all songs in special cache
          SongService.setAllSongsCache(response_data)
          // Also apply any filters and return filtered result
          return this.filterSongsClientSide(response_data, filters)
        } else {
          // Cache filtered result normally
          if (cacheKey) {
            SongService.setCache(cacheKey, response_data)
          }
        }

        return response_data
      }

      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching songs:', error)
      throw error
    }
  }

  async getSong(id: string): Promise<Song> {
    const cacheKey = SongService.getCacheKey('getSong', { id })
    
    // Try cache first
    const cachedResult = SongService.getFromCache<Song>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const response = await fetch(`${BASE_URL}/songs/${id}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch song: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        const song = this.transformSongData(result.data)
        
        // Cache the result
        SongService.setCache(cacheKey, song)
        
        return song
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching song:', error)
      throw error
    }
  }

  async createSong(data: CreateSongRequest): Promise<Song> {
    try {
      const response = await fetch(`${BASE_URL}/admin/songs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create song: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const newSong = this.transformSongData(result)
      
      // Invalidate relevant caches
      SongService.clearCacheByPattern('getAllSongs')
      SongService.clearCacheByPattern('getSongCount')
      this.invalidateDashboardCache()
      
      return newSong
    } catch (error) {
      console.warn('Error creating song:', error)
      throw error
    }
  }

  async updateSong(id: string, data: UpdateSongRequest): Promise<Song> {
    try {
      const response = await fetch(`${BASE_URL}/admin/songs/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update song: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const updatedSong = this.transformSongData(result)

      // Invalidate relevant caches
      SongService.clearCacheByPattern('getAllSongs')
      SongService.clearCacheByPattern('getSongCount')
      SongService.clearCacheByPattern(`getSong:{"id":"${id}"}`)
      this.invalidateDashboardCache()

      return updatedSong
    } catch (error) {
      console.warn('Error updating song:', error)
      throw error
    }
  }

  async deleteSong(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/admin/songs/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete song: ${response.status} - ${errorText}`)
      }
      
      // Invalidate relevant caches
      SongService.clearCacheByPattern('getAllSongs')
      SongService.clearCacheByPattern('getSongCount')
      SongService.clearCacheByPattern(`getSong:{"id":"${id}"}`)
      this.invalidateDashboardCache()
    } catch (error) {
      console.warn('Error deleting song:', error)
      throw error
    }
  }

  async searchSongs(query: string, baseChord?: string, tagIds?: string): Promise<SongListResponse> {
    const filters: SongFilters = {
      search: query,
      ...(baseChord && { base_chord: baseChord }),
      ...(tagIds && { tag_ids: tagIds }),
    }

    return this.getAllSongs(filters)
  }

  async getSongCount(filters?: Omit<SongFilters, 'page' | 'limit'>): Promise<number> {
    try {
      // Use the existing getAllSongs with minimal data to get totalItems from pagination
      const response = await this.getAllSongs({
        page: 1,
        limit: 1,
        ...filters
      })

      return response.pagination.totalItems
    } catch (error) {
      console.warn('Error fetching song count:', error)
      throw error
    }
  }

  private invalidateDashboardCache(): void {
    // Clear dashboard cache by dispatching custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invalidate-dashboard-cache'))
    }
  }

  private filterSongsClientSide(allSongs: SongListResponse, filters?: SongFilters): SongListResponse {
    let filteredSongs = [...allSongs.data]

    // Apply search filter
    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase()
      filteredSongs = filteredSongs.filter(song =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.some(artist => artist.toLowerCase().includes(searchTerm)) ||
        song.lyrics_and_chords.toLowerCase().includes(searchTerm)
      )
    }

    // Apply chord filter
    if (filters?.base_chord) {
      filteredSongs = filteredSongs.filter(song => song.base_chord === filters.base_chord)
    }

    // Apply sorting
    if (filters?.sort_by) {
      filteredSongs.sort((a, b) => {
        let valueA: string, valueB: string

        if (filters.sort_by === 'title') {
          valueA = a.title.toLowerCase()
          valueB = b.title.toLowerCase()
        } else if (filters.sort_by === 'base_chord') {
          valueA = a.base_chord
          valueB = b.base_chord
        } else {
          return 0
        }

        if (filters.sort_order === 'desc') {
          return valueB.localeCompare(valueA)
        } else {
          return valueA.localeCompare(valueB)
        }
      })
    }

    console.log(`🎵 Client-side filtered: ${filteredSongs.length} songs from ${allSongs.data.length} cached songs`)

    // Return filtered result with updated pagination
    return {
      data: filteredSongs,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: filteredSongs.length,
        itemsPerPage: filteredSongs.length,
        hasNextPage: false,
        hasPrevPage: false,
      }
    }
  }

  private transformSongData(song: any): Song {
    let artists: string[] = ['Unknown Artist']

    if (song.artist) {
      try {
        // Try to parse as JSON array if it's a string
        if (typeof song.artist === 'string') {
          const parsed = JSON.parse(song.artist)
          if (Array.isArray(parsed)) {
            artists = parsed
          } else {
            artists = [song.artist]
          }
        } else if (Array.isArray(song.artist)) {
          artists = song.artist
        } else {
          artists = [String(song.artist)]
        }
      } catch {
        // If JSON parsing fails, treat as single artist
        artists = [song.artist]
      }
    }

    return {
      id: song.id,
      title: song.title || 'Untitled',
      artist: artists,
      base_chord: song.base_chord || 'C',
      lyrics_and_chords: song.lyrics_and_chords || '',
      tag_names: Array.isArray(song.tags) ? song.tags.map((tag: any) => tag.name) : [],
      created_at: song.createdAt,
      updated_at: song.updatedAt,
    }
  }
}

export const songService = new SongService()