'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { laborEfficiency } from '@/lib/dashboard-data'

const chartConfig = {
  perCapita: { label: '单品人效', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function LaborEfficiency() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">加工人员单品人效排名</CardTitle>
        <CardDescription>各产线人均加工产出（件/人 · 日），含人员费用核算</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={laborEfficiency}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={80}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-mono font-medium text-foreground">
                      {Number(value).toLocaleString('zh-CN')} 件/人
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="perCapita"
              fill="var(--color-perCapita)"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
