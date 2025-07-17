import { createFileRoute } from '@tanstack/react-router'
import { SongListPage } from '@/resources/songs'

export const Route = createFileRoute('/_authenticated/songs/')({
  component: SongListPage,
})
