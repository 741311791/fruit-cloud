'use client'

import { Construction, ChevronRight } from 'lucide-react'
import { navLabels, navDescriptions, parentLabels } from '@/lib/nav'
import { Card } from '@/components/ui/card'

export function ModulePlaceholder({ moduleId }: { moduleId: string }) {
  const label = navLabels[moduleId] ?? '功能模块'
  const parent = parentLabels[moduleId]
  const desc = navDescriptions[moduleId]

  return (
    <Card className="flex min-h-[60vh] flex-col items-center justify-center gap-4 border-dashed text-center">
      {parent && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{parent}</span>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{label}</span>
        </div>
      )}
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Construction className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        {desc && <p className="mt-1.5 text-sm font-medium text-muted-foreground">{desc}</p>}
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          该模块已规划，功能正在建设中，后续将逐步填充上线。如需优先开发，可在此模块提出需求。
        </p>
      </div>
      <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
        敬请期待
      </span>
    </Card>
  )
}
