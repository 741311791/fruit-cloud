'use client'

import { useEffect, useState } from 'react'
import { Citrus, ChevronsLeft, ChevronDown } from 'lucide-react'
import { navGroups } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type AppSidebarProps = {
  active: string
  onSelect: (id: string) => void
  collapsed: boolean
  onToggle: () => void
}

/** Find the parent module id for a given (sub)module id. */
function parentOf(id: string): string | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.id === id) return item.id
      if (item.children?.some((c) => c.id === id)) return item.id
    }
  }
  return null
}

export function AppSidebar({ active, onSelect, collapsed, onToggle }: AppSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Keep the active item's parent menu open.
  useEffect(() => {
    const parent = parentOf(active)
    if (parent) setExpanded((prev) => ({ ...prev, [parent]: true }))
  }, [active])

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Citrus className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">鲜果云</p>
            <p className="truncate text-xs text-muted-foreground">加工业务管理平台</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed && (
              <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const hasChildren = !!item.children?.length
                const isOpen = expanded[item.id] ?? false
                const isActive = active === item.id
                const childActive = item.children?.some((c) => c.id === active) ?? false

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren && !collapsed) {
                          setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        } else {
                          onSelect(item.id)
                        }
                      }}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive || (childActive && collapsed)
                          ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                      {!collapsed && hasChildren && (
                        <ChevronDown
                          className={cn(
                            'size-4 shrink-0 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    {!collapsed && hasChildren && isOpen && (
                      <ul className="mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 ml-[22px]">
                        {item.children!.map((child) => {
                          const isChildActive = active === child.id
                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => onSelect(child.id)}
                                className={cn(
                                  'flex w-full items-center rounded-md px-3 py-1.5 text-[13px] transition-colors',
                                  isChildActive
                                    ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                                    : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                              >
                                <span className="truncate text-left">{child.label}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground"
        >
          <ChevronsLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="ml-2">收起</span>}
        </Button>
      </div>
    </aside>
  )
}
