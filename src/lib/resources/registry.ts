import { Resource } from './types'
import { type SidebarData } from '@/components/layout/types'
import { IconLayoutDashboard, IconHelp } from '@tabler/icons-react'

class ResourceRegistry {
  private resources: Map<string, Resource> = new Map()

  register(resource: Resource) {
    this.resources.set(resource.getModel(), resource)
  }

  getResource(model: string): Resource | undefined {
    return this.resources.get(model)
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values())
  }

  getVisibleResources(): Resource[] {
    return this.getAllResources().filter(resource => 
      resource.getNavigationVisible() && !resource.hideMenu()
    )
  }

  generateSidebarData(): SidebarData {
    const resources = this.getVisibleResources()
    
    // Group resources by navigation group
    const groupedResources = new Map<string, Resource[]>()
    
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
    const navGroups = Array.from(groupedResources.entries()).map(([title, resources]) => ({
      title,
      items: resources.map(resource => ({
        title: resource.getNavigationLabel(),
        url: resource.getNavigationUrl() as any,
        icon: resource.getNavigationIcon() as any,
      }))
    }))

    // Add static navigation items (like Dashboard, Help Center)
    const staticNavGroups = [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/dashboard' as any,
            icon: IconLayoutDashboard as any,
          },
        ],
      },
      {
        title: 'Other',
        items: [
          {
            title: 'Help Center',
            url: '/help-center' as any,
            icon: IconHelp as any,
          },
        ],
      },
    ]

    // Merge static and resource-generated navigation
    const mergedNavGroups = [...staticNavGroups]
    
    navGroups.forEach(resourceGroup => {
      const existingGroup = mergedNavGroups.find(g => g.title === resourceGroup.title)
      if (existingGroup) {
        // Merge resource items into existing group
        existingGroup.items.push(...resourceGroup.items)
      } else {
        // Add new group
        mergedNavGroups.push(resourceGroup)
      }
    })

    return {
      user: {
        name: 'kristian',
        email: 'epafroditus.kristian@gmail.com',
        avatar: '/avatars/shadcn.jpg',
      },
      navGroups: mergedNavGroups,
    }
  }
}

export const resourceRegistry = new ResourceRegistry()
export { ResourceRegistry }