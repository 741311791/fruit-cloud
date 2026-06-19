'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { returnRanking } from '@/lib/dashboard-data'
import { formatYuan } from '@/lib/format'

export function ReturnRanking() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">退货金额排名</CardTitle>
        <CardDescription>退货金额与退货笔数最高的商品</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-xs">商品</TableHead>
              <TableHead className="h-8 text-right text-xs">退货金额</TableHead>
              <TableHead className="h-8 text-right text-xs">笔数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnRanking.map((r) => (
              <TableRow key={r.name} className="border-border">
                <TableCell className="py-2.5 text-sm text-foreground">{r.name}</TableCell>
                <TableCell className="py-2.5 text-right font-mono text-sm text-destructive">
                  {formatYuan(r.amount)}
                </TableCell>
                <TableCell className="py-2.5 text-right font-mono text-sm text-muted-foreground">
                  {r.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
