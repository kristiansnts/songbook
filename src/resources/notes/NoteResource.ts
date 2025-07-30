import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { Note } from './note-schema'
import { IconNote } from '@tabler/icons-react'
import { toast } from 'sonner'

export class NoteResource extends Resource<Note> {
  constructor() {
    super({
      name: 'NoteResource',
      model: 'Note',
      route: '/notes',
      navigationIcon: IconNote,
      navigationSort: 20,
      navigationGroup: 'General',
      navigationLabel: 'Notes',
      navigationVisible: true,
    })
  }

  getModel(): string {
    return 'Note'
  }

  getRoute(): string {
    return '/notes'
  }

  getLabel(): string {
    return 'Note'
  }

  getPluralLabel(): string {
    return 'Notes'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .section(section => 
        section
          .title('Note Details')
          .columns(1)
          .field('title', field => 
            field
              .label('Title')
              .type('text')
              .placeholder('Enter title')
              .required()
          )
          .field('description', field => 
            field
              .label('Description')
              .type('textarea')
              .placeholder('Enter description')
              .rows(4)
          )
      )
      .submitButtonText('Save Note')
      .build()
  }

  getTableSchema(refreshCallback?: () => void): TableBuilderConfig<Note> {
    return TableBuilder.create<Note>()
      .searchPlaceholder('Search notes...')
      .searchColumnId('title')
      .filterable(true)
      .groupedFilters(true)
      .filters([
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'System', value: 'system' },
            { label: 'Song Management', value: 'song' },
            { label: 'Development', value: 'development' },
            { label: 'UI/UX', value: 'ui' },
            { label: 'Database', value: 'database' },
          ],
        },
        {
          name: 'createdAt',
          label: 'Created Date',
          type: 'dateRange',
          fromLabel: 'From Date',
          toLabel: 'To Date',
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'Search by title...',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          placeholder: 'Search by description...',
        },
      ])
      .column('title', col => 
        col
          .label('Title')
          .type('text')
          .accessor('title')
          .searchable()
          .sortable()
          .filterable()
      )
      .column('description', col => 
        col
          .label('Description')
          .type('text')
          .accessor('description')
          .truncate()
          .maxLength(50)
          .filterable()
      )
      .column('createdAt', col => 
        col
          .label('Created')
          .type('date')
          .accessor('createdAt')
          .sortable()
          .filterable()
          .dateFormat('MMM d, yyyy')
          .relative(false)
      )
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'View',
              onClick: (row) => this.navigateToView(row.original.id),
            },
            {
              label: 'Edit',
              onClick: (row) => this.navigateToEdit(row.original.id),
            },
            {
              label: 'Delete',
              onClick: async (row, refresh) => {
                try{
                  await this.deleteRecord(row.original.id)
                  refresh?.()
                  toast.success('Noted deleted successfully', {
                    action: {
                      label: 'x',
                      onClick: () => toast.dismiss(),
                    },
                  })
                }catch (error) {
                  refresh?.()
                  toast.success('Error deleting user', {
                    action: {
                      label: 'x',
                      onClick: () => toast.dismiss(),
                    },
                  })
                }
              },
              variant: 'destructive',
              requiresConfirmation: true,
              confirmationTitle: 'Delete Note',
              confirmationMessage: 'Are you sure you want to delete this note?',
            },
          ])
      )
      .build()
  }

  // Sample data - replace with your actual data layer
  private static notes: Note[] = [
    {
      id: '1',
      title: 'Welcome to Notes',
      description: 'This is your first note. You can create, edit, and delete notes using the resource system.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Resource System',
      description: 'The resource system provides automatic CRUD operations with forms and tables.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Song Management',
      description: 'Ideas for managing songs: Add tags for better organization, create playlists, and include chord charts.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Filter Implementation',
      description: 'Implement FilamentPHP-style filters for better data management and user experience.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'UI Components',
      description: 'List of UI components to implement: badge components, date formatters, and responsive tables.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Database Schema',
      description: 'Design database schema for songs, notes, and user management with proper relationships.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Data operations - implement these with your data layer
  async getRecords(): Promise<Note[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return NoteResource.notes
  }

  async getRecord(id: string): Promise<Note | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return NoteResource.notes.find(note => note.id === id) || null
  }

  async createRecord(data: Partial<Note>): Promise<Note> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    NoteResource.notes.push(newNote)
    return newNote
  }

  async updateRecord(id: string, data: Partial<Note>): Promise<Note> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = NoteResource.notes.findIndex(note => note.id === id)
    if (index === -1) {
      throw new Error('Note not found')
    }
    
    const updatedNote: Note = {
      ...NoteResource.notes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    NoteResource.notes[index] = updatedNote
    return updatedNote
  }

  async deleteRecord(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = NoteResource.notes.findIndex(note => note.id === id)
    if (index === -1) {
      return false
    }
    
    NoteResource.notes.splice(index, 1)
    return true
  }

  async deleteRecords(ids: string[]): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    NoteResource.notes = NoteResource.notes.filter(note => !ids.includes(note.id))
    return true
  }

  // Lifecycle hooks (optional)
  async beforeSave(data: Partial<Note>): Promise<Partial<Note>> {
    // Add any pre-save processing here
    return data
  }

  async afterSave(_record: Note): Promise<void> {
    // Add any post-save processing here
  }

  async beforeDelete(_record: Note): Promise<boolean> {
    // Add any pre-delete validation here
    return true
  }

  async afterDelete(_record: Note): Promise<void> {
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
              window.location.href = '/notes/create'
            }
          },
        },
      ],
    }
  }
}
