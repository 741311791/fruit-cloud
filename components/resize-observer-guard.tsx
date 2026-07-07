'use client'

import { useEffect } from 'react'

/**
 * Suppresses the benign "ResizeObserver loop completed with undelivered
 * notifications" browser warning. This message is emitted by the spec when a
 * ResizeObserver callback schedules work for the next frame (common inside
 * third-party UI primitives that measure/position elements). It is not an
 * actual error, but Next.js's dev overlay and error listeners surface it as
 * one. We stop only this specific message from propagating.
 */
const RESIZE_OBSERVER_MESSAGES = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
]

function isResizeObserverNoise(message?: string) {
  if (!message) return false
  return RESIZE_OBSERVER_MESSAGES.some((m) => message.includes(m))
}

export function ResizeObserverGuard() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isResizeObserverNoise(event.message)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    // Next.js's dev overlay also hooks console.error; silence just this message.
    const originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && isResizeObserverNoise(args[0])) return
      originalConsoleError(...args)
    }

    window.addEventListener('error', onError, true)
    return () => {
      window.removeEventListener('error', onError, true)
      console.error = originalConsoleError
    }
  }, [])

  return null
}
