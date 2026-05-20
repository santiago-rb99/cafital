'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Seller, SubscriptionPlan } from '@/types'
import { getMockUserById } from '@/data/mock/users'

const SESSION_KEY = 'cafital_session'
const DEFAULT_USER_ID = 'buyer-01'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isSeller: boolean
  isBuyer: boolean
  subscriptionPlan: SubscriptionPlan
  login: (userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    const userId = stored ?? DEFAULT_USER_ID
    const found = getMockUserById(userId)
    if (found) setUser(found)
  }, [])

  function login(userId: string) {
    const found = getMockUserById(userId)
    if (found) {
      setUser(found)
      localStorage.setItem(SESSION_KEY, userId)
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const isSeller = user?.role === 'seller'
  const isBuyer = user?.role === 'buyer'
  const subscriptionPlan: SubscriptionPlan =
    isSeller ? (user as Seller).subscriptionPlan : 'none'

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isSeller,
        isBuyer,
        subscriptionPlan,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
