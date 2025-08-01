import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_PROD_URL_API || 'https://songbanks-v1-1.vercel.app/api'}/auth/login`, { 
        username: email, // Changed from email to username
        password 
      })
      
      if (response.data.code === 200) {
        const userData = response.data.data.user
        setUser({ email: userData.email, name: userData.email })
        localStorage.setItem('auth-user', JSON.stringify({ email: userData.email, name: userData.email }))
        localStorage.setItem('auth-token', response.data.data.token)
        return true
      }
      return false
    } catch (error) {
      return false
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
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}