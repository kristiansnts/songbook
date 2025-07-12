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
}