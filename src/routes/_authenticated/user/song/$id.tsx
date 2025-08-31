import { createFileRoute, redirect, useParams, useNavigate } from '@tanstack/react-router'
import { SongViewer } from '@/components/song-viewer'
import { PlaylistDialog } from '@/components/playlist-dialog'
import { authManager } from '@/lib/auth-manager'
import { songService } from '@/services/songService'
import { useState, useEffect } from 'react'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus } from 'lucide-react'

function SongViewPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_authenticated/user/song/$id' })
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)

  const handleAddToPlaylist = () => {
    setShowPlaylistDialog(true)
  }

  const handlePlaylistAdd = (playlistIds: string[], newPlaylistName?: string) => {
    // TODO: Implement actual playlist API calls
    console.log('Adding song to playlists:', playlistIds, 'New playlist:', newPlaylistName)
    
    // Show success message (you can replace with proper toast notification)tgy9igy
    const playlistText = playlistIds.length > 1 ? 'playlists' : 'playlist'
    const message = newPlaylistName 
      ? `Added to "${newPlaylistName}" and ${playlistIds.length} existing ${playlistText}`
      : `Added to ${playlistIds.length} ${playlistText}`
    
    // alert(message)
  }

  useEffect(() => {
    const fetchSong = async () => {
      try {
        setIsLoading(true)
        const data = await songService.getSong(id)
        setSong(data)
        setError(null)
      } catch (_err) {
        setError('Failed to load song')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSong()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading song...</div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-500">{error || 'Song not found'}</div>
        <Button onClick={() => navigate({ to: '/user/song' })}>
          Back to Songs
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b bg-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/user/song' })}
            className="mr-2 p-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg">Songs</span>
        </div>
        
        <Button
          onClick={handleAddToPlaylist}
          className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add to Playlist</span>
        </Button>
      </header>

      {/* Scrollable Song Content */}
      <main className="flex-1 overflow-y-auto">
        <SongViewer song={song} />
      </main>

      {/* Playlist Dialog */}
      <PlaylistDialog
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
        song={song}
        onAddToPlaylist={handlePlaylistAdd}
      />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/user/song/$id')({
  beforeLoad: async () => {
    // 🛡️ User route protection - require peserta permission
    try {
      const hasPermission = await authManager.hasPermission('peserta')
      
      if (!hasPermission) {
        throw redirect({
          to: '/unauthorized',
        })
      }
    } catch (error) {
      console.error('User song view permission check failed:', error)
      // If permission check fails but we have a token, allow access for development
      if (!authManager.getToken()) {
        throw redirect({
          to: '/sign-in',
        })
      }
    }
  },
  component: SongViewPage,
})