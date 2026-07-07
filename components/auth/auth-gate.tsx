'use client'

import { AppShell } from '@/components/dashboard/app-shell'
import { useAuth } from './auth-provider'
import { LoginPage } from './login-page'
import { PasswordResetModal } from './password-reset-modal'

export function AuthGate() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') return <LoginPage />

  // Authenticated (or mid password-reset): render the app, and overlay the
  // forced-reset modal so the shell never actually appears until reset is done.
  return (
    <>
      {status === 'authenticated' && <AppShell />}
      {status === 'must-reset' && <PasswordResetModal />}
    </>
  )
}
