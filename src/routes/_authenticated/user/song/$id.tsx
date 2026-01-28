import { useState, useEffect } from 'react'
import {
  createFileRoute,
  redirect,
  useParams,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { songService } from '@/services/songService'
import { Song } from '@/types/song'
import { ChevronLeft, Plus } from 'lucide-react'
import { authManager } from '@/lib/auth-manager'
import { Button } from '@/components/ui/button'
import { PlaylistDialog } from '@/components/playlist-dialog'
import { SongViewer } from '@/components/song-viewer'

function SongViewPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_authenticated/user/song/$id' })
  const search = useSearch({ from: '/_authenticated/user/song/$id' }) as {
    search?: string
    artist?: string
  }
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)

  const handleAddToPlaylist = () => {
    setShowPlaylistDialog(true)
  }

  const handlePlaylistAdd = (
    playlistIds: string[],
    newPlaylistName?: string
  ) => {
    // TODO: Implement actual playlist API calls
    console.log(
      'Adding song to playlists:',
      playlistIds,
      'New playlist:',
      newPlaylistName
    )

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
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-muted-foreground'>Loading song...</div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center space-y-4'>
        <div className='text-destructive'>{error || 'Song not found'}</div>
        <Button onClick={() => navigate({ to: '/user/song', search })}>
          Back to Songs
        </Button>
      </div>
    )
  }

  return (
    <div className='flex h-screen flex-col'>
      {/* Fixed Header */}
      <header className='border-border bg-background flex items-center justify-between border-b px-4 py-4'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/user/song', search })}
            className='mr-2 p-1'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <span className='text-foreground text-lg'>Songs</span>
        </div>

        <Button
          onClick={handleAddToPlaylist}
          className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          <span className='hidden sm:inline'>Add to Playlist</span>
        </Button>
      </header>

      {/* Scrollable Song Content */}
      <main className='flex-1 overflow-y-auto'>
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
  validateSearch: (search) => ({
    search: (search.search as string) || undefined,
    artist: (search.artist as string) || undefined,
  }),
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
