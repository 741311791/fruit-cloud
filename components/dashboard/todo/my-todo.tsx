'use client'

import { useMemo, useState } from 'react'
import {
  Inbox,
  CheckCheck,
  FileUp,
  Copy as CopyIcon,
  ChevronRight,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApprovalDetailDrawer, type ApprovalDecision } from './approval-detail-drawer'
import {
  BUCKET_LABELS,
  BUSINESS_DOC_LABELS,
  CURRENT_USER,
  INITIAL_INSTANCES,
  INSTANCE_STATUS_LABELS,
  type ApprovalInstance,
  type TaskBucket,
} from '@/lib/workflow-data'

const TAB_ICON: Record<TaskBucket, React.ReactNode> = {
  pending: <Inbox className="size-4" />,
  approved: <CheckCheck className="size-4" />,
  mine: <FileUp className="size-4" />,
  cc: <CopyIcon className="size-4" />,
}

const BUCKETS: TaskBucket[] = ['pending', 'approved', 'mine', 'cc']

function shortName(full: string) {
  return full.replace(/（.*?）/g, '')
}

export function MyTodo() {
  const [instances, setInstances] = useState<ApprovalInstance[]>(INITIAL_INSTANCES)
  const [tab, setTab] = useState<TaskBucket>('pending')
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<ApprovalInstance | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const counts = useMemo(() => {
    const c: Record<TaskBucket, number> = { pending: 0, approved: 0, mine: 0, cc: 0 }
    for (const it of instances) c[it.bucket] += 1
    return c
  }, [instances])

  const listFor = (bucket: TaskBucket) => {
    const kw = keyword.trim().toLowerCase()
    return instances
      .filter((it) => it.bucket === bucket)
      .filter(
        (it) =>
          !kw ||
          it.title.toLowerCase().includes(kw) ||
          it.docCode.toLowerCase().includes(kw) ||
          it.submittedBy.toLowerCase().includes(kw),
      )
  }

  const openDetail = (it: ApprovalInstance) => {
    setSelected(it)
    setDrawerOpen(true)
    if (it.unread) {
      setInstances((prev) => prev.map((x) => (x.id === it.id ? { ...x, unread: false } : x)))
    }
  }

  const handleDecision = (
    id: number,
    decision: ApprovalDecision,
    comment: string,
    transferTo?: string,
  ) => {
    setInstances((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        if (decision === 'transfer') {
          return {
            ...it,
            currentNode: `已转办 · ${shortName(transferTo ?? '')}`,
            timeline: [
              ...it.timeline.filter((t) => t.action !== 'pending'),
              {
                actor: shortName(CURRENT_USER),
                role: '财务总监',
                action: 'transfer',
                time: new Date().toISOString().slice(0, 16).replace('T', ' '),
                comment: `转办给 ${transferTo}${comment ? ` · ${comment}` : ''}`,
              },
              { actor: shortName(transferTo ?? ''), role: '受理人', action: 'pending' },
            ],
          }
        }
        const approved = decision === 'approve'
        return {
          ...it,
          bucket: 'approved' as TaskBucket,
          status: approved ? 'approved' : 'rejected',
          currentNode: '已结束',
          timeline: [
            ...it.timeline.filter((t) => t.action !== 'pending'),
            {
              actor: shortName(CURRENT_USER),
              role: '财务总监',
              action: approved ? 'approve' : 'reject',
              time: new Date().toISOString().slice(0, 16).replace('T', ' '),
              comment: comment || undefined,
            },
          ],
        }
      }),
    )
    setDrawerOpen(false)
    notify(decision === 'approve' ? '已同意，单据流转至下一环节' : decision === 'reject' ? '已驳回并退回发起人' : '已转办')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">我的待办</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          全公司审批统一工作台：采购单、请购单、销售订单、报销、请假等各业务单据的审批消息集中在此处理，支持同意、驳回与转办，并可追溯完整流转记录。当前登录：
          <span className="font-medium text-foreground">{CURRENT_USER}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索单据标题、编号或发起人"
            className="h-9 w-72 pl-8"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TaskBucket)} className="space-y-4">
        <TabsList>
          {BUCKETS.map((b) => (
            <TabsTrigger key={b} value={b} className="gap-1.5">
              {TAB_ICON[b]}
              {BUCKET_LABELS[b]}
              {counts[b] > 0 && (
                <span
                  className={`ml-0.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                    b === 'pending'
                      ? 'bg-destructive text-background'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {counts[b]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {BUCKETS.map((b) => {
          const list = listFor(b)
          return (
            <TabsContent key={b} value={b}>
              {list.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-16 text-center">
                  <Inbox className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">暂无{BUCKET_LABELS[b]}的单据</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {list.map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => openDetail(it)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-xs transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {it.unread && b !== 'approved' && (
                              <span className="size-2 shrink-0 rounded-full bg-destructive" aria-label="未读" />
                            )}
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                              {BUSINESS_DOC_LABELS[it.docType]}
                            </span>
                            <span className="truncate text-sm font-medium text-foreground">{it.title}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{it.docCode}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>发起人 {it.submittedBy}</span>
                            <span>{it.submittedAt}</span>
                            {it.amount > 0 && (
                              <span className="font-mono">
                                金额 <span className="font-medium text-foreground">¥{it.amount.toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <StatusBadge instance={it} />
                          <span className="text-[11px] text-muted-foreground">
                            {b === 'pending' ? `待办：${it.currentNode}` : `节点：${it.currentNode}`}
                          </span>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <ApprovalDetailDrawer
        open={drawerOpen}
        instance={selected}
        onClose={() => setDrawerOpen(false)}
        onDecision={handleDecision}
      />

      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ instance }: { instance: ApprovalInstance }) {
  const map = {
    processing: 'bg-warning/12 text-warning',
    approved: 'bg-success/12 text-success',
    rejected: 'bg-destructive/12 text-destructive',
  } as const
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[instance.status]}`}>
      {INSTANCE_STATUS_LABELS[instance.status]}
    </span>
  )
}
