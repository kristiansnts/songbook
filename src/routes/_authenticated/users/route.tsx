import { createFileRoute, redirect } from '@tanstack/react-router';
import { UsersLayout } from '@/panels/users/UsersLayout';
import { authManager } from '@/lib/auth-manager';

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: async () => {
    // 👤 User route protection - require peserta permission
    const hasPermission = await authManager.hasPermission('peserta')
    
    if (!hasPermission) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: UsersLayout,
});
