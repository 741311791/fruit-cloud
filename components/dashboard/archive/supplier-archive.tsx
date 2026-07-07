'use client'

import { useMemo, useState } from 'react'
import { Store } from 'lucide-react'
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
  CREDIT_LEVEL_LABELS,
  SETTLEMENT_LABELS,
  SUPPLIER_TYPE_LABELS,
  type ArchiveStatusFilter,
  type CreditLevel,
  type Settlement,
  type Supplier,
  type SupplierType,
} from '@/lib/archive-data'

type Draft = Omit<Supplier, 'id' | 'code'> & { id?: number; code?: string }

const emptyDraft: Draft = {
  name: '',
  pinyin: '',
  type: 'individual',
  phone: '',
  settlement: 'cash',
  bankName: '',
  bankAccount: '',
  accountName: '',
  creditLevel: 'normal',
  mainCategory: '',
  prepaidBalance: 0,
  enabled: true,
}

export function SupplierArchive({
  suppliers,
  setSuppliers,
}: {
  suppliers: Supplier[]
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ArchiveStatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const filtered = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          archiveMatch(keyword, s.name, s.pinyin) && statusMatch(status, s.enabled),
      ),
    [suppliers, keyword, status],
  )

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const openNew = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }
  const openEdit = (s: Supplier) => {
    setDraft({ ...s })
    setOpen(true)
  }

  const save = () => {
    if (!draft.name.trim()) return
    if (draft.id) {
      setSuppliers((prev) => prev.map((s) => (s.id === draft.id ? ({ ...s, ...draft } as Supplier) : s)))
    } else {
      const id = Math.max(0, ...suppliers.map((s) => s.id)) + 1
      const code = nextCode('SP', suppliers.map((s) => s.code))
      setSuppliers((prev) => [...prev, { ...(draft as Supplier), id, code }])
    }
    setOpen(false)
  }

  const toggle = (id: number) =>
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))

  const remove = (s: Supplier) => {
    if (window.confirm(`确定删除供应商「${s.name}」吗？删除后相关采购单将无法追溯。`)) {
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id))
    }
  }

  return (
    <>
      <ArchiveScaffold
        title="供应商（农户）档案"
        hint="支撑采购单录入，兼顾企业供应商与个人散户；支持名称 / 拼音首字母搜索（如 LDN）"
        searchPlaceholder="搜索名称 / 首字母，如 李大娘 或 LDN"
        keyword={keyword}
        onKeyword={setKeyword}
        status={status}
        onStatus={setStatus}
        count={filtered.length}
        onNew={openNew}
        newLabel="新建供应商"
        onImport={() => window.alert('请选择供应商档案 Excel 文件进行批量导入。')}
        onExport={() => window.alert(`已导出 ${filtered.length} 条供应商档案。`)}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">编码</TableHead>
              <TableHead>供应商名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>联系电话</TableHead>
              <TableHead>结算方式</TableHead>
              <TableHead>信用等级</TableHead>
              <TableHead>主营类目</TableHead>
              <TableHead className="text-right">预付款余额</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[200px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.code}</TableCell>
                <TableCell className="font-medium">
                  {s.name}
                  <span className="ml-1.5 text-[11px] text-muted-foreground">{s.pinyin}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={s.type === 'enterprise' ? 'secondary' : 'outline'} className="font-normal">
                    {SUPPLIER_TYPE_LABELS[s.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                <TableCell>{SETTLEMENT_LABELS[s.settlement]}</TableCell>
                <TableCell>
                  <CreditTag level={s.creditLevel} />
                </TableCell>
                <TableCell className="text-muted-foreground">{s.mainCategory}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {s.prepaidBalance > 0 ? (
                    <span className="text-success">¥{s.prepaidBalance.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground">¥0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge enabled={s.enabled} />
                </TableCell>
                <TableCell>
                  <RowActions
                    enabled={s.enabled}
                    onEdit={() => openEdit(s)}
                    onToggle={() => toggle(s.id)}
                    onDelete={() => remove(s)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的供应商
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
              <Store className="size-4 text-primary" />
              {draft.id ? '编辑供应商' : '新建供应商'}
            </DrawerTitle>
            <DrawerDescription>
              {draft.id ? `编码 ${draft.code}` : '编码将由系统自动生成'}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-6">
            <FormSection title="基础信息">
              <Field label="供应商名称" required>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="如：李大娘 / 合作社"
                  className="h-9"
                />
              </Field>
              <Field label="拼音首字母" hint="用于快速搜索，如 LDN">
                <Input
                  value={draft.pinyin}
                  onChange={(e) => patch({ pinyin: e.target.value.toUpperCase() })}
                  placeholder="LDN"
                  className="h-9"
                />
              </Field>
              <Field label="类型" required>
                <Select
                  value={draft.type}
                  items={SUPPLIER_TYPE_LABELS}
                  onValueChange={(v) => patch({ type: v as SupplierType })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">个人散户</SelectItem>
                    <SelectItem value="enterprise">企业供应商</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="联系电话">
                <Input
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="请输入手机号"
                  className="h-9"
                  inputMode="numeric"
                />
              </Field>
            </FormSection>

            <FormSection title="财务与结算">
              <Field label="结算方式" required>
                <Select
                  value={draft.settlement}
                  items={SETTLEMENT_LABELS}
                  onValueChange={(v) => patch({ settlement: v as Settlement })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">现结</SelectItem>
                    <SelectItem value="account">账期结算</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="预付款余额（元）" hint="采购单对账时实时抵扣">
                <Input
                  type="number"
                  value={draft.prepaidBalance}
                  onChange={(e) => patch({ prepaidBalance: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </Field>
              <Field label="开户行">
                <Input
                  value={draft.bankName}
                  onChange={(e) => patch({ bankName: e.target.value })}
                  placeholder="如：中国农业银行"
                  className="h-9"
                />
              </Field>
              <Field label="账户户名">
                <Input
                  value={draft.accountName}
                  onChange={(e) => patch({ accountName: e.target.value })}
                  placeholder="收款人姓名 / 单位名称"
                  className="h-9"
                />
              </Field>
              <Field label="银行账号" className="sm:col-span-2">
                <Input
                  value={draft.bankAccount}
                  onChange={(e) => patch({ bankAccount: e.target.value.replace(/[^\d]/g, '') })}
                  placeholder="请输入银行卡号"
                  className="h-9"
                  inputMode="numeric"
                />
              </Field>
            </FormSection>

            <FormSection title="风控属性">
              <Field label="信用等级" required>
                <Select
                  value={draft.creditLevel}
                  items={CREDIT_LEVEL_LABELS}
                  onValueChange={(v) => patch({ creditLevel: v as CreditLevel })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">优质</SelectItem>
                    <SelectItem value="normal">普通</SelectItem>
                    <SelectItem value="blacklist">黑名单</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="主营类目" hint="如：猕猴桃、草莓">
                <Input
                  value={draft.mainCategory}
                  onChange={(e) => patch({ mainCategory: e.target.value })}
                  placeholder="请输入主营农产品"
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

function CreditTag({ level }: { level: CreditLevel }) {
  const cls =
    level === 'premium'
      ? 'bg-success/12 text-success'
      : level === 'blacklist'
        ? 'bg-destructive/12 text-destructive'
        : 'bg-muted text-muted-foreground'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {CREDIT_LEVEL_LABELS[level]}
    </span>
  )
}
