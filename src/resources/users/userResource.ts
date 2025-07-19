import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { User } from './user-schema'
import { IconUsers } from '@tabler/icons-react'
import { UserRoleEnum } from '@/enums/User/UserRoleEnum'
import { UserStatusEnum } from '@/enums/User/UserStatusEnum'
import { toast } from 'sonner'

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
      .build()
  }

  getTableSchema(): TableBuilderConfig<User> {
    return TableBuilder.create<User>()
      .searchPlaceholder('Search users...')
      .searchColumnId('email')
      .column('email', col => 
        col
          .label('Email')
          .type('text')
          .accessor('email')
          .searchable()
          .sortable()
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
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'Activate',
              size: 'xs',
              variant: 'outline',
              color: 'green',
              hidden: (row) => row.original.status === UserStatusEnum.ACTIVE,
              requiresConfirmation: true,
              confirmationTitle: 'Activate User',
              confirmationMessage: 'Are you sure you want to activate this user?',
              onClick: async (row, refresh) => {
                try {
                  const updatedUser = await this.updateUserStatus(row.original.id, UserStatusEnum.ACTIVE)
                  if (updatedUser) {
                    // Update the row data with the returned user data
                    Object.assign(row.original, updatedUser)
                    refresh?.()
                    toast.success('User activated successfully', {
                      action: {
                        label: 'x',
                        onClick: () => toast.dismiss()
                      }
                    })
                  } else {
                    throw new Error('Update failed')
                  }
                } catch (error) {
                  refresh?.()
                  toast.error('Failed to activate user. Please try again.', {
                    action: {
                      label: 'x',
                      onClick: () => toast.dismiss()
                    }
                  })
                }
              }
            },
            {
              label: 'Suspend',
              size: 'xs',
              variant: 'outline',
              color: 'red',
              hidden: (row) => row.original.status === UserStatusEnum.SUSPEND || row.original.status === UserStatusEnum.REQUEST,
              requiresConfirmation: true,
              confirmationTitle: 'Suspend User',
              confirmationMessage: 'Are you sure you want to suspend this user?',
              onClick: async (row, refresh) => {                
                try {
                  const updatedUser = await this.updateUserStatus(row.original.id, UserStatusEnum.SUSPEND)
                  if (updatedUser) {
                    // Update the row data with the returned user data
                    Object.assign(row.original, updatedUser)
                    refresh?.()
                    toast.success('User suspended successfully')
                  } else {
                    throw new Error('Update failed')
                  }
                } catch (error) {
                  refresh?.()
                  toast.error('Failed to suspend user. Please try again.')
                }
              }
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
            { label: 'Request', value: 'request' },
            { label: 'Suspended', value: 'suspend' },
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
      role: UserRoleEnum.ADMIN,
      status: UserStatusEnum.ACTIVE,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ2A3B4C5D6E7F8G9H',
      email: 'john.doe@example.com',
      role: UserRoleEnum.MEMBER,
      status: UserStatusEnum.ACTIVE,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ3A4B5C6D7E8F9G0H',
      email: 'jane.smith@example.com',
      role: UserRoleEnum.MEMBER,
      status: UserStatusEnum.ACTIVE,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ4A5B6C7D8E9F0G1H',
      email: 'guest.user@example.com',
      role: UserRoleEnum.GUEST,
      status: UserStatusEnum.PENDING,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ5A6B7C8D9E0F1G2H',
      email: 'new.request@example.com',
      role: UserRoleEnum.MEMBER,
      status: UserStatusEnum.REQUEST,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '01J5XKQZQZ6A7B8C9D0E1F2G3H',
      email: 'suspended.user@example.com',
      role: UserRoleEnum.MEMBER,
      status: UserStatusEnum.SUSPEND,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Data operations - fetch from API
  async getRecords(): Promise<User[]> {
    try {
      const userAccess = await this.getUserAccess()
      
      // Combine all user types into a single array
      const allUsers = [
        ...userAccess.active_users,
        ...userAccess.request_users,
        ...userAccess.suspended_users
      ]
      
      return allUsers
    } catch (error) {
      console.error('Error fetching users from API:', error)
      // Fallback to mock data if API fails
      return UserResource.users.filter(user => user.role !== UserRoleEnum.ADMIN && user.status !== UserStatusEnum.PENDING)
    }
  }

  async getRecord(id: string): Promise<User | null> {
    try {
      const userAccess = await this.getUserAccess()
      
      // Search in all user arrays
      const allUsers = [
        ...userAccess.active_users,
        ...userAccess.request_users,
        ...userAccess.suspended_users
      ]
      
      return allUsers.find(user => user.id === id) || null
    } catch (error) {
      console.error('Error fetching user from API:', error)
      // Fallback to mock data if API fails
      return UserResource.users.find(user => user.id === id) || null
    }
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

  // Custom method to update user status via API
  async updateUserStatus(id: string, status: UserStatusEnum.ACTIVE | UserStatusEnum.SUSPEND): Promise<User> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    const response = await fetch(`http://localhost:3000/api/admin/user-access/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code === 200) {
      // Update local mock data to reflect the change
      const user = UserResource.users.find(u => u.id === id)
      if (user) {
        user.status = status
        user.updatedAt = new Date().toISOString()
        return user
      }
      
      // If user not found in local data, return the API response data
      return {
        id,
        status,
        updatedAt: new Date().toISOString(),
        // Add other required fields with fallback values
        email: '',
        role: UserRoleEnum.MEMBER,
        createdAt: new Date().toISOString(),
      } as User
    } else {
      throw new Error(result.message || 'Failed to update user status')
    }
  }

  // Fallback mock data method
  // private updateUserStatusMock(id: string, status: UserStatusEnum.ACTIVE | UserStatusEnum.SUSPEND): User {
  //   const user = UserResource.users.find(u => u.id === id)
  //   if (!user) {
  //     throw new Error('User not found')
  //   }
    
  //   user.status = status
  //   user.updatedAt = new Date().toISOString()
    
  //   return user
  // }

  // Method to get users by access status from API
  async getUserAccess(): Promise<{
    active_users: User[]
    request_users: User[]
    suspended_users: User[]
  }> {
    try {
      const response = await fetch('http://localhost:3000/api/admin/user-access', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200) {
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch user access data')
      }
    } catch (error) {
      console.error('Error fetching user access:', error)
      // Fallback to mock data if API fails
      return this.getUserAccessMock()
    }
  }

  // Helper method to get auth token from existing auth system
  private getAuthToken(): string {
    return localStorage.getItem('auth-token') || ''
  }


  // Fallback mock data method
  private getUserAccessMock(): {
    active_users: User[]
    request_users: User[]
    suspended_users: User[]
  } {
    const activeUsers = UserResource.users.filter(user => 
      user.status === 'active' && user.role !== UserRoleEnum.ADMIN
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
    if (record.role === UserRoleEnum.ADMIN) {
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
        
      ],
    }
  }
}
