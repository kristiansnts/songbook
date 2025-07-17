#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const nameIndex = args.findIndex(arg => arg === '--name');
const panelName = nameIndex !== -1 ? args[nameIndex + 1] : 'Admin';

if (!panelName) {
  console.error('❌ Panel name is required. Usage: npm run generate:panel --name=Admin');
  process.exit(1);
}

const panelNameLower = panelName.toLowerCase();
const panelNameKebab = panelName.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');

console.log(`🔧 Generating panel: ${panelName}`);

// Base directories
const baseDir = path.join(process.cwd(), 'src');
const panelDir = path.join(baseDir, 'panels', panelNameLower);
const routesDir = path.join(baseDir, 'routes', '_authenticated', panelNameLower);

// Create directories
const directories = [
  panelDir,
  path.join(panelDir, 'components'),
  path.join(panelDir, 'components', 'layout'),
  path.join(panelDir, 'pages'),
  path.join(panelDir, 'config'),
  routesDir,
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Generate panel configuration
const panelConfig = `export interface ${panelName}PanelConfig {
  name: string;
  path: string;
  id: string;
  brandName: string;
  brandLogo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  navigation: {
    dashboard: {
      label: string;
      icon?: string;
      url: string;
    };
  };
}

export const ${panelNameLower}PanelConfig: ${panelName}PanelConfig = {
  name: '${panelName}',
  path: '/${panelNameLower}',
  id: '${panelNameLower}',
  brandName: '${panelName} Panel',
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
  },
  navigation: {
    dashboard: {
      label: 'Dashboard',
      url: '/${panelNameLower}/dashboard',
    },
  },
};
`;

// Generate panel layout component
const panelLayout = `import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { ${panelName}Sidebar } from './components/layout/${panelName}Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';

interface ${panelName}LayoutProps {
  children?: React.ReactNode;
}

export function ${panelName}Layout({ children }: ${panelName}LayoutProps) {
  const defaultOpen = Cookies.get('${panelNameLower}_sidebar_state') !== 'false';
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={defaultOpen}>
        <${panelName}Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children ? children : <Outlet />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
`;


// Generate panel sidebar component
const panelSidebar = `import React from 'react';
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
import { ${panelNameLower}PanelConfig } from '../../config/${panelNameLower}-config';
import { LayoutDashboard, Settings, Users, Shield } from 'lucide-react';

export function ${panelName}Sidebar() {
  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{${panelNameLower}PanelConfig.brandName}</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to={${panelNameLower}PanelConfig.navigation.dashboard.url}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{${panelNameLower}PanelConfig.navigation.dashboard.label}</span>
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
          © 2024 ${panelName} Panel
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
`;

// Generate dashboard page component
const dashboardPage = `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ${panelNameLower}PanelConfig } from '../config/${panelNameLower}-config';
import { Users, Activity, CheckCircle, Package, TrendingUp, Clock } from 'lucide-react';

export function ${panelName}Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">{${panelNameLower}PanelConfig.navigation.dashboard.label}</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome to your {${panelNameLower}PanelConfig.brandName} - Monitor and manage your system
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              Real-time activity
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panel Version</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.0.0</div>
            <p className="text-xs text-muted-foreground">
              Latest version
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Update deployed</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Users className="h-4 w-4" />
                Manage Users
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                <Activity className="h-4 w-4" />
                View Analytics
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
                <Package className="h-4 w-4" />
                System Settings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

// Generate route files
const panelRoute = `import { createFileRoute } from '@tanstack/react-router';
import { ${panelName}Layout } from '@/panels/${panelNameLower}/${panelName}Layout';

export const Route = createFileRoute('/_authenticated/${panelNameLower}')({
  component: ${panelName}Layout,
});
`;

const dashboardRoute = `import { createFileRoute } from '@tanstack/react-router';
import { ${panelName}Dashboard } from '@/panels/${panelNameLower}/pages/${panelName}Dashboard';

export const Route = createFileRoute('/_authenticated/${panelNameLower}/dashboard')({
  component: ${panelName}Dashboard,
});
`;

const indexRoute = `import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/${panelNameLower}/')({
  beforeLoad: () => {
    throw redirect({
      to: '/${panelNameLower}/dashboard',
    });
  },
});
`;

// Write files
const files = [
  { path: path.join(panelDir, 'config', `${panelNameLower}-config.ts`), content: panelConfig },
  { path: path.join(panelDir, `${panelName}Layout.tsx`), content: panelLayout },
  { path: path.join(panelDir, 'components', 'layout', `${panelName}Sidebar.tsx`), content: panelSidebar },
  { path: path.join(panelDir, 'pages', `${panelName}Dashboard.tsx`), content: dashboardPage },
  { path: path.join(routesDir, 'route.tsx'), content: panelRoute },
  { path: path.join(routesDir, 'dashboard.tsx'), content: dashboardRoute },
  { path: path.join(routesDir, 'index.tsx'), content: indexRoute },
];

files.forEach(file => {
  fs.writeFileSync(file.path, file.content);
  console.log(`📄 Created file: ${file.path}`);
});

// Generate index file for easy imports
const indexFile = `export { ${panelName}Layout } from './${panelName}Layout';
export { ${panelName}Dashboard } from './pages/${panelName}Dashboard';
export { ${panelName}Sidebar } from './components/layout/${panelName}Sidebar';
export { ${panelNameLower}PanelConfig } from './config/${panelNameLower}-config';
`;

fs.writeFileSync(path.join(panelDir, 'index.ts'), indexFile);
console.log(`📄 Created index file: ${path.join(panelDir, 'index.ts')}`);

// Update route tree (if using TanStack Router)
try {
  console.log('🔄 Regenerating route tree...');
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Route tree regenerated successfully');
} catch (error) {
  console.warn('⚠️  Warning: Could not regenerate route tree automatically');
  console.warn('   Please run \`npm run build\` manually to update routes');
}

console.log('\\n🎉 Panel generation completed!');
console.log(`\\n📋 Summary:`);
console.log(`   Panel Name: ${panelName}`);
console.log(`   Panel Path: /${panelNameLower}`);
console.log(`   Dashboard URL: /${panelNameLower}/dashboard`);
console.log(`\\n🚀 You can now visit your panel at: http://localhost:5173/${panelNameLower}`);
console.log(`\\n📁 Generated files:`);
files.forEach(file => console.log(`   - ${file.path}`));