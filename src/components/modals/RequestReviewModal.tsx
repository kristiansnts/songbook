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
import { IconUserCheck, IconClock, IconUserX } from '@tabler/icons-react'

interface RequestReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userEmail: string
}

export function RequestReviewModal({ 
  open, 
  onOpenChange, 
  userName, 
  userEmail 
}: RequestReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <IconClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Request Under Review
          </DialogTitle>
          <DialogDescription className="text-base">
            Your access request is currently being reviewed by administrators.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-l-4 border-l-yellow-500">
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
                  <strong>Current Status:</strong> Request Under Review
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Role:</strong> Guest Access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 dark:bg-yellow-950/50 rounded-lg p-4">
          <div className="flex gap-3">
            <IconUserCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Request Submitted
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Your account is currently on request review from administrator. You will be notified once your access request has been processed.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}