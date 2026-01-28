import { useState, useEffect } from 'react'
import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { getSidebarData } from './data/sidebar-data'
import { type SidebarData } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebarData, setSidebarData] = useState<SidebarData>({
    user: {
      name: 'User',
      email: 'user@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navGroups: [],
  })

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const data = await getSidebarData()
        setSidebarData(data)
      } catch (error) {
        console.error('Failed to load sidebar data:', error)
      }
    }

    loadSidebarData()
  }, [])

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
