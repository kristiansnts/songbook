import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { User } from './user-schema'
import { IconUsers } from '@tabler/icons-react'
import { UserStatusEnum } from '@/enums/User/UserStatusEnum'
import { UserRoleEnum } from '@/enums/User/UserRoleEnum'

export class UserResource extends Resource<User> {
  constructor() {
    super({
      name: 'UserResource',
      model: 'User',
      route: '/admin/users',
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
    return '/admin/users'
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
      .searchPlaceholder('Search users by name or email...')
      .searchColumnId('nama') // Use nama as the search column for the built-in search
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
      .emptyState(
        'No users found',
        'No users are currently available. This could be due to network issues or no users being registered in the system.',
      )
      .showViewOptions(false)
      .build()
  }


  // Data operations - fetch users from correct API endpoint
  async getRecords(searchQuery?: string): Promise<User[]> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        console.warn('No authentication token found, showing empty table')
        return []
      }

      // Build URL with search parameter if provided
      const url = new URL('https://songbanks-v1-1.vercel.app/api/admin/user/')
      url.searchParams.set('page', '1')
      if (searchQuery && searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim())
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`)
        return [] // Return empty array instead of throwing error
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        // Transform API data to match our User interface
        return result.data.map((user: any) => ({
          id: String(user.id_peserta),
          nama: user.nama || 'Unknown',
          username: user.email || 'unknown@example.com',
          email: user.email || 'unknown@example.com',
          role: user.role as UserRoleEnum || 'guest',
          status: user.status as UserStatusEnum || 'pending',
        }))
      } else {
        console.error('Invalid API response format:', result)
        return [] // Return empty array for invalid response
      }
    } catch (error) {
      console.error('Error fetching users from API:', error)
      return [] // Always return empty array instead of throwing error
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
  async updateUserStatus(id: string, status: UserStatusEnum.ACTIVE | UserStatusEnum.SUSPEND, currentUserData?: User): Promise<User> {
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
        // First try to get the current user data from API
        const currentUser = await this.getRecord(id)
        if (currentUser) {
          return {
            ...currentUser,
            status,
          }
        }
        
        // If API fetch fails, use the provided currentUserData as fallback
        if (currentUserData) {
          return {
            ...currentUserData,
            status,
          }
        }
        
        // Last resort fallback (should rarely happen)
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
    return localStorage.getItem('token') || ''
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
