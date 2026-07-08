'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
  CircleDot,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  APPROVER_CANDIDATES,
  BUSINESS_DOC_LABELS,
  INSTANCE_STATUS_LABELS,
  TIMELINE_ACTION_LABELS,
  type ApprovalInstance,
  type TimelineAction,
  type TimelineEntry,
} from '@/lib/workflow-data'

export type ApprovalDecision = 'approve' | 'reject' | 'transfer'

export function ApprovalDetailDrawer({
  open,
  instance,
  onClose,
  onDecision,
}: {
  open: boolean
  instance: ApprovalInstance | null
  onClose: () => void
  onDecision: (id: number, decision: ApprovalDecision, comment: string, transferTo?: string) => void
}) {
  const [comment, setComment] = useState('')
  const [transferTo, setTransferTo] = useState(APPROVER_CANDIDATES.user[0])
  const [showTransfer, setShowTransfer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setComment('')
      setTransferTo(APPROVER_CANDIDATES.user[0])
      setShowTransfer(false)
      setError(null)
    }
  }, [open, instance])

  if (!instance) return null

  const actionable = instance.bucket === 'pending'
  const snap = instance.snapshot

  const submit = (decision: ApprovalDecision) => {
    if (decision === 'reject' && !comment.trim()) {
      setError('驳回时请填写审批意见，便于发起人修改')
      return
    }
    if (decision === 'transfer') {
      onDecision(instance.id, 'transfer', comment.trim(), transferTo)
    } else {
      onDecision(instance.id, decision, comment.trim())
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="w-full max-w-full sm:max-w-[640px] lg:max-w-[48vw]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            {instance.title}
          </DrawerTitle>
          <DrawerDescription>
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                {BUSINESS_DOC_LABELS[instance.docType]}
              </span>
              <span className="font-mono">{instance.docCode}</span>
              <span className="text-muted-foreground">·</span>
              <StatusPill status={instance.status} />
            </span>
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          {/* 区块一：业务单据详情（只读） */}
          <section className="space-y-3">
            <ZoneTitle>单据详情</ZoneTitle>
            <div className="rounded-lg border border-border">
              <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
                {snap.fields.map((f, i) => (
                  <div
                    key={f.label}
                    className={`flex gap-2 px-3 py-2.5 text-sm ${
                      i % 2 === 0 ? 'sm:border-r sm:border-border' : ''
                    }`}
                  >
                    <dt className="shrink-0 text-muted-foreground">{f.label}</dt>
                    <dd className="ml-auto text-right font-medium text-foreground">{f.value}</dd>
                  </div>
                ))}
              </dl>

              {snap.lines && snap.lines.length > 0 && (
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                        <th className="px-3 py-2 text-left">商品</th>
                        <th className="px-3 py-2 text-right">件数</th>
                        <th className="px-3 py-2 text-right">净重(斤)</th>
                        <th className="px-3 py-2 text-right">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snap.lines.map((l) => (
                        <tr key={l.name} className="border-b border-border/60 last:border-0">
                          <td className="px-3 py-2 text-foreground">{l.name}</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">{l.pieces}</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">{l.net}</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">
                            ¥{l.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/40 text-xs font-medium">
                        <td className="px-3 py-2 text-right text-muted-foreground">合计</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {snap.totalPieces}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-primary">
                          {snap.totalNet}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-primary">
                          ¥{(snap.totalAmount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* 区块二：审批时间轴 */}
          <section className="space-y-3">
            <ZoneTitle>审批流转</ZoneTitle>
            <ol className="relative space-y-4 pl-2">
              {instance.timeline.map((t, i) => (
                <TimelineRow key={i} entry={t} last={i === instance.timeline.length - 1} />
              ))}
            </ol>
          </section>

          {/* 区块三：审批操作区（仅待我处理时可用） */}
          {actionable && (
            <section className="space-y-3">
              <ZoneTitle>审批操作</ZoneTitle>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="填写审批意见（驳回时必填）"
                className="min-h-20"
              />
              {showTransfer && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <UserCog className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">转办给</span>
                  <Select
                    value={transferTo}
                    items={Object.fromEntries(APPROVER_CANDIDATES.user.map((c) => [c, c]))}
                    onValueChange={(v) => v && setTransferTo(v)}
                  >
                    <SelectTrigger className="h-8 flex-1 text-xs">
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
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </section>
          )}
        </DrawerBody>

        <DrawerFooter>
          {actionable ? (
            showTransfer ? (
              <>
                <Button variant="outline" onClick={() => setShowTransfer(false)}>
                  返回
                </Button>
                <Button className="gap-1.5" onClick={() => submit('transfer')}>
                  <Send className="size-4" />
                  确认转办
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setShowTransfer(true)}
                >
                  <UserCog className="size-4" />
                  转办
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => submit('reject')}
                >
                  <XCircle className="size-4" />
                  驳回
                </Button>
                <Button className="gap-1.5" onClick={() => submit('approve')}>
                  <CheckCircle2 className="size-4" />
                  同意
                </Button>
              </>
            )
          ) : (
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ZoneTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3.5 w-1 rounded-full bg-primary" />
      <h4 className="text-sm font-semibold text-foreground">{children}</h4>
    </div>
  )
}

function StatusPill({ status }: { status: ApprovalInstance['status'] }) {
  const map = {
    processing: 'bg-warning/12 text-warning',
    approved: 'bg-success/12 text-success',
    rejected: 'bg-destructive/12 text-destructive',
  } as const
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {INSTANCE_STATUS_LABELS[status]}
    </span>
  )
}

const ACTION_STYLE: Record<TimelineAction, { icon: React.ReactNode; dot: string }> = {
  submit: { icon: <Send className="size-3.5" />, dot: 'bg-primary text-primary-foreground' },
  approve: { icon: <CheckCircle2 className="size-3.5" />, dot: 'bg-success text-background' },
  reject: { icon: <XCircle className="size-3.5" />, dot: 'bg-destructive text-background' },
  transfer: { icon: <UserCog className="size-3.5" />, dot: 'bg-accent text-accent-foreground' },
  cc: { icon: <Send className="size-3.5" />, dot: 'bg-muted text-muted-foreground' },
  pending: { icon: <Clock className="size-3.5" />, dot: 'bg-muted text-muted-foreground' },
}

function TimelineRow({ entry, last }: { entry: TimelineEntry; last: boolean }) {
  const style = ACTION_STYLE[entry.action]
  const isPending = entry.action === 'pending'
  return (
    <li className="relative flex gap-3">
      {!last && (
        <span
          className="absolute left-[13px] top-7 h-[calc(100%-4px)] w-px bg-border"
          aria-hidden
        />
      )}
      <span
        className={`z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${style.dot} ${
          isPending ? 'ring-2 ring-warning/40' : ''
        }`}
      >
        {isPending ? <CircleDot className="size-3.5" /> : style.icon}
      </span>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">{entry.actor}</span>
          <span className="text-xs text-muted-foreground">{entry.role}</span>
          <span
            className={`text-xs font-medium ${
              entry.action === 'approve'
                ? 'text-success'
                : entry.action === 'reject'
                  ? 'text-destructive'
                  : isPending
                    ? 'text-warning'
                    : 'text-muted-foreground'
            }`}
          >
            {TIMELINE_ACTION_LABELS[entry.action]}
          </span>
          {entry.time && <span className="ml-auto text-[11px] text-muted-foreground">{entry.time}</span>}
        </div>
        {entry.comment && (
          <p className="mt-1 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
            {entry.comment}
          </p>
        )}
      </div>
    </li>
  )
}
