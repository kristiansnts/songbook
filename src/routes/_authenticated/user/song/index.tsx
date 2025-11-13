import { createFileRoute } from '@tanstack/react-router'
import { SongListView } from '@/features/songs'

export const Route = createFileRoute('/_authenticated/user/song/')({
  validateSearch: (search) => ({
    artist: (search.artist as string) || undefined,
    search: (search.search as string) || undefined,
  }),
  component: SongListView,
})