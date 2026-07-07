'use client'

import { useState } from 'react'
import { Plus, Search, RotateCcw, ShieldCheck, Trash2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RolePermissionDialog } from './role-permission-dialog'
import { DATA_SCOPE_LABELS, type Department, type Role } from '@/lib/permission-data'

const SCOPE_STYLE: Record<string, string> = {
  all: 'bg-primary/10 text-primary',
  dept: 'bg-warning/15 text-warning',
  self: 'bg-muted text-muted-foreground',
  custom: 'bg-success/15 text-success',
}

export function RoleManagement({
  roles,
  setRoles,
  departments,
}: {
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  departments: Department[]
}) {
  const [keyword, setKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)

  const filtered = roles.filter(
    (r) =>
      !keyword ||
      r.name.includes(keyword) ||
      r.code.toLowerCase().includes(keyword.toLowerCase()),
  )

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (r: Role) => {
    setEditing(r)
    setDialogOpen(true)
  }

  const handleSave = (data: Omit<Role, 'id'> & { id?: number }) => {
    if (data.id) {
      setRoles((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } : r)))
    } else {
      const id = Math.max(0, ...roles.map((r) => r.id)) + 1
      setRoles((prev) => [...prev, { ...data, id } as Role])
    }
    setDialogOpen(false)
  }

  const toggleStatus = (r: Role) => {
    if (r.builtIn) return
    setRoles((prev) => prev.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))
  }

  const remove = (r: Role) => {
    if (r.builtIn) return
    if (window.confirm(`确定删除角色「${r.name}」吗？`)) {
      setRoles((prev) => prev.filter((x) => x.id !== r.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1.5">
          <label className="block text-xs text-muted-foreground">角色名称 / 编码</label>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="请输入"
            className="h-9 w-56"
          />
        </div>
        <div className="flex gap-2">
          <Button className="h-9 gap-1.5">
            <Search className="size-4" />
            查询
          </Button>
          <Button variant="outline" className="h-9 gap-1.5" onClick={() => setKeyword('')}>
            <RotateCcw className="size-4" />
            重置
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{filtered.length}</span> 个角色
        </p>
        <Button className="gap-1.5" onClick={openNew}>
          <Plus className="size-4" />
          新增角色
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14 text-center">序号</TableHead>
              <TableHead>角色名称</TableHead>
              <TableHead>角色编码</TableHead>
              <TableHead className="min-w-[240px]">角色描述</TableHead>
              <TableHead>数据权限范围</TableHead>
              <TableHead className="text-center">菜单数</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-medium">
                    {r.builtIn && <Lock className="size-3.5 text-muted-foreground" />}
                    {r.name}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.code}</code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="max-w-[320px]">
                    <p className="text-pretty">{r.description}</p>
                    {r.scopeNote && (
                      <p className="mt-0.5 text-xs text-muted-foreground/80">范围：{r.scopeNote}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SCOPE_STYLE[r.dataScope]}`}
                  >
                    {DATA_SCOPE_LABELS[r.dataScope]}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-normal">
                    {r.menuIds.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={r.enabled}
                      disabled={r.builtIn}
                      onCheckedChange={() => toggleStatus(r)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {r.enabled ? '启用' : '停用'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs text-primary hover:text-primary"
                      onClick={() => openEdit(r)}
                    >
                      <ShieldCheck className="size-3.5" />
                      {r.builtIn ? '查看' : '权限配置'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={r.builtIn}
                      className="h-8 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => remove(r)}
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

      <RolePermissionDialog
        open={dialogOpen}
        role={editing}
        departments={departments}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
