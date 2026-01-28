import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { ApprovedPage } from '@/components/pages/ApprovedPage'

function ApprovedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <ApprovedPage
      userName={user.name}
      userEmail={user.email}
      fullName={user.name}
    />
  )
}

export const Route = createFileRoute('/approved')({
  component: ApprovedRoute,
})
