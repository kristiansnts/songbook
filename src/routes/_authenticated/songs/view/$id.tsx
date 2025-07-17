import { createFileRoute } from '@tanstack/react-router'
import { SongViewPage } from '@/resources/songs'

export const Route = createFileRoute('/_authenticated/songs/view/$id')({
  component: SongViewPage,
})