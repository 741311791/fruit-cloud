'use client'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const data = [
  {
    label: '应收账款',
    value: '¥86.4万',
    overdue: '逾期 ¥12.3万',
    pct: 68,
    icon: ArrowDownLeft,
    tone: 'text-primary',
    bar: 'bg-primary',
  },
  {
    label: '应付账款',
    value: '¥62.1万',
    overdue: '逾期 ¥4.8万',
    pct: 49,
    icon: ArrowUpRight,
    tone: 'text-chart-2',
    bar: 'bg-chart-2',
  },
]

export function ReceivablesPayables() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">应收 / 应付账款</CardTitle>
        <CardDescription>往来款项汇总与逾期监控</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {data.map((d) => {
          const Icon = d.icon
          return (
            <div key={d.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className={`size-4 ${d.tone}`} />
                  {d.label}
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {d.value}
                </span>
              </div>
              <Progress value={d.pct} className="h-1.5" />
              <p className="mt-1.5 text-xs text-muted-foreground">{d.overdue}</p>
            </div>
          )
        })}
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">净往来差额</span>
            <span className="font-mono font-semibold text-primary">+¥24.3万</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
