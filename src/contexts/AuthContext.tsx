'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  ReactNode,
} from 'react'
import { User, Seller, SubscriptionPlan } from '@/types'
import { ALL_MOCK_USERS } from '@/data/mock/users'
import { loadOverrides, mergeWithOverrides } from '@/lib/api/_client'
import { useIsHydrated } from '@/hooks/useLocalStorageState'

const SESSION_KEY = 'cafital_session'
const USERS_OVERRIDES_KEY = 'cafital_users_overrides'
const DEFAULT_USER_ID = 'buyer-01'

const sessionListeners = new Set<() => void>()

function notifySessionChange() {
  sessionListeners.forEach((listener) => listener())
}

function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    sessionListeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

function getServerSessionId(): null {
  return null
}

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
  isAdmin: boolean
  subscriptionPlan: SubscriptionPlan
  login: (userId: string) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const isHydrated = useIsHydrated()
  const storedSessionId = useSyncExternalStore(
    subscribeSession,
    getSessionId,
    getServerSessionId
  )
  // Logout es efímero: limpia el id en localStorage pero, además, marca el
  // estado en memoria como "cerrado". Sin esto, derivaríamos `user` del
  // DEFAULT_USER_ID en cuanto el id desaparece del storage.
  const [explicitlyLoggedOut, setExplicitlyLoggedOut] = useState(false)
  // Forzar recálculo de `user` cuando cambian los overrides de usuarios
  // (refreshUser tras editar perfil, por ejemplo).
  const [overridesVersion, setOverridesVersion] = useState(0)

  const user = useMemo<User | null>(() => {
    if (!isHydrated) return null
    if (explicitlyLoggedOut) return null
    return findUser(storedSessionId ?? DEFAULT_USER_ID)
    // overridesVersion en deps a propósito: invalida el memo aunque no
    // aparezca dentro del callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, storedSessionId, explicitlyLoggedOut, overridesVersion])

  const login = useCallback((userId: string) => {
    const found = findUser(userId)
    if (found) {
      localStorage.setItem(SESSION_KEY, userId)
      setExplicitlyLoggedOut(false)
      notifySessionChange()
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setExplicitlyLoggedOut(true)
    notifySessionChange()
  }, [])

  const refreshUser = useCallback(() => {
    setOverridesVersion((v) => v + 1)
  }, [])

  const isSeller = user?.role === 'seller'
  const isBuyer = user?.role === 'buyer'
  const isAdmin = user?.role === 'admin'
  const subscriptionPlan: SubscriptionPlan = isSeller
    ? (user as Seller).subscriptionPlan
    : 'none'

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isHydrated,
        isSeller,
        isBuyer,
        isAdmin,
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
