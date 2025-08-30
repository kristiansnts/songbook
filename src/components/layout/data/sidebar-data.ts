import { type SidebarData } from '../types'
import { resourceRegistry } from '@/lib/resources/registry'

// Auto-load all resources
import '@/lib/resources/auto-loader'

// Generate sidebar data from auto-registered resources
// Since this is now async, we need to handle it differently
export async function getSidebarData(): Promise<SidebarData> {
  return await resourceRegistry.generateSidebarData()
}

// For backwards compatibility, provide a default sidebar
export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'user@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [],
}
