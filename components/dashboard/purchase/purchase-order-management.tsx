'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Upload,
  Download,
  Printer,
  Send,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { INITIAL_SUPPLIERS, INITIAL_PRODUCTS } from '@/lib/archive-data'
import {
  FACTORIES,
  INITIAL_ORDERS,
  PURCHASE_STATUS_LABELS,
  orderHasAnomaly,
  orderPayable,
  orderTotals,
  type PurchaseOrder,
  type PurchaseStatus,
} from '@/lib/purchase-data'
import { PurchaseOrderDrawer } from './purchase-order-drawer'
import { PurchaseImportDialog } from './purchase-import-dialog'
import { PurchasePrintDialog } from './purchase-print-dialog'

type StatusTab = 'all' | PurchaseStatus
const OPERATOR = '刘洋'

const STATUS_TAB_ORDER: StatusTab[] = ['all', 'draft', 'pending', 'rejected', 'completed']
const STATUS_TAB_LABEL: Record<StatusTab, string> = {
  all: '全部',
  ...PURCHASE_STATUS_LABELS,
}

const STATUS_STYLE: Record<PurchaseStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/15 text-warning',
  rejected: 'bg-destructive/12 text-destructive',
  completed: 'bg-success/12 text-success',
}

export function PurchaseOrderManagement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_ORDERS)
  const suppliers = useMemo(() => INITIAL_SUPPLIERS.filter((s) => s.enabled), [])
  const products = useMemo(() => INITIAL_PRODUCTS.filter((p) => p.enabled), [])

  const [keyword, setKeyword] = useState('')
  const [factoryFilter, setFactoryFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tab, setTab] = useState<StatusTab>('all')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit' | 'view'; order: PurchaseOrder | null } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [printOrders, setPrintOrders] = useState<PurchaseOrder[] | null>(null)

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  const counts = useMemo(() => {
    const c: Record<StatusTab, number> = { all: orders.length, draft: 0, pending: 0, rejected: 0, completed: 0 }
    orders.forEach((o) => (c[o.status] += 1))
    return c
  }, [orders])

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return orders.filter((o) => {
      if (tab !== 'all' && o.status !== tab) return false
      if (factoryFilter !== 'all' && String(o.factoryId) !== factoryFilter) return false
      if (dateFrom && o.date < dateFrom) return false
      if (dateTo && o.date > dateTo) return false
      if (k) {
        const hay = `${o.code} ${o.supplierName} ${o.supplierPhone}`.toLowerCase()
        if (!hay.includes(k)) return false
      }
      return true
    })
  }, [orders, tab, factoryFilter, dateFrom, dateTo, keyword])

  const footTotals = useMemo(
    () =>
      filtered.reduce(
        (acc, o) => {
          const t = orderTotals(o.lines)
          return {
            pieces: acc.pieces + t.pieces,
            gross: Number((acc.gross + t.gross).toFixed(2)),
            net: Number((acc.net + t.net).toFixed(2)),
            amount: Number((acc.amount + t.amount).toFixed(2)),
          }
        },
        { pieces: 0, gross: 0, net: 0, amount: 0 },
      ),
    [filtered],
  )

  const allChecked = filtered.length > 0 && filtered.every((o) => selected.has(o.id))
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(filtered.map((o) => o.id)))
  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const resetFilters = () => {
    setKeyword('')
    setFactoryFilter('all')
    setDateFrom('')
    setDateTo('')
    setTab('all')
  }

  const submitOrder = (o: PurchaseOrder, action: 'save' | 'submit') => {
    const status: PurchaseStatus = action === 'submit' ? 'pending' : 'draft'
    const saved = { ...o, status, rejectReason: action === 'submit' ? undefined : o.rejectReason }
    setOrders((prev) => {
      const exists = prev.some((x) => x.id === o.id)
      return exists ? prev.map((x) => (x.id === o.id ? saved : x)) : [saved, ...prev]
    })
    setDrawer(null)
    notify(action === 'submit' ? `采购单 ${o.code} 已提交审批` : `采购单 ${o.code} 已保存草稿`)
  }

  const removeOrder = (o: PurchaseOrder) => {
    if (window.confirm(`确定删除采购单「${o.code}」吗？`)) {
      setOrders((prev) => prev.filter((x) => x.id !== o.id))
      notify(`已删除 ${o.code}`)
    }
  }

  const batchSubmit = () => {
    const targets = orders.filter(
      (o) => selected.has(o.id) && (o.status === 'draft' || o.status === 'rejected'),
    )
    if (targets.length === 0) {
      notify('仅「草稿 / 已驳回」状态可提交审批')
      return
    }
    const ids = new Set(targets.map((o) => o.id))
    setOrders((prev) =>
      prev.map((o) => (ids.has(o.id) ? { ...o, status: 'pending', rejectReason: undefined } : o)),
    )
    setSelected(new Set())
    notify(`已批量提交 ${targets.length} 张采购单`)
  }

  const batchPrint = () => {
    const targets = orders.filter((o) => selected.has(o.id))
    if (targets.length === 0) {
      notify('请先勾选要打印的采购单')
      return
    }
    setPrintOrders(targets)
  }

  const exportDetail = () => {
    const rows = filtered.reduce((n, o) => n + o.lines.length, 0)
    notify(`已按明细级导出 ${filtered.length} 张单据 / ${rows} 行明细`)
  }

  const selectedCount = selected.size

  return (
    <div className="space-y-4">
      {/* 面包屑 + 标题 */}
      <div>
        <p className="text-xs text-muted-foreground">首页 / 采购管理 / 采购单管理</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">采购单管理</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          采购单全生命周期：录入称重明细、皮重扣杂自动计算、预付款抵扣、审批流转与打印导出
        </p>
      </div>

      {/* 筛选区 */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="采购单号 / 农户 / 手机号"
            className="h-9 w-60 pl-8"
          />
        </div>
        <Select
          value={factoryFilter}
          items={{ all: '全部工厂', ...Object.fromEntries(FACTORIES.map((f) => [String(f.id), f.name])) }}
          onValueChange={(v) => setFactoryFilter(v ?? 'all')}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部工厂</SelectItem>
            {FACTORIES.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-36"
            aria-label="起始日期"
          />
          <span className="text-xs text-muted-foreground">至</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-36"
            aria-label="结束日期"
          />
        </div>
        <Button variant="outline" className="h-9 gap-1.5" onClick={resetFilters}>
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      {/* 状态页签 + 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_TAB_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {STATUS_TAB_LABEL[t]}
              <span className={cn('ml-1 text-xs', tab === t ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="h-9 gap-1.5" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            批量导入
          </Button>
          <Button variant="outline" className="h-9 gap-1.5" onClick={exportDetail}>
            <Download className="size-4" />
            导出明细
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5"
            onClick={batchPrint}
            disabled={selectedCount === 0}
          >
            <Printer className="size-4" />
            批量打印
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5"
            onClick={batchSubmit}
            disabled={selectedCount === 0}
          >
            <Send className="size-4" />
            批量提交
          </Button>
          <Button className="h-9 gap-1.5" onClick={() => setDrawer({ mode: 'create', order: null })}>
            <Plus className="size-4" />
            新增采购单
          </Button>
        </div>
      </div>

      {selectedCount > 0 && (
        <p className="text-xs text-muted-foreground">已选择 {selectedCount} 张单据</p>
      )}

      {/* 列表 */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 text-center">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="全选" />
              </TableHead>
              <TableHead className="w-12">序号</TableHead>
              <TableHead>采购单号</TableHead>
              <TableHead>农户 / 供应商</TableHead>
              <TableHead>交货工厂</TableHead>
              <TableHead>采购日期</TableHead>
              <TableHead className="text-right">总净重(斤)</TableHead>
              <TableHead className="text-right">货款总额</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[210px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o, i) => {
              const t = orderTotals(o.lines)
              const anomaly = orderHasAnomaly(o)
              const canSubmit = o.status === 'draft' || o.status === 'rejected'
              const canEdit = o.status === 'draft' || o.status === 'rejected'
              return (
                <TableRow key={o.id} className={selected.has(o.id) ? 'bg-primary/5' : undefined}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selected.has(o.id)}
                      onCheckedChange={() => toggleOne(o.id)}
                      aria-label={`选择 ${o.code}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-medium">{o.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.supplierName}</div>
                    <div className="text-[11px] text-muted-foreground">{o.supplierPhone}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.factoryName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{t.net.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-medium">
                    ¥{t.amount.toFixed(2)}
                    {o.deductPrepaid && (
                      <div className="text-[10px] font-normal text-muted-foreground">
                        实付 ¥{orderPayable(o).toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                          STATUS_STYLE[o.status],
                        )}
                      >
                        {PURCHASE_STATUS_LABELS[o.status]}
                      </span>
                      {anomaly && (
                        <span
                          className="inline-flex items-center rounded-full bg-destructive/12 p-0.5 text-destructive"
                          title="单价偏离指导价 ±20%，请重点审核"
                        >
                          <AlertTriangle className="size-3" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <IconBtn
                        icon={<Eye className="size-3.5" />}
                        label="查看"
                        onClick={() => setDrawer({ mode: 'view', order: o })}
                      />
                      <IconBtn
                        icon={<Pencil className="size-3.5" />}
                        label="编辑"
                        onClick={() => setDrawer({ mode: 'edit', order: o })}
                        disabled={!canEdit}
                      />
                      <IconBtn
                        icon={<Printer className="size-3.5" />}
                        label="打印"
                        onClick={() => setPrintOrders([o])}
                      />
                      {canSubmit && (
                        <IconBtn
                          icon={<Send className="size-3.5" />}
                          label="提交"
                          onClick={() => submitOrder({ ...o }, 'submit')}
                        />
                      )}
                      <IconBtn
                        icon={<Trash2 className="size-3.5" />}
                        label="删除"
                        danger
                        onClick={() => removeOrder(o)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的采购单
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40 text-sm font-medium">
                <td colSpan={6} className="px-3 py-2.5 text-right text-muted-foreground">
                  合计（{filtered.length} 张）
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                  {footTotals.net.toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                  ¥{footTotals.amount.toFixed(2)}
                </td>
                <td colSpan={2} className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                  总件数 {footTotals.pieces} · 总毛重 {footTotals.gross.toFixed(2)} 斤
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

      {drawer && (
        <PurchaseOrderDrawer
          open
          mode={drawer.mode}
          order={drawer.order}
          suppliers={suppliers}
          products={products}
          existingCodes={orders.map((o) => o.code)}
          operator={OPERATOR}
          onSubmit={submitOrder}
          onClose={() => setDrawer(null)}
        />
      )}

      <PurchaseImportDialog
        open={importOpen}
        suppliers={suppliers}
        onClose={() => setImportOpen(false)}
        onImported={(n) => notify(`已导入 ${n} 行采购明细（生成草稿单据）`)}
      />

      <PurchasePrintDialog
        open={printOrders !== null}
        orders={printOrders ?? []}
        onClose={() => setPrintOrders(null)}
      />

      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function IconBtn({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-8 gap-1 px-2 text-xs',
        danger ? 'text-destructive hover:text-destructive' : 'text-muted-foreground',
      )}
    >
      {icon}
      {label}
    </Button>
  )
}
