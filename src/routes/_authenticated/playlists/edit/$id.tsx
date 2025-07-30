import { createFileRoute } from '@tanstack/react-router'
import { PlaylistEditPage } from '@/resources/playlists'

export const Route = createFileRoute('/_authenticated/playlists/edit/$id')({
  component: PlaylistEditPage,
})
