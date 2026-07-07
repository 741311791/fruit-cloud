'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { OPERATION_LOGS } from '@/lib/current-user'
import { PASSWORD_RULE_HINT, passwordStrength, validatePassword } from '@/lib/password'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthToaster, useToasts } from '@/components/auth/auth-toast'

export function SecurityPanel() {
  const { changePassword, logout } = useAuth()
  const { toasts, toast, dismiss } = useToasts()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => passwordStrength(next), [next])
  const ruleError = next ? validatePassword(next) : null
  const mismatch = confirm.length > 0 && confirm !== next
  const canSubmit = current.length > 0 && !ruleError && next.length > 0 && confirm.length > 0 && !mismatch

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
    setTimeout(() => {
      const result = changePassword(current, next)
      if (result) {
        setSubmitting(false)
        toast('error', result)
        return
      }
      // Success: notify, then sign out and return to the login screen.
      toast('success', '密码修改成功，请使用新密码重新登录')
      setTimeout(() => logout(), 1200)
    }, 500)
  }

  return (
    <div className="space-y-10">
      <AuthToaster toasts={toasts} onDismiss={dismiss} />

      {/* Change password */}
      <section className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">修改登录密码</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            修改成功后需使用新密码重新登录。密码要求：{PASSWORD_RULE_HINT}。
          </p>
        </div>

        <div className="grid max-w-md gap-5">
          <div className="grid gap-2">
            <Label htmlFor="cur-pw">当前密码</Label>
            <div className="relative">
              <Input
                id="cur-pw"
                type={showCurrent ? 'text' : 'password'}
                placeholder="请输入当前密码"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="h-9 pr-9"
              />
              <button
                type="button"
                aria-label={showCurrent ? '隐藏密码' : '显示密码'}
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-pw">新密码</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNext ? 'text' : 'password'}
                placeholder="请输入新密码"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={cn('h-9 pr-9', ruleError && 'border-destructive')}
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
            {ruleError && <p className="text-xs text-destructive">{ruleError}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-pw">确认新密码</Label>
            <Input
              id="confirm-pw"
              type="password"
              placeholder="请再次输入新密码"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn('h-9', mismatch && 'border-destructive')}
            />
            {mismatch && <p className="text-xs text-destructive">两次输入的密码不一致。</p>}
          </div>

          <div>
            <Button disabled={!canSubmit || submitting} onClick={submit}>
              {submitting ? '提交中…' : '更新密码'}
            </Button>
          </div>
        </div>
      </section>

      {/* Operation log audit */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">操作日志审计</h3>
          <p className="mt-1 text-sm text-muted-foreground">记录近期登录与关键操作，便于安全追溯。</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>操作内容</TableHead>
                <TableHead className="hidden sm:table-cell">IP 地址</TableHead>
                <TableHead className="hidden md:table-cell">设备 / 浏览器</TableHead>
                <TableHead>时间</TableHead>
                <TableHead className="text-right">结果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OPERATION_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {log.ip}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{log.device}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{log.time}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.result === 'success' ? 'secondary' : 'destructive'}>
                      {log.result === 'success' ? '成功' : '失败'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
