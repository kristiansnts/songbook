import { createFileRoute } from '@tanstack/react-router'
import { TagCreatePage } from '@/resources/tags'

export const Route = createFileRoute('/_authenticated/tags/create')({
  component: TagCreatePage,
})