import { Song } from '../data/schema'
import { songs as defaultSongs } from '../data/songs'

// TODO: This service is deprecated - use songService from @/services/songService.ts instead
// Keeping minimal implementation for backward compatibility
export class SongsService {
  /**
   * @deprecated Use songService.getAllSongs() instead
   * Get all songs - returns default data for backward compatibility
   */
  static getSongs(): Song[] {
    return defaultSongs
  }

  /**
   * @deprecated This method is no longer used - backend handles persistence
   */
  static saveSongs(_songs: Song[]): void {
    // No-op - backend handles persistence now
  }

  /**
   * @deprecated Use songService.createSong() instead
   */
  static addSong(songData: Omit<Song, 'id'>): Song {
    const newSong: Song = {
      ...songData,
      id: `SONG-${Date.now()}`, // Simple ID generation for development
    }

    return newSong
  }

  /**
   * @deprecated Use songService.updateSong() instead
   */
  static updateSong(id: string, songData: Partial<Song>): Song | null {
    const songs = this.getSongs()
    const song = songs.find((song) => song.id === id)

    if (!song) {
      return null
    }

    return { ...song, ...songData }
  }

  /**
   * @deprecated Use songService.deleteSong() instead
   */
  static deleteSong(id: string): boolean {
    const songs = this.getSongs()
    return songs.some((song) => song.id === id)
  }

  /**
   * Get a single song by ID
   */
  static getSongById(id: string): Song | null {
    const songs = this.getSongs()
    return songs.find((song) => song.id === id) || null
  }

  /**
   * Get multiple songs by IDs
   */
  static getSongsByIds(ids: string[]): Song[] {
    const songs = this.getSongs()
    return songs.filter((song) => ids.includes(song.id))
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
      const numericIds = songIds
        .map((id) => {
          // Handle both string and numeric IDs
          const numId = parseInt(id, 10)
          if (isNaN(numId)) {
            // For string IDs like "SONG-123", extract the numeric part
            const match = id.match(/\d+/)
            return match ? parseInt(match[0], 10) : 0
          }
          return numId
        })
        .filter((id) => id > 0)

      if (baseChord) {
        // Add songs with specific chord for each
        for (const songId of numericIds) {
          await playlistService.addSongToPlaylistWithChord(
            playlistId,
            songId,
            baseChord
          )
        }
      } else {
        // Add songs with their original chords - get each song's base chord
        const songObjects = this.getSongsByIds(songIds)
        for (let i = 0; i < numericIds.length; i++) {
          const songId = numericIds[i]
          const song = songObjects.find((s) => {
            const songNumId = parseInt(s.id.replace('SONG-', ''), 10)
            return songNumId === songId || parseInt(s.id, 10) === songId
          })
          const originalChord = song?.baseChord || 'C' // Fallback to C if no chord found
          await playlistService.addSongToPlaylistWithChord(
            playlistId,
            songId,
            originalChord
          )
        }
      }

      return true
    } catch (error: any) {
      // Re-throw plan limit errors so they can be caught by the caller
      if (error.name === 'PLAN_LIMIT_EXCEEDED') {
        throw error
      }
      // eslint-disable-next-line no-console
      console.error('Error adding multiple songs to playlist:', error)
      return false
    }
  }
}
