'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ClipboardList, Plus, Trash2, AlertTriangle, Wallet } from 'lucide-react'
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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Field } from '../archive/archive-kit'
import { cn } from '@/lib/utils'
import {
  FACTORIES,
  GUIDE_PRICES,
  lineAmount,
  lineHasPriceAnomaly,
  lineNetWeight,
  nextOrderCode,
  orderTotals,
  PURCHASE_STATUS_LABELS,
  type PurchaseLine,
  type PurchaseOrder,
  type PurchaseStatus,
} from '@/lib/purchase-data'
import type { Product, Supplier } from '@/lib/archive-data'
import { PRICING_LABELS } from '@/lib/archive-data'

type DrawerMode = 'create' | 'edit' | 'view'

let lineSeq = 0
function newLine(): PurchaseLine {
  lineSeq += 1
  return {
    key: `nl-${Date.now()}-${lineSeq}`,
    productId: null,
    productName: '',
    unit: '斤',
    pieces: 0,
    grossWeight: 0,
    tareWeight: 0,
    impurity: 0,
    unitPrice: 0,
  }
}

export function PurchaseOrderDrawer({
  open,
  mode,
  order,
  suppliers,
  products,
  existingCodes,
  operator,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: DrawerMode
  order: PurchaseOrder | null
  suppliers: Supplier[]
  products: Product[]
  existingCodes: string[]
  operator: string
  /** action: 'save' keeps draft, 'submit' sends for approval. */
  onSubmit: (o: PurchaseOrder, action: 'save' | 'submit') => void
  onClose: () => void
}) {
  const readOnly = mode === 'view'

  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [factoryId, setFactoryId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [lines, setLines] = useState<PurchaseLine[]>([])
  const [deductPrepaid, setDeductPrepaid] = useState(false)
  const [deductAmount, setDeductAmount] = useState(0)
  const [remark, setRemark] = useState('')
  const [error, setError] = useState<string | null>(null)

  const bodyRef = useRef<HTMLDivElement>(null)

  // Hydrate the form whenever the drawer opens.
  useEffect(() => {
    if (!open) return
    if (order) {
      setSupplierId(order.supplierId)
      setFactoryId(order.factoryId)
      setDate(order.date)
      setLines(order.lines.map((l) => ({ ...l })))
      setDeductPrepaid(order.deductPrepaid)
      setDeductAmount(order.deductAmount)
      setRemark(order.remark)
    } else {
      setSupplierId(null)
      setFactoryId(null)
      setDate(new Date().toISOString().slice(0, 10))
      setLines([newLine()])
      setDeductPrepaid(false)
      setDeductAmount(0)
      setRemark('')
    }
    setError(null)
  }, [open, order])

  const supplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId) ?? null,
    [suppliers, supplierId],
  )
  const prepaid = supplier?.prepaidBalance ?? 0
  const totals = useMemo(() => orderTotals(lines), [lines])
  const payable = Math.max(0, totals.amount - (deductPrepaid ? deductAmount : 0))
  const anomalyCount = lines.filter(lineHasPriceAnomaly).length

  const patchLine = (key: string, p: Partial<PurchaseLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...p } : l)))

  const chooseProduct = (key: string, pid: number) => {
    const p = products.find((x) => x.id === pid)
    if (!p) return
    patchLine(key, {
      productId: p.id,
      productName: p.name,
      unit: PRICING_LABELS[p.pricingMethod] === '按件计价' ? '件' : '斤',
      tareWeight: p.tareWeight,
      // Suggest guide price so operators start from market reference.
      unitPrice: GUIDE_PRICES[p.id] ?? 0,
    })
  }

  const addLine = () => setLines((prev) => [...prev, newLine()])
  const removeLine = (key: string) =>
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)))

  // Ctrl+N appends a new detail row anywhere in the drawer.
  useEffect(() => {
    if (!open || readOnly) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        addLine()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, readOnly])

  // Enter moves focus along the entry sequence: 件数 → 毛重 → 单价 → 下一行件数.
  const focusCell = (row: number, field: string) => {
    const el = bodyRef.current?.querySelector<HTMLInputElement>(
      `[data-cell="r${row}-${field}"]`,
    )
    if (el) {
      el.focus()
      el.select()
    }
  }
  const onCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    field: 'pieces' | 'gross' | 'price',
  ) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    if (field === 'pieces') focusCell(row, 'gross')
    else if (field === 'gross') focusCell(row, 'price')
    else {
      if (row === lines.length - 1) {
        addLine()
        requestAnimationFrame(() => focusCell(row + 1, 'pieces'))
      } else {
        focusCell(row + 1, 'pieces')
      }
    }
  }

  const validate = (): PurchaseOrder | null => {
    if (!supplierId || !supplier) {
      setError('请选择供应商（农户）')
      return null
    }
    if (!factoryId) {
      setError('请选择交货工厂')
      return null
    }
    const valid = lines.filter((l) => l.productId && (l.grossWeight > 0 || l.pieces > 0))
    if (valid.length === 0) {
      setError('请至少录入一条有效采购明细')
      return null
    }
    if (deductPrepaid && deductAmount > prepaid) {
      setError(`抵扣金额 ¥${deductAmount.toLocaleString()} 超过预付款余额 ¥${prepaid.toLocaleString()}，请调整`)
      return null
    }
    const factory = FACTORIES.find((f) => f.id === factoryId)!
    const code = order?.code ?? nextOrderCode(existingCodes)
    return {
      id: order?.id ?? Date.now(),
      code,
      supplierId,
      supplierName: supplier.name,
      supplierPhone: supplier.phone,
      factoryId,
      factoryName: factory.name,
      date,
      status: (order?.status ?? 'draft') as PurchaseStatus,
      lines: valid,
      deductPrepaid,
      deductAmount: deductPrepaid ? deductAmount : 0,
      remark,
      createdBy: order?.createdBy ?? operator,
      createdAt: order?.createdAt ?? new Date().toISOString().slice(0, 16).replace('T', ' '),
      rejectReason: order?.rejectReason,
    }
  }

  const handle = (action: 'save' | 'submit') => {
    const o = validate()
    if (!o) return
    onSubmit(o, action)
  }

  const productItems = useMemo(
    () => Object.fromEntries(products.map((p) => [String(p.id), p.name])),
    [products],
  )

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="w-full max-w-full sm:max-w-[880px] lg:max-w-[72vw]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            {mode === 'create' ? '新增采购单' : mode === 'edit' ? '编辑采购单' : '查看采购单'}
          </DrawerTitle>
          <DrawerDescription>
            {order ? (
              <span className="flex items-center gap-2">
                <span className="font-mono">{order.code}</span>
                <span className="text-muted-foreground">·</span>
                <span>{PURCHASE_STATUS_LABELS[order.status]}</span>
              </span>
            ) : (
              '单号将由系统按 PO+日期+流水 自动生成'
            )}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody ref={bodyRef} className="space-y-6">
          {/* 单据头 */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="供应商（农户）" required>
              <Select
                value={supplierId ? String(supplierId) : ''}
                items={Object.fromEntries(suppliers.map((s) => [String(s.id), s.name]))}
                onValueChange={(v) => !readOnly && setSupplierId(Number(v))}
                disabled={readOnly}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="请选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}（{s.phone}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="交货工厂" required>
              <Select
                value={factoryId ? String(factoryId) : ''}
                items={Object.fromEntries(FACTORIES.map((f) => [String(f.id), f.name]))}
                onValueChange={(v) => !readOnly && setFactoryId(Number(v))}
                disabled={readOnly}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="请选择交货工厂" />
                </SelectTrigger>
                <SelectContent>
                  {FACTORIES.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="采购日期" required>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
                disabled={readOnly}
              />
            </Field>
          </div>

          {/* 预付款联动提示 */}
          {supplier && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <Wallet className="size-4 text-primary" />
              <span className="text-muted-foreground">该供应商预付款余额</span>
              <span className="font-mono font-semibold text-success">
                ¥{prepaid.toLocaleString()}
              </span>
              <span className="text-muted-foreground">· 结算方式 {supplier.settlement === 'cash' ? '现结' : '账期结算'}</span>
            </div>
          )}

          {/* 明细表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-1 rounded-full bg-primary" />
                <h4 className="text-sm font-semibold text-foreground">采购明细</h4>
                <span className="text-[11px] text-muted-foreground">
                  净重 = 毛重 − 件数×皮重 − 扣杂；回车逐格录入，Ctrl+N 新增行
                </span>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={addLine}>
                  <Plus className="size-3.5" />
                  新增行
                </Button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="w-8 px-2 py-2 text-center">#</th>
                    <th className="min-w-40 px-2 py-2 text-left">商品</th>
                    <th className="w-20 px-2 py-2 text-right">件数</th>
                    <th className="w-24 px-2 py-2 text-right">毛重</th>
                    <th className="w-20 px-2 py-2 text-right">皮重</th>
                    <th className="w-20 px-2 py-2 text-right">扣杂</th>
                    <th className="w-24 px-2 py-2 text-right">净重</th>
                    <th className="w-24 px-2 py-2 text-right">单价</th>
                    <th className="w-28 px-2 py-2 text-right">金额</th>
                    {!readOnly && <th className="w-10 px-2 py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => {
                    const net = lineNetWeight(l)
                    const amount = lineAmount(l)
                    const anomaly = lineHasPriceAnomaly(l)
                    return (
                      <tr key={l.key} className="border-b border-border/60 last:border-0">
                        <td className="px-2 py-1.5 text-center text-xs text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-2 py-1.5">
                          <Select
                            value={l.productId ? String(l.productId) : ''}
                            items={productItems}
                            onValueChange={(v) => chooseProduct(l.key, Number(v))}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="选择商品" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <CellInput
                          value={l.pieces}
                          cell={`r${i}-pieces`}
                          onChange={(n) => patchLine(l.key, { pieces: n })}
                          onKeyDown={(e) => onCellKeyDown(e, i, 'pieces')}
                          readOnly={readOnly}
                        />
                        <CellInput
                          value={l.grossWeight}
                          cell={`r${i}-gross`}
                          onChange={(n) => patchLine(l.key, { grossWeight: n })}
                          onKeyDown={(e) => onCellKeyDown(e, i, 'gross')}
                          readOnly={readOnly}
                        />
                        <CellInput
                          value={l.tareWeight}
                          onChange={(n) => patchLine(l.key, { tareWeight: n })}
                          readOnly={readOnly}
                        />
                        <CellInput
                          value={l.impurity}
                          onChange={(n) => patchLine(l.key, { impurity: n })}
                          readOnly={readOnly}
                        />
                        <td className="px-2 py-1.5 text-right font-mono text-xs tabular-nums text-foreground">
                          {net.toFixed(2)}
                          <span className="ml-0.5 text-[10px] text-muted-foreground">{l.unit === '件' ? '斤' : '斤'}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="relative">
                            <CellRawInput
                              value={l.unitPrice}
                              cell={`r${i}-price`}
                              onChange={(n) => patchLine(l.key, { unitPrice: n })}
                              onKeyDown={(e) => onCellKeyDown(e, i, 'price')}
                              readOnly={readOnly}
                              className={anomaly ? 'border-destructive text-destructive' : ''}
                            />
                            {anomaly && (
                              <AlertTriangle className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-destructive" />
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-xs font-medium tabular-nums">
                          ¥{amount.toFixed(2)}
                        </td>
                        {!readOnly && (
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(l.key)}
                              className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                              disabled={lines.length <= 1}
                              aria-label="删除该行"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/40 text-xs font-medium">
                    <td colSpan={2} className="px-2 py-2 text-right text-muted-foreground">
                      合计
                    </td>
                    <td className="px-2 py-2 text-right font-mono tabular-nums">{totals.pieces}</td>
                    <td className="px-2 py-2 text-right font-mono tabular-nums">{totals.gross.toFixed(2)}</td>
                    <td colSpan={2} />
                    <td className="px-2 py-2 text-right font-mono tabular-nums text-primary">
                      {totals.net.toFixed(2)}
                    </td>
                    <td />
                    <td className="px-2 py-2 text-right font-mono tabular-nums text-primary">
                      ¥{totals.amount.toFixed(2)}
                    </td>
                    {!readOnly && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>

            {anomalyCount > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3.5" />
                {anomalyCount} 条明细单价偏离指导价 ±20%，提交后将标记「价格异常」供主管重点审核
              </p>
            )}
          </div>

          {/* 结算 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={deductPrepaid}
                  onCheckedChange={(v) => !readOnly && setDeductPrepaid(Boolean(v))}
                  disabled={readOnly || prepaid <= 0}
                />
                <span>抵扣预付款</span>
                <span className="text-xs text-muted-foreground">（余额 ¥{prepaid.toLocaleString()}）</span>
              </label>
              {deductPrepaid && (
                <Field label="本次抵扣金额（元）">
                  <Input
                    type="number"
                    value={deductAmount}
                    onChange={(e) => setDeductAmount(Number(e.target.value) || 0)}
                    className={cn(
                      'h-9',
                      deductAmount > prepaid && 'border-destructive text-destructive',
                    )}
                    disabled={readOnly}
                  />
                </Field>
              )}
            </div>
            <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">货款总额</span>
                <span className="font-mono font-medium tabular-nums">¥{totals.amount.toFixed(2)}</span>
              </div>
              {deductPrepaid && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>抵扣预付款</span>
                  <span className="font-mono tabular-nums">-¥{deductAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-1.5">
                <span className="font-medium">实付金额</span>
                <span className="font-mono text-base font-semibold tabular-nums text-primary">
                  ¥{payable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Field label="备注">
            <Input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="选填，如收购时段、果品状态等"
              className="h-9"
              disabled={readOnly}
            />
          </Field>

          {order?.status === 'rejected' && order.rejectReason && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <span className="font-medium">驳回原因：</span>
              {order.rejectReason}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>
            {readOnly ? '关闭' : '取消'}
          </Button>
          {!readOnly && (
            <>
              <Button variant="outline" onClick={() => handle('save')}>
                保存草稿
              </Button>
              <Button onClick={() => handle('submit')}>提交审批</Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/** Numeric cell wrapped in a <td> for the detail grid. */
function CellInput({
  value,
  cell,
  onChange,
  onKeyDown,
  readOnly,
}: {
  value: number
  cell?: string
  onChange: (n: number) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  readOnly?: boolean
}) {
  return (
    <td className="px-2 py-1.5">
      <CellRawInput
        value={value}
        cell={cell}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
      />
    </td>
  )
}

function CellRawInput({
  value,
  cell,
  onChange,
  onKeyDown,
  readOnly,
  className,
}: {
  value: number
  cell?: string
  onChange: (n: number) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  readOnly?: boolean
  className?: string
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      data-cell={cell}
      value={value === 0 ? '' : value}
      placeholder="0"
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      onKeyDown={onKeyDown}
      onFocus={(e) => e.target.select()}
      readOnly={readOnly}
      className={cn(
        'h-8 w-full rounded-md border border-input bg-transparent px-2 text-right font-mono text-xs tabular-nums outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40 read-only:cursor-default read-only:opacity-70',
        className,
      )}
    />
  )
}
