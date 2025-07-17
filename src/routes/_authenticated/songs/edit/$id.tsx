import { createFileRoute } from '@tanstack/react-router'
import { SongEditPage } from '@/resources/songs'

export const Route = createFileRoute('/_authenticated/songs/edit/$id')({
  component: SongEditPage,
})