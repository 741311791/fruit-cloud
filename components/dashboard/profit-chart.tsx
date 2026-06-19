'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import { profitTrend } from '@/lib/dashboard-data'

const chartConfig = {
  revenue: { label: '营收', color: 'var(--chart-2)' },
  cost: { label: '成本', color: 'var(--chart-4)' },
  profit: { label: '净盈利', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function ProfitChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">盈亏数据一览</CardTitle>
        <CardDescription>营收 / 成本 / 净盈利趋势（含固定支出核算）</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={profitTrend} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        ¥{Number(value).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              fill="url(#fillRevenue)"
              strokeWidth={2}
            />
            <Area
              dataKey="profit"
              type="monotone"
              stroke="var(--color-profit)"
              fill="url(#fillProfit)"
              strokeWidth={2}
            />
            <Area
              dataKey="cost"
              type="monotone"
              stroke="var(--color-cost)"
              fill="transparent"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
