import { createFileRoute, redirect } from '@tanstack/react-router'
import Library from '@/features/library'
import { authManager } from '@/lib/auth-manager'

export const Route = createFileRoute('/_authenticated/user/dashboard')({
  beforeLoad: async () => {
    // 🛡️ User route protection - require peserta permission
    try {
      const hasPermission = await authManager.hasPermission('peserta')
      
      if (!hasPermission) {
        throw redirect({
          to: '/unauthorized',
        })
      }
    } catch (error) {
      console.error('User dashboard permission check failed:', error)
      // If permission check fails but we have a token, allow access for development
      if (!authManager.getToken()) {
        throw redirect({
          to: '/sign-in',
        })
      }
    }
  },
  component: Library,
})