import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconUserX, IconUserCheck, IconClock } from '@tabler/icons-react'
import { toast } from 'sonner'

interface PendingAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userEmail: string
  userId?: string
  onRequestSuccess?: () => void
}

export function PendingAccessModal({ 
  open, 
  onOpenChange, 
  userName, 
  userEmail,
  userId,
  onRequestSuccess
}: PendingAccessModalProps) {
  const [isRequesting, setIsRequesting] = React.useState(false)

  const handleRequestAccess = async () => {
    if (!userId) {
      toast.error('User ID not found', {
        description: 'Unable to submit request. Please try logging in again.',
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      return
    }

    setIsRequesting(true)
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth-token')
      
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('https://songbanks-v1-1.vercel.app/api/users/request-vol-access', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId
        })
      })

      console.log('API Response status:', response.status)
      
      let result
      try {
        result = await response.json()
        console.log('API Response data:', result)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error('Invalid response from server')
      }

      // Handle successful responses (200, 201, 202)
      if (response.ok) {
        // Check if we have a JSON response with a code
        if (result && result.code === 200) {
          // Standard success response
          toast.success('Access request submitted successfully!', {
            description: 'Your request has been sent to administrators for review.',
            action: {
              label: 'x',
              onClick: () => toast.dismiss()
            }
          })
        } else if (response.status === 202) {
          // HTTP 202 Accepted - request accepted for processing
          toast.success('Access request submitted successfully!', {
            description: 'Your request has been sent to administrators for review.',
            action: {
              label: 'x',
              onClick: () => toast.dismiss()
            }
          })
        } else {
          // Other successful status codes
          toast.success('Access request submitted successfully!', {
            description: 'Your request has been sent to administrators for review.',
            action: {
              label: 'x',
              onClick: () => toast.dismiss()
            }
          })
        }
        
        onOpenChange(false)
        onRequestSuccess?.() // Trigger the request success callback
      } else {
        const errorMessage = result?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API Error:', errorMessage, result)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting access request:', error)
      
      let errorMessage = 'Please try again later or contact support.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error('Failed to submit access request', {
        description: errorMessage,
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <IconClock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Account Pending Approval
          </DialogTitle>
          <DialogDescription className="text-base">
            Your account is currently pending approval from administrators.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <IconUserX className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{userName}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Current Status:</strong> Pending Review
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Role:</strong> Guest Access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
          <div className="flex gap-3">
            <IconUserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Request Full Access
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Submit a request to administrators for full platform access. You'll be notified once your request is reviewed.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRequesting}
          >
            Close
          </Button>
          <Button
            onClick={handleRequestAccess}
            disabled={isRequesting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRequesting ? (
              <>
                <IconClock className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <IconUserCheck className="mr-2 h-4 w-4" />
                Request Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}