'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { THEMES, themeById } from '@/lib/themes'
import { useTheme } from '@/components/theme-provider'
import { LANGUAGES, usePreferences } from '@/components/preferences-provider'

const NOTIFICATION_OPTIONS: { key: string; label: string; desc: string; default: boolean }[] = [
  { key: 'announcement', label: '系统公告', desc: '版本更新、维护通知等平台级消息', default: true },
  { key: 'order', label: '订单动态', desc: '采购单、销售单状态变更提醒', default: true },
  { key: 'approval', label: '审批提醒', desc: '待办审批、审批结果实时推送', default: true },
  { key: 'email', label: '邮件通知', desc: '将重要提醒同步发送至绑定邮箱', default: false },
]

export function PersonalizationPanel() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = usePreferences()
  const [notif, setNotif] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_OPTIONS.map((o) => [o.key, o.default])),
  )

  return (
    <div className="space-y-10">
      {/* Language */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">语言切换</h3>
          <p className="mt-1 text-sm text-muted-foreground">选择界面显示语言，设置将立即生效。</p>
        </div>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          {LANGUAGES.map((l) => {
            const active = language === l.id
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id)}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{l.label}</span>
                  <span className="text-xs text-muted-foreground">{l.hint}</span>
                </span>
                {active && <Check className="size-4 text-primary" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Theme / appearance */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">主题外观</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            当前：<span className="font-medium text-foreground">{themeById(theme).label}</span>
          </p>
        </div>
        <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
          {THEMES.map((t) => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
                  <span className="flex size-full">
                    <span className="h-full w-1/3" style={{ background: t.swatch[0] }} />
                    <span className="h-full w-1/3" style={{ background: t.swatch[1] }} />
                    <span className="h-full w-1/3" style={{ background: t.swatch[2] }} />
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{t.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{t.desc}</span>
                </span>
                {active && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">系统通知接收</h3>
          <p className="mt-1 text-sm text-muted-foreground">选择你希望接收的通知类型。</p>
        </div>
        <div className="max-w-2xl divide-y divide-border rounded-lg border border-border">
          {NOTIFICATION_OPTIONS.map((o) => (
            <label key={o.key} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5">
              <span className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{o.label}</span>
                <span className="text-xs text-muted-foreground">{o.desc}</span>
              </span>
              <Switch
                checked={notif[o.key]}
                onCheckedChange={(v) => setNotif((prev) => ({ ...prev, [o.key]: v }))}
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
