import { createFileRoute, useParams } from '@tanstack/react-router'
import { SongResource } from '@/panels/admin/resources/songs/songResource'
import { EditPage } from '@/lib/resources/pages/edit-page'

const songResource = new SongResource()

function SongEditPage() {
  const { id } = useParams({ from: '/_authenticated/admin/songs/edit/$id' })

  return (
    <EditPage
      resource={songResource}
      recordId={id}
      onSuccess={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/songs'
        }
      }}
    />
  )
}

export const Route = createFileRoute('/_authenticated/admin/songs/edit/$id')({
  component: SongEditPage,
})
