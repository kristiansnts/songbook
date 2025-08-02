import { createFileRoute } from '@tanstack/react-router'
import { ApprovedPage } from '@/components/pages/ApprovedPage'
import { useAuth } from '@/lib/auth'

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