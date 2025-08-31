import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/user/playlist/view/$id')({
  component: PlaylistViewerComponent,
})

// Component to render individual song content
function SongContent({ song, index }: { song: Song; index: number }) {
  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      {/* Song Header */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
            {index + 1}
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{song.title}</h2>
            <p className="text-gray-600">{song.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Key: <strong className="text-gray-700">{song.base_chord}</strong></span>
        </div>
      </div>

      {/* Song Lyrics and Chords */}
      <div className="lyrics-content">
        {song.lyrics_and_chords ? (
          <div 
            className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: song.lyrics_and_chords }}
          />
        ) : (
          <p className="text-gray-500 italic">No lyrics available</p>
        )}
      </div>
    </div>
  )
}

function PlaylistViewerComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlaylistData()
  }, [id])

  const loadPlaylistData = async () => {
    try {
      setLoading(true)
      const playlistData = await playlistService.getPlaylist(id)
      setPlaylist(playlistData)
      setSongs(playlistData.songs || [])
    } catch (error) {
      console.error('Error loading playlist data:', error)
      toast.error('Failed to load playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      setPlaylist({ id, name: 'Playlist Not Found', songCount: 0 })
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPlaylist = () => {
    navigate({ to: '/user/playlist/$id', params: { id } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading playlist...
          </div>
        </div>
      </div>
    )
  }

  if (!playlist || songs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No songs found in this playlist</p>
              <Button onClick={handleBackToPlaylist} variant="outline">
                Back to Playlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToPlaylist}
              className="mr-2 p-1"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{playlist.name}</h1>
              <p className="text-sm text-gray-500">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* All Songs Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {songs.map((song, index) => (
            <SongContent key={song.id} song={song} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}