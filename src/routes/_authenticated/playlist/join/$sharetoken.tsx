import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { playlistService } from '@/services/playlist-service'
import { toast } from 'sonner'
import { IconPlaylist, IconUserPlus } from '@tabler/icons-react'

export const Route = createFileRoute('/_authenticated/playlist/join/$sharetoken')({
  component: PlaylistJoin,
})

function PlaylistJoin() {
  const { sharetoken } = useParams({ from: '/_authenticated/playlist/join/$sharetoken' })
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false) // Start with false
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    // Check if there's a saved sharetoken from before login
    const savedShareToken = localStorage.getItem('pending_playlist_join')
    
    if (savedShareToken && savedShareToken === sharetoken) {
      // Clear the saved token
      localStorage.removeItem('pending_playlist_join')
      toast.info('You can now join the playlist!')
    }
    
    // Set a small delay to ensure component is fully mounted before showing dialog
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [sharetoken])

  const handleJoin = async () => {
    if (!sharetoken) {
      toast.error('Invalid share token')
      return
    }

    setIsJoining(true)
    try {
      await playlistService.joinPlaylist(sharetoken)
      toast.success('Successfully joined the playlist!')
      
      // Redirect to user dashboard
      navigate({ to: '/user/dashboard' })
    } catch (error: any) {
      console.error('Failed to join playlist:', error)
      
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        // Save sharetoken to localStorage and redirect to login
        localStorage.setItem('pending_playlist_join', sharetoken)
        toast.error('Please login first to join the playlist')
        navigate({ to: '/sign-in' })
      } else if (error.message === 'PLAYLIST_OWNER') {
        toast.warning('You\'re the playlist owner and cannot join your own playlist')
      } else {
        toast.error('Failed to join playlist. Please try again.')
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    // Clear any saved sharetoken when cancelling
    localStorage.removeItem('pending_playlist_join')
    navigate({ to: '/user/dashboard' })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If user tries to close the dialog, treat it as cancel
      handleCancel()
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconPlaylist className="h-5 w-5" />
              Join Playlist
            </DialogTitle>
            <DialogDescription>
              You've been invited to join a playlist. Would you like to join it?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-primary/10 p-4">
              <IconUserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Playlist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fallback content - always show as a backup */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPlaylist className="h-5 w-5" />
            Join Playlist
          </CardTitle>
          <CardDescription>
            You've been invited to join a playlist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <IconUserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isJoining}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join Playlist'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}