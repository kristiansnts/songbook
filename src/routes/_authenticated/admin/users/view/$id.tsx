import { createFileRoute } from '@tanstack/react-router'
import UserViewPage from '@/panels/admin/resources/users/pages/view'

export const Route = createFileRoute('/_authenticated/admin/users/view/$id')({
  component: UserViewPage,
})
