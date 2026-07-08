'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopBar } from './top-bar'
import { TabBar, type TabView } from './tab-bar'
import { Overview } from './overview'
import { ModulePlaceholder } from './module-placeholder'
import { PermissionManagement } from './permission-management'
import { ArchiveManagement } from './archive-management'
import { PurchaseOrderManagement } from './purchase/purchase-order-management'
import { ProfileCenter } from './profile/profile-center'
import { WorkflowConfig } from './workflow/workflow-config'
import { MyTodo } from './todo/my-todo'
import { navLabels } from '@/lib/nav'
import { cn } from '@/lib/utils'

const MAX_TABS = 20
const HOME_ID = 'dashboard'

function tabTitle(id: string): string {
  if (id === HOME_ID) return '首页'
  return navLabels[id] ?? '未命名页面'
}

/** Render the component for a given view id. */
function renderView(id: string) {
  if (id === HOME_ID) return <Overview />
  if (id === 'system-permission') return <PermissionManagement />
  if (id === 'system-archive') return <ArchiveManagement />
  if (id === 'purchase-order') return <PurchaseOrderManagement />
  if (id === 'system-workflow') return <WorkflowConfig />
  if (id === 'hr-todo') return <MyTodo />
  if (id === 'system-profile') return <ProfileCenter />
  return <ModulePlaceholder moduleId={id} />
}

export function AppShell() {
  const [views, setViews] = useState<TabView[]>([{ id: HOME_ID, title: '首页', affix: true }])
  const [active, setActive] = useState(HOME_ID)
  const [collapsed, setCollapsed] = useState(false)
  // Per-tab remount key: bumping it destroys the keep-alive cache (refresh).
  const [nonce, setNonce] = useState<Record<string, number>>({})
  const [warning, setWarning] = useState<string | null>(null)

  // Mirror of `views` for synchronous reads inside event handlers.
  const viewsRef = useRef(views)
  useEffect(() => {
    viewsRef.current = views
  }, [views])

  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = useCallback((msg: string) => {
    setWarning(msg)
    if (warnTimer.current) clearTimeout(warnTimer.current)
    warnTimer.current = setTimeout(() => setWarning(null), 2800)
  }, [])

  const openTab = useCallback(
    (id: string) => {
      const cur = viewsRef.current
      const exists = cur.some((v) => v.id === id)
      if (!exists) {
        if (cur.length >= MAX_TABS) {
          notify(`打开页签已达上限（${MAX_TABS} 个），请先关闭部分无用页面`)
          return
        }
        const next = [...cur, { id, title: tabTitle(id) }]
        viewsRef.current = next
        setViews(next)
      }
      setActive(id)
    },
    [notify],
  )

  const closeTab = useCallback(
    (id: string) => {
      const cur = viewsRef.current
      const idx = cur.findIndex((v) => v.id === id)
      if (idx === -1 || cur[idx].affix) return
      const next = cur.filter((v) => v.id !== id)
      viewsRef.current = next
      setViews(next)
      setNonce((n) => {
        const m = { ...n }
        delete m[id]
        return m
      })
      // If closing the active tab, fall back to the adjacent (previous) tab.
      setActive((prevActive) => {
        if (prevActive !== id) return prevActive
        const fallback = next[idx - 1] ?? next[next.length - 1]
        return fallback ? fallback.id : HOME_ID
      })
    },
    [],
  )

  const refreshTab = useCallback((id: string) => {
    setNonce((n) => ({ ...n, [id]: (n[id] ?? 0) + 1 }))
    setActive(id)
  }, [])

  const closeOthers = useCallback((id: string) => {
    const next = viewsRef.current.filter((v) => v.affix || v.id === id)
    viewsRef.current = next
    setViews(next)
    setActive(id)
  }, [])

  const closeRight = useCallback((id: string) => {
    const cur = viewsRef.current
    const idx = cur.findIndex((v) => v.id === id)
    if (idx === -1) return
    const next = cur.filter((v, i) => i <= idx || v.affix)
    viewsRef.current = next
    setViews(next)
    setActive((prevActive) =>
      next.some((v) => v.id === prevActive) ? prevActive : id,
    )
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        active={active}
        onSelect={openTab}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar active={active} onNavigate={openTab} />
        <TabBar
          views={views}
          active={active}
          onSelect={setActive}
          onClose={closeTab}
          onRefresh={refreshTab}
          onCloseOthers={closeOthers}
          onCloseRight={closeRight}
        />
        <main className="relative min-h-0 flex-1 overflow-hidden">
          {views.map((v) => {
            const isActive = v.id === active
            return (
              <div
                key={`${v.id}#${nonce[v.id] ?? 0}`}
                aria-hidden={!isActive}
                className={cn(
                  'absolute inset-0 overflow-y-auto p-4 md:p-6',
                  isActive ? 'visible' : 'invisible pointer-events-none',
                )}
              >
                {renderView(v.id)}
              </div>
            )
          })}
        </main>
      </div>

      {warning && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
          {warning}
        </div>
      )}
    </div>
  )
}
