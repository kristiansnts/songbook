import { createFileRoute } from '@tanstack/react-router'
import UserListPage from '@/panels/admin/resources/users/pages/list'

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: UserListPage,
})