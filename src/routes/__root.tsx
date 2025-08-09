import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { AuthProvider } from '@/lib/auth'

export const Route = createRootRoute({
  component: () => {
    return (
      <AuthProvider>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={50000} />
      </AuthProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
