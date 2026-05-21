'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Seller, SubscriptionPlan } from '@/types'
import { ALL_MOCK_USERS } from '@/data/mock/users'
import { loadOverrides, mergeWithOverrides } from '@/lib/api/_client'

const SESSION_KEY = 'cafital_session'
const USERS_OVERRIDES_KEY = 'cafital_users_overrides'
const DEFAULT_USER_ID = 'buyer-01'

function findUser(userId: string): User | null {
  const merged = mergeWithOverrides(
    ALL_MOCK_USERS as User[],
    loadOverrides<User>(USERS_OVERRIDES_KEY)
  )
  return merged.find((u) => u.id === userId) ?? null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  isSeller: boolean
  isBuyer: boolean
  subscriptionPlan: SubscriptionPlan
  login: (userId: string) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    const userId = stored ?? DEFAULT_USER_ID
    const found = findUser(userId)
    if (found) setUser(found)
    setIsHydrated(true)
  }, [])

  function login(userId: string) {
    const found = findUser(userId)
    if (found) {
      setUser(found)
      localStorage.setItem(SESSION_KEY, userId)
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  function refreshUser() {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return
    const found = findUser(stored)
    if (found) setUser(found)
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
        isHydrated,
        isSeller,
        isBuyer,
        subscriptionPlan,
        login,
        logout,
        refreshUser,
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
