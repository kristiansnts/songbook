import { createFileRoute } from '@tanstack/react-router'
import { NoteCreatePage } from '@/resources/notes'

export const Route = createFileRoute('/_authenticated/notes/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NoteCreatePage />
}