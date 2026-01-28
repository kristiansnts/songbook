import React from 'react'
import {
  Users,
  Activity,
  CheckCircle,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usersPanelConfig } from '../config/users-config'

export function UsersDashboard() {
  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='border-b pb-6'>
        <h1 className='text-4xl font-bold tracking-tight'>
          {usersPanelConfig.navigation.dashboard.label}
        </h1>
        <p className='text-muted-foreground mt-2 text-lg'>
          Welcome to your {usersPanelConfig.brandName} - Monitor and manage your
          system
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='relative overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,234</div>
            <p className='text-muted-foreground text-xs'>
              <TrendingUp className='mr-1 inline h-3 w-3' />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Sessions
            </CardTitle>
            <Activity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>89</div>
            <p className='text-muted-foreground text-xs'>
              <Clock className='mr-1 inline h-3 w-3' />
              Real-time activity
            </p>
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Status</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>Online</div>
            <p className='text-muted-foreground text-xs'>
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Panel Version</CardTitle>
            <Package className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>v1.0.0</div>
            <p className='text-muted-foreground text-xs'>Latest version</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                  <Users className='h-4 w-4 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>New user registered</p>
                  <p className='text-muted-foreground text-xs'>2 minutes ago</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>System backup completed</p>
                  <p className='text-muted-foreground text-xs'>1 hour ago</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-100'>
                  <Package className='h-4 w-4 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Update deployed</p>
                  <p className='text-muted-foreground text-xs'>3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <button className='bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors'>
                <Users className='h-4 w-4' />
                Manage Users
              </button>
              <button className='bg-secondary text-secondary-foreground hover:bg-secondary/80 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors'>
                <Activity className='h-4 w-4' />
                View Analytics
              </button>
              <button className='bg-accent text-accent-foreground hover:bg-accent/80 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors'>
                <Package className='h-4 w-4' />
                System Settings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
