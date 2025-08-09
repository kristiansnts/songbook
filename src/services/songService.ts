import { Song, CreateSongRequest, UpdateSongRequest, SongFilters, SongListResponse } from '@/types/song'

const BASE_URL = 'https://songbanks-v1-1.vercel.app/api'

export class SongService {
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
        return result.data.map(this.transformSongData)
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Error fetching songs:', error)
      throw error
    }
  }

  async getSong(id: string): Promise<Song> {
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
        return this.transformSongData(result.data)
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Error fetching song:', error)
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
      return this.transformSongData(result)
    } catch (error) {
      console.error('Error creating song:', error)
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
      return this.transformSongData(result)
    } catch (error) {
      console.error('Error updating song:', error)
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
    } catch (error) {
      console.error('Error deleting song:', error)
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