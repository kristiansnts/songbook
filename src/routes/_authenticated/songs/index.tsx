import { createFileRoute } from '@tanstack/react-router'
import Songs from '@/features/songs'

export const Route = createFileRoute('/_authenticated/songs/')({
  component: Songs,
})
