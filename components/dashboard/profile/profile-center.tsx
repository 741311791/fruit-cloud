'use client'

import { useState } from 'react'
import { UserCog, ShieldCheck, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/lib/current-user'
import { BasicInfoPanel } from './basic-info-panel'
import { SecurityPanel } from './security-panel'
import { PersonalizationPanel } from './personalization-panel'

type TabId = 'basic' | 'security' | 'personal'

const TABS: { id: TabId; label: string; desc: string; icon: LucideIcon }[] = [
  { id: 'basic', label: '基本资料', desc: '头像、昵称与联系方式', icon: UserCog },
  { id: 'security', label: '安全设置', desc: '登录密码与操作日志', icon: ShieldCheck },
  { id: 'personal', label: '个性化', desc: '语言、主题与通知偏好', icon: SlidersHorizontal },
]

export function ProfileCenter() {
  const [tab, setTab] = useState<TabId>('basic')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">个人中心</h2>
        <p className="mt-1 text-sm text-muted-foreground">管理你的账户资料、安全凭证与个性化偏好设置。</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left nav */}
        <aside className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/12 text-base font-semibold text-primary">
                {CURRENT_USER.initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{CURRENT_USER.name}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {CURRENT_USER.roleLabel}
              </span>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col lg:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex flex-1 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left transition-colors lg:flex-none',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{t.label}</span>
                    <span
                      className={cn(
                        'hidden truncate text-[11px] lg:block',
                        active ? 'text-primary/70' : 'text-muted-foreground',
                      )}
                    >
                      {t.desc}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Right panel */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          {tab === 'basic' && <BasicInfoPanel />}
          {tab === 'security' && <SecurityPanel />}
          {tab === 'personal' && <PersonalizationPanel />}
        </div>
      </div>
    </div>
  )
}
