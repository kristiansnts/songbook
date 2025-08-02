import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { PendingAccessModal } from '@/components/modals/PendingAccessModal'
import { RequestReviewModal } from '@/components/modals/RequestReviewModal'
import { ApprovedPage } from '@/components/pages/ApprovedPage'

interface User {
  id?: string
  email: string
  name: string
  status?: string
  role?: string
}

interface LoginResult {
  success: boolean
  isPendingGuest?: boolean
  isRequestReview?: boolean
  isApprovedMember?: boolean
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

  const handleRequestSuccess = () => {
    // Update user status to 'request' and show the review modal
    if (user) {
      const updatedUser = { ...user, status: 'request' }
      setUser(updatedUser)
      localStorage.setItem('auth-user', JSON.stringify(updatedUser))
    }
    setShowRequestReviewModal(true)
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_PROD_URL_API || 'https://songbanks-v1-1.vercel.app/api'}/auth/login`, { 
        username: email, // Changed from email to username
        password 
      })
      
      if (response.data.code === 200) {
        const userData = response.data.data.user
        const userInfo = { 
          id: String(userData.id),
          email: userData.email || userData.username, 
          name: userData.nama || userData.name || userData.username,
          status: userData.status,
          role: userData.role
        }
        
        setUser(userInfo)
        localStorage.setItem('auth-user', JSON.stringify(userInfo))
        localStorage.setItem('auth-token', response.data.data.token)
        
        // Check if user has pending status and guest role
        if (userData.status === 'pending' && userData.role === 'guest') {
          setShowPendingModal(true)
          return { success: false, isPendingGuest: true }
        }
        
        // Check if user has request status
        if (userData.status === 'request') {
          setShowRequestReviewModal(true)
          return { success: false, isRequestReview: true }
        }
        
        // Check if user has active status and member role (approved member)
        if (userData.status === 'active' && userData.role === 'member') {
          return { success: true, isApprovedMember: true }
        }
        
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth-user')
    localStorage.removeItem('auth-token')
    navigate({ to: '/sign-in' })
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    showPendingModal,
    setShowPendingModal,
    showRequestReviewModal,
    setShowRequestReviewModal,
    showApprovedPage,
    setShowApprovedPage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user && (
        <>
          <PendingAccessModal
            open={showPendingModal}
            onOpenChange={setShowPendingModal}
            userName={user.name}
            userEmail={user.email}
            userId={user.id}
            onRequestSuccess={handleRequestSuccess}
          />
          <RequestReviewModal
            open={showRequestReviewModal}
            onOpenChange={setShowRequestReviewModal}
            userName={user.name}
            userEmail={user.email}
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