import {
  IconHelp,
  IconLayoutDashboard,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'
import { resourceRegistry } from '@/lib/resources/registry'

// Import and register resources
import { SongResource } from '@/resources/songs'
import { NoteResource } from '@/resources/notes'
import { UserResource } from '@/resources/users'

// Register resources
resourceRegistry.register(new SongResource())
resourceRegistry.register(new NoteResource())
resourceRegistry.register(new UserResource())

// Generate sidebar data from resources
const generateSidebarData = (): SidebarData => {
  const resources = resourceRegistry.getVisibleResources()
  
  // Group resources by navigation group
  const groupedResources = new Map<string, typeof resources>()
  
  resources.forEach(resource => {
    const group = resource.getNavigationGroup() || 'General'
    if (!groupedResources.has(group)) {
      groupedResources.set(group, [])
    }
    groupedResources.get(group)!.push(resource)
  })

  // Sort resources within each group by navigation sort
  groupedResources.forEach(resourceList => {
    resourceList.sort((a, b) => a.getNavigationSort() - b.getNavigationSort())
  })

  // Generate navigation groups
  const resourceNavGroups = Array.from(groupedResources.entries()).map(([title, resources]) => ({
    title,
    items: resources.map(resource => ({
      title: resource.getNavigationLabel(),
      url: resource.getNavigationUrl() as any,
      icon: resource.getNavigationIcon() as any,
    }))
  }))

  // Static navigation items
  const staticNavItems = [
    {
      title: 'Dashboard',
      url: '/dashboard' as any,
      icon: IconLayoutDashboard as any,
    },
  ]

  // Merge static items with resource items in General group
  const generalGroup = resourceNavGroups.find(g => g.title === 'General')
  if (generalGroup) {
    generalGroup.items.unshift(...staticNavItems)
  } else {
    resourceNavGroups.unshift({
      title: 'General',
      items: staticNavItems,
    })
  }

  // Add Other group with static items
  resourceNavGroups.push({
    title: 'Other',
    items: [
      {
        title: 'Help Center',
        url: '/help-center' as any,
        icon: IconHelp as any,
      },
    ],
  })

  return {
    user: {
      name: 'kristian',
      email: 'epafroditus.kristian@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navGroups: resourceNavGroups,
  }
}

export const sidebarData: SidebarData = generateSidebarData()
