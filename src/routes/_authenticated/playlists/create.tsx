import { createFileRoute } from '@tanstack/react-router'
import { PlaylistCreatePage } from '@/resources/playlists'

export const Route = createFileRoute('/_authenticated/playlists/create')({
  component: PlaylistCreatePage,
})
