import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authManager, User, LoginCredentials } from '@/lib/auth-manager'
import { useDashboardData } from '@/lib/dashboard-data-context'
import { PendingAccessModal } from '@/components/modals/PendingAccessModal'
import { RequestReviewModal } from '@/components/modals/RequestReviewModal'
import { ApprovedPage } from '@/components/pages/ApprovedPage'

interface LoginResult {
  success: boolean
  isPendingGuest?: boolean
  isRequestReview?: boolean
  isApprovedMember?: boolean
  data?: any
  message?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  showPendingModal: boolean
  setShowPendingModal: (show: boolean) => void
  showRequestReviewModal: boolean
  setShowRequestReviewModal: (show: boolean) => void
  showApprovedPage: boolean
  setShowApprovedPage: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showRequestReviewModal, setShowRequestReviewModal] = useState(false)
  const [showApprovedPage, setShowApprovedPage] = useState(false)
  const navigate = useNavigate()
  const { fetchDashboardData } = useDashboardData()

  const handleRequestSuccess = () => {
    // Update user status to 'request' and show the review modal
    if (user) {
      const updatedUser = { ...user }
      setUser(updatedUser)
    }
    setShowRequestReviewModal(true)
  }

  // ✅ Initialize user from server, not localStorage (per security guide)
  useEffect(() => {
    const initializeAuth = async () => {
      if (authManager.isLoggedIn()) {
        try {
          const currentUser = await authManager.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error('Failed to get current user:', error)
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // 🔐 LOGIN - Using secure AuthManager (per security guide)
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const credentials: LoginCredentials = {
        username: email, // Using email as username for compatibility
        password,
      }

      const result = await authManager.login(credentials)

      if (result.success) {
        // Get user data from server after successful login
        const currentUser = await authManager.getCurrentUser()
        setUser(currentUser)

        // Fetch dashboard data after successful login
        await fetchDashboardData()

        // Check for special user states (keeping existing flow compatibility)
        if (currentUser) {
          // Check if user has pending status and guest role
          if (
            currentUser.userType === 'peserta' &&
            currentUser.userlevel &&
            parseInt(currentUser.userlevel) < 2
          ) {
            setShowPendingModal(true)
            return { success: false, isPendingGuest: true }
          }

          // Check if user has request status (custom logic can be added here)
          // This would need to be determined from server response

          // Check if user has active status and member role (approved member)
          if (
            currentUser.userType === 'peserta' &&
            currentUser.verifikasi === '1'
          ) {
            return { success: true, isApprovedMember: true }
          }
        }

        return { success: true, data: result.data }
      }

      return { success: false, message: result.message }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      }
    }
  }

  // 🚪 LOGOUT - Using secure AuthManager
  const logout = async () => {
    setUser(null)
    await authManager.logout()
    // AuthManager handles redirect, no need for navigate here
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: authManager.isLoggedIn() && !!user, // Use AuthManager for token check
    isLoading,
    showPendingModal,
    setShowPendingModal,
    showRequestReviewModal,
    setShowRequestReviewModal,
    showApprovedPage,
    setShowApprovedPage,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user && (
        <>
          <PendingAccessModal
            open={showPendingModal}
            onOpenChange={setShowPendingModal}
            userName={user.nama}
            userEmail={user.email || user.username}
            userId={user.id}
            onRequestSuccess={handleRequestSuccess}
          />
          <RequestReviewModal
            open={showRequestReviewModal}
            onOpenChange={setShowRequestReviewModal}
            userName={user.nama}
            userEmail={user.email || user.username}
          />
        </>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
