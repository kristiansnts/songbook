import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardStats {
  totalUsers: number
  totalSongs: number
  monthlySongs: number
  lastUpdated: Date | null
}

interface DashboardDataContextType {
  stats: DashboardStats
  isLoading: boolean
  fetchDashboardData: () => Promise<void>
  refreshData: () => Promise<void>
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalSongs: 0,
  monthlySongs: 0,
  lastUpdated: null
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No token found for dashboard data fetch')
      return
    }

    setIsLoading(true)
    try {
      // Fetch user data and song data in parallel
      const [userResponse, songResponse] = await Promise.all([
        fetch('https://songbanks-v1-1.vercel.app/api/admin/user/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('https://songbanks-v1-1.vercel.app/api/songs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ])

      const [userData, songData] = await Promise.all([
        userResponse.json(),
        songResponse.json()
      ])

      // Calculate monthly songs from createdAt field
      const currentDate = new Date()
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      const songsThisMonth = songData.data.filter((song: any) => {
        const createdAt = new Date(song.createdAt)
        return createdAt >= lastMonth
      })

      setStats({
        totalUsers: userData.pagination.totalItems,
        totalSongs: songData.pagination.totalItems,
        monthlySongs: songsThisMonth.length,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await fetchDashboardData()
  }

  const value = {
    stats,
    isLoading,
    fetchDashboardData,
    refreshData
  }

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider')
  }
  return context
}