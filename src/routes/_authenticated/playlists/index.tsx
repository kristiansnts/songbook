import { createFileRoute } from '@tanstack/react-router'
import { PlaylistListPage } from '@/resources/playlists'

export const Route = createFileRoute('/_authenticated/playlists/')({
  component: PlaylistListPage,
})
