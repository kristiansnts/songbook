import {
  IconLayoutDashboard,
  IconHelp,
  IconMusic,
  IconPlaylist,
  IconUsers,
} from '@tabler/icons-react'
import { type SidebarData } from '@/components/layout/types'
import { Resource } from './types'

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
    return this.getAllResources().filter(
      (resource) => resource.getNavigationVisible() && !resource.hideMenu()
    )
  }

  async generateSidebarData(): Promise<SidebarData> {
    const resources = this.getVisibleResources()

    // Group resources by navigation group
    const groupedResources = new Map<string, Resource[]>()

    resources.forEach((resource) => {
      const group = resource.getNavigationGroup() || 'General'
      if (!groupedResources.has(group)) {
        groupedResources.set(group, [])
      }
      groupedResources.get(group)!.push(resource)
    })

    // Sort resources within each group by navigation sort
    groupedResources.forEach((resourceList) => {
      resourceList.sort((a, b) => a.getNavigationSort() - b.getNavigationSort())
    })

    // Generate navigation groups
    const navGroups = Array.from(groupedResources.entries()).map(
      ([title, resources]) => ({
        title,
        items: resources.map((resource) => ({
          title: resource.getNavigationLabel(),
          url: resource.getNavigationUrl() as any,
          icon: resource.getNavigationIcon() as any,
        })),
      })
    )

    // Determine user type (default to pengurus for backwards compatibility)
    let userType = 'pengurus'
    try {
      // Try to get user info from auth manager
      const { authManager } = await import('@/lib/auth-manager')
      if (authManager.isLoggedIn()) {
        const user = await authManager.getCurrentUser()
        if (user?.userType) {
          userType = user.userType
        }
      }
    } catch (error) {
      console.warn(
        'Could not determine user type, defaulting to pengurus:',
        error
      )
    }

    // Create different navigation based on user type
    let staticNavGroups

    if (userType === 'peserta') {
      // Navigation for peserta (regular users)
      staticNavGroups = [
        {
          title: 'Peserta',
          items: [
            {
              title: 'Dashboard',
              url: '/user/dashboard' as any,
              icon: IconLayoutDashboard as any,
            },
            {
              title: 'Songs',
              url: '/user/song' as any,
              icon: IconMusic as any,
            },
            {
              title: 'Playlist',
              url: '/user/dashboard?section=playlist' as any,
              icon: IconPlaylist as any,
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
    } else {
      // Navigation for pengurus (admin users) - keep old structure
      staticNavGroups = [
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
    }

    // Merge static and resource-generated navigation
    const mergedNavGroups = [...staticNavGroups]

    // Only merge resource groups for pengurus users
    if (userType === 'pengurus') {
      navGroups.forEach((resourceGroup) => {
        const existingGroup = mergedNavGroups.find(
          (g) => g.title === resourceGroup.title
        )
        if (existingGroup) {
          // Merge resource items into existing group
          existingGroup.items.push(...resourceGroup.items)
        } else {
          // Add new group
          mergedNavGroups.push(resourceGroup)
        }
      })
    }

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
