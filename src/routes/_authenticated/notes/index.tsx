import { createFileRoute } from '@tanstack/react-router'
import NoteListPage from '@/resources/notes/pages/list'

export const Route = createFileRoute('/_authenticated/notes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NoteListPage />
}