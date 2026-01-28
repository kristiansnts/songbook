import React from 'react'
import Cookies from 'js-cookie'
import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/components/ui/sidebar'
import { UsersSidebar } from './components/layout/UsersSidebar'

interface UsersLayoutProps {
  children?: React.ReactNode
}

export function UsersLayout({ children }: UsersLayoutProps) {
  const defaultOpen = Cookies.get('users_sidebar_state') !== 'false'

  return (
    <div className='bg-background flex h-screen'>
      <SidebarProvider defaultOpen={defaultOpen}>
        <UsersSidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='flex-1 overflow-auto'>
            <div className='container mx-auto p-6'>
              {children ? children : <Outlet />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
