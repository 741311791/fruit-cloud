'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  ACTION_LABELS,
  DATA_SCOPE_LABELS,
  PERMISSION_TREE,
  flattenDepartments,
  type ActionKey,
  type DataScope,
  type Department,
  type Role,
} from '@/lib/permission-data'

type Draft = {
  name: string
  code: string
  description: string
  enabled: boolean
  dataScope: DataScope
  scopeNote: string
  customDeptIds: number[]
  menuIds: Set<string>
  actions: Record<string, ActionKey[]>
}

function toDraft(role: Role | null): Draft {
  return {
    name: role?.name ?? '',
    code: role?.code ?? '',
    description: role?.description ?? '',
    enabled: role?.enabled ?? true,
    dataScope: role?.dataScope ?? 'dept',
    scopeNote: role?.scopeNote ?? '',
    customDeptIds: [],
    menuIds: new Set(role?.menuIds ?? []),
    actions: role ? JSON.parse(JSON.stringify(role.actions)) : {},
  }
}

const ALL_ACTIONS: ActionKey[] = ['view', 'create', 'edit', 'delete', 'export', 'approve']

export function RolePermissionDialog({
  open,
  role,
  departments,
  onClose,
  onSave,
}: {
  open: boolean
  role: Role | null
  departments: Department[]
  onClose: () => void
  onSave: (data: Omit<Role, 'id'> & { id?: number }) => void
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(role))
  const [expanded, setExpanded] = useState<Set<string>>(new Set(PERMISSION_TREE.map((n) => n.id)))

  useEffect(() => {
    if (open) {
      setDraft(toDraft(role))
      setExpanded(new Set(PERMISSION_TREE.map((n) => n.id)))
    }
  }, [open, role])

  const readOnly = role?.builtIn ?? false
  const viewOnly = role?.viewOnly ?? false
  const deptOptions = useMemo(() => flattenDepartments(departments), [departments])

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const isLeafChecked = (id: string) => draft.menuIds.has(id)

  const toggleLeaf = (id: string, checked: boolean) => {
    if (readOnly) return
    setDraft((d) => {
      const menuIds = new Set(d.menuIds)
      const actions = { ...d.actions }
      if (checked) {
        menuIds.add(id)
        if (!actions[id]?.length) actions[id] = ['view']
      } else {
        menuIds.delete(id)
        delete actions[id]
      }
      return { ...d, menuIds, actions }
    })
  }

  const toggleAction = (leafId: string, action: ActionKey, checked: boolean) => {
    if (readOnly) return
    if (viewOnly && action !== 'view') return
    setDraft((d) => {
      const menuIds = new Set(d.menuIds)
      const actions = { ...d.actions }
      const current = new Set(actions[leafId] ?? [])
      if (checked) {
        current.add(action)
        if (action !== 'view') current.add('view') // any action implies view access
        menuIds.add(leafId)
      } else {
        current.delete(action)
      }
      actions[leafId] = ALL_ACTIONS.filter((a) => current.has(a))
      if (actions[leafId].length === 0) {
        delete actions[leafId]
        menuIds.delete(leafId)
      }
      return { ...d, menuIds, actions }
    })
  }

  // Parent node checkbox state: all / some / none of its leaves selected.
  const nodeState = (nodeId: string) => {
    const node = PERMISSION_TREE.find((n) => n.id === nodeId)!
    const total = node.children.length
    const selected = node.children.filter((c) => draft.menuIds.has(c.id)).length
    if (selected === 0) return 'none'
    if (selected === total) return 'all'
    return 'some'
  }

  const toggleNode = (nodeId: string, checked: boolean) => {
    if (readOnly) return
    const node = PERMISSION_TREE.find((n) => n.id === nodeId)!
    node.children.forEach((c) => toggleLeaf(c.id, checked))
  }

  const toggleExpand = (nodeId: string) =>
    setExpanded((e) => {
      const next = new Set(e)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })

  const selectAll = (checked: boolean) => {
    if (readOnly) return
    if (checked) {
      const menuIds = new Set<string>()
      const actions: Record<string, ActionKey[]> = {}
      PERMISSION_TREE.forEach((n) =>
        n.children.forEach((c) => {
          menuIds.add(c.id)
          actions[c.id] = viewOnly ? ['view'] : [...ALL_ACTIONS]
        }),
      )
      patch({ menuIds, actions })
    } else {
      patch({ menuIds: new Set(), actions: {} })
    }
  }

  const selectedCount = draft.menuIds.size

  const handleSubmit = () => {
    onSave({
      id: role?.id,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      enabled: draft.enabled,
      dataScope: draft.dataScope,
      scopeNote:
        draft.dataScope === 'custom'
          ? draft.scopeNote.trim() ||
            deptOptions
              .filter((o) => draft.customDeptIds.includes(o.id))
              .map((o) => o.label)
              .join('、')
          : undefined,
      remark: role?.remark,
      builtIn: role?.builtIn,
      menuIds: Array.from(draft.menuIds),
      actions: draft.actions,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-5 text-primary" />
            {role ? (readOnly ? '查看角色权限' : '编辑角色') : '新增角色'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {readOnly
              ? '内置超级管理员角色拥有全部权限，不可修改。'
              : '功能权限（菜单 + 按钮）与数据权限分开配置。'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-5">
            {/* Basic info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  角色名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.name}
                  disabled={readOnly}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="请输入角色名称"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  角色编码 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={draft.code}
                  disabled={readOnly}
                  onChange={(e) => patch({ code: e.target.value })}
                  placeholder="如 PURCHASE_MGR"
                  className="h-9 font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">角色描述</Label>
                <Input
                  value={draft.description}
                  disabled={readOnly}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="请输入角色描述"
                  className="h-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs">角色状态</Label>
                <Switch
                  checked={draft.enabled}
                  disabled={readOnly}
                  onCheckedChange={(v) => patch({ enabled: v })}
                />
                <span className="text-xs text-muted-foreground">
                  {draft.enabled ? '启用' : '停用'}
                </span>
              </div>
            </div>

            {/* Data scope */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">数据权限范围</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Select
                  value={draft.dataScope}
                  items={DATA_SCOPE_LABELS}
                  disabled={readOnly}
                  onValueChange={(v) => patch({ dataScope: v as DataScope })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DATA_SCOPE_LABELS) as DataScope[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {DATA_SCOPE_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {draft.dataScope === 'custom' && (
                  <Input
                    value={draft.scopeNote}
                    disabled={readOnly}
                    onChange={(e) => patch({ scopeNote: e.target.value })}
                    placeholder="自定义范围说明，如：仅华东销售组"
                    className="h-9"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                控制该角色可见的数据行范围，与下方的功能权限相互独立。
              </p>
            </div>

            {/* Functional permission tree */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  功能权限
                  <span className="ml-2 text-muted-foreground">已选 {selectedCount} 项菜单</span>
                </Label>
                {!readOnly && (
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => selectAll(true)}
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:underline"
                      onClick={() => selectAll(false)}
                    >
                      清空
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border">
                {PERMISSION_TREE.map((node, idx) => {
                  const state = nodeState(node.id)
                  const isOpen = expanded.has(node.id)
                  return (
                    <div
                      key={node.id}
                      className={cn(idx !== 0 && 'border-t border-border')}
                    >
                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(node.id)}
                          className="text-muted-foreground"
                          aria-label={isOpen ? '折叠' : '展开'}
                        >
                          <ChevronRight
                            className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
                          />
                        </button>
                        <Checkbox
                          checked={state === 'all'}
                          indeterminate={state === 'some'}
                          disabled={readOnly}
                          onCheckedChange={(v) => toggleNode(node.id, v)}
                        />
                        <span className="text-sm font-medium text-foreground">{node.label}</span>
                      </div>

                      {isOpen && (
                        <div className="divide-y divide-border/60">
                          {node.children.map((leaf) => {
                            const granted = draft.actions[leaf.id] ?? []
                            const checked = isLeafChecked(leaf.id)
                            return (
                              <div
                                key={leaf.id}
                                className="flex flex-col gap-2 px-3 py-2.5 pl-9 sm:flex-row sm:items-center"
                              >
                                <label className="flex min-w-[168px] items-center gap-2">
                                  <Checkbox
                                    checked={checked}
                                    disabled={readOnly}
                                    onCheckedChange={(v) => toggleLeaf(leaf.id, v)}
                                  />
                                  <span className="text-sm text-foreground">{leaf.label}</span>
                                </label>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                  {ACTION_LABELS.map((a) => {
                                    const actionLocked = viewOnly && a.key !== 'view'
                                    return (
                                    <label
                                      key={a.key}
                                      className={cn(
                                        'flex items-center gap-1.5 text-xs',
                                        (!checked || actionLocked) && 'opacity-50',
                                      )}
                                    >
                                      <Checkbox
                                        className="size-3.5"
                                        checked={granted.includes(a.key)}
                                        disabled={readOnly || actionLocked}
                                        onCheckedChange={(v) => toggleAction(leaf.id, a.key, v)}
                                      />
                                      <span className="text-muted-foreground">{a.label}</span>
                                    </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            {readOnly ? '关闭' : '取消'}
          </Button>
          {!readOnly && (
            <Button onClick={handleSubmit} disabled={!draft.name.trim() || !draft.code.trim()}>
              确定
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
