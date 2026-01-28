import { Song } from './song'

export interface Playlist {
  id: string
  name?: string
  playlist_name?: string
  songCount?: number
  songs?: Song[] // Array of full song objects
  playlist_notes?: Array<{ song_id: number; base_chord: string }> // Notes for each song
  created_at?: string
  updated_at?: string
  access_type?: string
  sharable_link?: string
  share_token?: string
  is_shared?: boolean
  is_locked?: boolean
  playlist_team_id?: number
}

export interface CreatePlaylistRequest {
  playlist_name: string
  songs?: string[]
}

export interface UpdatePlaylistRequest {
  name: string
  songs?: number[]
}

export interface PlaylistFilters {
  search?: string
}

export interface PlaylistListResponse {
  data: Playlist[]
  meta?: {
    total: number
    page: number
    per_page: number
  }
}
