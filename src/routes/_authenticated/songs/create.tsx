import { createFileRoute } from '@tanstack/react-router'
import { SongCreatePage } from '@/resources/songs'

export const Route = createFileRoute('/_authenticated/songs/create')({
  component: SongCreatePage,
})