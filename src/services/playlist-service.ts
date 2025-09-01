import { Playlist, CreatePlaylistRequest, UpdatePlaylistRequest, PlaylistFilters } from '@/types/playlist'
import { Song } from '@/types/song'
import { songService } from './songService'

const BASE_URL = 'https://songbanks-v1-1.vercel.app/api'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CachedResponse<T> {
  data: T
  timestamp: number
  key: string
}

export class PlaylistService {
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

  async getAllPlaylists(filters?: PlaylistFilters): Promise<Playlist[]> {
    const cacheKey = PlaylistService.getCacheKey('getAllPlaylists', filters)
    
    // Try cache first
    const cachedResult = PlaylistService.getFromCache<Playlist[]>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const url = new URL(`${BASE_URL}/playlists`)
      
      if (filters?.search && filters.search.trim()) {
        url.searchParams.set('search', filters.search.trim())
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch playlists: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        // Get all songs to calculate song counts
        const allSongs = await songService.getAllSongs()
        
        const playlists = await Promise.all(
          result.data.map(async (playlist: any) => this.transformPlaylistData(playlist, allSongs))
        )
        
        // Cache the result
        PlaylistService.setCache(cacheKey, playlists)
        
        return playlists
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching playlists:', error)
      throw error
    }
  }

  async getPlaylist(id: string): Promise<Playlist> {
    const cacheKey = PlaylistService.getCacheKey('getPlaylist', { id })
    
    // Try cache first
    const cachedResult = PlaylistService.getFromCache<Playlist>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const response = await fetch(`${BASE_URL}/playlists/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        // Get all songs to calculate song count
        const allSongs = await songService.getAllSongs()
        const playlist = this.transformPlaylistData(result.data, allSongs)
        
        // Cache the result
        PlaylistService.setCache(cacheKey, playlist)
        
        return playlist
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching playlist:', error)
      throw error
    }
  }

  async createPlaylist(data: CreatePlaylistRequest): Promise<Playlist> {
    try {
      const response = await fetch(`${BASE_URL}/playlists`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create playlist: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if ((result.code === 200 || result.code === 201) && result.data) {
        const allSongs = await songService.getAllSongs()
        const newPlaylist = this.transformPlaylistData(result.data, allSongs)
        
        // Invalidate relevant caches
        PlaylistService.clearCacheByPattern('getAllPlaylists')
        
        return newPlaylist
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error creating playlist:', error)
      throw error
    }
  }

  async updatePlaylist(id: string, data: UpdatePlaylistRequest): Promise<Playlist> {
    try {
      const response = await fetch(`${BASE_URL}/playlists/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update playlist: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const allSongs = await songService.getAllSongs()
      const updatedPlaylist = this.transformPlaylistData(result, allSongs)
      
      // Invalidate relevant caches
      PlaylistService.clearCacheByPattern('getAllPlaylists')
      PlaylistService.clearCacheByPattern(`getPlaylist:{"id":"${id}"}`)
      
      return updatedPlaylist
    } catch (error) {
      console.warn('Error updating playlist:', error)
      throw error
    }
  }

  async deletePlaylist(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete playlist: ${response.status} - ${errorText}`)
      }
      
      // Invalidate relevant caches
      PlaylistService.clearCacheByPattern('getAllPlaylists')
      PlaylistService.clearCacheByPattern(`getPlaylist:{"id":"${id}"}`)
    } catch (error) {
      console.warn('Error deleting playlist:', error)
      throw error
    }
  }

  async getPlaylistSongs(playlistId: string): Promise<Song[]> {
    // Get playlist data which includes songs
    const playlist = await this.getPlaylist(playlistId)
    return playlist.songs || []
  }

  async addSongsToPlaylist(playlistId: string, songIds: number[]): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ songIds }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add songs to playlist: ${response.status} - ${errorText}`)
      }
      
      // Invalidate relevant caches
      PlaylistService.clearCacheByPattern('getAllPlaylists')
      PlaylistService.clearCacheByPattern(`getPlaylist:{"id":"${playlistId}"}`)
      PlaylistService.clearCacheByPattern(`getPlaylistSongs:{"id":"${playlistId}"}`)
    } catch (error) {
      console.warn('Error adding songs to playlist:', error)
      throw error
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/playlists/${playlistId}/song/${songId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to remove song from playlist: ${response.status} - ${errorText}`)
      }
      
      // Invalidate relevant caches
      PlaylistService.clearCacheByPattern('getAllPlaylists')
      PlaylistService.clearCacheByPattern(`getPlaylist:{"id":"${playlistId}"}`)
      PlaylistService.clearCacheByPattern(`getPlaylistSongs:{"id":"${playlistId}"}`)
    } catch (error) {
      console.warn('Error removing song from playlist:', error)
      throw error
    }
  }

  async createShareLink(playlistId: string): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/playlists/${playlistId}/sharelink`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: '',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create share link: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if ((result.code === 200 || result.code === 201) && result.data?.sharable_link) {
        // Invalidate playlist cache to refresh share link data
        PlaylistService.clearCacheByPattern(`getPlaylist:{"id":"${playlistId}"}`)
        return result.data.sharable_link
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error creating share link:', error)
      throw error
    }
  }

  async joinPlaylist(shareToken: string): Promise<void> {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('AUTHENTICATION_REQUIRED')
    }

    try {
      const response = await fetch(`${BASE_URL}/playlists/join/${shareToken}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: '',
      })

      if (!response.ok) {
        const errorText = await response.text()
        
        // Check if user is the owner of the playlist
        if (response.status === 409 || errorText.includes('owner')) {
          throw new Error('PLAYLIST_OWNER')
        }
        
        throw new Error(`Failed to join playlist: ${response.status} - ${errorText}`)
      }
      
      // Invalidate all playlists cache to refresh with newly joined playlist
      PlaylistService.clearCacheByPattern('getAllPlaylists')
    } catch (error) {
      console.warn('Error joining playlist:', error)
      throw error
    }
  }

  async getPlaylistTeams(): Promise<any[]> {
    const cacheKey = PlaylistService.getCacheKey('getPlaylistTeams')
    
    // Try cache first
    const cachedResult = PlaylistService.getFromCache<any[]>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const response = await fetch(`${BASE_URL}/playlist-teams`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch playlist teams: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        // Cache the result
        PlaylistService.setCache(cacheKey, result.data)
        return result.data
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching playlist teams:', error)
      // Return empty array on error to avoid breaking the UI
      return []
    }
  }

  async getPlaylistTeamDetails(teamId: string): Promise<any> {
    const cacheKey = PlaylistService.getCacheKey('getPlaylistTeamDetails', { teamId })
    
    // Try cache first
    const cachedResult = PlaylistService.getFromCache<any>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const response = await fetch(`${BASE_URL}/playlist-teams/${teamId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch playlist team details: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        // Cache the result
        PlaylistService.setCache(cacheKey, result.data)
        return result.data
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching playlist team details:', error)
      return null
    }
  }

  async removeMemberFromPlaylist(teamId: string, memberId: number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/playlist-teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to remove member: ${response.status} - ${errorText}`)
      }
      
      // Invalidate playlist teams cache
      PlaylistService.clearCacheByPattern('getPlaylistTeams')
      PlaylistService.clearCacheByPattern('getPlaylistTeamDetails')
    } catch (error) {
      console.warn('Error removing member from playlist:', error)
      throw error
    }
  }

  async deletePlaylistTeam(teamId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/playlist-teams/${teamId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete team: ${response.status} - ${errorText}`)
      }
      
      // Invalidate relevant caches
      PlaylistService.clearCacheByPattern('getPlaylistTeams')
      PlaylistService.clearCacheByPattern('getPlaylistTeamDetails')
    } catch (error) {
      console.warn('Error deleting playlist team:', error)
      throw error
    }
  }

  private transformPlaylistData(playlist: any, _allSongs: any[]): Playlist {
    // Handle songs array - can be full song objects or just IDs
    let songCount = 0
    let songs: Song[] = []
    
    // Handle songs as JSON string (API format for some endpoints)
    if (playlist.songs && typeof playlist.songs === 'string') {
      try {
        const parsedSongs = JSON.parse(playlist.songs)
        if (Array.isArray(parsedSongs)) {
          songs = parsedSongs.map((song: any) => 
            typeof song === 'object' ? this.transformSongData(song) : song
          )
          songCount = songs.length
        }
      } catch (error) {
        console.warn('Failed to parse playlist songs:', error)
      }
    } else if (playlist.songs && Array.isArray(playlist.songs)) {
      // Handle songs as array of objects (detailed playlist API response)
      songs = playlist.songs.map((song: any) => 
        typeof song === 'object' ? this.transformSongData(song) : song
      )
      songCount = songs.length
    }
    
    // Use songs_count from API if available, otherwise use calculated count
    if (playlist.songs_count !== undefined) {
      songCount = playlist.songs_count
    }

    return {
      id: playlist.id?.toString() || Math.random().toString(36).substr(2, 9),
      name: playlist.playlist_name || playlist.name || 'Untitled Playlist',
      songCount,
      songs,
      created_at: playlist.createdAt || playlist.created_at,
      updated_at: playlist.updatedAt || playlist.updated_at,
      access_type: playlist.access_type,
      sharable_link: playlist.sharable_link,
      share_token: playlist.share_token,
      is_shared: playlist.is_shared,
      is_locked: playlist.is_locked,
      playlist_team_id: playlist.playlist_team_id,
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

export const playlistService = new PlaylistService()