import { createFileRoute } from '@tanstack/react-router'
import PublicPrivacyPolicyPage from '@/features/privacy-policy/public.tsx'

export const Route = createFileRoute('/privacy-policy')({
    component: PublicPrivacyPolicyPage,
})
