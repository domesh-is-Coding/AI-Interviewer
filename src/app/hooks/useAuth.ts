'use client'
import { useState, useEffect } from 'react'

interface User {
  userId: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/verify', { 
        method: 'POST',
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(true)
        setUser(data.user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      setIsAuthenticated(false)
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout on client side even if API fails
      setIsAuthenticated(false)
      setUser(null)
      window.location.href = '/login'
    }
  }
  
  return { 
    isAuthenticated, 
    user, 
    loading, 
    logout, 
    checkAuthStatus 
  }
}