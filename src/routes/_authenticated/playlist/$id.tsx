import { createFileRoute } from '@tanstack/react-router'
import PlaylistView from '@/features/library/components/playlist-view'

export const Route = createFileRoute('/_authenticated/playlist/$id')({
  component: PlaylistComponent,
})

function PlaylistComponent() {
  const { id } = Route.useParams()
  
  // Mock playlist data - in a real app, this would come from an API
  const mockPlaylists: Record<string, { name: string; count: number }> = {
    '1': { name: 'Monoplex Club', count: 10 },
    '2': { name: 'Veľký Biel Festival', count: 9 },
    '3': { name: 'Summer Open Air', count: 8 },
  }
  
  const playlist = mockPlaylists[id] || { name: 'Test', count: 0 }
  
  return <PlaylistView playlistName={playlist.name} songCount={playlist.count} />
}