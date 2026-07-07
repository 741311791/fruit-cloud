'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Smartphone, Lock, Eye, EyeOff, ShieldCheck, Boxes, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { isValidPhone } from '@/lib/password'
import { useAuth } from './auth-provider'
import { AuthToaster, useToasts } from './auth-toast'

const HIGHLIGHTS = [
  { icon: Boxes, title: '全链路业务协同', desc: '采购、仓储、生产、销售一体化管理' },
  { icon: LineChart, title: '数据看板实时洞察', desc: '经营指标一屏掌握，辅助高效决策' },
  { icon: ShieldCheck, title: '企业级权限安全', desc: 'RBAC 模型精细化管控数据边界' },
]

export function LoginPage() {
  const { login } = useAuth()
  const { toasts, toast, dismiss } = useToasts()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = () => {
    if (!phone || !password) {
      toast('error', '请输入手机号与密码')
      return
    }
    if (!isValidPhone(phone)) {
      toast('error', '请输入正确的 11 位手机号')
      return
    }
    if (!agreed) {
      toast('error', '请先阅读并勾选用户协议与隐私政策')
      return
    }

    setSubmitting(true)
    // Simulate the login request round-trip.
    setTimeout(() => {
      const result = login(phone, password)
      if (!result.ok) {
        setSubmitting(false)
        if (result.reason === 'disabled') {
          toast('error', '该账户已被停用，请联系管理员')
        } else {
          toast('error', '账号或密码错误，请重新输入')
        }
        return
      }
      // On success the AuthGate swaps the screen; no further UI needed here.
    }, 600)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      submit()
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AuthToaster toasts={toasts} onDismiss={dismiss} />

      {/* Left brand panel */}
      <aside className="relative hidden w-[46%] max-w-2xl overflow-hidden lg:block">
        <Image
          src="/auth/login-brand.png"
          alt="鲜果云加工业务平台"
          fill
          priority
          className="object-cover"
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15 text-lg font-bold backdrop-blur">
              鲜
            </span>
            <span className="text-lg font-semibold tracking-tight">鲜果云</span>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-pretty text-3xl font-bold leading-tight">
                加工业务一体化
                <br />
                管理平台
              </h1>
              <p className="max-w-sm text-pretty text-sm leading-relaxed text-primary-foreground/85">
                从田间到成品，全流程数字化管控，让水果加工业务高效、透明、可追溯。
              </p>
            </div>

            <ul className="space-y-4">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon
                return (
                  <li key={h.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur">
                      <Icon className="size-[18px]" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-primary-foreground/75">{h.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} 鲜果云集团 · 企业内部管理系统
          </p>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          {/* Compact brand for small screens */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              鲜
            </span>
            <span className="text-lg font-semibold text-foreground">鲜果云</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">欢迎登录</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">请使用管理员分配的手机号与密码登录系统</p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="login-phone">手机号</Label>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入 11 位手机号"
                  autoComplete="username"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={onKeyDown}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-password">密码</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="h-11 pl-9 pr-9"
                />
                <button
                  type="button"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-right text-xs text-muted-foreground">忘记密码？请联系企业管理员在后台重置</p>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span>
                我已阅读并同意
                <a href="#" className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  《用户服务协议》
                </a>
                与
                <a href="#" className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  《隐私政策》
                </a>
              </span>
            </label>

            <Button className="h-11 w-full text-sm font-medium" disabled={submitting} onClick={submit}>
              {submitting ? '登录中…' : '登 录'}
            </Button>
          </div>

          {/* Demo credentials helper */}
          <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <p className="mb-1.5 font-medium text-foreground">演示账号</p>
            <p className="leading-relaxed">
              常规登录：<span className="font-mono">13800138000</span> / <span className="font-mono">Admin@2026</span>
            </p>
            <p className="leading-relaxed">
              首次改密：<span className="font-mono">13800138001</span> / <span className="font-mono">Fruit@123</span>
            </p>
            <p className="leading-relaxed">
              停用账户：<span className="font-mono">13800138002</span> / <span className="font-mono">Fruit@123</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
