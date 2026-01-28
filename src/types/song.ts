export interface Song {
  id: number
  title: string
  artist: string[]
  base_chord: string
  lyrics_and_chords: string
  tag_names: string[]
  created_at?: string
  updated_at?: string
}

export interface CreateSongRequest {
  title: string
  artist: string[]
  base_chord: string
  lyrics_and_chords: string
  tag_names: string[]
}

export interface UpdateSongRequest extends CreateSongRequest {
  id?: number
}

export interface SongFilters {
  search?: string
  base_chord?: string
  tag_ids?: string
  page?: number
  limit?: number
  sort_by?: 'title' | 'base_chord'
  sort_order?: 'asc' | 'desc'
}

export interface SongListResponse {
  data: Song[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
