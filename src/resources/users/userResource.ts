import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { User } from './user-schema'
import { IconUsers } from '@tabler/icons-react'
import { UserStatusEnum } from '@/enums/User/UserStatusEnum'
import { UserRoleEnum } from '@/enums/User/UserRoleEnum'
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
      .searchColumnId('username')
      .column('nama', col => 
        col
          .label('Name')
          .type('text')
          .accessor('nama')
          .searchable()
          .sortable()
      )
      .column('username', col => 
        col
          .label('Email/Username')
          .type('text')
          .accessor('username')
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
            'admin': 'purple',
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


  // Data operations - fetch from API
  async getRecords(): Promise<User[]> {
    try {
      const response = await fetch('https://songbanks-v1-1.vercel.app/api/admin/user-access', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200) {
        // Transform API data to match our User schema
        return result.data.map((user: any) => ({
          id: String(user.id),
          nama: user.nama,
          username: user.username,
          email: user.username, // Use username as email for backward compatibility
          role: user.role,
          status: user.status,
        }))
      } else {
        throw new Error(result.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users from API:', error)
      // Fallback to empty array if API fails
      return []
    }
  }

  async getRecord(id: string): Promise<User | null> {
    try {
      const allUsers = await this.getRecords()
      return allUsers.find(user => user.id === id) || null
    } catch (error) {
      console.error('Error fetching user from API:', error)
      return null
    }
  }



  async updateRecord(id: string, data: Partial<User>): Promise<User> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      // Build query parameters from the data object
      const queryParams = new URLSearchParams()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await fetch(`https://songbanks-v1-1.vercel.app/api/admin/user-access/${id}?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200) {
        // Return updated user data, merging with the original data structure
        const currentUser = await this.getRecord(id)
        return {
          ...currentUser,
          ...data,
          id: String(id),
        } as User
      } else {
        throw new Error(result.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user via API:', error)
      throw error
    }
  }



  // Custom method to update user status via API
  async updateUserStatus(id: string, status: UserStatusEnum.ACTIVE | UserStatusEnum.SUSPEND): Promise<User> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch(`https://songbanks-v1-1.vercel.app/api/admin/user-access/${id}?status=${status}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200) {
        // Get the current user data and update the status
        const currentUser = await this.getRecord(id)
        if (currentUser) {
          return {
            ...currentUser,
            status,
          }
        }
        
        // Fallback if user not found in current data
        return {
          id: String(id),
          nama: '',
          username: '',
          status,
          role: UserRoleEnum.GUEST,
        } as User
      } else {
        throw new Error(result.message || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status via API:', error)
      throw error
    }
  }

  // Helper method to get auth token from localStorage
  private getAuthToken(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return localStorage.getItem('auth-token') || ''
  }

  // Lifecycle hooks (optional)
  async beforeSave(data: Partial<User>): Promise<Partial<User>> {
    // Add any pre-save processing here for updates
    return data
  }

  async afterSave(record: User): Promise<void> {
    // Add any post-save processing here for updates
    console.log(`User ${record.username} updated successfully`)
  }

  // Page configurations
  getListPageConfig() {
    return {
      title: this.getPluralLabel(),
      actions: [], // No create action since user creation is not supported
    }
  }
}
