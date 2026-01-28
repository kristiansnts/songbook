import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react'

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
  clearCache: () => void
}

interface CachedData {
  stats: DashboardStats
  timestamp: number
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalSongs: 0,
  monthlySongs: 0,
  lastUpdated: null,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const cacheRef = useRef<CachedData | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isDataExpired = () => {
    if (!cacheRef.current) return true
    return Date.now() - cacheRef.current.timestamp > CACHE_DURATION
  }

  const fetchDashboardData = async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh && cacheRef.current && !isDataExpired()) {
      setStats(cacheRef.current.stats)
      return
    }

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
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
        fetch('https://songbanks-v1-1.vercel.app/api/songs', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
      ])

      const [userData, songData] = await Promise.all([
        userResponse.json(),
        songResponse.json(),
      ])

      // Calculate monthly songs from createdAt field
      const currentDate = new Date()
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      )
      const songsThisMonth = songData.data.filter((song: any) => {
        const createdAt = new Date(song.createdAt)
        return createdAt >= lastMonth
      })

      const newStats = {
        totalUsers: userData.pagination.totalItems,
        totalSongs: songData.pagination.totalItems,
        monthlySongs: songsThisMonth.length,
        lastUpdated: new Date(),
      }

      // Update cache and state
      cacheRef.current = {
        stats: newStats,
        timestamp: Date.now(),
      }
      setStats(newStats)
    } catch (error) {
      console.warn('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await fetchDashboardData(true) // Force refresh
  }

  const clearCache = () => {
    cacheRef.current = null
  }

  // Auto-refresh with page visibility control
  const startAutoRefresh = () => {
    if (intervalRef.current) return // Already running

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData()
      }
    }, CACHE_DURATION)
  }

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Set up auto-refresh and visibility handling
  useEffect(() => {
    // Initial fetch
    fetchDashboardData()

    // Start auto-refresh if page is visible
    if (document.visibilityState === 'visible') {
      startAutoRefresh()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startAutoRefresh()
        // Refresh data when user returns to tab if cache is expired
        if (isDataExpired()) {
          fetchDashboardData()
        }
      } else {
        stopAutoRefresh()
      }
    }

    const handleCacheInvalidation = () => {
      clearCache()
      // Fetch fresh data if page is visible
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener(
      'invalidate-dashboard-cache',
      handleCacheInvalidation
    )

    return () => {
      stopAutoRefresh()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener(
        'invalidate-dashboard-cache',
        handleCacheInvalidation
      )
    }
  }, [])

  const value = {
    stats,
    isLoading,
    fetchDashboardData,
    refreshData,
    clearCache,
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
    throw new Error(
      'useDashboardData must be used within a DashboardDataProvider'
    )
  }
  return context
}
