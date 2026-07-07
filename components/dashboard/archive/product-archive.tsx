'use client'

import { useMemo, useState } from 'react'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { ArchiveScaffold, Field, FormSection, RowActions, StatusBadge } from './archive-kit'
import {
  archiveMatch,
  statusMatch,
  nextCode,
  PACKAGING_OPTIONS,
  PRICING_LABELS,
  QUALITY_LABELS,
  type ArchiveStatusFilter,
  type PricingMethod,
  type Product,
  type QualityGrade,
} from '@/lib/archive-data'

type Draft = Omit<Product, 'id' | 'code'> & { id?: number; code?: string }

const emptyDraft: Draft = {
  name: '',
  pinyin: '',
  category: '',
  quality: 'first',
  pricingMethod: 'weight',
  packaging: PACKAGING_OPTIONS[0],
  tareWeight: 0,
  standardPieceWeight: 0,
  stockUpper: 0,
  stockLower: 0,
  enabled: true,
}

export function ProductArchive({
  products,
  setProducts,
}: {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ArchiveStatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => archiveMatch(keyword, p.name, p.pinyin) && statusMatch(status, p.enabled),
      ),
    [products, keyword, status],
  )

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const openNew = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }
  const openEdit = (p: Product) => {
    setDraft({ ...p })
    setOpen(true)
  }

  const save = () => {
    if (!draft.name.trim()) return
    if (draft.id) {
      setProducts((prev) => prev.map((p) => (p.id === draft.id ? ({ ...p, ...draft } as Product) : p)))
    } else {
      const id = Math.max(0, ...products.map((p) => p.id)) + 1
      const code = nextCode('GD', products.map((p) => p.code))
      setProducts((prev) => [...prev, { ...(draft as Product), id, code }])
    }
    setOpen(false)
  }

  const toggle = (id: number) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))

  const remove = (p: Product) => {
    if (window.confirm(`确定删除商品「${p.name}」吗？`)) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id))
    }
  }

  const packagingItems = Object.fromEntries(PACKAGING_OPTIONS.map((o) => [o, o]))

  return (
    <>
      <ArchiveScaffold
        title="商品（货品）档案"
        hint="农产品为非标品，此处设定的计价方式与固定皮重将在前端过磅录入时自动带出"
        searchPlaceholder="搜索名称 / 首字母，如 徐香猕猴桃 或 XXMHT"
        keyword={keyword}
        onKeyword={setKeyword}
        status={status}
        onStatus={setStatus}
        count={filtered.length}
        onNew={openNew}
        newLabel="新建商品"
        onImport={() => window.alert('请选择商品档案 Excel 文件进行批量导入。')}
        onExport={() => window.alert(`已导出 ${filtered.length} 条商品档案。`)}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">编码</TableHead>
              <TableHead>商品名称</TableHead>
              <TableHead>类目</TableHead>
              <TableHead>默认品质</TableHead>
              <TableHead>计价方式</TableHead>
              <TableHead>默认包装</TableHead>
              <TableHead className="text-right">固定皮重(斤)</TableHead>
              <TableHead className="text-right">标准件重(斤)</TableHead>
              <TableHead className="text-center">库存预警</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[200px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.code}</TableCell>
                <TableCell className="font-medium">
                  {p.name}
                  <span className="ml-1.5 text-[11px] text-muted-foreground">{p.pinyin}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {QUALITY_LABELS[p.quality]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={p.pricingMethod === 'weight' ? 'secondary' : 'outline'} className="font-normal">
                    {PRICING_LABELS[p.pricingMethod]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.packaging}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.tareWeight}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.standardPieceWeight}</TableCell>
                <TableCell className="text-center font-mono text-xs tabular-nums text-muted-foreground">
                  {p.stockLower} ~ {p.stockUpper}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge enabled={p.enabled} />
                </TableCell>
                <TableCell>
                  <RowActions
                    enabled={p.enabled}
                    onEdit={() => openEdit(p)}
                    onToggle={() => toggle(p.id)}
                    onDelete={() => remove(p)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的商品
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ArchiveScaffold>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              {draft.id ? '编辑商品' : '新建商品'}
            </DrawerTitle>
            <DrawerDescription>
              {draft.id ? `编码 ${draft.code}` : '编码将由系统自动生成'}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-6">
            <FormSection title="基础信息">
              <Field label="商品名称" required>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="如：徐香猕猴桃"
                  className="h-9"
                />
              </Field>
              <Field label="拼音首字母" hint="用于快速搜索，如 XXMHT">
                <Input
                  value={draft.pinyin}
                  onChange={(e) => patch({ pinyin: e.target.value.toUpperCase() })}
                  placeholder="XXMHT"
                  className="h-9"
                />
              </Field>
              <Field label="所属类目" required>
                <Input
                  value={draft.category}
                  onChange={(e) => patch({ category: e.target.value })}
                  placeholder="如：猕猴桃"
                  className="h-9"
                />
              </Field>
              <Field label="默认品质等级">
                <Select
                  value={draft.quality}
                  items={QUALITY_LABELS}
                  onValueChange={(v) => patch({ quality: v as QualityGrade })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="special">特级</SelectItem>
                    <SelectItem value="first">一级</SelectItem>
                    <SelectItem value="standard">统货</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FormSection>

            <FormSection title="计量与计价">
              <Field label="默认计价方式" required>
                <Select
                  value={draft.pricingMethod}
                  items={PRICING_LABELS}
                  onValueChange={(v) => patch({ pricingMethod: v as PricingMethod })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">按斤计价</SelectItem>
                    <SelectItem value="piece">按件计价</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="默认包装方案">
                <Select
                  value={draft.packaging}
                  items={packagingItems}
                  onValueChange={(v) => patch({ packaging: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="固定皮重（斤/件）" hint="采购录入选到该商品时自动带出">
                <Input
                  type="number"
                  value={draft.tareWeight}
                  onChange={(e) => patch({ tareWeight: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              <Field label="标准件重（斤）" hint="每件净果，标品入库参考">
                <Input
                  type="number"
                  value={draft.standardPieceWeight}
                  onChange={(e) => patch({ standardPieceWeight: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
            </FormSection>

            <FormSection title="库存策略">
              <Field label="库存预警下限">
                <Input
                  type="number"
                  value={draft.stockLower}
                  onChange={(e) => patch({ stockLower: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              <Field label="库存预警上限">
                <Input
                  type="number"
                  value={draft.stockUpper}
                  onChange={(e) => patch({ stockUpper: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
            </FormSection>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button disabled={!draft.name.trim()} onClick={save}>
              保存
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
