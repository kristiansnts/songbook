# Songbook Admin Dashboard

Admin Dashboard UI crafted with Shadcn and Vite. Built with responsiveness and accessibility in mind.

This is a customized version of the Shadcn Admin Dashboard, tailored for songbook management with streamlined features.

## Features

- Light/dark mode
- Responsive
- Accessible
- Built-in Sidebar component
- Authentication system
- Song management with CRUD operations
- User management system
- Error handling pages
- Help center

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [Eslint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Tabler Icons](https://tabler.io/icons)

**Auth:** Custom authentication with localStorage

## Installation & Development

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Quick Start

1. **Clone the project**

```bash
git clone <your-repository-url>
cd songbook
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Start development server**

```bash
npm run dev
# or
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with Vite       |
| `npm run build`        | Build for production (TypeScript + Vite) |
| `npm run preview`      | Preview production build                 |
| `npm run lint`         | Run ESLint for code linting              |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check code formatting                    |
| `npm run knip`         | Find unused dependencies and exports     |

### Build Process

The build process involves two steps:

1. **TypeScript Compilation**: `tsc -b` compiles TypeScript files
2. **Vite Build**: Bundles the application and generates the route tree

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

## Authentication

For development, use these credentials:

- **Email**: `admin@gmail.com`
- **Password**: `password`

The authentication system uses localStorage to persist user sessions and includes:

- Custom auth context (`/src/lib/auth.tsx`)
- Route protection with redirects
- Automatic session restoration
- Logout functionality

## Songbook Features

### Song Management

- **CRUD Operations**: Create, read, update, and delete songs
- **Data Table**: Sortable, filterable song listing
- **Search**: Global search across song titles, artists, and lyrics
- **Import/Export**: Bulk song operations
- **Categories**: Song categorization and filtering

### User Management

- **User CRUD**: Complete user management system
- **Role Management**: User roles and permissions
- **User Profiles**: Individual user profile management

### Dashboard

- **Overview**: Key metrics and statistics
- **Recent Activity**: Latest songs and user actions
- **Quick Actions**: Fast access to common operations

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadcnUI components
│   └── layout/         # Layout components & navigation
├── features/           # Feature-based modules
│   ├── auth/           # Authentication (sign-in only)
│   ├── dashboard/      # Dashboard & overview
│   ├── songs/          # Song management with CRUD
│   ├── users/          # User management with CRUD
│   └── errors/         # Error pages (401, 403, 404, 500, 503)
├── routes/             # File-based routing (TanStack Router)
│   ├── (auth)/         # Authentication routes
│   └── _authenticated/ # Protected routes
├── lib/                # Utilities & configurations
└── stores/             # Zustand state stores
```

## Components Library

### Core UI Components (ShadcnUI)

The project includes 24 pre-built UI components based on Radix UI primitives:

| Component       | Description                      | Usage                               |
| --------------- | -------------------------------- | ----------------------------------- |
| `Button`        | Interactive button with variants | Primary actions, forms              |
| `Card`          | Container for grouped content    | Dashboard widgets, forms            |
| `Dialog`        | Modal dialog component           | Confirmations, forms                |
| `Form`          | Form wrapper with validation     | All forms with React Hook Form      |
| `Input`         | Text input with variants         | Form fields                         |
| `Table`         | Data table component             | Listing data with sorting/filtering |
| `Select`        | Dropdown select component        | Form selections                     |
| `Tabs`          | Tab navigation component         | Content organization                |
| `Avatar`        | User avatar display              | User profiles                       |
| `Badge`         | Status indicators                | Labels, status                      |
| `Dropdown Menu` | Context menu component           | Actions, navigation                 |
| `Popover`       | Floating content                 | Tooltips, additional info           |
| `Sidebar`       | Collapsible navigation           | Main app navigation                 |
| `Sheet`         | Slide-out panel                  | Mobile navigation, forms            |
| `Alert`         | Notification component           | Messages, warnings                  |
| `Checkbox`      | Checkbox input                   | Multiple selections                 |
| `Radio Group`   | Radio button group               | Single selections                   |
| `Switch`        | Toggle switch                    | Boolean settings                    |
| `Textarea`      | Multi-line text input            | Long text entries                   |
| `Tooltip`       | Hover information                | Help text                           |
| `Calendar`      | Date picker                      | Date selection                      |
| `Command`       | Command palette                  | Search, actions                     |
| `Scroll Area`   | Custom scrollbar                 | Long content areas                  |
| `Skeleton`      | Loading placeholder              | Loading states                      |

### Custom Components

| Component             | Location                 | Purpose                        |
| --------------------- | ------------------------ | ------------------------------ |
| `AuthenticatedLayout` | `components/layout/`     | Main app layout with sidebar   |
| `AppSidebar`          | `components/layout/`     | Navigation sidebar             |
| `DataTable`           | `features/*/components/` | Advanced data tables with CRUD |
| `SearchProvider`      | `context/`               | Global search functionality    |
| `ThemeSwitch`         | `components/`            | Dark/light mode toggle         |
| `ProfileDropdown`     | `components/`            | User profile menu              |

## CRUD Implementation Guide

The project demonstrates CRUD operations in the **Songs** and **Users** features. Here's how to implement CRUD for a new entity:

### 1. Define Data Schema

Create a Zod schema for type safety and validation:

```typescript
// src/features/[entity]/data/schema.ts
import { z } from 'zod'

export const entitySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Entity = z.infer<typeof entitySchema>
```

### 2. Create Data Layer

Set up mock data and API functions:

```typescript
// src/features/[entity]/data/[entity].ts
import { faker } from '@faker-js/faker'
import { Entity } from './schema'

export function generateMockEntities(count: number): Entity[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }))
}
```

### 3. Create Context for State Management

```typescript
// src/features/[entity]/context/[entity]-context.tsx
import { createContext, useContext, useState } from 'react'
import { Entity } from '../data/schema'

interface EntityContextType {
  entities: Entity[]
  open: string | null
  setOpen: (open: string | null) => void
  currentRow: Entity | null
  setCurrentRow: (row: Entity | null) => void
}

const EntityContext = createContext<EntityContextType | undefined>(undefined)

export function useEntity() {
  const context = useContext(EntityContext)
  if (!context) throw new Error('useEntity must be used within EntityProvider')
  return context
}
```

### 4. Create Data Table Columns

```typescript
// src/features/[entity]/components/columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Entity } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Entity>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
```

### 5. Create CRUD Dialogs

Create dialog components for Create, Update, and Delete operations:

```typescript
// src/features/[entity]/components/[entity]-dialogs.tsx
export function EntityDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEntity()

  return (
    <>
      <EntityCreateDialog
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <EntityEditDialog
            open={open === 'edit'}
            onOpenChange={() => setOpen('edit')}
            currentRow={currentRow}
          />

          <EntityDeleteDialog
            open={open === 'delete'}
            onOpenChange={() => setOpen('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
```

### 6. Main Feature Page

```typescript
// src/features/[entity]/index.tsx
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { EntityProvider } from './context/[entity]-context'
import { EntityTable } from './components/[entity]-table'
import { EntityDialogs } from './components/[entity]-dialogs'

export default function EntityPage() {
  return (
    <EntityProvider>
      <Header>
        <h1>Entity Management</h1>
      </Header>
      <Main>
        <EntityTable />
        <EntityDialogs />
      </Main>
    </EntityProvider>
  )
}
```

### 7. Add Route

Create the route file:

```typescript
// src/routes/_authenticated/[entity]/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import EntityPage from '@/features/[entity]'

export const Route = createFileRoute('/_authenticated/[entity]/')({
  component: EntityPage,
})
```

### 8. Add Navigation

Add to sidebar navigation:

```typescript
// src/components/layout/data/sidebar-data.ts
{
  title: 'Entity',
  url: '/[entity]',
  icon: IconYourChoice,
}
```

## Key Features Implemented

### Data Tables

- **Sorting**: Click column headers to sort
- **Filtering**: Global search and column-specific filters
- **Pagination**: Navigate through large datasets
- **Row Selection**: Bulk operations support
- **Column Visibility**: Show/hide columns
- **Responsive**: Mobile-friendly design

### Form Handling

- **React Hook Form**: Form state management
- **Zod Validation**: Runtime type checking
- **Error Handling**: Field-level error messages
- **Toast Notifications**: User feedback via Sonner

### State Management

- **Zustand**: Global client state
- **TanStack Query**: Server state and caching
- **React Context**: Feature-specific state

### Routing

- **File-based Routing**: Automatic route generation
- **Route Protection**: Authentication guards
- **Nested Layouts**: Shared layout components
- **Type Safety**: Full TypeScript support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Original Project

This project is based on the excellent [Shadcn Admin Dashboard](https://github.com/satnaing/shadcn-admin) by [@satnaing](https://github.com/satnaing). The original project demonstrates a comprehensive admin dashboard implementation with ShadcnUI components.

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
