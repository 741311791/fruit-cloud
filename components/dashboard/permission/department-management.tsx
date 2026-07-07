'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { flattenDepartments, type Department } from '@/lib/permission-data'

type Row = { dept: Department; depth: number }

function toRows(depts: Department[]): Row[] {
  const rows: Row[] = []
  const walk = (parentId: number | null, depth: number) => {
    depts
      .filter((d) => d.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .forEach((d) => {
        rows.push({ dept: d, depth })
        walk(d.id, depth + 1)
      })
  }
  walk(null, 0)
  return rows
}

export function DepartmentManagement({
  departments,
  setDepartments,
}: {
  departments: Department[]
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const rows = useMemo(() => toRows(departments), [departments])

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (d: Department) => {
    setEditing(d)
    setDialogOpen(true)
  }

  const handleSave = (data: Omit<Department, 'id'> & { id?: number }) => {
    if (data.id) {
      setDepartments((prev) => prev.map((d) => (d.id === data.id ? { ...d, ...data } : d)))
    } else {
      const id = Math.max(0, ...departments.map((d) => d.id)) + 1
      setDepartments((prev) => [...prev, { ...data, id } as Department])
    }
    setDialogOpen(false)
  }

  const remove = (d: Department) => {
    if (departments.some((x) => x.parentId === d.id)) {
      window.alert('该部门下存在子部门，请先删除子部门。')
      return
    }
    if (window.confirm(`确定删除部门「${d.name}」吗？`)) {
      setDepartments((prev) => prev.filter((x) => x.id !== d.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{departments.length}</span> 个部门
        </p>
        <Button className="gap-1.5" onClick={openNew}>
          <Plus className="size-4" />
          新增部门
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>部门名称</TableHead>
              <TableHead>部门编码</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead className="text-center">排序</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ dept, depth }) => (
              <TableRow key={dept.id}>
                <TableCell>
                  <div
                    className="flex items-center gap-1.5 font-medium"
                    style={{ paddingLeft: depth * 20 }}
                  >
                    <Building2 className="size-4 text-muted-foreground" />
                    {dept.name}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{dept.code}</code>
                </TableCell>
                <TableCell className="text-muted-foreground">{dept.leader}</TableCell>
                <TableCell className="text-center text-muted-foreground">{dept.sort}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      dept.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {dept.enabled ? '启用' : '停用'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs text-muted-foreground"
                      onClick={() => openEdit(dept)}
                    >
                      <Pencil className="size-3.5" />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={dept.parentId === null}
                      className="h-8 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => remove(dept)}
                    >
                      <Trash2 className="size-3.5" />
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DepartmentDialog
        open={dialogOpen}
        dept={editing}
        departments={departments}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

function DepartmentDialog({
  open,
  dept,
  departments,
  onClose,
  onSave,
}: {
  open: boolean
  dept: Department | null
  departments: Department[]
  onClose: () => void
  onSave: (data: Omit<Department, 'id'> & { id?: number }) => void
}) {
  const build = () => ({
    name: dept?.name ?? '',
    code: dept?.code ?? '',
    leader: dept?.leader ?? '',
    parentId: dept?.parentId ?? (departments[0]?.id ?? null),
    sort: dept?.sort ?? 1,
    enabled: dept?.enabled ?? true,
  })
  const [draft, setDraft] = useState(build)

  useEffect(() => {
    if (open) setDraft(build())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dept])

  const patch = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }))
  // A department cannot be its own parent (or a descendant) — simple guard: exclude self.
  const parentOptions = flattenDepartments(departments).filter((o) => o.id !== dept?.id)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-5 text-primary" />
            {dept ? '编辑部门' : '新增部门'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">上级部门</Label>
            <Select
              value={draft.parentId === null ? 'root' : String(draft.parentId)}
              onValueChange={(v) => patch({ parentId: v === 'root' ? null : Number(v) })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">顶级部门</SelectItem>
                {parentOptions.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {'\u00A0'.repeat(o.depth * 2)}
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">
                部门名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="请输入"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">部门编码</Label>
              <Input
                value={draft.code}
                onChange={(e) => patch({ code: e.target.value })}
                placeholder="如 SALES"
                className="h-9 uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">负责人</Label>
              <Input
                value={draft.leader}
                onChange={(e) => patch({ leader: e.target.value })}
                placeholder="请输入"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">排序</Label>
              <Input
                type="number"
                value={draft.sort}
                onChange={(e) => patch({ sort: Number(e.target.value) })}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs">状态</Label>
            <Switch checked={draft.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
            <span className="text-xs text-muted-foreground">{draft.enabled ? '启用' : '停用'}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            disabled={!draft.name.trim()}
            onClick={() => onSave({ id: dept?.id, ...draft, name: draft.name.trim() })}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
