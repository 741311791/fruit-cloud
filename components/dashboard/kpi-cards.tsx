'use client'

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Coins, TrendingDown, Receipt, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Kpi = {
  label: string
  value: string
  delta: number
  sub: string
  icon: LucideIcon
  tone: 'positive' | 'negative' | 'neutral'
}

const kpis: Kpi[] = [
  {
    label: '本月净盈利',
    value: '¥51.4万',
    delta: 12.6,
    sub: '营收 ¥213.7万 · 成本 ¥162.3万',
    icon: Wallet,
    tone: 'positive',
  },
  {
    label: '加工费用合计',
    value: '¥38.6万',
    delta: 4.2,
    sub: '人员费用 ¥24.8万',
    icon: Coins,
    tone: 'neutral',
  },
  {
    label: '出库成本',
    value: '¥128.5万',
    delta: -2.8,
    sub: '占总成本 79.2%',
    icon: Receipt,
    tone: 'neutral',
  },
  {
    label: '负毛利商品损失',
    value: '¥8.0万',
    delta: 6.4,
    sub: '涉及 4 个 SKU',
    icon: TrendingDown,
    tone: 'negative',
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const up = kpi.delta >= 0
        // 对“损失/成本”类指标，上升其实是负面，用色调区分
        const deltaIsGood =
          kpi.tone === 'negative' ? !up : kpi.tone === 'neutral' ? true : up
        return (
          <Card key={kpi.label} className="gap-0 p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-[18px] text-muted-foreground" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {kpi.value}
              </span>
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  deltaIsGood ? 'text-primary' : 'text-destructive',
                )}
              >
                {up ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(kpi.delta)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{kpi.sub}</p>
          </Card>
        )
      })}
    </div>
  )
}
