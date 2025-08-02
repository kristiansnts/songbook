import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { authManager } from '@/lib/auth-manager'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    // ✅ Use secure AuthManager instead of localStorage check
    if (!authManager.isLoggedIn()) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
    
    // ✅ Validate user with server (per security guide)
    try {
      const user = await authManager.getCurrentUser()
      if (!user) {
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
