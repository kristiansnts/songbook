import React from 'react'
import { 
  TableBuilder, 
  TableRenderer, 
  TextColumn, 
  BadgeColumn, 
  DateColumn, 
  ActionsColumn, 
  BooleanColumn 
} from '@/components/builders'
import { Edit, Trash2, Eye } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  isVerified: boolean
  createdAt: string
  lastLogin: string
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-02-01T14:20:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'pending',
    isVerified: false,
    createdAt: '2024-01-20T09:15:00Z',
    lastLogin: '2024-01-25T11:45:00Z',
  },
  // Add more sample data as needed
]

export function TableBuilderExample() {
  const tableConfig = TableBuilder.create<User>()
    .data(sampleUsers)
    .searchPlaceholder('Search users...')
    .column('select', col => col.type('select').label(''))
    .column('name', col => 
      col
        .label('Name')
        .type('text')
        .accessor('name')
        .searchable()
        .sortable()
    )
    .column('email', col => 
      col
        .label('Email')
        .type('text')
        .accessor('email')
        .searchable()
        .sortable()
    )
    .column('role', col => 
      col
        .label('Role')
        .type('badge')
        .accessor('role')
        .colors({
          admin: 'bg-purple-100 text-purple-800',
          user: 'bg-blue-100 text-blue-800',
          manager: 'bg-green-100 text-green-800',
        })
        .filterable()
    )
    .column('status', col => 
      col
        .label('Status')
        .type('badge')
        .accessor('status')
        .colors({
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
        })
        .filterable()
    )
    .column('isVerified', col => 
      col
        .label('Verified')
        .type('boolean')
        .accessor('isVerified')
        .showIcons()
        .filterable()
    )
    .column('createdAt', col => 
      col
        .label('Created')
        .type('date')
        .accessor('createdAt')
        .dateFormat('MMM dd, yyyy')
        .sortable()
    )
    .column('lastLogin', col => 
      col
        .label('Last Login')
        .type('date')
        .accessor('lastLogin')
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
              console.log('View user:', row.original)
            },
          },
          {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => {
              console.log('Edit user:', row.original)
            },
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row) => {
              console.log('Delete user:', row.original)
            },
            variant: 'destructive',
            requiresConfirmation: true,
            confirmationTitle: 'Delete User',
            confirmationMessage: 'Are you sure you want to delete this user?',
          },
        ])
    )
    .filters([
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Manager', value: 'manager' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
      },
    ])
    .bulkActions([
      {
        label: 'Delete Selected',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (rows) => {
          console.log('Delete selected:', rows.map(r => r.original))
        },
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationTitle: 'Delete Users',
        confirmationMessage: 'Are you sure you want to delete the selected users?',
      },
    ])
    .emptyState('No users found', 'Try adjusting your search or filter criteria.')
    .onRowClick((row) => {
      console.log('Row clicked:', row.original)
    })
    .build()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <TableRenderer config={tableConfig} />
    </div>
  )
}

// Alternative using fluent column helpers
export function FluentTableExample() {
  const tableConfig = TableBuilder.create<User>()
    .data(sampleUsers)
    .columns([
      TextColumn<User>('name')
        .label('Name')
        .accessor('name')
        .searchable()
        .sortable()
        .build(),
      
      TextColumn<User>('email')
        .label('Email')
        .accessor('email')
        .searchable()
        .sortable()
        .build(),
      
      BadgeColumn<User>('role')
        .label('Role')
        .accessor('role')
        .colors({
          admin: 'bg-purple-100 text-purple-800',
          user: 'bg-blue-100 text-blue-800',
        })
        .build(),
      
      BooleanColumn<User>('isVerified')
        .label('Verified')
        .accessor('isVerified')
        .showIcons()
        .build(),
      
      DateColumn<User>('createdAt')
        .label('Created')
        .accessor('createdAt')
        .dateFormat('MMM dd, yyyy')
        .build(),
      
      ActionsColumn<User>('actions')
        .label('Actions')
        .actions([
          {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => console.log('Edit:', row.original),
          },
        ])
        .build(),
    ])
    .build()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Simple Users Table</h1>
      <TableRenderer config={tableConfig} />
    </div>
  )
}