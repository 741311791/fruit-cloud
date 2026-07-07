'use client'

import { useEffect, useState } from 'react'
import { UserCog } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { flattenDepartments, type Department, type Role, type User } from '@/lib/permission-data'

type Draft = {
  account: string
  name: string
  phone: string
  deptId: number
  roleId: number
  enabled: boolean
}

export function UserDialog({
  open,
  user,
  roles,
  departments,
  onClose,
  onSave,
}: {
  open: boolean
  user: User | null
  roles: Role[]
  departments: Department[]
  onClose: () => void
  onSave: (data: Omit<User, 'id' | 'createdAt'> & { id?: number }) => void
}) {
  const build = (): Draft => ({
    account: user?.account ?? '',
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    deptId: user?.deptId ?? departments[0]?.id ?? 1,
    roleId: user?.roleId ?? roles[0]?.id ?? 1,
    enabled: user?.enabled ?? true,
  })
  const [draft, setDraft] = useState<Draft>(build)

  useEffect(() => {
    if (open) setDraft(build())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const deptOptions = flattenDepartments(departments)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserCog className="size-5 text-primary" />
            {user ? '编辑用户' : '新增用户'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              登录账号 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={draft.account}
              onChange={(e) => patch({ account: e.target.value })}
              placeholder="请输入登录账号"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              姓名 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="请输入姓名"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">手机号码</Label>
            <Input
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="请输入手机号码"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">所属部门</Label>
            <Select value={String(draft.deptId)} onValueChange={(v) => patch({ deptId: Number(v) })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deptOptions.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {'\u00A0'.repeat(d.depth * 2)}
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">角色</Label>
            <Select value={String(draft.roleId)} onValueChange={(v) => patch({ roleId: Number(v) })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Label className="text-xs">账号状态</Label>
            <Switch checked={draft.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
            <span className="text-xs text-muted-foreground">{draft.enabled ? '启用' : '停用'}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            disabled={!draft.account.trim() || !draft.name.trim()}
            onClick={() =>
              onSave({
                id: user?.id,
                account: draft.account.trim(),
                name: draft.name.trim(),
                phone: draft.phone.trim(),
                deptId: draft.deptId,
                roleId: draft.roleId,
                enabled: draft.enabled,
              })
            }
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
