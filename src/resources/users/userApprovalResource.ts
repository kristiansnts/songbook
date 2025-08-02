import { Resource } from '@/lib/resources/types'
import { FormBuilder, TableBuilder } from '@/components/builders'
import { FormBuilderConfig } from '@/lib/builders/form-builder'
import { TableBuilderConfig } from '@/lib/builders/table-builder'
import { User } from './user-schema'
import { IconUserCheck } from '@tabler/icons-react'
import { UserStatusEnum } from '@/enums/User/UserStatusEnum'
import { UserRoleEnum } from '@/enums/User/UserRoleEnum'
import { toast } from 'sonner'

export class UserApprovalResource extends Resource<User> {
  constructor() {
    super({
      name: 'UserApprovalResource',
      model: 'UserApproval',
      route: '/user-approval',
      navigationIcon: IconUserCheck,
      navigationSort: 25,
      navigationGroup: 'General',
      navigationLabel: 'User Approval',
      navigationVisible: true,
    })
  }

  getModel(): string {
    return 'UserApproval'
  }

  getRoute(): string {
    return '/user-approval'
  }

  getLabel(): string {
    return 'User Approval'
  }

  getPluralLabel(): string {
    return 'User Approval'
  }

  getFormSchema(): FormBuilderConfig {
    return FormBuilder.create()
      .build()
  }

  getTableSchema(): TableBuilderConfig<User> {
    return TableBuilder.create<User>()
      .searchPlaceholder('Search pending users...')
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
            'request': 'blue'
          })
      )
      .column('actions', col => 
        col
          .label('Actions')
          .type('actions')
          .actions([
            {
              label: 'Approve',
              size: 'xs',
              variant: 'outline',
              color: 'green',
              requiresConfirmation: true,
              confirmationTitle: 'Approve User',
              confirmationMessage: 'Are you sure you want to approve this user?',
              onClick: async (row, refresh) => {
                try {
                  await this.approveUser(row.original.id)
                  refresh?.()
                  toast.success('User approved successfully', {
                    action: {
                      label: 'x',
                      onClick: () => toast.dismiss()
                    }
                  })
                } catch (error) {
                  refresh?.()
                  toast.error('Failed to approve user. Please try again.', {
                    action: {
                      label: 'x',
                      onClick: () => toast.dismiss()
                    }
                  })
                }
              }
            },
            {
              label: 'Reject',
              size: 'xs',
              variant: 'outline',
              color: 'red',
              requiresConfirmation: true,
              confirmationTitle: 'Reject User',
              confirmationMessage: 'Are you sure you want to reject this user? This will suspend their account.',
              onClick: async (row, refresh) => {                
                try {
                  await this.rejectUser(row.original.id)
                  refresh?.()
                  toast.success('User rejected successfully')
                } catch (error) {
                  refresh?.()
                  toast.error('Failed to reject user. Please try again.')
                }
              }
            },
          ])
      )
      .build()
  }

  // Data operations - fetch only users with REQUEST status (backend filtered)
  async getRecords(): Promise<User[]> {
    try {
      let allUsers: any[] = []
      let currentPage = 1
      let hasNextPage = true
      const limit = 100 // Fetch in larger chunks for efficiency

      // Fetch all pages with backend filtering by status=request
      while (hasNextPage) {
        const response = await fetch(`https://songbanks-v1-1.vercel.app/api/admin/user-access?status=request&page=${currentPage}&limit=${limit}`, {
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
          allUsers = [...allUsers, ...result.data]
          hasNextPage = result.pagination.hasNextPage
          currentPage++
        } else {
          throw new Error(result.message || 'Failed to fetch users')
        }
      }

      // Transform API data (no frontend filtering needed - backend already filtered)
      return allUsers.map((user: any) => ({
        id: String(user.id),
        nama: user.nama,
        username: user.username,
        email: user.username,
        role: user.role as UserRoleEnum,
        status: UserStatusEnum.REQUEST, // All users from API have request status
      }))
    } catch (error) {
      console.error('Error fetching users from API:', error)
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

  // Custom method to approve user via API
  async approveUser(userId: string): Promise<void> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch('https://songbanks-v1-1.vercel.app/api/admin/approve-vol-access', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to approve user')
      }
    } catch (error) {
      console.error('Error approving user via API:', error)
      throw error
    }
  }

  // Custom method to reject user via API
  async rejectUser(userId: string): Promise<void> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    try {
      const response = await fetch('https://songbanks-v1-1.vercel.app/api/admin/reject-vol-access', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to reject user')
      }
    } catch (error) {
      console.error('Error rejecting user via API:', error)
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

  // Page configurations
  getListPageConfig() {
    return {
      title: this.getPluralLabel(),
      actions: [], // No create action needed for approval
    }
  }
}