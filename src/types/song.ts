export interface Song {
  id: number;
  title: string;
  artist: string[];
  base_chord: string;
  lyrics_and_chords: string;
  tag_names: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateSongRequest {
  title: string;
  artist: string[];
  base_chord: string;
  lyrics_and_chords: string;
  tag_names: string[];
}

export interface UpdateSongRequest extends CreateSongRequest {}

export interface SongFilters {
  search?: string;
  base_chord?: string;
  tag_ids?: string;
}

export interface SongListResponse {
  data: Song[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}