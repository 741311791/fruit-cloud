'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { navLabels, parentLabels } from '@/lib/nav'
import { ThemeSwitcher } from './theme-switcher'
import { UserMenu } from './user-menu'

type TopBarProps = {
  active: string
  onNavigate: (id: string) => void
}

export function TopBar({ active, onNavigate }: TopBarProps) {
  const isDashboard = active === 'dashboard'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground md:text-lg">
          {navLabels[active] ?? '数据看板'}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {isDashboard
            ? '经营盈亏全景 · 实时洞察'
            : parentLabels[active]
              ? `${parentLabels[active]} · 待填充`
              : '功能模块 · 待填充'}
        </p>
      </div>

      <div className="relative hidden lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索订单、商品、供应商…"
          className="h-9 w-64 bg-card pl-9 text-sm"
        />
      </div>

      <ThemeSwitcher />

      <Button variant="ghost" size="icon" className="relative size-9 text-muted-foreground">
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
      </Button>

      <UserMenu onNavigate={onNavigate} />
    </header>
  )
}
