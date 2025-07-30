import { type SidebarData } from '../types'
import { resourceRegistry } from '@/lib/resources/registry'

// Auto-load all resources
import '@/lib/resources/auto-loader'

// Generate sidebar data from auto-registered resources
export const sidebarData: SidebarData = resourceRegistry.generateSidebarData()
