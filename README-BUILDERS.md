# Filament-Inspired Form and Table Builders

This project now includes a Filament PHP-inspired form and table builder system that simplifies the creation of forms and tables with a fluent, declarative API.

## Features

### Form Builder
- **Fluent API**: Chain methods to build complex forms declaratively
- **Multiple Field Types**: Text, email, password, number, select, checkbox, textarea, date, phone
- **Validation**: Built-in Zod validation with custom schemas
- **Sections**: Organize fields into collapsible sections with custom layouts
- **Responsive**: Grid-based layouts that adapt to different screen sizes
- **Type Safety**: Full TypeScript support with intelligent auto-completion

### Table Builder
- **Column Types**: Text, badge, date, actions, select, image, icon, boolean, number
- **Filtering**: Built-in filters with faceted search
- **Sorting**: Sortable columns with custom sort functions
- **Bulk Actions**: Multi-select with bulk operations
- **Pagination**: Configurable page sizes and navigation
- **Search**: Global search across multiple columns
- **Empty States**: Customizable empty state messages and icons

## Quick Start

### Basic Form Example

```tsx
import { FormBuilder, FormRenderer, Text, Email, Password } from '@/components/builders'

const formConfig = FormBuilder.create()
  .title('User Registration')
  .section(section => 
    section
      .title('Account Details')
      .columns(2)
      .field('firstName', field => 
        field
          .label('First Name')
          .type('text')
          .placeholder('Enter your first name')
          .required()
      )
      .field('email', field => 
        field
          .label('Email')
          .type('email')
          .placeholder('Enter your email')
          .required()
      )
  )
  .onSubmit(async (data) => {
    console.log('Form submitted:', data)
  })
  .build()

export function MyForm() {
  return <FormRenderer config={formConfig} />
}
```

### Alternative Fluent Syntax

```tsx
const formConfig = FormBuilder.create()
  .title('Quick Form')
  .schema([
    Text('firstName')
      .label('First Name')
      .required()
      .build(),
    
    Email('email')
      .label('Email')
      .required()
      .build(),
    
    Password('password')
      .label('Password')
      .minLength(8)
      .required()
      .build(),
  ])
  .build()
```

### Basic Table Example

```tsx
import { TableBuilder, TableRenderer, TextColumn, BadgeColumn } from '@/components/builders'

const tableConfig = TableBuilder.create<User>()
  .data(users)
  .column('name', col => 
    col
      .label('Name')
      .type('text')
      .searchable()
      .sortable()
  )
  .column('status', col => 
    col
      .label('Status')
      .type('badge')
      .colors({
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
      })
  )
  .build()

export function MyTable() {
  return <TableRenderer config={tableConfig} />
}
```

## Advanced Usage

### Form with Validation

```tsx
import { z } from 'zod'

const formConfig = FormBuilder.create()
  .section(section => 
    section
      .field('email', field => 
        field
          .label('Email')
          .type('email')
          .required()
          .validation(z.string().email('Invalid email format'))
      )
      .field('password', field => 
        field
          .label('Password')
          .type('password')
          .required()
          .validation(
            z.string()
              .min(8, 'Password must be at least 8 characters')
              .regex(/[A-Z]/, 'Password must contain uppercase letter')
          )
      )
  )
  .build()
```

### Table with Actions and Filters

```tsx
const tableConfig = TableBuilder.create<User>()
  .data(users)
  .column('name', col => col.label('Name').type('text').searchable())
  .column('actions', col => 
    col
      .label('Actions')
      .type('actions')
      .actions([
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: (row) => handleEdit(row.original),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: (row) => handleDelete(row.original),
          variant: 'destructive',
          requiresConfirmation: true,
        },
      ])
  )
  .filters([
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ])
  .bulkActions([
    {
      label: 'Delete Selected',
      onClick: (rows) => handleBulkDelete(rows),
      variant: 'destructive',
    },
  ])
  .build()
```

## Field Types

### Form Fields

| Type | Description | Options |
|------|-------------|---------|
| `text` | Text input | `minLength`, `maxLength`, `placeholder` |
| `email` | Email input with validation | `placeholder` |
| `password` | Password input with toggle | `minLength`, `placeholder` |
| `number` | Number input | `min`, `max`, `step` |
| `select` | Dropdown selection | `options`, `multiple` |
| `checkbox` | Checkbox with description | `description` |
| `textarea` | Multi-line text input | `rows`, `minLength`, `maxLength` |
| `date` | Date picker | `minDate`, `maxDate` |
| `phone` | Phone number input | `placeholder` |

### Table Columns

| Type | Description | Options |
|------|-------------|---------|
| `text` | Plain text display | `format`, `truncate`, `maxLength` |
| `badge` | Colored badge | `colors`, `variant` |
| `date` | Formatted date | `format`, `relative` |
| `actions` | Action buttons/dropdown | `actions` |
| `select` | Selection checkbox | `enableSelectAll` |
| `image` | Avatar/image display | `size`, `shape`, `fallback` |
| `icon` | Icon display | `iconMap`, `size` |
| `boolean` | Yes/No display | `trueLabel`, `falseLabel`, `showIcons` |
| `number` | Formatted numbers | `format`, `currency`, `precision` |

## API Reference

### FormBuilder Methods

- `title(title: string)` - Set form title
- `description(description: string)` - Set form description
- `section(callback)` - Add a form section
- `schema(fields: FieldConfig[])` - Set fields directly
- `submitButtonText(text: string)` - Customize submit button
- `onSubmit(handler)` - Set submit handler
- `defaultValues(values)` - Set default form values

### TableBuilder Methods

- `data(data: T[])` - Set table data
- `column(name, callback)` - Add a column
- `columns(columns: ColumnConfig[])` - Set columns directly
- `searchable(enabled)` - Enable/disable search
- `filterable(enabled)` - Enable/disable filtering
- `pagination(enabled)` - Enable/disable pagination
- `bulkActions(actions)` - Set bulk actions
- `emptyState(title, description)` - Customize empty state

## Examples

Check out the `/examples` folder for complete working examples:

- `form-builder-example.tsx` - Basic and advanced form examples
- `table-builder-example.tsx` - Table configuration examples
- `songs-with-builders.tsx` - Real-world usage with the songs feature

## Integration with Existing Components

The builders are designed to work seamlessly with your existing ShadcnUI components and can be gradually adopted in your project. They generate standard form and table markup that integrates with your current styling and theme system.

## TypeScript Support

All builders are fully typed with TypeScript generics, providing excellent IDE support and type safety:

```tsx
interface User {
  id: string
  name: string
  email: string
}

const table = TableBuilder.create<User>()
  .data(users)
  .column('name', col => col.label('Name').accessor('name')) // Fully typed!
  .build()
```

This system provides the same developer experience as Filament PHP but adapted for React and TypeScript, making form and table creation much more efficient and maintainable.