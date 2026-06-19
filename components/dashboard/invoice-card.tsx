'use client'

import { FileInput, FileOutput } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function InvoiceCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">发票统计</CardTitle>
        <CardDescription>当月进项 / 销项发票及差额</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileInput className="size-3.5" />
              进项发票
            </div>
            <p className="font-mono text-lg font-semibold text-foreground">¥142.6万</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileOutput className="size-3.5" />
              销项发票
            </div>
            <p className="font-mono text-lg font-semibold text-foreground">¥198.3万</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
          <span className="text-sm text-foreground">当月发票差额（销-进）</span>
          <span className="font-mono text-base font-semibold text-primary">+¥55.7万</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">报销支出合计</span>
          <span className="font-mono text-base font-semibold text-foreground">¥3.65万</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">运费统计合计</span>
          <span className="font-mono text-base font-semibold text-foreground">¥9.28万</span>
        </div>
      </CardContent>
    </Card>
  )
}
