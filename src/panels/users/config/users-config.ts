export interface UsersPanelConfig {
  name: string
  path: string
  id: string
  brandName: string
  brandLogo?: string
  colors: {
    primary: string
    secondary: string
  }
  navigation: {
    dashboard: {
      label: string
      icon?: string
      url: string
    }
  }
}

export const usersPanelConfig: UsersPanelConfig = {
  name: 'Users',
  path: '/users',
  id: 'users',
  brandName: 'Users Panel',
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
  },
  navigation: {
    dashboard: {
      label: 'Dashboard',
      url: '/users/dashboard',
    },
  },
}
