'use client'

import { Cell, Label, Pie, PieChart } from 'recharts'
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
import { costBreakdown } from '@/lib/dashboard-data'
import { formatYuan } from '@/lib/format'

const palette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const chartConfig: ChartConfig = Object.fromEntries(
  costBreakdown.map((c, i) => [c.key, { label: c.name, color: palette[i] }]),
)

export function CostBreakdown() {
  const total = costBreakdown.reduce((s, c) => s + c.value, 0)
  const data = costBreakdown.map((c, i) => ({ ...c, fill: palette[i] }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">成本结构</CardTitle>
        <CardDescription>各项成本占比构成</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="aspect-square h-[180px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[name as string]?.label}
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {formatYuan(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={55}
              outerRadius={80}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground font-mono text-lg font-semibold"
                        >
                          {(total / 10000).toFixed(0)}万
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          总成本
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="grid w-full grid-cols-1 gap-2">
          {data.map((c) => (
            <li key={c.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-sm" style={{ background: c.fill }} />
                {c.name}
              </span>
              <span className="font-mono text-foreground">
                {((c.value / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
