'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { supplierRanking } from '@/lib/dashboard-data'
import { formatYuan } from '@/lib/format'

export function SupplierRanking() {
  const max = Math.max(...supplierRanking.map((s) => s.amount))
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">供应商供货金额排名</CardTitle>
        <CardDescription>本月采购金额 TOP 供应商</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5">
        {supplierRanking.map((s, i) => (
          <div key={s.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-foreground">{s.name}</span>
              </span>
              <span className="font-mono font-medium text-foreground">{formatYuan(s.amount)}</span>
            </div>
            <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-2"
                style={{ width: `${(s.amount / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
