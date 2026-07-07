'use client'

import { useMemo, useState } from 'react'
import { Plus, RotateCcw, Search, KeyRound, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import { UserDialog } from './user-dialog'
import { flattenDepartments, type Department, type Role, type User } from '@/lib/permission-data'

export function UserManagement({
  users,
  setUsers,
  roles,
  departments,
}: {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  roles: Role[]
  departments: Department[]
}) {
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const deptMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments])
  const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r.name])), [roles])
  const deptOptions = useMemo(() => flattenDepartments(departments), [departments])

  const filtered = users.filter((u) => {
    if (account && !u.account.toLowerCase().includes(account.toLowerCase())) return false
    if (name && !u.name.includes(name)) return false
    if (deptFilter !== 'all' && u.deptId !== Number(deptFilter)) return false
    if (roleFilter !== 'all' && u.roleId !== Number(roleFilter)) return false
    if (statusFilter !== 'all' && String(u.enabled) !== statusFilter) return false
    return true
  })

  const reset = () => {
    setAccount('')
    setName('')
    setDeptFilter('all')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (u: User) => {
    setEditing(u)
    setDialogOpen(true)
  }

  const handleSave = (data: Omit<User, 'id' | 'createdAt'> & { id?: number }) => {
    if (data.id) {
      setUsers((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)))
    } else {
      const id = Math.max(0, ...users.map((u) => u.id)) + 1
      setUsers((prev) => [
        ...prev,
        { ...data, id, createdAt: new Date().toISOString().slice(0, 10) } as User,
      ])
    }
    setDialogOpen(false)
  }

  const toggleStatus = (id: number) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)))

  const remove = (u: User) => {
    if (window.confirm(`确定删除用户「${u.name}」吗？`)) {
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <Field label="登录账号">
          <Input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="请输入"
            className="h-9 w-40"
          />
        </Field>
        <Field label="姓名">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入"
            className="h-9 w-40"
          />
        </Field>
        <Field label="所属部门">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {deptOptions.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {'\u00A0'.repeat(d.depth * 2)}
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="角色">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="账号状态">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">启用</SelectItem>
              <SelectItem value="false">停用</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex gap-2">
          <Button className="h-9 gap-1.5">
            <Search className="size-4" />
            查询
          </Button>
          <Button variant="outline" className="h-9 gap-1.5" onClick={reset}>
            <RotateCcw className="size-4" />
            重置
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{filtered.length}</span> 条记录
        </p>
        <Button className="gap-1.5" onClick={openNew}>
          <Plus className="size-4" />
          新增
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-14 text-center">序号</TableHead>
              <TableHead>登录账号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>手机号码</TableHead>
              <TableHead>所属部门</TableHead>
              <TableHead>角色</TableHead>
              <TableHead className="text-center">账号状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-mono text-sm">{u.account}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                <TableCell>{deptMap.get(u.deptId) ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {roleMap.get(u.roleId) ?? '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch checked={u.enabled} onCheckedChange={() => toggleStatus(u.id)} />
                    <span className="text-xs text-muted-foreground">
                      {u.enabled ? '启用' : '停用'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ActionBtn
                      icon={<KeyRound className="size-3.5" />}
                      label="重置密码"
                      onClick={() => window.alert(`已为「${u.name}」重置密码为默认密码。`)}
                    />
                    <ActionBtn
                      icon={<Pencil className="size-3.5" />}
                      label="编辑"
                      onClick={() => openEdit(u)}
                    />
                    <ActionBtn
                      icon={<Trash2 className="size-3.5" />}
                      label="删除"
                      danger
                      onClick={() => remove(u)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的用户
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={dialogOpen}
        user={editing}
        roles={roles}
        departments={departments}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
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
