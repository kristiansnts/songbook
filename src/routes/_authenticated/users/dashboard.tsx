import { createFileRoute } from '@tanstack/react-router';
import { UsersDashboard } from '@/panels/users/pages/UsersDashboard';

export const Route = createFileRoute('/_authenticated/users/dashboard')({
  component: UsersDashboard,
});
