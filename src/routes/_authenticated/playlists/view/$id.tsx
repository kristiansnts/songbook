import { createFileRoute } from '@tanstack/react-router'
import { PlaylistViewPage } from '@/resources/playlists'

export const Route = createFileRoute('/_authenticated/playlists/view/$id')({
  component: PlaylistViewPage,
})
