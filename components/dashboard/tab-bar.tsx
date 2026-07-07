'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  XCircle,
  Columns2,
  ArrowRightToLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabView = {
  id: string
  title: string
  affix?: boolean
}

type TabBarProps = {
  views: TabView[]
  active: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onRefresh: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseRight: (id: string) => void
}

type MenuState = {
  x: number
  y: number
  id: string
} | null

export function TabBar({
  views,
  active,
  onSelect,
  onClose,
  onRefresh,
  onCloseOthers,
  onCloseRight,
}: TabBarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [menu, setMenu] = useState<MenuState>(null)

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 1)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  // Recompute overflow affordances when tabs change or the window resizes.
  useLayoutEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => ro.disconnect()
  }, [views.length, updateArrows])

  // Keep the active tab in view.
  useEffect(() => {
    const node = tabRefs.current[active]
    node?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [active])

  // Close the context menu on any outside interaction.
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('resize', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  function scrollBy(dir: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (e.deltaY === 0) return
    const el = scrollerRef.current
    if (!el) return
    el.scrollLeft += e.deltaY
  }

  function openMenu(e: React.MouseEvent, id: string) {
    e.preventDefault()
    const menuWidth = 184
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8)
    setMenu({ x, y: e.clientY, id })
  }

  const menuView = menu ? views.find((v) => v.id === menu.id) : null
  const menuIdx = menu ? views.findIndex((v) => v.id === menu.id) : -1
  const hasRight = menuIdx > -1 && menuIdx < views.length - 1
  const hasOthers = views.some((v) => !v.affix && v.id !== menu?.id)

  return (
    <div className="relative flex h-11 items-stretch border-b border-border bg-card">
      {canLeft && (
        <button
          type="button"
          aria-label="向左滚动"
          onClick={() => scrollBy(-1)}
          className="flex w-8 shrink-0 items-center justify-center border-r border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        onWheel={handleWheel}
        className="flex flex-1 items-center gap-1 overflow-x-auto scroll-smooth px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {views.map((v) => {
          const isActive = v.id === active
          return (
            <div
              key={v.id}
              ref={(n) => {
                tabRefs.current[v.id] = n
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onSelect(v.id)}
              onContextMenu={(e) => openMenu(e, v.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(v.id)
                }
              }}
              onMouseDown={(e) => {
                // Middle-click closes (browser convention).
                if (e.button === 1 && !v.affix) {
                  e.preventDefault()
                  onClose(v.id)
                }
              }}
              className={cn(
                'group relative flex h-8 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-md pl-3 pr-2 text-[13px] transition-colors',
                v.affix && 'pl-2.5',
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {v.affix && <Home className="size-3.5 shrink-0" />}
              <span className="max-w-[160px] truncate">{v.title}</span>
              {!v.affix && (
                <button
                  type="button"
                  aria-label={`关闭 ${v.title}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose(v.id)
                  }}
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-sm transition-colors',
                    'hover:bg-foreground/15 hover:text-foreground',
                    isActive ? 'text-primary/70' : 'text-muted-foreground/70',
                  )}
                >
                  <X className="size-3" />
                </button>
              )}
              {isActive && (
                <span className="pointer-events-none absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </div>
          )
        })}
      </div>

      {canRight && (
        <button
          type="button"
          aria-label="向右滚动"
          onClick={() => scrollBy(1)}
          className="flex w-8 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Right-click context menu */}
      {menu && menuView && (
        <div
          className="fixed z-50 min-w-[184px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextItem
            icon={RotateCw}
            label="刷新当前页"
            onClick={() => {
              onRefresh(menu.id)
              setMenu(null)
            }}
          />
          <ContextItem
            icon={XCircle}
            label="关闭当前页"
            disabled={menuView.affix}
            onClick={() => {
              onClose(menu.id)
              setMenu(null)
            }}
          />
          <ContextItem
            icon={Columns2}
            label="关闭其他页"
            disabled={!hasOthers}
            onClick={() => {
              onCloseOthers(menu.id)
              setMenu(null)
            }}
          />
          <ContextItem
            icon={ArrowRightToLine}
            label="关闭右侧全部"
            disabled={!hasRight}
            onClick={() => {
              onCloseRight(menu.id)
              setMenu(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

function ContextItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof RotateCw
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors',
        disabled
          ? 'cursor-not-allowed text-muted-foreground/40'
          : 'text-foreground hover:bg-accent',
      )}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </button>
  )
}
