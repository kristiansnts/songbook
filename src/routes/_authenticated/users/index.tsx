import { createFileRoute } from '@tanstack/react-router'
import { UserListPage } from '@/resources/users'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UserListPage,
})
