import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'

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

const DUMMY_USER = {
  email: 'admin@gmail.com',
  password: 'password',
  name: 'Admin User'
}

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
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      const userData = { email: DUMMY_USER.email, name: DUMMY_USER.name }
      setUser(userData)
      localStorage.setItem('auth-user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth-user')
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