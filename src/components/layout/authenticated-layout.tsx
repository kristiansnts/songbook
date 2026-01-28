import Cookies from 'js-cookie'
import { Outlet, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import SkipToMain from '@/components/skip-to-main'
import { ThemeSwitch } from '@/components/theme-switch'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const location = useLocation()

  // Routes where the main navigation (header + sidebar) should be hidden
  const hideNavigationRoutes = [
    '/user/song',
    '/user/artist',
    '/user/playlist/view',
  ]

  // Check if current route should hide navigation
  const shouldHideNavigation = hideNavigationRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + '/')
  )

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        {!shouldHideNavigation && <AppSidebar />}
        <div
          id='content'
          className={cn(
            'w-full max-w-full',
            !shouldHideNavigation &&
              'md:ml-auto md:peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            !shouldHideNavigation &&
              'md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            !shouldHideNavigation &&
              'md:transition-[width] md:duration-200 md:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh',
            'overflow-x-hidden'
          )}
        >
          {/* Global Header - Conditionally visible */}
          {!shouldHideNavigation && (
            <Header>
              <div className='ml-auto flex items-center space-x-4'>
                <ThemeSwitch />
                <ProfileDropdown />
              </div>
            </Header>
          )}
          {children ? children : <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
