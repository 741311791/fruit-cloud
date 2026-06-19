'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { topMargin, negativeMargin } from '@/lib/dashboard-data'
import { formatYuan, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

function RankRow({
  rank,
  name,
  margin,
  rate,
  negative,
}: {
  rank: number
  name: string
  margin: number
  rate: number
  negative?: boolean
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
          rank <= 3
            ? negative
              ? 'bg-destructive/15 text-destructive'
              : 'bg-primary/15 text-primary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{name}</span>
      <div className="text-right">
        <p
          className={cn(
            'font-mono text-sm font-medium',
            negative ? 'text-destructive' : 'text-foreground',
          )}
        >
          {formatYuan(margin)}
        </p>
        <p className={cn('text-xs', negative ? 'text-destructive/80' : 'text-primary')}>
          {formatPercent(rate)}
        </p>
      </div>
    </li>
  )
}

export function MarginRanking() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">商品毛利排名</CardTitle>
        <CardDescription>识别高盈利单品与拖累利润的负毛利商品</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top">
          <TabsList className="mb-2">
            <TabsTrigger value="top">TOP 毛利额</TabsTrigger>
            <TabsTrigger value="negative">负毛利预警</TabsTrigger>
          </TabsList>
          <TabsContent value="top">
            <ul className="divide-y divide-border">
              {topMargin.map((item, i) => (
                <RankRow key={item.name} rank={i + 1} {...item} />
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="negative">
            <ul className="divide-y divide-border">
              {negativeMargin.map((item, i) => (
                <RankRow key={item.name} rank={i + 1} negative {...item} />
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
