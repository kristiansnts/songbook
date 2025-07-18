import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { User } from './user-schema'
import { IconUsers } from '@tabler/icons-react'

export class UserResource extends Resource<User> {
  constructor() {
    super({
      name: 'UserResource',
      model: 'User',
      route: '/users',
      navigationIcon: IconUsers,
      navigationSort: 30,
      navigationGroup: 'General',
      navigationLabel: 'Users',
      navigationVisible: true,
    })
  }

  getModel(): string {
    return 'User'
  }

  getRoute(): string {
    return '/users'
  }

  getLabel(): string {
    return 'User'
  }

  getPluralLabel(): string {
    return 'Users'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .section(section => 
        section
          .title('User Details')
          .columns(2)
          .field('email', field => 
            field
              .label('Email')
              .type('email')
              .placeholder('Enter email address')
              .required()
          )
          .field('role', field => 
            field
              .label('Role')
              .type('select')
              .placeholder('Select user role')
              .options([
                { label: 'Admin', value: 'admin' },
                { label: 'Member', value: 'member' },
                { label: 'Guest', value: 'guest' },
              ])
              .required()
          )
          .field('status', field => 
            field
              .label('Status')
              .type('select')
              .placeholder('Select user status')
              .options([
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Request', value: 'request' },
                { label: 'Suspended', value: 'suspend' },
              ])
              .required()
          )
      )
      .submitButtonText('Save User')
      .build()
  }

  getTableSchema(): TableBuilderConfig<User> {
    return TableBuilder.create<User>()
      .searchPlaceholder('Search users...')
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
          .sortable()
          .colors({
            'admin': 'red',
            'member': 'blue',
            'guest': 'gray'
          })
      )
      .column('status', col => 
        col
          .label('Status')
          .type('badge')
          .accessor('status')
          .sortable()
          .colors({
            'active': 'green',
            'pending': 'yellow',
            'request': 'blue',
            'suspend': 'red'
          })
      )
      .column('createdAt', col => 
        col
          .label('Created At')
          .type('date')
          .accessor('createdAt')
          .sortable()
          .dateFormat('MMM d, yyyy')
      )
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'Edit',
              onClick: (row) => this.navigateToEdit(row.original.id),
            },
            {
              label: 'Activate',
              onClick: (row) => this.updateUserStatus(row.original.id, 'active'),
              variant: 'default',
              hidden: (row) => row.original.status === 'active',
            },
            {
              label: 'Suspend',
              onClick: (row) => this.updateUserStatus(row.original.id, 'suspend'),
              variant: 'destructive',
              hidden: (row) => row.original.status === 'suspend',
              requiresConfirmation: true,
              confirmationTitle: 'Suspend User',
              confirmationMessage: 'Are you sure you want to suspend this user?',
            },
            {
              label: 'Delete',
              onClick: (row) => this.deleteRecord(row.original.id),
              variant: 'destructive',
              requiresConfirmation: true,
              confirmationTitle: 'Delete User',
              confirmationMessage: 'Are you sure you want to delete this user?',
            },
          ])
      )
      .filters([
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Request', value: 'request' },
            { label: 'Suspended', value: 'suspend' },
          ],
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { label: 'All', value: '' },
            { label: 'Admin', value: 'admin' },
            { label: 'Member', value: 'member' },
            { label: 'Guest', value: 'guest' },
          ],
        },
      ])
      .build()
  }

  // Sample data - replace with your actual data layer
  private static users: User[] = [
    {
      id: '01J5XKQZQZ1A2B3C4D5E6F7G8H',
      email: 'admin@songbook.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ2A3B4C5D6E7F8G9H',
      email: 'john.doe@example.com',
      role: 'member',
      status: 'active',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ3A4B5C6D7E8F9G0H',
      email: 'jane.smith@example.com',
      role: 'member',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ4A5B6C7D8E9F0G1H',
      email: 'guest.user@example.com',
      role: 'guest',
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ5A6B7C8D9E0F1G2H',
      email: 'new.request@example.com',
      role: 'member',
      status: 'request',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ6A7B8C9D0E1F2G3H',
      email: 'suspended.user@example.com',
      role: 'member',
      status: 'suspend',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Data operations - implement these with your data layer
  async getRecords(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return UserResource.users
  }

  async getRecord(id: string): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return UserResource.users.find(user => user.id === id) || null
  }

  async createRecord(data: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newUser: User = {
      id: `01J5XKQZQZ${Date.now().toString().slice(-10)}`,
      email: data.email || '',
      role: data.role || 'member',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    UserResource.users.push(newUser)
    return newUser
  }

  async updateRecord(id: string, data: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = UserResource.users.findIndex(user => user.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    
    const updatedUser: User = {
      ...UserResource.users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    UserResource.users[index] = updatedUser
    return updatedUser
  }

  async deleteRecord(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = UserResource.users.findIndex(user => user.id === id)
    if (index === -1) {
      return false
    }
    
    UserResource.users.splice(index, 1)
    return true
  }

  async deleteRecords(ids: string[]): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    UserResource.users = UserResource.users.filter(user => !ids.includes(user.id))
    return true
  }

  // Custom method to update user status (matching UserController.updateUserAccess)
  async updateUserStatus(id: string, status: 'active' | 'suspend'): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const user = UserResource.users.find(u => u.id === id)
    if (!user) {
      throw new Error('User not found')
    }
    
    user.status = status
    user.updatedAt = new Date().toISOString()
    
    return user
  }

  // Method to get users by access status (matching UserController.getUserAccess)
  async getUserAccess(): Promise<{
    active_users: User[]
    request_users: User[]
    suspended_users: User[]
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const activeUsers = UserResource.users.filter(user => 
      user.status === 'active' && user.role !== 'admin'
    )
    
    const requestUsers = UserResource.users.filter(user => 
      user.status === 'request'
    )
    
    const suspendedUsers = UserResource.users.filter(user => 
      user.status === 'suspend'
    )
    
    return {
      active_users: activeUsers,
      request_users: requestUsers,
      suspended_users: suspendedUsers,
    }
  }

  // Lifecycle hooks (optional)
  async beforeSave(data: Partial<User>): Promise<Partial<User>> {
    // Add any pre-save processing here
    // For example, validate email uniqueness
    if (data.email) {
      const existingUser = UserResource.users.find(u => u.email === data.email)
      if (existingUser) {
        throw new Error('Email already exists')
      }
    }
    return data
  }

  async afterSave(record: User): Promise<void> {
    // Add any post-save processing here
    console.log(`User ${record.email} saved successfully`)
  }

  async beforeDelete(record: User): Promise<boolean> {
    // Add any pre-delete validation here
    // Prevent deletion of admin users
    if (record.role === 'admin') {
      throw new Error('Cannot delete admin users')
    }
    return true
  }

  async afterDelete(record: User): Promise<void> {
    // Add any post-delete cleanup here
    console.log(`User ${record.email} deleted successfully`)
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
              window.location.href = '/users/create'
            }
          },
        },
      ],
    }
  }
}
