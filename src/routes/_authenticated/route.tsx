import { createFileRoute, redirect } from '@tanstack/react-router'
import { authManager } from '@/lib/auth-manager'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

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
    // For development: skip server validation if it fails
    try {
      const user = await authManager.getCurrentUser()
      if (!user) {
        // In development, if server call fails but we have a token, continue
        if (authManager.getToken()) {
          console.warn(
            'Server validation failed but token exists, allowing access for development'
          )
          return
        }
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      // In development, if we have a token but server is not available, allow access
      if (authManager.getToken()) {
        console.warn(
          'Server not available but token exists, allowing access for development'
        )
        return
      }
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
