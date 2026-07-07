'use client'

import { useMemo, useState } from 'react'
import { IdCard, RefreshCw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  generatePassword,
  type ArchiveStatusFilter,
  type Staff,
} from '@/lib/archive-data'
import { flattenDepartments, INITIAL_DEPARTMENTS, INITIAL_ROLES } from '@/lib/permission-data'

type Draft = Omit<Staff, 'id' | 'code'> & { id?: number; code?: string }

const emptyDraft: Draft = {
  employeeNo: '',
  name: '',
  pinyin: '',
  phone: '',
  deptId: INITIAL_DEPARTMENTS[0]?.id ?? 1,
  position: '',
  hasAccount: false,
  roleIds: [],
  enabled: true,
}

export function StaffArchive({
  staff,
  setStaff,
}: {
  staff: Staff[]
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ArchiveStatusFilter>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const deptOptions = useMemo(() => flattenDepartments(INITIAL_DEPARTMENTS), [])
  const deptMap = useMemo(() => new Map(INITIAL_DEPARTMENTS.map((d) => [d.id, d.name])), [])
  const roleMap = useMemo(() => new Map(INITIAL_ROLES.map((r) => [r.id, r.name])), [])
  const deptItems = useMemo(
    () => Object.fromEntries(deptOptions.map((d) => [String(d.id), d.label])),
    [deptOptions],
  )

  const filtered = useMemo(
    () =>
      staff.filter(
        (s) => archiveMatch(keyword, s.name, s.pinyin) && statusMatch(status, s.enabled),
      ),
    [staff, keyword, status],
  )

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const openNew = () => {
    setDraft(emptyDraft)
    setPassword(generatePassword())
    setCopied(false)
    setOpen(true)
  }
  const openEdit = (s: Staff) => {
    setDraft({ ...s })
    setPassword('')
    setCopied(false)
    setOpen(true)
  }

  const toggleRole = (roleId: number) =>
    setDraft((d) => ({
      ...d,
      roleIds: d.roleIds.includes(roleId)
        ? d.roleIds.filter((r) => r !== roleId)
        : [...d.roleIds, roleId],
    }))

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('请手动复制初始密码：', password)
    }
  }

  const save = () => {
    if (!draft.name.trim()) return
    // A staff with a system account must have at least one role assigned.
    const roleIds = draft.hasAccount ? draft.roleIds : []
    if (draft.id) {
      setStaff((prev) => prev.map((s) => (s.id === draft.id ? ({ ...s, ...draft, roleIds } as Staff) : s)))
    } else {
      const id = Math.max(0, ...staff.map((s) => s.id)) + 1
      const code = nextCode('EMP', staff.map((s) => s.code), 3)
      setStaff((prev) => [...prev, { ...(draft as Staff), roleIds, id, code }])
    }
    setOpen(false)
  }

  const toggle = (id: number) =>
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))

  const remove = (s: Staff) => {
    if (window.confirm(`确定删除职员「${s.name}」吗？停用后该员工将无法登录及被业务单据选取。`)) {
      setStaff((prev) => prev.filter((x) => x.id !== s.id))
    }
  }

  return (
    <>
      <ArchiveScaffold
        title="职员（员工）档案"
        hint="职员档案决定系统登录与数据可见范围，账号与角色直接联动权限管理模块"
        searchPlaceholder="搜索姓名 / 首字母 / 工号"
        keyword={keyword}
        onKeyword={setKeyword}
        status={status}
        onStatus={setStatus}
        count={filtered.length}
        onNew={openNew}
        newLabel="新建职员"
        onImport={() => window.alert('请选择职员档案 Excel 文件进行批量导入。')}
        onExport={() => window.alert(`已导出 ${filtered.length} 条职员档案。`)}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20">工号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>手机号（登录账号）</TableHead>
              <TableHead>所属部门</TableHead>
              <TableHead>岗位</TableHead>
              <TableHead>系统角色</TableHead>
              <TableHead className="text-center">系统账号</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[200px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.employeeNo}</TableCell>
                <TableCell className="font-medium">
                  {s.name}
                  <span className="ml-1.5 text-[11px] text-muted-foreground">{s.pinyin}</span>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{s.phone}</TableCell>
                <TableCell>{deptMap.get(s.deptId) ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{s.position}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {s.roleIds.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      s.roleIds.map((rid) => (
                        <Badge key={rid} variant="secondary" className="font-normal">
                          {roleMap.get(rid) ?? rid}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {s.hasAccount ? (
                    <span className="text-xs font-medium text-success">已开通</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">未开通</span>
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
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  暂无符合条件的职员
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
              <IdCard className="size-4 text-primary" />
              {draft.id ? '编辑职员' : '新建职员'}
            </DrawerTitle>
            <DrawerDescription>
              {draft.id ? `编码 ${draft.code}` : '编码将由系统自动生成'}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-6">
            <FormSection title="个人基本信息">
              <Field label="真实姓名" required>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="请输入姓名"
                  className="h-9"
                />
              </Field>
              <Field label="拼音首字母" hint="用于快速搜索">
                <Input
                  value={draft.pinyin}
                  onChange={(e) => patch({ pinyin: e.target.value.toUpperCase() })}
                  placeholder="如 ZW"
                  className="h-9"
                />
              </Field>
              <Field label="工号">
                <Input
                  value={draft.employeeNo}
                  onChange={(e) => patch({ employeeNo: e.target.value })}
                  placeholder="如 G0001"
                  className="h-9"
                />
              </Field>
              <Field label="手机号" required hint="作为登录唯一账号">
                <Input
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="请输入手机号"
                  className="h-9"
                  inputMode="numeric"
                />
              </Field>
            </FormSection>

            <FormSection title="组织架构">
              <Field label="所属部门" required>
                <Select
                  value={String(draft.deptId)}
                  items={deptItems}
                  onValueChange={(v) => patch({ deptId: Number(v) })}
                >
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
              </Field>
              <Field label="岗位 / 职位">
                <Input
                  value={draft.position}
                  onChange={(e) => patch({ position: e.target.value })}
                  placeholder="如：采购员"
                  className="h-9"
                />
              </Field>
            </FormSection>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-1 rounded-full bg-primary" />
                <h4 className="text-sm font-semibold text-foreground">系统账号绑定</h4>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">开通系统账号</p>
                  <p className="text-[11px] text-muted-foreground">开启后该职员才可登录系统</p>
                </div>
                <Switch
                  checked={draft.hasAccount}
                  onCheckedChange={(v) => patch({ hasAccount: v })}
                />
              </div>

              {draft.hasAccount && (
                <div className="space-y-3 rounded-lg border border-border p-3">
                  <div>
                    <p className="mb-2 text-xs font-medium text-foreground">
                      分配系统角色 <span className="text-destructive">*</span>
                      <span className="ml-1 font-normal text-muted-foreground">（联动权限管理）</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {INITIAL_ROLES.map((r) => {
                        const on = draft.roleIds.includes(r.id)
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => toggleRole(r.id)}
                            className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                              on
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span
                              className={`flex size-3.5 items-center justify-center rounded-sm border ${
                                on ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                              }`}
                            >
                              {on && <Check className="size-2.5" />}
                            </span>
                            {r.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {!draft.id && (
                    <Field label="初始密码" hint="系统已生成强密码，可一键复制发送给员工">
                      <div className="flex gap-2">
                        <Input value={password} readOnly className="h-9 font-mono" />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 shrink-0"
                          onClick={() => setPassword(generatePassword())}
                          aria-label="重新生成"
                        >
                          <RefreshCw className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 shrink-0"
                          onClick={copyPassword}
                          aria-label="复制密码"
                        >
                          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                        </Button>
                      </div>
                    </Field>
                  )}
                </div>
              )}
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              disabled={
                !draft.name.trim() ||
                !draft.phone.trim() ||
                (draft.hasAccount && draft.roleIds.length === 0)
              }
              onClick={save}
            >
              保存
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
