'use client'

import { useState } from 'react'
import { Printer, Receipt, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  amountToChinese,
  lineAmount,
  lineNetWeight,
  orderTotals,
  type PurchaseOrder,
} from '@/lib/purchase-data'

type PrintMode = 'receipt' | 'triplicate'

export function PurchasePrintDialog({
  open,
  orders,
  onClose,
}: {
  open: boolean
  orders: PurchaseOrder[]
  onClose: () => void
}) {
  const [mode, setMode] = useState<PrintMode>('receipt')
  const first = orders[0]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-4 text-primary" />
            打印采购单
          </DialogTitle>
          <DialogDescription>
            已选择 {orders.length} 张单据 · 金额自动转大写防篡改
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as PrintMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="receipt" className="gap-1.5">
              <Receipt className="size-3.5" />
              精简小票（热敏）
            </TabsTrigger>
            <TabsTrigger value="triplicate" className="gap-1.5">
              <FileText className="size-3.5" />
              三联单（财务记账）
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {first ? (
          <div className="max-h-80 overflow-auto rounded-lg border border-border bg-card p-4">
            {mode === 'receipt' ? (
              <ReceiptPreview order={first} />
            ) : (
              <TriplicatePreview order={first} />
            )}
            {orders.length > 1 && (
              <p className="mt-3 border-t border-dashed border-border pt-2 text-center text-[11px] text-muted-foreground">
                另有 {orders.length - 1} 张单据将按相同模板批量打印
              </p>
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">请先选择要打印的单据</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button className="gap-1.5" onClick={() => window.print()} disabled={!first}>
            <Printer className="size-4" />
            打印 {orders.length} 张
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReceiptPreview({ order }: { order: PurchaseOrder }) {
  const totals = orderTotals(order.lines)
  return (
    <div className="mx-auto max-w-[280px] font-mono text-xs leading-relaxed text-foreground">
      <p className="text-center text-sm font-bold">果云供应链 · 采购小票</p>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">{order.code}</p>
      <div className="my-2 border-t border-dashed border-border" />
      <p>农户：{order.supplierName}</p>
      <p>工厂：{order.factoryName}</p>
      <p>日期：{order.date}</p>
      <div className="my-2 border-t border-dashed border-border" />
      {order.lines.map((l) => (
        <div key={l.key} className="flex justify-between">
          <span className="truncate">{l.productName}</span>
          <span>
            {lineNetWeight(l).toFixed(1)}斤×{l.unitPrice}
          </span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-border" />
      <div className="flex justify-between">
        <span>总净重</span>
        <span>{totals.net.toFixed(2)} 斤</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>合计</span>
        <span>¥{totals.amount.toFixed(2)}</span>
      </div>
      <p className="mt-1 text-[11px]">大写：{amountToChinese(totals.amount)}</p>
      <div className="my-2 border-t border-dashed border-border" />
      <p className="text-center text-[11px] text-muted-foreground">收货人签字：__________</p>
    </div>
  )
}

function TriplicatePreview({ order }: { order: PurchaseOrder }) {
  const totals = orderTotals(order.lines)
  return (
    <div className="text-xs text-foreground">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold">采购单（记账联）</span>
        <span className="font-mono text-[11px] text-muted-foreground">{order.code}</span>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-y-0.5">
        <span>农户：{order.supplierName}</span>
        <span>电话：{order.supplierPhone}</span>
        <span>交货工厂：{order.factoryName}</span>
        <span>日期：{order.date}</span>
      </div>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border border-border bg-muted/50">
            <th className="border border-border px-1 py-1 text-left">商品</th>
            <th className="border border-border px-1 py-1 text-right">件数</th>
            <th className="border border-border px-1 py-1 text-right">净重</th>
            <th className="border border-border px-1 py-1 text-right">单价</th>
            <th className="border border-border px-1 py-1 text-right">金额</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => (
            <tr key={l.key}>
              <td className="border border-border px-1 py-1">{l.productName}</td>
              <td className="border border-border px-1 py-1 text-right">{l.pieces}</td>
              <td className="border border-border px-1 py-1 text-right">{lineNetWeight(l).toFixed(2)}</td>
              <td className="border border-border px-1 py-1 text-right">{l.unitPrice}</td>
              <td className="border border-border px-1 py-1 text-right">{lineAmount(l).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-medium">
            <td className="border border-border px-1 py-1">合计</td>
            <td className="border border-border px-1 py-1 text-right">{totals.pieces}</td>
            <td className="border border-border px-1 py-1 text-right">{totals.net.toFixed(2)}</td>
            <td className="border border-border px-1 py-1" />
            <td className="border border-border px-1 py-1 text-right">{totals.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2">
        金额大写：<span className="font-medium">{amountToChinese(totals.amount)}</span>
      </p>
      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        <span>制单：{order.createdBy}</span>
        <span>审核：__________</span>
        <span>收货：__________</span>
      </div>
    </div>
  )
}
