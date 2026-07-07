'use client'

import { useMemo, useState } from 'react'
import {
  Workflow,
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  ShieldAlert,
  GitBranch,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { WorkflowConfigDrawer } from './workflow-config-drawer'
import {
  BUSINESS_DOC_LABELS,
  INITIAL_PROCESSES,
  describeTrigger,
  stepCount,
  type BusinessDoc,
  type WorkflowProcess,
} from '@/lib/workflow-data'

const OPERATOR = '当前管理员'

export function WorkflowConfig() {
  const [processes, setProcesses] = useState<WorkflowProcess[]>(INITIAL_PROCESSES)
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<WorkflowProcess | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return processes
    return processes.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        BUSINESS_DOC_LABELS[p.doc].toLowerCase().includes(kw),
    )
  }, [processes, keyword])

  const usedDocs = useMemo<BusinessDoc[]>(() => processes.map((p) => p.doc), [processes])

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setDrawerOpen(true)
  }
  const openEdit = (p: WorkflowProcess) => {
    setMode('edit')
    setEditing(p)
    setDrawerOpen(true)
  }

  const handleSubmit = (p: WorkflowProcess) => {
    setProcesses((prev) => {
      const exists = prev.some((x) => x.id === p.id)
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]
    })
    setDrawerOpen(false)
    notify(mode === 'create' ? '流程已创建' : `流程已更新为 v${p.version}`)
  }

  const duplicate = (p: WorkflowProcess) => {
    const copy: WorkflowProcess = {
      ...p,
      id: Date.now(),
      name: `${p.name}（副本）`,
      version: 1,
      enabled: false,
      updatedBy: OPERATOR,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      steps: p.steps.map((s) => ({ ...s, id: `${s.id}-c${Date.now()}` })),
    }
    setProcesses((prev) => [copy, ...prev])
    notify('已复制为新流程（默认停用）')
  }

  const remove = (id: number) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
    notify('流程已删除')
  }

  const toggle = (id: number) =>
    setProcesses((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))

  const enabledCount = processes.filter((p) => p.enabled).length
  const triggerCount = processes.filter((p) => p.advancedTrigger.enabled).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">审批流配置</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按业务单据可视化编排审批链路：发起人 → 逐级审批 → 流程结束，支持角色/岗位/上级/指定人多种指派方式与会签/或签策略，并可针对鲜果收购的金额、损耗率、统货扣件比例设置风控加签。
        </p>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Layers className="size-4" />} label="流程总数" value={processes.length} />
        <StatCard icon={<Workflow className="size-4" />} label="启用中" value={enabledCount} accent="success" />
        <StatCard
          icon={<ShieldAlert className="size-4" />}
          label="含风控加签"
          value={triggerCount}
          accent="warning"
        />
        <StatCard
          icon={<GitBranch className="size-4" />}
          label="已覆盖单据"
          value={usedDocs.length}
        />
      </div>

      {/* 工具条 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索流程名称或业务单据"
            className="h-9 w-64 pl-8"
          />
        </div>
        <Button className="h-9 gap-1.5" onClick={openCreate}>
          <Plus className="size-4" />
          新建流程
        </Button>
      </div>

      {/* 流程卡片列表 */}
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    {BUSINESS_DOC_LABELS[p.doc]}
                  </span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    v{p.version}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.initiatorNote} · 共 {stepCount(p)} 个节点
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Switch checked={p.enabled} onCheckedChange={() => toggle(p.id)} aria-label="启用/停用" />
                <span
                  className={`text-[11px] font-medium ${p.enabled ? 'text-success' : 'text-muted-foreground'}`}
                >
                  {p.enabled ? '启用' : '停用'}
                </span>
              </div>
            </header>

            {/* 节点链路预览 */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-2.5 text-xs">
              <ChainNode label="发起人" tone="primary" />
              {p.steps.map((s) => (
                <span key={s.id} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50">→</span>
                  <ChainNode
                    label={s.approver}
                    sub={s.multiPolicy === 'and' ? '会签' : '或签'}
                  />
                </span>
              ))}
              {p.advancedTrigger.enabled && (
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/50">→</span>
                  <ChainNode label={p.advancedTrigger.escalateTo} tone="warning" sub="条件加签" />
                </span>
              )}
              <span className="text-muted-foreground/50">→</span>
              <ChainNode label="结束" tone="muted" />
            </div>

            {p.advancedTrigger.enabled && (
              <p className="flex items-start gap-1.5 text-[11px] text-warning">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                {describeTrigger(p.advancedTrigger)}
              </p>
            )}

            <footer className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span>
                最近修改 {p.updatedBy} · {p.updatedAt}
              </span>
              <div className="flex items-center gap-0.5">
                <ActionBtn icon={<Pencil className="size-3.5" />} label="编辑" onClick={() => openEdit(p)} />
                <ActionBtn icon={<Copy className="size-3.5" />} label="复制" onClick={() => duplicate(p)} />
                <ActionBtn
                  icon={<Trash2 className="size-3.5" />}
                  label="删除"
                  danger
                  onClick={() => remove(p.id)}
                />
              </div>
            </footer>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center">
            <Workflow className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">未找到匹配的审批流程</p>
          </div>
        )}
      </div>

      <WorkflowConfigDrawer
        open={drawerOpen}
        mode={mode}
        process={editing}
        usedDocs={usedDocs}
        operator={OPERATOR}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />

      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: 'success' | 'warning'
}) {
  const tone =
    accent === 'success'
      ? 'bg-success/12 text-success'
      : accent === 'warning'
        ? 'bg-warning/12 text-warning'
        : 'bg-primary/10 text-primary'
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs">
      <span className={`flex size-9 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      <div>
        <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function ChainNode({
  label,
  sub,
  tone = 'default',
}: {
  label: string
  sub?: string
  tone?: 'default' | 'primary' | 'warning' | 'muted'
}) {
  const cls =
    tone === 'primary'
      ? 'border-primary/30 bg-primary/10 text-primary'
      : tone === 'warning'
        ? 'border-warning/30 bg-warning/12 text-warning'
        : tone === 'muted'
          ? 'border-border bg-muted text-muted-foreground'
          : 'border-border bg-card text-foreground'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${cls}`}>
      <span className="font-medium">{label}</span>
      {sub && <span className="text-[10px] opacity-70">· {sub}</span>}
    </span>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 gap-1 px-2 text-xs ${danger ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'}`}
    >
      {icon}
      {label}
    </Button>
  )
}
