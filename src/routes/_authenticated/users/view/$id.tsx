import { createFileRoute } from '@tanstack/react-router'
import { UserViewPage } from '@/panels/admin/resources/users'

export const Route = createFileRoute('/_authenticated/users/view/$id')({
  component: UserViewPage,
})