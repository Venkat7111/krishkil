import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@/services/api/authAPI'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ks_user')
    const guest = localStorage.getItem('ks_guest')
    if (stored) setUser(JSON.parse(stored))
    if (guest) setIsGuest(true)
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials)
      setUser(data.user)
      setIsGuest(false)
      localStorage.setItem('ks_user', JSON.stringify(data.user))
      localStorage.removeItem('ks_guest')
      return data
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Could not reach the server. Please try again.')
    }
  }

  const register = async (payload) => {
    try {
      const data = await authAPI.register(payload)
      setUser(data.user)
      localStorage.setItem('ks_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Could not reach the server. Please try again.')
    }
  }

  const continueAsGuest = () => {
    setIsGuest(true)
    localStorage.setItem('ks_guest', '1')
  }

  const logout = () => {
    setUser(null)
    setIsGuest(false)
    localStorage.removeItem('ks_user')
    localStorage.removeItem('ks_guest')
  }

  return (
    <AuthContext.Provider
      value={{ user, isGuest, loading, login, register, continueAsGuest, logout, isAuthenticated: !!user || isGuest }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
