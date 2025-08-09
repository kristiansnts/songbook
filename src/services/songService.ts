import { Song, CreateSongRequest, UpdateSongRequest, SongFilters } from '@/types/song'

const BASE_URL = 'https://songbanks-v1-1.vercel.app/api'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CachedResponse<T> {
  data: T
  timestamp: number
  key: string
}

export class SongService {
  private static cache = new Map<string, CachedResponse<any>>()

  private static isExpired(cachedItem: CachedResponse<any>): boolean {
    return Date.now() - cachedItem.timestamp > CACHE_DURATION
  }

  private static getCacheKey(method: string, params?: any): string {
    return `${method}:${JSON.stringify(params || {})}`
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && !this.isExpired(cached)) {
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

  async getAllSongs(filters?: SongFilters): Promise<Song[]> {
    const cacheKey = SongService.getCacheKey('getAllSongs', filters)
    
    // Try cache first
    const cachedResult = SongService.getFromCache<Song[]>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
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
        
        // Cache the result
        SongService.setCache(cacheKey, songs)
        
        return songs
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
      SongService.clearCacheByPattern(`getSong:{"id":"${id}"}`)
      this.invalidateDashboardCache()
    } catch (error) {
      console.warn('Error deleting song:', error)
      throw error
    }
  }

  async searchSongs(query: string, baseChord?: string, tagIds?: string): Promise<Song[]> {
    const filters: SongFilters = {
      search: query,
      ...(baseChord && { base_chord: baseChord }),
      ...(tagIds && { tag_ids: tagIds }),
    }
    
    return this.getAllSongs(filters)
  }

  private invalidateDashboardCache(): void {
    // Clear dashboard cache by dispatching custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invalidate-dashboard-cache'))
    }
  }

  private transformSongData(song: any): Song {
    return {
      id: song.id,
      title: song.title || 'Untitled',
      artist: song.artist || 'Unknown Artist',
      base_chord: song.base_chord || 'C',
      lyrics_and_chords: song.lyrics_and_chords || '',
      tag_names: Array.isArray(song.tags) ? song.tags.map((tag: any) => tag.name) : [],
      created_at: song.createdAt,
      updated_at: song.updatedAt,
    }
  }
}

export const songService = new SongService()