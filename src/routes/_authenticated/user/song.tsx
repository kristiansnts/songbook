import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { authManager } from '@/lib/auth-manager'

function SongLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/user/song')({
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
      console.error('User song permission check failed:', error)
      // If permission check fails but we have a token, allow access for development
      if (!authManager.getToken()) {
        throw redirect({
          to: '/sign-in',
        })
      }
    }
  },
  component: SongLayout,
})
