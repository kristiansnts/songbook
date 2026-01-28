import React from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Settings, Users, Shield } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usersPanelConfig } from '../../config/users-config'

export function UsersSidebar() {
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className='border-b p-4'>
        <div className='flex items-center gap-2'>
          <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg'>
            <Shield className='h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold'>
              {usersPanelConfig.brandName}
            </span>
            <span className='text-muted-foreground text-xs'>v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to={usersPanelConfig.navigation.dashboard.url}
                className='hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2'
              >
                <LayoutDashboard className='h-4 w-4' />
                <span>{usersPanelConfig.navigation.dashboard.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2'>
                <Users className='h-4 w-4' />
                <span>Users</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className='hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2'>
                <Settings className='h-4 w-4' />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='border-t p-4'>
        <div className='text-muted-foreground text-xs'>© 2024 Users Panel</div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
