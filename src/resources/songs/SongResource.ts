import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { Song } from './song-schema'

export class SongResource extends Resource<Song> {
  constructor() {
    super({
      name: 'SongResource',
      model: 'Song',
      route: '/songs',
      navigationIcon: undefined, // Add your icon here
      navigationSort: 0,
      navigationGroup: undefined, // Add navigation group if needed
    })
  }

  getModel(): string {
    return 'Song'
  }

  getRoute(): string {
    return '/songs'
  }

  getLabel(): string {
    return 'Song'
  }

  getPluralLabel(): string {
    return 'Songs'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .section(section => 
        section
          .title('Song Details')
          .columns(2)
          .field('title', field => 
            field
              .label('Song Title')
              .type('text')
              .placeholder('Enter a song title')
              .required()
          )
          .field('artist', field => 
            field
              .label('Artist')
              .type('text')
              .placeholder('Enter artist of the song')
          )
          .field('tags', field => 
            field
              .label('Tags')
              .type('text')
              .placeholder('Enter tags (e.g., rock, pop)')
          )
          .field('baseChord', field => 
            field
              .label('Base Chord')
              .type('select')
              .placeholder('Select base chord (optional)')
              .options([
                { label: 'C', value: 'C' },
                { label: 'C#', value: 'C#' },
                { label: 'D', value: 'D' },
                { label: 'D#', value: 'D#' },
                { label: 'E', value: 'E' },
                { label: 'F', value: 'F' },
                { label: 'F#', value: 'F#' },
                { label: 'G', value: 'G' },
                { label: 'G#', value: 'G#' },
                { label: 'A', value: 'A' },
                { label: 'A#', value: 'A#' },
                { label: 'B', value: 'B' },
                { label: 'Am', value: 'Am' },
                { label: 'Bm', value: 'Bm' },
                { label: 'Cm', value: 'Cm' },
                { label: 'Dm', value: 'Dm' },
                { label: 'Em', value: 'Em' },
                { label: 'Fm', value: 'Fm' },
                { label: 'Gm', value: 'Gm' },
              ])
          )
      )
      .section(section => 
        section
          .title('Song Content')
          .columns(1)
          .field('lyricAndChords', field => 
            field
              .label('Lyrics and Chords')
              .type('richtext')
              .placeholder('Enter song lyrics and chords...')
              .rows(12)
          )
      )
      .submitButtonText('Save Song')
      .build()
  }

  getTableSchema(): TableBuilderConfig<Song> {
    return TableBuilder.create<Song>()
      .searchPlaceholder('Search songs...')
      .column('title', col => 
        col
          .label('Song Title')
          .type('text')
          .accessor('title')
          .searchable()
          .sortable()
      )
      .column('artist', col => 
        col
          .label('Artist')
          .type('text')
          .accessor('artist')
          .searchable()
          .sortable()
      )
      .column('baseChord', col => 
        col
          .label('Key')
          .type('badge')
          .accessor('baseChord')
          .sortable()
          .colors({
            'C': 'blue',
            'D': 'green',
            'E': 'yellow',
            'F': 'orange',
            'G': 'red',
            'A': 'purple',
            'B': 'pink',
            'Am': 'indigo',
            'Dm': 'teal',
            'Em': 'lime',
            'Gm': 'cyan',
          })
      )
      .column('status', col => 
        col
          .label('Status')
          .type('badge')
          .accessor('status')
          .sortable()
          .colors({
            'in progress': 'blue',
            'backlog': 'gray',
            'todo': 'yellow',
            'completed': 'green',
          })
      )
      .column('tags', col => 
        col
          .label('Tags')
          .type('text')
          .accessor('tags')
          .searchable()
      )
      .column('createdAt', col => 
        col
          .label('Created At')
          .type('date')
          .accessor('createdAt')
          .dateFormat('MMM d, yyyy')
      )
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'View',
              onClick: (row) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/songs/view/${row.original.id}`
                }
              },
            },
            {
              label: 'Edit',
              onClick: (row) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/songs/edit/${row.original.id}`
                }
              },
            },
            {
              label: 'Delete',
              onClick: (row) => this.deleteRecord(row.original.id),
              variant: 'destructive',
              requiresConfirmation: true,
              confirmationTitle: 'Delete Song',
              confirmationMessage: 'Are you sure you want to delete this song?',
            },
          ])
      )
      .defaultSort('createdAt', 'desc')
      .filters([
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'In Progress', value: 'in progress' },
            { label: 'Backlog', value: 'backlog' },
            { label: 'Todo', value: 'todo' },
            { label: 'Completed', value: 'completed' },
          ],
        },
        {
          name: 'label',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'Hymn', value: 'hymn' },
            { label: 'Traditional', value: 'traditional' },
            { label: 'Contemporary', value: 'contemporary' },
            { label: 'Gospel', value: 'gospel' },
            { label: 'Worship', value: 'worship' },
          ],
        },
        {
          name: 'createdAt',
          label: 'Created Date',
          type: 'dateRange',
          fromLabel: 'From Date',
          toLabel: 'To Date',
        },
      ])
      .build()
  }

  // Sample data - replace with your actual data layer
  private static songs: Song[] = [
    {
      id: 'SONG-8782',
      title: 'Amazing Grace',
      artist: 'John Newton',
      tags: ['hymn', 'traditional'],
      status: 'in progress',
      label: 'hymn',
      lyric: 'Amazing grace, how sweet the sound...',
      chords: 'G,C,D,Em',
      lyricAndChords: 'G       C       G\nAmazing grace, how sweet the sound\nG        D       G\nThat saved a wretch like me',
      baseChord: 'G',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SONG-7878',
      title: 'How Great Thou Art',
      artist: 'Stuart K. Hine',
      tags: ['hymn', 'worship'],
      status: 'backlog',
      label: 'hymn',
      lyric: 'O Lord my God, when I in awesome wonder...',
      chords: 'C,F,G',
      lyricAndChords: 'C        F       C\nO Lord my God, when I in awesome wonder\nC         G        C\nConsider all the worlds thy hands have made',
      baseChord: 'C',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SONG-7839',
      title: 'Be Thou My Vision',
      artist: 'Traditional Irish',
      tags: ['traditional', 'irish'],
      status: 'todo',
      label: 'traditional',
      lyric: 'Be thou my vision, O Lord of my heart...',
      chords: 'D,G,A',
      lyricAndChords: 'D        G       D\nBe thou my vision, O Lord of my heart\nA        D       G      D\nNaught be all else to me, save that thou art',
      baseChord: 'D',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SONG-1234',
      title: 'Here I Am to Worship',
      artist: 'Tim Hughes',
      tags: ['contemporary', 'worship'],
      status: 'completed',
      label: 'contemporary',
      lyric: 'Light of the world, you stepped down into darkness...',
      chords: 'Em,C,G,D',
      lyricAndChords: 'Em       C       G       D\nLight of the world, you stepped down into darkness',
      baseChord: 'Em',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SONG-5678',
      title: 'What a Beautiful Name',
      artist: 'Hillsong',
      tags: ['contemporary', 'worship'],
      status: 'in progress',
      label: 'contemporary',
      lyric: 'You were the Word at the beginning...',
      chords: 'A,D,F#m,E',
      lyricAndChords: 'A        D       F#m      E\nYou were the Word at the beginning',
      baseChord: 'A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SONG-9012',
      title: 'Blessed Assurance',
      artist: 'Fanny Crosby',
      tags: ['hymn', 'gospel'],
      status: 'completed',
      label: 'gospel',
      lyric: 'Blessed assurance, Jesus is mine...',
      chords: 'F,Bb,C,Dm',
      lyricAndChords: 'F        Bb      C       Dm\nBlessed assurance, Jesus is mine',
      baseChord: 'F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Data operations - implement these with your data layer
  async getRecords(): Promise<Song[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return SongResource.songs
  }

  async getRecord(id: string): Promise<Song | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return SongResource.songs.find(song => song.id === id) || null
  }

  async createRecord(data: Partial<Song>): Promise<Song> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newSong: Song = {
      id: `SONG-${Date.now()}`,
      title: data.title || '',
      artist: data.artist,
      tags: data.tags || [],
      status: 'todo',
      label: 'song',
      lyric: data.lyric,
      chords: data.chords,
      lyricAndChords: data.lyricAndChords,
      baseChord: data.baseChord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    SongResource.songs.push(newSong)
    return newSong
  }

  async updateRecord(id: string, data: Partial<Song>): Promise<Song> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = SongResource.songs.findIndex(song => song.id === id)
    if (index === -1) {
      throw new Error('Song not found')
    }
    
    const updatedSong: Song = {
      ...SongResource.songs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    SongResource.songs[index] = updatedSong
    return updatedSong
  }

  async deleteRecord(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = SongResource.songs.findIndex(song => song.id === id)
    if (index === -1) {
      return false
    }
    
    SongResource.songs.splice(index, 1)
    return true
  }

  async deleteRecords(ids: string[]): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    SongResource.songs = SongResource.songs.filter(song => !ids.includes(song.id))
    return true
  }

  // Lifecycle hooks (optional)
  async beforeSave(data: Partial<Song>): Promise<Partial<Song>> {
    // Add any pre-save processing here
    return data
  }

  async afterSave(_record: Song): Promise<void> {
    // Add any post-save processing here
  }

  async beforeDelete(_record: Song): Promise<boolean> {
    // Add any pre-delete validation here
    return true
  }

  async afterDelete(_record: Song): Promise<void> {
    // Add any post-delete cleanup here
  }

  // Page configurations
  getListPageConfig() {
    return {
      title: this.getPluralLabel(),
      actions: [
        {
          name: 'create',
          label: `Create ${this.getLabel()}`,
          action: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/songs/create'
            }
          },
        },
      ],
    }
  }
}
