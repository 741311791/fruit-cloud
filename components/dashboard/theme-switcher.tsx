'use client'

import { Check, Palette } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { THEMES } from '@/lib/themes'
import { useTheme } from '@/components/theme-provider'

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
      <span className="flex size-full">
        <span className="h-full w-1/3" style={{ background: colors[0] }} />
        <span className="h-full w-1/3" style={{ background: colors[1] }} />
        <span className="h-full w-1/3" style={{ background: colors[2] }} />
      </span>
    </span>
  )
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
            aria-label="切换主题配色"
          >
            <Palette className="size-[18px]" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          主题配色
        </div>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 py-2"
          >
            <Swatch colors={t.swatch} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">{t.label}</span>
              <span className="truncate text-xs text-muted-foreground">{t.desc}</span>
            </span>
            <Check
              className={cn(
                'size-4 text-primary',
                theme === t.id ? 'opacity-100' : 'opacity-0',
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
