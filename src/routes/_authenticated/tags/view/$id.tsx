import { createFileRoute } from '@tanstack/react-router'
import { TagViewPage } from '@/resources/tags'

export const Route = createFileRoute('/_authenticated/tags/view/$id')({
  component: TagViewPage,
})