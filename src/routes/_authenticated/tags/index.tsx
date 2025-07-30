import { createFileRoute } from '@tanstack/react-router'
import { TagListPage } from '@/resources/tags'

export const Route = createFileRoute('/_authenticated/tags/')({
  component: TagListPage,
})