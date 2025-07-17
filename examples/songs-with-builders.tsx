import React from 'react'
import { 
  FormBuilder, 
  FormRenderer, 
  TableBuilder, 
  TableRenderer,
  Text,
  Textarea,
  TextColumn,
  ActionsColumn
} from '@/components/builders'
import { Song } from '@/features/songs/data/schema'
import { Edit, Trash2, Eye } from 'lucide-react'
import { z } from 'zod'

// Example: Songs form using the new form builder
export function SongsFormExample() {
  const songFormConfig = FormBuilder.create()
    .title('Add New Song')
    .description('Create a new song entry in the songbook')
    .section(section => 
      section
        .title('Song Details')
        .columns(2)
        .field('title', field => 
          field
            .label('Song Title')
            .type('text')
            .placeholder('Enter song title')
            .required()
            .validation(z.string().min(1, 'Song title is required'))
        )
        .field('artist', field => 
          field
            .label('Artist')
            .type('text')
            .placeholder('Enter artist name')
            .validation(z.string().optional())
        )
        .field('baseChord', field => 
          field
            .label('Key')
            .type('text')
            .placeholder('e.g., C, G, Am')
            .helperText('The main key of the song')
        )
        .field('tempo', field => 
          field
            .label('Tempo (BPM)')
            .type('number')
            .placeholder('120')
            .min(60)
            .max(200)
        )
    )
    .section(section => 
      section
        .title('Lyrics & Chords')
        .field('lyricAndChords', field => 
          field
            .label('Lyrics and Chords')
            .type('textarea')
            .placeholder('Enter lyrics with chord markings...')
            .rows(15)
            .helperText('Use chord notation like [C]Hello [G]world')
        )
    )
    .section(section => 
      section
        .title('Additional Information')
        .collapsible(true)
        .columns(2)
        .field('genre', field => 
          field
            .label('Genre')
            .type('text')
            .placeholder('Pop, Rock, Jazz, etc.')
        )
        .field('year', field => 
          field
            .label('Year')
            .type('number')
            .placeholder('2024')
            .min(1900)
            .max(new Date().getFullYear())
        )
        .field('notes', field => 
          field
            .label('Notes')
            .type('textarea')
            .placeholder('Additional notes about the song...')
            .rows(3)
            .colSpan(2)
        )
    )
    .submitButtonText('Save Song')
    .onSubmit(async (data) => {
      console.log('Song form submitted:', data)
      // Handle song creation
    })
    .build()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormRenderer config={songFormConfig} />
    </div>
  )
}

// Example: Songs table using the new table builder
export function SongsTableExample({ songs }: { songs: Song[] }) {
  const songsTableConfig = TableBuilder.create<Song>()
    .data(songs)
    .searchPlaceholder('Search songs...')
    .column('title', col => 
      col
        .label('Song Title')
        .type('text')
        .accessor('title')
        .searchable()
        .sortable()
        .truncate()
        .maxLength(50)
    )
    .column('artist', col => 
      col
        .label('Artist')
        .type('text')
        .accessor('artist')
        .searchable()
        .sortable()
        .format((value) => value || '-')
    )
    .column('baseChord', col => 
      col
        .label('Key')
        .type('text')
        .accessor('baseChord')
        .format((value) => value || '-')
        .className('font-mono font-medium')
        .align('center')
        .width('10%')
    )
    .column('genre', col => 
      col
        .label('Genre')
        .type('text')
        .accessor('genre')
        .format((value) => value || '-')
        .filterable()
    )
    .column('tempo', col => 
      col
        .label('Tempo')
        .type('number')
        .accessor('tempo')
        .format((value) => value ? `${value} BPM` : '-')
        .align('center')
        .width('10%')
    )
    .column('updatedAt', col => 
      col
        .label('Last Updated')
        .type('date')
        .accessor('updatedAt')
        .relative()
        .sortable()
    )
    .column('actions', col => 
      col
        .label('Actions')
        .type('actions')
        .actions([
          {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => {
              console.log('View song:', row.original)
              // Open song view dialog
            },
          },
          {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => {
              console.log('Edit song:', row.original)
              // Open song edit form
            },
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row) => {
              console.log('Delete song:', row.original)
              // Show delete confirmation
            },
            variant: 'destructive',
            requiresConfirmation: true,
            confirmationTitle: 'Delete Song',
            confirmationMessage: 'Are you sure you want to delete this song?',
          },
        ])
        .width('15%')
    )
    .filters([
      {
        name: 'genre',
        label: 'Genre',
        type: 'select',
        options: [
          { label: 'Pop', value: 'pop' },
          { label: 'Rock', value: 'rock' },
          { label: 'Jazz', value: 'jazz' },
          { label: 'Folk', value: 'folk' },
          { label: 'Country', value: 'country' },
        ],
      },
      {
        name: 'baseChord',
        label: 'Key',
        type: 'select',
        options: [
          { label: 'C', value: 'C' },
          { label: 'G', value: 'G' },
          { label: 'D', value: 'D' },
          { label: 'A', value: 'A' },
          { label: 'E', value: 'E' },
          { label: 'Am', value: 'Am' },
          { label: 'Em', value: 'Em' },
          { label: 'Dm', value: 'Dm' },
        ],
      },
    ])
    .bulkActions([
      {
        label: 'Export Selected',
        onClick: (rows) => {
          console.log('Export selected songs:', rows.map(r => r.original))
          // Handle bulk export
        },
      },
      {
        label: 'Delete Selected',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (rows) => {
          console.log('Delete selected songs:', rows.map(r => r.original))
          // Handle bulk delete
        },
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationTitle: 'Delete Songs',
        confirmationMessage: 'Are you sure you want to delete the selected songs?',
      },
    ])
    .emptyState('No songs found', 'Try adding some songs to your songbook.')
    .onRowClick((row) => {
      console.log('Song row clicked:', row.original)
      // Open song view or edit
    })
    .build()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Songs</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add New Song
        </button>
      </div>
      <TableRenderer config={songsTableConfig} />
    </div>
  )
}

// Example: Combined form and table in a complete CRUD interface
export function SongsCRUDExample() {
  const [songs, setSongs] = React.useState<Song[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [editingSong, setEditingSong] = React.useState<Song | null>(null)

  const handleFormSubmit = async (data: any) => {
    if (editingSong) {
      // Update existing song
      setSongs(prev => prev.map(s => s.id === editingSong.id ? { ...s, ...data } : s))
      setEditingSong(null)
    } else {
      // Create new song
      const newSong: Song = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setSongs(prev => [...prev, newSong])
    }
    setShowForm(false)
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
    setShowForm(true)
  }

  const handleDelete = (song: Song) => {
    setSongs(prev => prev.filter(s => s.id !== song.id))
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SongsFormExample />
        <div className="mt-6 flex gap-2">
          <button 
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Songs Management</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Song
        </button>
      </div>
      <SongsTableExample songs={songs} />
    </div>
  )
}