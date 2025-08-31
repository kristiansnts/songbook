import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, Search, X, Loader2, Play, Share, Copy } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/user/playlist/$id')({
  component: PlaylistComponent,
})

function PlaylistComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareLink, setShareLink] = useState<string>('')
  const [generatingLink, setGeneratingLink] = useState(false)
  
  useEffect(() => {
    loadPlaylistData()
  }, [id])

  useEffect(() => {
    // Set share link if playlist has one
    if (playlist?.sharable_link) {
      setShareLink(playlist.sharable_link)
    }
  }, [playlist])

  const loadPlaylistData = async () => {
    try {
      setLoading(true)
      const playlistData = await playlistService.getPlaylist(id)
      setPlaylist(playlistData)
      setSongs(playlistData.songs || [])
    } catch (_error) {
      setPlaylist({ id, name: 'Playlist Not Found', songCount: 0 })
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSong = async (songId: number) => {
    try {
      setRemovingIds(prev => new Set([...prev, songId]))
      
      await playlistService.removeSongFromPlaylist(id, songId)
      
      // Reload playlist data to get updated song list
      await loadPlaylistData()
      
      toast.success('Song removed from playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } catch (error) {
      toast.error('Failed to remove song from playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(songId)
        return newSet
      })
    }
  }

  const handleBackToLibrary = () => {
    navigate({ to: '/user/dashboard' })
  }

  const handlePlayPlaylist = () => {
    if (songs.length > 0) {
      // Navigate to playlist viewer
      navigate({ 
        to: '/user/playlist/view/$id', 
        params: { id }
      })
    }
  }

  const getOrCreateShareLink = async (): Promise<string> => {
    // Return existing share link if available
    if (playlist?.sharable_link) {
      return playlist.sharable_link
    }
    
    // Generate new share link
    try {
      const newShareLink = await playlistService.createShareLink(id)
      return newShareLink
    } catch (_error) {
      // Fallback to manual share link
      const fallbackUrl = `${window.location.origin}/user/playlist/${id}`
      toast.error('Using fallback share link', {
        description: 'Could not generate API share link',
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      return fallbackUrl
    }
  }

  const handleSharePlaylist = () => {
    // Check if we have a valid share link (not empty/null)
    const existingLink = playlist?.sharable_link || shareLink
    if (existingLink && existingLink.trim() !== '') {
      setShareLink(existingLink)
      setShareDialogOpen(true)
      return
    }
    
    // If no valid share link exists, show confirmation dialog
    setConfirmDialogOpen(true)
  }

  const handleConfirmCreateShareLink = async () => {
    setConfirmDialogOpen(false)
    setShareDialogOpen(true)
    
    try {
      setGeneratingLink(true)
      const link = await getOrCreateShareLink()
      setShareLink(link)
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      if (!shareLink) {
        toast.error('No share link available')
        return
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink)
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea')
        textArea.value = shareLink
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopySuccess(true)
      toast.success('Link copied to clipboard!', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })

      // Reset copy success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading playlist...
        </div>
      </div>
    )
  }
  
  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          Playlist not found
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLibrary}
            className="mr-2 p-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg">Library</span>
        </div>
      </header>

      {/* Playlist Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{playlist.name}</h1>
            <p className="text-gray-500 mt-1">
              {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleSharePlaylist}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Playlist</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view this playlist
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    id="link"
                    value={generatingLink ? 'Generating share link...' : shareLink}
                    readOnly
                    className="h-9"
                    disabled={generatingLink}
                  />
                </div>
                <Button
                  size="sm"
                  className="px-3"
                  onClick={handleCopyLink}
                  variant={copySuccess ? "default" : "secondary"}
                  disabled={generatingLink || !shareLink}
                >
                  {generatingLink ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {generatingLink ? "Generating..." : copySuccess ? "Copied!" : "Copy"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Confirmation Dialog for creating share link */}
          <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Share Link?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a shareable link that allows anyone with the link to view this playlist. 
                  Do you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCreateShareLink}>
                  Create Share Link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          className="pl-10"
          placeholder="Search in playlist"
          type="text"
        />
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No songs in this playlist
          </div>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center p-4 rounded-lg group"
            >
              {/* Index */}
              <div className="w-8 text-center mr-4">
                <span className="text-gray-500 text-sm">
                  {index + 1}
                </span>
              </div>

              {/* Song Info - Only title and artist */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {song.artist}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSong(song.id)}
                disabled={removingIds.has(song.id)}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100"
              >
                {removingIds.has(song.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Floating Play Button */}
      {songs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handlePlayPlaylist}
            className="w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      )}
    </div>
  )
}