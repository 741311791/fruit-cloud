'use client'

import {
  Settings,
  Palette,
  Languages,
  LogOut,
  Check,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/lib/current-user'
import { THEMES, themeById } from '@/lib/themes'
import { useTheme } from '@/components/theme-provider'
import { LANGUAGES, usePreferences } from '@/components/preferences-provider'

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded border border-border">
      <span className="flex size-full">
        <span className="h-full w-1/3" style={{ background: colors[0] }} />
        <span className="h-full w-1/3" style={{ background: colors[1] }} />
        <span className="h-full w-1/3" style={{ background: colors[2] }} />
      </span>
    </span>
  )
}

type UserMenuProps = {
  onNavigate: (id: string) => void
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = usePreferences()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="账户菜单"
            className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                {CURRENT_USER.initial}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        {/* Profile summary */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-11">
            <AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">
              {CURRENT_USER.initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{CURRENT_USER.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {CURRENT_USER.roleLabel}
              </span>
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{CURRENT_USER.deptLabel}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Account settings */}
        <DropdownMenuItem className="gap-2 py-2" onClick={() => onNavigate('system-profile')}>
          <Settings className="size-4 text-muted-foreground" />
          <span className="flex-1">账户设置</span>
          <span className="text-[11px] text-muted-foreground">安全 · 密码</span>
        </DropdownMenuItem>

        {/* Skin / theme submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 py-2">
            <Palette className="size-4 text-muted-foreground" />
            <span className="flex-1">更换皮肤</span>
            <span className="text-[11px] text-muted-foreground">{themeById(theme).label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {THEMES.map((t) => (
              <DropdownMenuItem
                key={t.id}
                closeOnClick={false}
                onClick={() => setTheme(t.id)}
                className="gap-2.5 py-1.5"
              >
                <Swatch colors={t.swatch} />
                <span className="flex-1 text-sm">{t.label}</span>
                <Check className={cn('size-4 text-primary', theme === t.id ? 'opacity-100' : 'opacity-0')} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Language submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 py-2">
            <Languages className="size-4 text-muted-foreground" />
            <span className="flex-1">更换语言</span>
            <span className="text-[11px] text-muted-foreground">
              {LANGUAGES.find((l) => l.id === language)?.label}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.id}
                closeOnClick={false}
                onClick={() => setLanguage(l.id)}
                className="gap-2 py-1.5"
              >
                <span className="flex-1 text-sm">{l.label}</span>
                <Check className={cn('size-4 text-primary', language === l.id ? 'opacity-100' : 'opacity-0')} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" className="gap-2 py-2">
          <LogOut className="size-4" />
          <span className="flex-1">退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
