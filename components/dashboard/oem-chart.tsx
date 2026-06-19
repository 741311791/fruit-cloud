'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { oemTrend } from '@/lib/dashboard-data'
import { formatYuan } from '@/lib/format'

const chartConfig = {
  income: { label: '代加工收入', color: 'var(--chart-1)' },
  cost: { label: '加工成本', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function OemChart() {
  const totalProfit = oemTrend.reduce((s, d) => s + (d.income - d.cost), 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">代加工盈亏</CardTitle>
            <CardDescription>受托加工收入与成本对比</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">期间净盈利</p>
            <p className="font-mono text-lg font-semibold text-primary">
              {formatYuan(totalProfit)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={oemTrend} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {formatYuan(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} barSize={18} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
