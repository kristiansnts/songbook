import { createFileRoute } from '@tanstack/react-router'
import { UserApprovalListPage } from '@/resources/users'

export const Route = createFileRoute('/_authenticated/user-approval/')({
  component: UserApprovalListPage,
})