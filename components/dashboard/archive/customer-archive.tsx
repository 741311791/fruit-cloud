'use client'

import { useMemo, useState } from 'react'
import { Building2, AlertTriangle } from 'lucide-react'
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
  CUSTOMER_TYPE_LABELS,
  type ArchiveStatusFilter,
  type Customer,
  type CustomerType,
} from '@/lib/archive-data'

type Draft = Omit<Customer, 'id' | 'code'> & { id?: number; code?: string }

const emptyDraft: Draft = {
  name: '',
  pinyin: '',
  type: 'retail',
  contact: '',
  phone: '',
  address: '',
  logistics: '',
  creditDays: 0,
  creditLimit: 0,
  currentDebt: 0,
  enabled: true,
}

export function CustomerArchive({
  customers,
  setCustomers,
}: {
  customers: Customer[]
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ArchiveStatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => archiveMatch(keyword, c.name, c.pinyin) && statusMatch(status, c.enabled),
      ),
    [customers, keyword, status],
  )

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const openNew = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }
  const openEdit = (c: Customer) => {
    setDraft({ ...c })
    setOpen(true)
  }

  const save = () => {
    if (!draft.name.trim()) return
    if (draft.id) {
      setCustomers((prev) => prev.map((c) => (c.id === draft.id ? ({ ...c, ...draft } as Customer) : c)))
    } else {
      const id = Math.max(0, ...customers.map((c) => c.id)) + 1
      const code = nextCode('KH', customers.map((c) => c.code))
      setCustomers((prev) => [...prev, { ...(draft as Customer), id, code }])
    }
    setOpen(false)
  }

  const toggle = (id: number) =>
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))

  const remove = (c: Customer) => {
    if (window.confirm(`确定删除客户「${c.name}」吗？`)) {
      setCustomers((prev) => prev.filter((x) => x.id !== c.id))
    }
  }

  return (
    <>
      <ArchiveScaffold
        title="客户（销货渠道）档案"
        hint="加工后的水果销往批发商、商超与电商；授信额度用于销售打单时的欠款拦截"
        searchPlaceholder="搜索名称 / 首字母，如 百果园 或 BGY"
        keyword={keyword}
        onKeyword={setKeyword}
        status={status}
        onStatus={setStatus}
        count={filtered.length}
        onNew={openNew}
        newLabel="新建客户"
        onImport={() => window.alert('请选择客户档案 Excel 文件进行批量导入。')}
        onExport={() => window.alert(`已导出 ${filtered.length} 条客户档案。`)}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">编码</TableHead>
              <TableHead>客户名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>联系人</TableHead>
              <TableHead>联系电话</TableHead>
              <TableHead className="text-center">账期(天)</TableHead>
              <TableHead className="text-right">授信额度</TableHead>
              <TableHead className="text-right">当前欠款</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[200px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const over = c.currentDebt > c.creditLimit
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.code}</TableCell>
                  <TableCell className="font-medium">
                    {c.name}
                    <span className="ml-1.5 text-[11px] text-muted-foreground">{c.pinyin}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {CUSTOMER_TYPE_LABELS[c.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.contact}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-center tabular-nums">{c.creditDays}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    ¥{c.creditLimit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {over ? (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <AlertTriangle className="size-3.5" />¥{c.currentDebt.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">¥{c.currentDebt.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge enabled={c.enabled} />
                  </TableCell>
                  <TableCell>
                    <RowActions
                      enabled={c.enabled}
                      onEdit={() => openEdit(c)}
                      onToggle={() => toggle(c.id)}
                      onDelete={() => remove(c)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的客户
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
              <Building2 className="size-4 text-primary" />
              {draft.id ? '编辑客户' : '新建客户'}
            </DrawerTitle>
            <DrawerDescription>
              {draft.id ? `编码 ${draft.code}` : '编码将由系统自动生成'}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-6">
            <FormSection title="基础信息">
              <Field label="客户名称" required>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="如：百果园 / 盒马鲜生"
                  className="h-9"
                />
              </Field>
              <Field label="拼音首字母" hint="用于快速搜索，如 BGY">
                <Input
                  value={draft.pinyin}
                  onChange={(e) => patch({ pinyin: e.target.value.toUpperCase() })}
                  placeholder="BGY"
                  className="h-9"
                />
              </Field>
              <Field label="客户类型" required>
                <Select
                  value={draft.type}
                  items={CUSTOMER_TYPE_LABELS}
                  onValueChange={(v) => patch({ type: v as CustomerType })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">档口散客</SelectItem>
                    <SelectItem value="chain">企业连锁</SelectItem>
                    <SelectItem value="online">线上渠道</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="联系人">
                <Input
                  value={draft.contact}
                  onChange={(e) => patch({ contact: e.target.value })}
                  placeholder="对接人姓名"
                  className="h-9"
                />
              </Field>
              <Field label="联系电话" className="sm:col-span-2">
                <Input
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="请输入联系电话"
                  className="h-9"
                  inputMode="numeric"
                />
              </Field>
            </FormSection>

            <FormSection title="收货与物流">
              <Field label="默认收货地址" className="sm:col-span-2">
                <Input
                  value={draft.address}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder="请输入详细收货地址"
                  className="h-9"
                />
              </Field>
              <Field label="常用物流 / 货运队" className="sm:col-span-2">
                <Input
                  value={draft.logistics}
                  onChange={(e) => patch({ logistics: e.target.value })}
                  placeholder="如：顺丰冷链 / 自提"
                  className="h-9"
                />
              </Field>
            </FormSection>

            <FormSection title="财务信用">
              <Field label="账期（天）" hint="到期未付款系统自动预警">
                <Input
                  type="number"
                  value={draft.creditDays}
                  onChange={(e) => patch({ creditDays: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              <Field label="授信额度（元）" hint="超额时销售打单自动拦截">
                <Input
                  type="number"
                  value={draft.creditLimit}
                  onChange={(e) => patch({ creditLimit: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              <Field label="当前欠款（元）" className="sm:col-span-2">
                <Input
                  type="number"
                  value={draft.currentDebt}
                  onChange={(e) => patch({ currentDebt: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              {draft.currentDebt > draft.creditLimit && (
                <div className="sm:col-span-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  当前欠款已超授信额度，该客户将无法正常发货
                </div>
              )}
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
