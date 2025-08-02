import { createFileRoute, redirect } from '@tanstack/react-router'
import { authManager } from '@/lib/auth-manager'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async () => {
    // 🛡️ Admin route protection - require pengurus permission
    const hasPermission = await authManager.hasPermission('pengurus')
    
    if (!hasPermission) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: () => <div>Admin Section</div>, // This will be replaced by actual admin layout
})