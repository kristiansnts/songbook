import { createFileRoute } from '@tanstack/react-router'
import { UserViewPage } from '@/resources/users'

export const Route = createFileRoute('/_authenticated/users/view/$id')({
  component: UserViewPage,
})