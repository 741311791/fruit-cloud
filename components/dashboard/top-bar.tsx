'use client'

import { Bell, Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import { navLabels, parentLabels } from '@/lib/nav'
import { FixedCostDialog } from './fixed-cost-dialog'
import { ThemeSwitcher } from './theme-switcher'

type TopBarProps = {
  active: string
  range: string
  onRangeChange: (v: string) => void
}

export function TopBar({ active, range, onRangeChange }: TopBarProps) {
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

      {isDashboard && (
        <>
          <Select
            value={range}
            items={{
              today: '今日',
              week: '本周',
              month: '本月累计',
              quarter: '本季度',
              year: '本年度',
            }}
            onValueChange={onRangeChange}
          >
            <SelectTrigger className="h-9 w-[132px] gap-2 bg-card text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月累计</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年度</SelectItem>
            </SelectContent>
          </Select>

          <FixedCostDialog />
        </>
      )}

      <ThemeSwitcher />

      <Button variant="ghost" size="icon" className="relative size-9 text-muted-foreground">
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
      </Button>

      <Avatar className="size-9">
        <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
          管
        </AvatarFallback>
      </Avatar>
    </header>
  )
}
