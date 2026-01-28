import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import PlaylistView from '@/features/library/components/playlist-view'

export const Route = createFileRoute('/_authenticated/playlist/$id')({
  component: PlaylistComponent,
})

function PlaylistComponent() {
  const { id } = Route.useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true)
        const playlistData = await playlistService.getPlaylist(id)
        setPlaylist(playlistData)
      } catch (error) {
        console.error('Error loading playlist:', error)
        // Fallback to default playlist
        setPlaylist({ id, name: 'Playlist Not Found', songCount: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadPlaylist()
  }, [id])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        Loading playlist...
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className='flex items-center justify-center p-8'>
        Playlist not found
      </div>
    )
  }

  return (
    <PlaylistView playlistName={playlist.name} songCount={playlist.songCount} />
  )
}
