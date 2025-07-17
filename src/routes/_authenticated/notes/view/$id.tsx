import { createFileRoute } from '@tanstack/react-router'
import NoteViewPage from '@/resources/notes/pages/view'

export const Route = createFileRoute('/_authenticated/notes/view/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  
  return <NoteViewPage recordId={id} />
}