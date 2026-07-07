'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEMO_ACCOUNTS, type DemoAccount } from '@/lib/auth-data'

export type AuthStatus = 'loading' | 'unauthenticated' | 'must-reset' | 'authenticated'

export type LoginResult =
  | { ok: true; mustReset: boolean }
  | { ok: false; reason: 'invalid' | 'disabled' }

type SessionUser = {
  phone: string
  name: string
  roleLabel: string
  deptLabel: string
  initial: string
}

type AuthContextValue = {
  status: AuthStatus
  user: SessionUser | null
  login: (phone: string, password: string) => LoginResult
  completeReset: (newPassword: string) => void
  /** Verify the current password and change it. Returns an error message or null. */
  changePassword: (oldPassword: string, newPassword: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'fruit-auth-session'

function toSessionUser(a: DemoAccount): SessionUser {
  return {
    phone: a.phone,
    name: a.name,
    roleLabel: a.roleLabel,
    deptLabel: a.deptLabel,
    initial: a.initial,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [phone, setPhone] = useState<string | null>(null)

  // Restore a previously authenticated session on first mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved && DEMO_ACCOUNTS.some((a) => a.phone === saved)) {
        setPhone(saved)
        setStatus('authenticated')
        return
      }
    } catch {
      // ignore storage errors
    }
    setStatus('unauthenticated')
  }, [])

  const persist = useCallback((p: string | null) => {
    try {
      if (p) localStorage.setItem(SESSION_KEY, p)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore storage errors
    }
  }, [])

  const login = useCallback<AuthContextValue['login']>((inputPhone, password) => {
    const account = DEMO_ACCOUNTS.find((a) => a.phone === inputPhone)
    // Security: do not reveal whether the phone exists — same message for both.
    if (!account || account.password !== password) return { ok: false, reason: 'invalid' }
    if (!account.enabled) return { ok: false, reason: 'disabled' }

    setPhone(account.phone)
    if (account.initialPassword) {
      setStatus('must-reset')
      return { ok: true, mustReset: true }
    }
    setStatus('authenticated')
    persist(account.phone)
    return { ok: true, mustReset: false }
  }, [persist])

  const completeReset = useCallback<AuthContextValue['completeReset']>(
    (newPassword) => {
      const account = DEMO_ACCOUNTS.find((a) => a.phone === phone)
      if (!account) return
      account.password = newPassword
      account.initialPassword = false
      setStatus('authenticated')
      persist(account.phone)
    },
    [phone, persist],
  )

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    (oldPassword, newPassword) => {
      const account = DEMO_ACCOUNTS.find((a) => a.phone === phone)
      if (!account) return '会话已失效，请重新登录'
      if (account.password !== oldPassword) return '原密码不正确'
      account.password = newPassword
      account.initialPassword = false
      return null
    },
    [phone],
  )

  const logout = useCallback(() => {
    setPhone(null)
    setStatus('unauthenticated')
    persist(null)
  }, [persist])

  const user = useMemo(() => {
    const account = DEMO_ACCOUNTS.find((a) => a.phone === phone)
    return account ? toSessionUser(account) : null
  }, [phone])

  const value = useMemo(
    () => ({ status, user, login, completeReset, changePassword, logout }),
    [status, user, login, completeReset, changePassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
