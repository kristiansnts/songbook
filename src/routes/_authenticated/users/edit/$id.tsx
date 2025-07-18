import { createFileRoute } from '@tanstack/react-router'
import { UserEditPage } from '@/resources/users'

export const Route = createFileRoute('/_authenticated/users/edit/$id')({
  component: UserEditPage,
})