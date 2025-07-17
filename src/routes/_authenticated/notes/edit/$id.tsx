import { createFileRoute } from '@tanstack/react-router'
import NoteEditPage from '@/resources/notes/pages/edit'

export const Route = createFileRoute('/_authenticated/notes/edit/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  
  return <NoteEditPage recordId={id} />
}