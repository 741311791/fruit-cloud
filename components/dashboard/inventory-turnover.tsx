'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { inventoryTurnover } from '@/lib/dashboard-data'

export function InventoryTurnover() {
  const max = Math.max(...inventoryTurnover.map((d) => d.turnover))
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">库存周转一览</CardTitle>
        <CardDescription>各品类周转次数与平均周转天数</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {inventoryTurnover.map((d) => (
          <div key={d.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-foreground">{d.name}</span>
              <span className="text-muted-foreground">
                <span className="font-mono text-foreground">{d.turnover}</span> 次 ·{' '}
                {d.days} 天
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(d.turnover / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
