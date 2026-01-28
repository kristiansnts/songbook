import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='text-destructive mx-auto mb-4 h-12 w-12'>
            <AlertTriangle className='h-full w-full' />
          </div>
          <CardTitle className='text-2xl font-bold'>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-muted-foreground'>
            You don't have permission to access this page. Please contact an
            administrator if you believe this is an error.
          </p>

          <div className='flex flex-col justify-center gap-2 sm:flex-row'>
            <Button asChild variant='outline'>
              <Link to='/'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link to='/sign-in'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
