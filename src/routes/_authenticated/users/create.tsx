import { createFileRoute } from '@tanstack/react-router'
import { UserCreatePage } from '@/resources/users'

export const Route = createFileRoute('/_authenticated/users/create')({
  component: UserCreatePage,
})