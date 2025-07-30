import { createFileRoute } from '@tanstack/react-router'
import { TagEditPage } from '@/resources/tags'

export const Route = createFileRoute('/_authenticated/tags/edit/$id')({
  component: TagEditPage,
})