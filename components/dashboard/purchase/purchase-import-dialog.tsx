'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, CheckCircle2, XCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Supplier } from '@/lib/archive-data'

type PreRow = {
  row: number
  supplierName: string
  productName: string
  pieces: number
  grossWeight: number
  unitPrice: number
  error?: string
}

/** Deterministic mock upload: mirrors a real 地磅/Excel export, with one bad row. */
const SAMPLE_ROWS: Omit<PreRow, 'error'>[] = [
  { row: 2, supplierName: '李大娘', productName: '奶油草莓', pieces: 30, grossWeight: 132, unitPrice: 18 },
  { row: 3, supplierName: '周家庄合作社', productName: '烟台红富士', pieces: 50, grossWeight: 2500, unitPrice: 4.2 },
  { row: 4, supplierName: '王老五', productName: '徐香猕猴桃', pieces: 20, grossWeight: 800, unitPrice: 6.5 },
  { row: 5, supplierName: '云岭生态农业', productName: '云南蓝莓', pieces: 40, grossWeight: 80, unitPrice: 9 },
]

export function PurchaseImportDialog({
  open,
  suppliers,
  onClose,
  onImported,
}: {
  open: boolean
  suppliers: Supplier[]
  onClose: () => void
  onImported: (count: number) => void
}) {
  const [rows, setRows] = useState<PreRow[] | null>(null)

  const runPrecheck = () => {
    const names = new Set(suppliers.map((s) => s.name))
    setRows(
      SAMPLE_ROWS.map((r) => ({
        ...r,
        error: names.has(r.supplierName)
          ? undefined
          : `农户「${r.supplierName}」在档案中未找到，请先建立档案`,
      })),
    )
  }

  const errorCount = rows?.filter((r) => r.error).length ?? 0
  const validCount = rows ? rows.length - errorCount : 0

  const reset = () => setRows(null)
  const close = () => {
    reset()
    onClose()
  }

  const confirm = () => {
    onImported(validCount)
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-primary" />
            批量导入采购单
          </DialogTitle>
          <DialogDescription>
            下载模板按格式填写，上传后系统先做预检、无误再写入，避免脏数据入库。
          </DialogDescription>
        </DialogHeader>

        {!rows ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <div className="text-sm">
                <p className="font-medium text-foreground">标准导入模板</p>
                <p className="text-xs text-muted-foreground">
                  含农户名称 / 手机号 / 商品编号 / 件数 / 毛重 / 皮重 / 扣杂 / 单价
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.alert('已开始下载《采购单导入模板.xlsx》')}
              >
                <Download className="size-4" />
                下载模板
              </Button>
            </div>
            <button
              type="button"
              onClick={runPrecheck}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Upload className="size-6" />
              点击选择 Excel 文件上传（点此加载示例数据进行预检）
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" />
                校验通过 {validCount} 行
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="size-4" />
                  异常 {errorCount} 行
                </span>
              )}
            </div>
            <div className="max-h-72 overflow-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/70">
                  <tr className="text-muted-foreground">
                    <th className="px-2 py-1.5 text-left">行</th>
                    <th className="px-2 py-1.5 text-left">农户</th>
                    <th className="px-2 py-1.5 text-left">商品</th>
                    <th className="px-2 py-1.5 text-right">件数</th>
                    <th className="px-2 py-1.5 text-right">毛重</th>
                    <th className="px-2 py-1.5 text-right">单价</th>
                    <th className="px-2 py-1.5 text-left">校验</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.row}
                      className={
                        r.error
                          ? 'border-t border-border bg-destructive/5'
                          : 'border-t border-border'
                      }
                    >
                      <td className="px-2 py-1.5">{r.row}</td>
                      <td className={`px-2 py-1.5 ${r.error ? 'font-medium text-destructive' : ''}`}>
                        {r.supplierName}
                      </td>
                      <td className="px-2 py-1.5">{r.productName}</td>
                      <td className="px-2 py-1.5 text-right font-mono tabular-nums">{r.pieces}</td>
                      <td className="px-2 py-1.5 text-right font-mono tabular-nums">{r.grossWeight}</td>
                      <td className="px-2 py-1.5 text-right font-mono tabular-nums">{r.unitPrice}</td>
                      <td className="px-2 py-1.5">
                        {r.error ? (
                          <span className="text-destructive">{r.error}</span>
                        ) : (
                          <span className="text-success">通过</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errorCount > 0 && (
              <p className="text-xs text-muted-foreground">
                异常行不会导入，请修正 Excel 后重新上传，或先导入通过的 {validCount} 行。
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            取消
          </Button>
          {rows && (
            <Button variant="outline" onClick={reset}>
              重新上传
            </Button>
          )}
          <Button onClick={confirm} disabled={!rows || validCount === 0}>
            导入 {rows ? `${validCount} 行` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
