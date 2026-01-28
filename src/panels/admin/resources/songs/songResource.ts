import { IconMusic } from '@tabler/icons-react'
import { TagService } from '@/services/tagService'
import {
  Song,
  CreateSongRequest,
  UpdateSongRequest,
  SongFilters,
  SongListResponse,
  PaginationMeta,
} from '@/types/song'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'

export class SongResource extends Resource<Song> {
  constructor() {
    super({
      name: 'SongResource',
      model: 'Song',
      route: '/admin/songs',
      navigationIcon: IconMusic,
      navigationSort: 10,
      navigationGroup: 'General',
      navigationLabel: 'Songs',
      navigationVisible: true,
    })
  }

  getModel(): string {
    return 'Song'
  }

  getRoute(): string {
    return '/admin/songs'
  }

  getLabel(): string {
    return 'Song'
  }

  getPluralLabel(): string {
    return 'Songs'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .section((section) =>
        section
          .title('Song Information')
          .columns(2)
          .field('title', (field) =>
            field
              .label('Title')
              .type('text')
              .required()
              .placeholder('Enter song title')
          )
          .field('artist', (field) =>
            field
              .label('Artists')
              .type('tags')
              .required()
              .placeholder('Enter artist names')
              .autoAddOnKeys(false)
          )
          .field('base_chord', (field) =>
            field
              .label('Base Chord')
              .type('searchable-select')
              .required()
              .searchPlaceholder('Search keys...')
              .emptyMessage('No keys found.')
              .options([
                { label: 'C', value: 'C' },
                { label: 'Cm', value: 'Cm' },
                { label: 'C#/Db', value: 'C#' },
                { label: 'D', value: 'D' },
                { label: 'Dm', value: 'Dm' },
                { label: 'Em', value: 'Em' },
                { label: 'D#/Eb', value: 'D#' },
                { label: 'E', value: 'E' },
                { label: 'F', value: 'F' },
                { label: 'Fm', value: 'Fm' },
                { label: 'F#/Gb', value: 'F#' },
                { label: 'G', value: 'G' },
                { label: 'Gm', value: 'Gm' },
                { label: 'G#/Ab', value: 'G#' },
                { label: 'A', value: 'A' },
                { label: 'Am', value: 'Am' },
                { label: 'A#/Bb', value: 'Bb' },
                { label: 'B', value: 'B' },
                { label: 'Bm', value: 'Bm' },
              ])
          )
          .field('tag_names', (field) =>
            field
              .label('Tags')
              .type('tags')
              .placeholder('Enter tags (press Enter, comma, or space to add)')
              .suggestions(async () => {
                try {
                  const tags = await TagService.getAllTags()
                  return tags.map((tag) => tag.name)
                } catch (error) {
                  console.error('Error loading tag suggestions:', error)
                  return [
                    'Gospel',
                    'Worship',
                    'Contemporary',
                    'Traditional',
                    'Hymn',
                    'Praise',
                    'Christmas',
                    'Easter',
                    'Thanksgiving',
                    'Baptism',
                    'Communion',
                    'Wedding',
                    'Funeral',
                  ]
                }
              })
          )
      )
      .section((section) =>
        section.field('lyrics_and_chords', (field) =>
          field
            .label('Lyrics and Chords')
            .type('chordtext')
            .required()
            .placeholder('Enter song lyrics with chord notations')
        )
      )
      .build()
  }

  getTableSchema(): TableBuilderConfig<Song> {
    return TableBuilder.create<Song>()
      .searchPlaceholder('Search songs by title, artist, or lyrics...')
      .searchColumnId('title')
      .filters([
        {
          name: 'base_chord',
          label: 'Base Chord',
          type: 'select',
          options: [
            { label: 'All Chords', value: '' },
            { label: 'C', value: 'C' },
            { label: 'C#/Db', value: 'C#' },
            { label: 'D', value: 'D' },
            { label: 'D#/Eb', value: 'D#' },
            { label: 'E', value: 'E' },
            { label: 'F', value: 'F' },
            { label: 'F#/Gb', value: 'F#' },
            { label: 'G', value: 'G' },
            { label: 'G#/Ab', value: 'G#' },
            { label: 'A', value: 'A' },
            { label: 'A#/Bb', value: 'A#' },
            { label: 'B', value: 'B' },
            { label: 'Cm', value: 'Cm' },
            { label: 'Dm', value: 'Dm' },
            { label: 'Em', value: 'Em' },
            { label: 'Fm', value: 'Fm' },
            { label: 'Gm', value: 'Gm' },
            { label: 'Am', value: 'Am' },
            { label: 'Bm', value: 'Bm' },
          ],
        },
      ])
      .defaultSort('title', 'asc')
      .column('title', (col) =>
        col
          .label('Title')
          .type('text')
          .accessor('title')
          .searchable()
          .sortable()
      )
      .column('artist', (col) =>
        col
          .label('Artists')
          .type('text')
          .accessor('artist')
          .searchable()
          .sortable()
          .format((artists: string[]) => {
            if (Array.isArray(artists)) {
              return artists.join(', ')
            }
            return artists ? String(artists) : ''
          })
      )
      .column('base_chord', (col) =>
        col.label('Base Chord').type('badge').accessor('base_chord').sortable()
      )
      .column('tag_names', (col) =>
        col
          .label('Tags')
          .type('text')
          .accessor('tag_names')
          .format((tags: string[]) => {
            if (Array.isArray(tags)) {
              return tags.join(', ')
            }
            return tags ? String(tags) : ''
          })
      )
      .emptyState(
        'No songs found',
        'No songs are currently available. Create your first song to get started.'
      )
      .showViewOptions(false)
      .build()
  }

  // Async version for dynamic tag loading
  async getTableSchemaAsync(): Promise<TableBuilderConfig<Song>> {
    const tagOptions = await this.getTagOptions()

    return TableBuilder.create<Song>()
      .searchPlaceholder('Search songs by title, artist, or lyrics...')
      .searchColumnId('title')
      .filters([
        {
          name: 'base_chord',
          label: 'Base Chord',
          type: 'select',
          options: [
            { label: 'All Chords', value: '' },
            { label: 'C', value: 'C' },
            { label: 'C#/Db', value: 'C#' },
            { label: 'D', value: 'D' },
            { label: 'D#/Eb', value: 'D#' },
            { label: 'E', value: 'E' },
            { label: 'F', value: 'F' },
            { label: 'F#/Gb', value: 'F#' },
            { label: 'G', value: 'G' },
            { label: 'G#/Ab', value: 'G#' },
            { label: 'A', value: 'A' },
            { label: 'A#/Bb', value: 'A#' },
            { label: 'B', value: 'B' },
            { label: 'Cm', value: 'Cm' },
            { label: 'Dm', value: 'Dm' },
            { label: 'Em', value: 'Em' },
            { label: 'Fm', value: 'Fm' },
            { label: 'Gm', value: 'Gm' },
            { label: 'Am', value: 'Am' },
            { label: 'Bm', value: 'Bm' },
          ],
        },
        {
          name: 'tag_names',
          label: 'Tags',
          type: 'select',
          options: tagOptions,
        },
      ])
      .defaultSort('title', 'asc')
      .column('title', (col) =>
        col
          .label('Title')
          .type('text')
          .accessor('title')
          .searchable()
          .sortable()
      )
      .column('artist', (col) =>
        col
          .label('Artists')
          .type('text')
          .accessor('artist')
          .searchable()
          .sortable()
          .format((artists: string[]) => {
            if (Array.isArray(artists)) {
              return artists.join(', ')
            }
            return artists ? String(artists) : ''
          })
      )
      .column('base_chord', (col) =>
        col.label('Base Chord').type('badge').accessor('base_chord').sortable()
      )
      .column('tag_names', (col) =>
        col
          .label('Tags')
          .type('text')
          .accessor('tag_names')
          .format((tags: string[]) => {
            if (Array.isArray(tags)) {
              return tags.join(', ')
            }
            return tags ? String(tags) : ''
          })
      )
      .emptyState(
        'No songs found',
        'No songs are currently available. Create your first song to get started.'
      )
      .showViewOptions(false)
      .build()
  }

  // Data operations - fetch songs from API
  async getRecords(filters?: SongFilters): Promise<Song[]> {
    const response = await this.getRecordsWithPagination(filters)
    return response.data
  }

  // New method that returns both data and pagination
  async getRecordsWithPagination(
    filters?: SongFilters
  ): Promise<SongListResponse> {
    try {
      // Build URL with filter parameters
      const url = new URL('https://songbanks-v1-1.vercel.app/api/songs')

      // Add pagination parameters
      const page = filters?.page || 1
      const limit = filters?.limit || 10
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', limit.toString())

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
          accept: 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`)
        return {
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      }

      const result = await response.json()

      if (result.code === 200 && Array.isArray(result.data)) {
        // Transform API data to match our Song interface
        const songs = result.data.map((song: any) => {
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
            tag_names: Array.isArray(song.tags)
              ? song.tags.map((tag: any) => tag.name)
              : [],
            created_at: song.createdAt,
            updated_at: song.updatedAt,
          }
        })

        // Return the response with pagination data
        return {
          data: songs,
          pagination: result.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: songs.length,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      } else {
        console.error('Invalid API response format:', result)
        return {
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      }
    } catch (error) {
      console.error('Error fetching songs from API:', error)
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: filters?.limit || 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    }
  }

  async getRecord(id: string): Promise<Song | null> {
    try {
      const response = await fetch(
        `https://songbanks-v1-1.vercel.app/api/songs/${id}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`)
        return null
      }

      const result = await response.json()

      if (result.code === 200 && result.data) {
        const song = result.data
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
          tag_names: Array.isArray(song.tags)
            ? song.tags.map((tag: any) => tag.name)
            : [],
          created_at: song.createdAt,
          updated_at: song.updatedAt,
        }
      } else {
        console.error('Invalid API response format for single song:', result)
        return null
      }
    } catch (error) {
      console.error('Error fetching song from API:', error)
      return null
    }
  }

  async createRecord(data: CreateSongRequest): Promise<Song> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch(
        'https://songbanks-v1-1.vercel.app/api/admin/songs',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      let artists: string[] = ['Unknown Artist']

      if (result.artist) {
        try {
          // Try to parse as JSON array if it's a string
          if (typeof result.artist === 'string') {
            const parsed = JSON.parse(result.artist)
            if (Array.isArray(parsed)) {
              artists = parsed
            } else {
              artists = [result.artist]
            }
          } else if (Array.isArray(result.artist)) {
            artists = result.artist
          } else {
            artists = [String(result.artist)]
          }
        } catch {
          // If JSON parsing fails, treat as single artist
          artists = [result.artist]
        }
      }

      return {
        id: result.id,
        title: result.title,
        artist: artists,
        base_chord: result.base_chord,
        lyrics_and_chords: result.lyrics_and_chords,
        tag_names: result.tag_names || [],
        created_at: result.created_at,
        updated_at: result.updated_at,
      }
    } catch (error) {
      console.error('Error creating song via API:', error)
      throw error
    }
  }

  async updateRecord(id: string, data: UpdateSongRequest): Promise<Song> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch(
        `https://songbanks-v1-1.vercel.app/api/admin/songs/${id}`,
        {
          method: 'PUT',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      let artists: string[] = ['Unknown Artist']

      if (result.artist) {
        try {
          // Try to parse as JSON array if it's a string
          if (typeof result.artist === 'string') {
            const parsed = JSON.parse(result.artist)
            if (Array.isArray(parsed)) {
              artists = parsed
            } else {
              artists = [result.artist]
            }
          } else if (Array.isArray(result.artist)) {
            artists = result.artist
          } else {
            artists = [String(result.artist)]
          }
        } catch {
          // If JSON parsing fails, treat as single artist
          artists = [result.artist]
        }
      }

      return {
        id: result.id,
        title: result.title,
        artist: artists,
        base_chord: result.base_chord,
        lyrics_and_chords: result.lyrics_and_chords,
        tag_names: result.tag_names || [],
        created_at: result.created_at,
        updated_at: result.updated_at,
      }
    } catch (error) {
      console.error('Error updating song via API:', error)
      throw error
    }
  }

  async deleteRecord(id: string): Promise<boolean> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch(
        `https://songbanks-v1-1.vercel.app/api/admin/songs/${id}`,
        {
          method: 'DELETE',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting song via API:', error)
      throw error
    }
  }

  // Helper method to get auth token from localStorage
  private getAuthToken(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return localStorage.getItem('token') || ''
  }

  // Helper method to get tag options for filters
  private async getTagOptions(): Promise<
    Array<{ label: string; value: string }>
  > {
    try {
      const tags = await TagService.getAllTags()
      return [
        { label: 'All Tags', value: '' },
        ...tags.map((tag) => ({ label: tag.name, value: tag.name })),
      ]
    } catch (error) {
      console.error('Error loading tag options:', error)
      return [
        { label: 'All Tags', value: '' },
        { label: 'Gospel', value: 'Gospel' },
        { label: 'Worship', value: 'Worship' },
        { label: 'Contemporary', value: 'Contemporary' },
        { label: 'Traditional', value: 'Traditional' },
        { label: 'Hymn', value: 'Hymn' },
        { label: 'Praise', value: 'Praise' },
      ]
    }
  }

  // Custom search method for advanced filtering
  async searchSongs(
    query: string,
    baseChord?: string,
    tagIds?: string
  ): Promise<Song[]> {
    const filters: SongFilters = {
      search: query,
      base_chord: baseChord,
      tag_ids: tagIds,
    }
    return this.getRecords(filters)
  }

  // Lifecycle hooks
  async beforeSave(data: Partial<Song>): Promise<Partial<Song>> {
    // Clean up tag_names array
    if (data.tag_names && Array.isArray(data.tag_names)) {
      data.tag_names = data.tag_names.filter((tag) => tag && tag.trim())
    }
    return data
  }

  async afterSave(record: Song): Promise<void> {
    console.log(`Song "${record.title}" saved successfully`)
  }

  // Page configurations
  getListPageConfig() {
    return {
      title: this.getPluralLabel(),
      actions: [
        {
          name: 'create',
          label: `Create ${this.getLabel()}`,
          action: () => this.navigateToCreate(),
        },
      ],
    }
  }
}
