# Filament-Inspired Resource System

This project now includes a complete Resource system inspired by Filament PHP, providing a powerful way to generate CRUD interfaces with a simple command-line interface.

## Features

### Resource Architecture
- **Base Resource Class**: Abstract class defining the structure for all resources
- **Form Integration**: Automatic form generation using the form builder
- **Table Integration**: Automatic table generation using the table builder  
- **Page System**: Pre-built List, Create, Edit, and View pages
- **Navigation**: Automatic navigation integration
- **Lifecycle Hooks**: beforeSave, afterSave, beforeDelete, afterDelete

### CLI Code Generation
- **Artisan-style Commands**: Generate resources with `npm run generate:resource`
- **Complete File Structure**: Automatically creates all necessary files
- **Customizable Templates**: Modify templates to fit your needs
- **Type Safety**: Full TypeScript support with proper schemas

## Quick Start

### Generate a Resource

```bash
# Basic usage
npm run generate:resource Note

# With options
npm run generate:resource User --plural=Users --route=users
```

This creates:
```
src/resources/notes/
├── NoteResource.ts       # Resource definition
├── note-schema.ts        # Zod schema & TypeScript types
├── pages/
│   ├── list.tsx         # List page component
│   ├── create.tsx       # Create page component
│   ├── edit.tsx         # Edit page component
│   └── view.tsx         # View page component
└── index.ts             # Barrel exports
```

### Basic Resource Structure

```typescript
// src/resources/notes/NoteResource.ts
export class NoteResource extends Resource<Note> {
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
      .title('Create Note')
      .section(section => 
        section
          .title('Note Details')
          .field('title', field => 
            field
              .label('Title')
              .type('text')
              .required()
          )
          .field('description', field => 
            field
              .label('Description')
              .type('textarea')
              .rows(4)
          )
      )
      .build()
  }

  getTableSchema(): TableBuilderConfig<Note> {
    return TableBuilder.create<Note>()
      .searchPlaceholder('Search notes...')
      .column('title', col => 
        col
          .label('Title')
          .type('text')
          .searchable()
          .sortable()
      )
      .column('description', col => 
        col
          .label('Description')
          .type('text')
          .truncate()
          .maxLength(50)
      )
      .build()
  }

  // Data operations - implement with your data layer
  async getRecords(): Promise<Note[]> {
    // Your data fetching logic here
    return []
  }

  async createRecord(data: Partial<Note>): Promise<Note> {
    // Your data creation logic here
    throw new Error('Not implemented')
  }

  // ... other CRUD operations
}
```

### Generated Schema

```typescript
// src/resources/notes/note-schema.ts
export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Note = z.infer<typeof noteSchema>
export type CreateNote = z.infer<typeof createNoteSchema>
```

### Generated Pages

The resource generator creates four page components:

#### List Page
```typescript
// src/resources/notes/pages/list.tsx
export default function NoteListPage() {
  const { data, loading, error, refresh } = useListPage(resource)

  return (
    <ListPage
      resource={resource}
      data={data}
      loading={loading}
      onRefresh={refresh}
    />
  )
}
```

#### Create Page
```typescript
// src/resources/notes/pages/create.tsx
export default function NoteCreatePage() {
  return <CreatePage resource={resource} />
}
```

#### Edit Page
```typescript
// src/resources/notes/pages/edit.tsx
export default function NoteEditPage() {
  const { id } = useRouter().query
  return <EditPage resource={resource} recordId={id} />
}
```

#### View Page
```typescript
// src/resources/notes/pages/view.tsx
export default function NoteViewPage() {
  const { id } = useRouter().query
  return <ViewPage resource={resource} recordId={id} />
}
```

## Advanced Features

### Lifecycle Hooks

```typescript
export class NoteResource extends Resource<Note> {
  async beforeSave(data: Partial<Note>): Promise<Partial<Note>> {
    // Add timestamps, validation, etc.
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    }
  }

  async afterSave(record: Note): Promise<void> {
    // Send notifications, update cache, etc.
    console.log('Note saved:', record)
  }

  async beforeDelete(record: Note): Promise<boolean> {
    // Validation before deletion
    return confirm('Are you sure you want to delete this note?')
  }

  async afterDelete(record: Note): Promise<void> {
    // Cleanup after deletion
    console.log('Note deleted:', record)
  }
}
```

### Custom Actions

```typescript
export class NoteResource extends Resource<Note> {
  getActions(): ResourceAction<Note>[] {
    return [
      {
        name: 'duplicate',
        label: 'Duplicate',
        icon: <Copy className="h-4 w-4" />,
        action: async (record) => {
          await this.createRecord({
            title: `${record.title} (Copy)`,
            description: record.description,
          })
        },
      },
    ]
  }

  getBulkActions(): ResourceBulkAction<Note>[] {
    return [
      {
        name: 'archive',
        label: 'Archive Selected',
        icon: <Archive className="h-4 w-4" />,
        action: async (records) => {
          // Bulk archive logic
        },
        requiresConfirmation: true,
      },
    ]
  }
}
```

### Data Layer Integration

```typescript
export class NoteResource extends Resource<Note> {
  async getRecords(): Promise<Note[]> {
    const response = await fetch('/api/notes')
    return response.json()
  }

  async createRecord(data: Partial<Note>): Promise<Note> {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async updateRecord(id: string, data: Partial<Note>): Promise<Note> {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async deleteRecord(id: string): Promise<boolean> {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  }
}
```

## CLI Commands

### Basic Generation
```bash
npm run generate:resource Note
```

### With Options
```bash
npm run generate:resource User --plural=Users --route=users --path=src/features/users
```

### Available Options
- `--plural=<name>` - Set plural name (default: ResourceName + 's')
- `--route=<route>` - Set route name (default: lowercase + 's')
- `--path=<path>` - Set output path (default: src/resources/<name>s)

## Integration with Existing Code

### Router Integration
```typescript
// Add to your router
import { NoteListPage, NoteCreatePage, NoteEditPage } from '@/resources/notes'

const routes = [
  {
    path: '/notes',
    component: NoteListPage,
  },
  {
    path: '/notes/create',
    component: NoteCreatePage,
  },
  {
    path: '/notes/edit/:id',
    component: NoteEditPage,
  },
]
```

### Navigation Integration
```typescript
// Add to your sidebar navigation
const navigation = [
  {
    label: 'Notes',
    href: '/notes',
    icon: <FileText className="h-4 w-4" />,
  },
]
```

## Customization

### Custom Templates
You can modify the templates in `src/lib/resources/generator/templates.ts` to customize the generated code structure.

### Custom Fields
```typescript
// Generate resource with custom fields
const generator = new ResourceGenerator('Product', {
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'category', type: 'select', options: [...] },
    { name: 'active', type: 'checkbox' },
  ]
})
```

## Best Practices

1. **Data Layer**: Always implement the data operations (`getRecords`, `createRecord`, etc.) with your actual data layer
2. **Validation**: Use Zod schemas for robust validation
3. **Error Handling**: Implement proper error handling in your data operations
4. **Type Safety**: Leverage TypeScript generics for full type safety
5. **Lifecycle Hooks**: Use lifecycle hooks for cross-cutting concerns

## Comparison with Filament PHP

| Feature | Filament PHP | React Resource System |
|---------|--------------|----------------------|
| Resource Generation | `php artisan make:filament-resource` | `npm run generate:resource` |
| Form Builder | Fluent API | Fluent API with TypeScript |
| Table Builder | Column definitions | Column definitions with types |
| Page System | List/Create/Edit pages | List/Create/Edit/View pages |
| Lifecycle Hooks | Yes | Yes |
| Type Safety | PHP types | Full TypeScript support |
| Navigation | Auto-generated | Manual integration |

This system provides the same developer experience as Filament PHP but adapted for React and TypeScript, making CRUD interface development much more efficient and maintainable.