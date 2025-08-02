import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usersPanelConfig } from '../../config/users-config';
import { LayoutDashboard, Settings, Users, Shield } from 'lucide-react';

export function UsersSidebar() {
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{usersPanelConfig.brandName}</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to={usersPanelConfig.navigation.dashboard.url}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{usersPanelConfig.navigation.dashboard.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          © 2024 Users Panel
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
