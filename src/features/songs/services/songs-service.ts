import { Song } from '../data/schema'
import { songs as defaultSongs } from '../data/songs'

const SONGS_STORAGE_KEY = 'songbook_songs'

// TODO: Will implement add to database when backend is ready
export class SongsService {
  /**
   * Get all songs from localStorage, fallback to default data
   */
  static getSongs(): Song[] {
    try {
      const stored = localStorage.getItem(SONGS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      // If no stored data, initialize with default songs
      this.saveSongs(defaultSongs)
      return defaultSongs
    } catch (_error) {
      // Error reading from localStorage, fallback to default songs
      return defaultSongs
    }
  }

  /**
   * Save songs array to localStorage
   */
  static saveSongs(songs: Song[]): void {
    try {
      localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs))
    } catch (_error) {
      // Error saving to localStorage, silently fail in development
    }
  }

  /**
   * Add a new song
   */
  static addSong(songData: Omit<Song, 'id'>): Song {
    const songs = this.getSongs()
    const newSong: Song = {
      ...songData,
      id: `SONG-${Date.now()}` // Simple ID generation for development
    }
    
    const updatedSongs = [...songs, newSong]
    this.saveSongs(updatedSongs)
    
    return newSong
  }

  /**
   * Update an existing song
   */
  static updateSong(id: string, songData: Partial<Song>): Song | null {
    const songs = this.getSongs()
    const songIndex = songs.findIndex(song => song.id === id)
    
    if (songIndex === -1) {
      return null
    }

    const updatedSong = { ...songs[songIndex], ...songData }
    songs[songIndex] = updatedSong
    
    this.saveSongs(songs)
    return updatedSong
  }

  /**
   * Delete a song
   */
  static deleteSong(id: string): boolean {
    const songs = this.getSongs()
    const filteredSongs = songs.filter(song => song.id !== id)
    
    if (filteredSongs.length === songs.length) {
      return false // Song not found
    }
    
    this.saveSongs(filteredSongs)
    return true
  }

  /**
   * Get a single song by ID
   */
  static getSongById(id: string): Song | null {
    const songs = this.getSongs()
    return songs.find(song => song.id === id) || null
  }

  /**
   * Get multiple songs by IDs
   */
  static getSongsByIds(ids: string[]): Song[] {
    const songs = this.getSongs()
    return songs.filter(song => ids.includes(song.id))
  }

  /**
   * Add multiple songs to a playlist
   * This method integrates with the playlist service
   */
  static async addMultipleSongsToPlaylist(
    songIds: string[], 
    playlistId: string, 
    baseChord?: string
  ): Promise<boolean> {
    try {
      // Import dynamically to avoid circular dependencies
      const { playlistService } = await import('@/services/playlist-service')
      
      // Convert string IDs to numbers for the API
      const numericIds = songIds.map(id => {
        // Handle both string and numeric IDs
        const numId = parseInt(id, 10)
        if (isNaN(numId)) {
          // For string IDs like "SONG-123", extract the numeric part
          const match = id.match(/\d+/)
          return match ? parseInt(match[0], 10) : 0
        }
        return numId
      }).filter(id => id > 0)
      
      if (baseChord) {
        // Add songs with specific chord for each
        for (const songId of numericIds) {
          await playlistService.addSongToPlaylistWithChord(playlistId, songId, baseChord)
        }
      } else {
        // Add songs with their original chords - get each song's base chord
        const songObjects = this.getSongsByIds(songIds)
        for (let i = 0; i < numericIds.length; i++) {
          const songId = numericIds[i]
          const song = songObjects.find(s => {
            const songNumId = parseInt(s.id.replace('SONG-', ''), 10)
            return songNumId === songId || parseInt(s.id, 10) === songId
          })
          const originalChord = song?.baseChord || 'C' // Fallback to C if no chord found
          await playlistService.addSongToPlaylistWithChord(playlistId, songId, originalChord)
        }
      }
      
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding multiple songs to playlist:', error)
      return false
    }
  }
}