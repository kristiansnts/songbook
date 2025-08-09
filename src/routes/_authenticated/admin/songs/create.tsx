import { createFileRoute } from '@tanstack/react-router'
import { CreatePage } from '@/lib/resources/pages/create-page'
import { SongResource } from '@/panels/admin/resources/songs/songResource'

const songResource = new SongResource()

function SongCreatePage() {
  return (
    <CreatePage 
      resource={songResource}
      onSuccess={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/songs'
        }
      }}
    />
  )
}

export const Route = createFileRoute('/_authenticated/admin/songs/create')({
  component: SongCreatePage,
})