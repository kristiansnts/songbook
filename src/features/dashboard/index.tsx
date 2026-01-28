import { RefreshCw } from 'lucide-react'
import { useDashboardData } from '@/lib/dashboard-data-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'

export default function Dashboard() {
  const { stats, isLoading, refreshData } = useDashboardData()

  return (
    <>
      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <Button
            variant='outline'
            size='sm'
            onClick={refreshData}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Songs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isLoading ? 'Loading...' : `${stats.totalSongs} Songs`}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    +{stats.monthlySongs} Song from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isLoading ? 'Loading...' : stats.totalUsers}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Active Core Users
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
