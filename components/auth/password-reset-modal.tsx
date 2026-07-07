'use client'

import { useMemo, useState } from 'react'
import { ShieldAlert, Eye, EyeOff, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PASSWORD_RULE_HINT, passwordStrength, validatePassword } from '@/lib/password'
import { useAuth } from './auth-provider'
import { AuthToaster, useToasts } from './auth-toast'

export function PasswordResetModal() {
  const { user, completeReset } = useAuth()
  const { toasts, toast, dismiss } = useToasts()

  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => passwordStrength(next), [next])
  const ruleError = next ? validatePassword(next) : null
  const mismatch = confirm.length > 0 && confirm !== next
  const canSubmit = !ruleError && next.length > 0 && confirm.length > 0 && !mismatch

  const submit = () => {
    const err = validatePassword(next)
    if (err) {
      toast('error', err)
      return
    }
    if (next !== confirm) {
      toast('error', '两次输入的密码不一致')
      return
    }
    setSubmitting(true)
    // Simulate the change-password request.
    setTimeout(() => {
      completeReset(next)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
      <AuthToaster toasts={toasts} onDismiss={dismiss} />

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-warning/12">
            <ShieldAlert className="size-6 text-warning" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">首次登录 · 请修改初始密码</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {user ? `你好，${user.name}。` : ''}为保障企业数据安全，请设置新的登录密码后进入系统。
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-new">新密码</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-new"
                type={showNext ? 'text' : 'password'}
                placeholder="请输入新密码"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={cn('h-10 pl-9 pr-9', ruleError && 'border-destructive')}
              />
              <button
                type="button"
                aria-label={showNext ? '隐藏密码' : '显示密码'}
                onClick={() => setShowNext((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {next && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full',
                        i <= strength.score ? strength.tone : 'bg-muted',
                      )}
                    />
                  ))}
                </div>
                <span className="w-8 text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
            <p className={cn('text-xs', ruleError ? 'text-destructive' : 'text-muted-foreground')}>
              {ruleError ?? PASSWORD_RULE_HINT}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reset-confirm">确认新密码</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="请再次输入新密码"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && canSubmit) {
                    submit()
                  }
                }}
                className={cn('h-10 pl-9 pr-9', mismatch && 'border-destructive')}
              />
              <button
                type="button"
                aria-label={showConfirm ? '隐藏密码' : '显示密码'}
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {mismatch && <p className="text-xs text-destructive">两次输入的密码不一致。</p>}
          </div>

          <Button className="mt-2 h-10 w-full gap-1.5" disabled={!canSubmit || submitting} onClick={submit}>
            {submitting ? (
              '提交中…'
            ) : (
              <>
                <Check className="size-4" />
                提交并登录
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            完成修改前无法进入系统，此窗口不可关闭。
          </p>
        </div>
      </div>
    </div>
  )
}
