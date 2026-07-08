'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Workflow,
  UserPlus,
  Plus,
  Trash2,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  User,
  ShieldAlert,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import {
  APPROVER_CANDIDATES,
  APPROVER_TYPE_LABELS,
  BUSINESS_DOC_LABELS,
  MULTI_POLICY_LABELS,
  TRIGGER_FIELD_LABELS,
  TRIGGER_OPERATOR_LABELS,
  defaultTrigger,
  newStep,
  type AdvancedTrigger,
  type ApprovalStep,
  type ApproverType,
  type BusinessDoc,
  type MultiPolicy,
  type TriggerField,
  type TriggerOperator,
  type WorkflowProcess,
} from '@/lib/workflow-data'

type DrawerMode = 'create' | 'edit'

export function WorkflowConfigDrawer({
  open,
  mode,
  process,
  usedDocs,
  operator,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: DrawerMode
  process: WorkflowProcess | null
  /** Docs already bound to other processes (one process per doc). */
  usedDocs: BusinessDoc[]
  operator: string
  onClose: () => void
  onSubmit: (p: WorkflowProcess) => void
}) {
  const [name, setName] = useState('')
  const [doc, setDoc] = useState<BusinessDoc>('purchase-order')
  const [initiatorNote, setInitiatorNote] = useState('')
  const [steps, setSteps] = useState<ApprovalStep[]>([])
  const [trigger, setTrigger] = useState<AdvancedTrigger>(defaultTrigger())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (process) {
      setName(process.name)
      setDoc(process.doc)
      setInitiatorNote(process.initiatorNote)
      setSteps(process.steps.map((s) => ({ ...s })))
      setTrigger({ ...process.advancedTrigger })
    } else {
      const firstFree =
        (Object.keys(BUSINESS_DOC_LABELS) as BusinessDoc[]).find((d) => !usedDocs.includes(d)) ??
        'purchase-order'
      setName('')
      setDoc(firstFree)
      setInitiatorNote('提交人所在岗位自动带出')
      setSteps([{ ...newStep(), name: '一级审批' }])
      setTrigger(defaultTrigger())
    }
    setError(null)
  }, [open, process])

  const docItems = useMemo(() => {
    // Allow current doc + docs not used by other processes.
    const entries = (Object.keys(BUSINESS_DOC_LABELS) as BusinessDoc[])
      .filter((d) => d === process?.doc || !usedDocs.includes(d))
      .map((d) => [d, BUSINESS_DOC_LABELS[d]] as [string, string])
    return Object.fromEntries(entries)
  }, [usedDocs, process])

  const patchStep = (id: string, p: Partial<ApprovalStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)))

  const chooseType = (id: string, t: ApproverType) =>
    patchStep(id, { approverType: t, approver: APPROVER_CANDIDATES[t][0] })

  const addStep = () =>
    setSteps((prev) => [...prev, { ...newStep(), name: `${prev.length + 1} 级审批` }])
  const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id))
  const move = (idx: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })

  const handleSave = () => {
    if (!name.trim()) {
      setError('请输入流程名称')
      return
    }
    if (steps.length === 0) {
      setError('请至少配置一个审批节点')
      return
    }
    const cleaned = steps.map((s, i) => ({
      ...s,
      name: s.name.trim() || `${i + 1} 级审批`,
    }))
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    onSubmit({
      id: process?.id ?? Date.now(),
      name: name.trim(),
      doc,
      version: process ? process.version + 1 : 1,
      updatedBy: operator,
      updatedAt: now,
      enabled: process?.enabled ?? true,
      initiatorNote: initiatorNote.trim() || '提交人自动带出',
      steps: cleaned,
      advancedTrigger: trigger,
    })
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="w-full max-w-full sm:max-w-[720px] lg:max-w-[56vw]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Workflow className="size-4 text-primary" />
            {mode === 'create' ? '新建审批流程' : '编辑审批流程'}
          </DrawerTitle>
          <DrawerDescription>
            {process
              ? `${process.name} · 当前版本 v${process.version}，保存后升级为 v${process.version + 1}`
              : '配置触发单据与审批节点链路，保存即生成 v1'}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          {/* 基础设置 */}
          <section className="space-y-3">
            <SectionTitle>基础设置</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="流程名称" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：采购单标准审批流"
                  className="h-9"
                />
              </Field>
              <Field label="触发单据" required hint="当该单据提交时触发本流程">
                <Select value={doc} items={docItems} onValueChange={(v) => v && setDoc(v as BusinessDoc)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(docItems).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* 流程节点 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle>流程节点</SectionTitle>
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={addStep}>
                <Plus className="size-3.5" />
                新增审批节点
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              {/* 发起人节点 */}
              <NodeCard
                accent="initiator"
                icon={<UserPlus className="size-4" />}
                title="发起人"
                subtitle="提交单据的人（系统自动带出）"
              >
                <Input
                  value={initiatorNote}
                  onChange={(e) => setInitiatorNote(e.target.value)}
                  placeholder="如：采购员提交时触发"
                  className="h-8 text-xs"
                />
              </NodeCard>

              {steps.map((s, i) => (
                <div key={s.id}>
                  <Connector />
                  <NodeCard
                    accent="approval"
                    icon={<User className="size-4" />}
                    title={`审批节点 ${i + 1}`}
                    onMoveUp={i > 0 ? () => move(i, -1) : undefined}
                    onMoveDown={i < steps.length - 1 ? () => move(i, 1) : undefined}
                    onRemove={steps.length > 1 ? () => removeStep(s.id) : undefined}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="节点名称">
                        <Input
                          value={s.name}
                          onChange={(e) => patchStep(s.id, { name: e.target.value })}
                          placeholder={`${i + 1} 级审批`}
                          className="h-8 text-xs"
                        />
                      </Field>
                      <Field label="指定方式">
                        <Select
                          value={s.approverType}
                          items={APPROVER_TYPE_LABELS}
                          onValueChange={(v) => v && chooseType(s.id, v as ApproverType)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(APPROVER_TYPE_LABELS) as ApproverType[]).map((t) => (
                              <SelectItem key={t} value={t}>
                                {APPROVER_TYPE_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="审批人">
                        <Select
                          value={s.approver}
                          items={Object.fromEntries(
                            APPROVER_CANDIDATES[s.approverType].map((c) => [c, c]),
                          )}
                          onValueChange={(v) => v && patchStep(s.id, { approver: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPROVER_CANDIDATES[s.approverType].map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="多人审批策略" hint="节点有多个审批人时生效">
                        <Select
                          value={s.multiPolicy}
                          items={MULTI_POLICY_LABELS}
                          onValueChange={(v) => v && patchStep(s.id, { multiPolicy: v as MultiPolicy })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(MULTI_POLICY_LABELS) as MultiPolicy[]).map((p) => (
                              <SelectItem key={p} value={p}>
                                {MULTI_POLICY_LABELS[p]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </NodeCard>
                </div>
              ))}

              <Connector />
              <NodeCard
                accent="end"
                icon={<Flag className="size-4" />}
                title="流程结束"
                subtitle="全部节点通过后单据生效"
              />
            </div>
          </section>

          {/* 高级触发条件 */}
          <section className="space-y-3">
            <SectionTitle>高级触发条件（鲜果云特有）</SectionTitle>
            <div className="rounded-lg border border-border p-4">
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={trigger.enabled}
                  onChange={(e) => setTrigger((t) => ({ ...t, enabled: e.target.checked }))}
                  className="mt-0.5 size-4 rounded border-input accent-primary"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ShieldAlert className="size-4 text-warning" />
                    命中风控条件时强制加签
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    如收购统货扣件比例过高（疑似货品质量差/作弊），自动升级至老板亲审，把控源头质量与资金风险
                  </p>
                </div>
              </label>

              {trigger.enabled && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Field label="触发字段" className="sm:col-span-2">
                    <Select
                      value={trigger.field}
                      items={TRIGGER_FIELD_LABELS}
                      onValueChange={(v) => v && setTrigger((t) => ({ ...t, field: v as TriggerField }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TRIGGER_FIELD_LABELS) as TriggerField[]).map((f) => (
                          <SelectItem key={f} value={f}>
                            {TRIGGER_FIELD_LABELS[f]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="条件">
                    <Select
                      value={trigger.operator}
                      items={TRIGGER_OPERATOR_LABELS}
                      onValueChange={(v) => v && setTrigger((t) => ({ ...t, operator: v as TriggerOperator }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TRIGGER_OPERATOR_LABELS) as TriggerOperator[]).map((o) => (
                          <SelectItem key={o} value={o}>
                            {TRIGGER_OPERATOR_LABELS[o]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="阈值">
                    <Input
                      type="number"
                      value={trigger.value}
                      onChange={(e) => setTrigger((t) => ({ ...t, value: Number(e.target.value) || 0 }))}
                      className="h-8 text-xs"
                    />
                  </Field>
                  <Field label="加签审批人" className="sm:col-span-4">
                    <Select
                      value={trigger.escalateTo}
                      items={Object.fromEntries(APPROVER_CANDIDATES.user.map((c) => [c, c]))}
                      onValueChange={(v) => v && setTrigger((t) => ({ ...t, escalateTo: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPROVER_CANDIDATES.user.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          </section>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>保存流程</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3.5 w-1 rounded-full bg-primary" />
      <h4 className="text-sm font-semibold text-foreground">{children}</h4>
    </div>
  )
}

function Connector() {
  return (
    <div className="flex justify-center py-1.5">
      <ArrowDown className="size-4 text-muted-foreground/50" />
    </div>
  )
}

function NodeCard({
  accent,
  icon,
  title,
  subtitle,
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  accent: 'initiator' | 'approval' | 'end'
  icon: React.ReactNode
  title: string
  subtitle?: string
  children?: React.ReactNode
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: () => void
}) {
  const accentClasses =
    accent === 'initiator'
      ? 'bg-primary/10 text-primary'
      : accent === 'end'
        ? 'bg-muted text-muted-foreground'
        : 'bg-accent text-accent-foreground'

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accentClasses}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-0.5">
          {onMoveUp && (
            <IconBtn label="上移" onClick={onMoveUp}>
              <ChevronUp className="size-4" />
            </IconBtn>
          )}
          {onMoveDown && (
            <IconBtn label="下移" onClick={onMoveDown}>
              <ChevronDown className="size-4" />
            </IconBtn>
          )}
          {onRemove && (
            <IconBtn label="删除节点" danger onClick={onRemove}>
              <Trash2 className="size-4" />
            </IconBtn>
          )}
        </div>
      </div>
      {children && <div className="border-t border-border/60 px-3 py-3">{children}</div>}
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted ${
        danger ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
