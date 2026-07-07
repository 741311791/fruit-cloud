'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastTone = 'error' | 'success'

export type ToastMessage = {
  id: number
  tone: ToastTone
  text: string
}

/** Lightweight toast queue for the auth screens. */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((tone: ToastTone, text: string) => {
    idRef.current += 1
    setToasts((prev) => [...prev, { id: idRef.current, tone, text }])
  }, [])

  return { toasts, toast, dismiss }
}

export function AuthToaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <AuthToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function AuthToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3200)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const Icon = toast.tone === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-lg animate-in fade-in slide-in-from-top-2',
        toast.tone === 'error'
          ? 'border-destructive/25 bg-card text-foreground'
          : 'border-success/25 bg-card text-foreground',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          toast.tone === 'error' ? 'text-destructive' : 'text-success',
        )}
      />
      <p className="flex-1 text-sm leading-relaxed">{toast.text}</p>
      <button
        type="button"
        aria-label="关闭提示"
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
