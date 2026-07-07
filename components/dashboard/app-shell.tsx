'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopBar } from './top-bar'
import { Overview } from './overview'
import { ModulePlaceholder } from './module-placeholder'
import { PermissionManagement } from './permission-management'
import { ProfileCenter } from './profile/profile-center'

export function AppShell() {
  const [active, setActive] = useState('dashboard')
  const [range, setRange] = useState('month')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar active={active} range={range} onRangeChange={setRange} onNavigate={setActive} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {active === 'dashboard' ? (
            <Overview />
          ) : active === 'system-permission' ? (
            <PermissionManagement />
          ) : active === 'system-profile' ? (
            <ProfileCenter />
          ) : (
            <ModulePlaceholder moduleId={active} />
          )}
        </main>
      </div>
    </div>
  )
}
