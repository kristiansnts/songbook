import React from 'react'
import {
  IconUserCheck,
  IconLogout,
  IconMail,
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ApprovedPageProps {
  userName: string
  userEmail: string
  fullName?: string
}

export function ApprovedPage({
  userName,
  userEmail,
  fullName,
}: ApprovedPageProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4 dark:from-green-950 dark:to-emerald-950'>
      <Card className='mx-auto w-full max-w-md border-green-200 shadow-lg dark:border-green-800'>
        <CardHeader className='pb-4 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
            <IconUserCheck className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
          <CardTitle className='text-2xl font-bold text-green-800 dark:text-green-200'>
            Account Approved!
          </CardTitle>
          <p className='mt-2 text-green-600 dark:text-green-400'>
            Your access request has been approved by administrators
          </p>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50'>
            <h3 className='mb-3 font-semibold text-green-800 dark:text-green-200'>
              Account Details
            </h3>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                  <IconUser className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Username</p>
                  <p className='font-medium text-green-800 dark:text-green-200'>
                    {userName}
                  </p>
                </div>
              </div>

              {fullName && (
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                    <IconUser className='h-4 w-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Full Name</p>
                    <p className='font-medium text-green-800 dark:text-green-200'>
                      {fullName}
                    </p>
                  </div>
                </div>
              )}

              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                  <IconMail className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Email</p>
                  <p className='font-medium text-green-800 dark:text-green-200'>
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50'>
            <div className='flex items-start gap-3'>
              <IconUserCheck className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
              <div className='text-sm'>
                <p className='font-medium text-blue-900 dark:text-blue-100'>
                  Welcome to the Platform!
                </p>
                <p className='mt-1 text-blue-700 dark:text-blue-300'>
                  You now have full access to all platform features. Please log
                  out and log back in to access your dashboard.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            className='w-full bg-green-600 text-white hover:bg-green-700'
            size='lg'
          >
            <IconLogout className='mr-2 h-4 w-4' />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
