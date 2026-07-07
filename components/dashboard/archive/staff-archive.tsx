'use client'

import { useMemo, useState } from 'react'
import { IdCard, Cake } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  calcAge,
  calcSeniority,
  GENDER_LABELS,
  EDUCATION_LABELS,
  MARITAL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type ArchiveStatusFilter,
  type Staff,
} from '@/lib/archive-data'
import { flattenDepartments, INITIAL_DEPARTMENTS } from '@/lib/permission-data'

type Draft = Omit<Staff, 'id' | 'code'> & { id?: number; code?: string }

const emptyDraft: Draft = {
  employeeNo: '',
  name: '',
  pinyin: '',
  gender: 'male',
  birthday: '',
  idCard: '',
  nativePlace: '',
  education: 'bachelor',
  maritalStatus: 'single',
  phone: '',
  emergencyContact: '',
  emergencyPhone: '',
  deptId: INITIAL_DEPARTMENTS[0]?.id ?? 1,
  position: '',
  employmentType: 'fulltime',
  hireDate: '',
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

  const deptOptions = useMemo(() => flattenDepartments(INITIAL_DEPARTMENTS), [])
  const deptMap = useMemo(() => new Map(INITIAL_DEPARTMENTS.map((d) => [d.id, d.name])), [])
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
    setOpen(true)
  }
  const openEdit = (s: Staff) => {
    setDraft({ ...s })
    setOpen(true)
  }

  const save = () => {
    if (!draft.name.trim() || !draft.phone.trim()) return
    if (draft.id) {
      setStaff((prev) => prev.map((s) => (s.id === draft.id ? ({ ...s, ...draft } as Staff) : s)))
    } else {
      const id = Math.max(0, ...staff.map((s) => s.id)) + 1
      const code = nextCode('EMP', staff.map((s) => s.code), 3)
      setStaff((prev) => [...prev, { ...(draft as Staff), id, code }])
    }
    setOpen(false)
  }

  const toggle = (id: number) =>
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))

  const remove = (s: Staff) => {
    if (window.confirm(`确定删除职员「${s.name}」的档案吗？删除后该员工将不可在业务单据中被选取。`)) {
      setStaff((prev) => prev.filter((x) => x.id !== s.id))
    }
  }

  return (
    <>
      <ArchiveScaffold
        title="职员（员工）档案"
        hint="记录员工入职时的基础人事信息（如生日、年龄、学历、工龄等）；系统账号与角色权限请前往「权限管理」维护"
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
              <TableHead className="text-center">性别</TableHead>
              <TableHead className="text-center">年龄</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>所属部门</TableHead>
              <TableHead>岗位</TableHead>
              <TableHead className="text-center">用工性质</TableHead>
              <TableHead>入职日期</TableHead>
              <TableHead>工龄</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="w-[200px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const age = calcAge(s.birthday)
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.employeeNo}</TableCell>
                  <TableCell className="font-medium">
                    {s.name}
                    <span className="ml-1.5 text-[11px] text-muted-foreground">{s.pinyin}</span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{GENDER_LABELS[s.gender]}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{age ?? '-'}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{s.phone}</TableCell>
                  <TableCell>{deptMap.get(s.deptId) ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{s.position}</TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {EMPLOYMENT_TYPE_LABELS[s.employmentType]}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{s.hireDate || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{calcSeniority(s.hireDate)}</TableCell>
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
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
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
              {draft.id ? '编辑职员档案' : '新建职员档案'}
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
              <Field label="性别">
                <Select
                  value={draft.gender}
                  items={GENDER_LABELS}
                  onValueChange={(v) => patch({ gender: v as Staff['gender'] })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="出生日期"
                hint={draft.birthday ? `当前年龄 ${calcAge(draft.birthday) ?? '-'} 岁` : '年龄将自动推算'}
              >
                <div className="relative">
                  <Cake className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={draft.birthday}
                    onChange={(e) => patch({ birthday: e.target.value })}
                    className="h-9 pl-8"
                  />
                </div>
              </Field>
              <Field label="身份证号">
                <Input
                  value={draft.idCard}
                  onChange={(e) => patch({ idCard: e.target.value.toUpperCase() })}
                  placeholder="请输入身份证号"
                  className="h-9 font-mono"
                  maxLength={18}
                />
              </Field>
              <Field label="籍贯">
                <Input
                  value={draft.nativePlace}
                  onChange={(e) => patch({ nativePlace: e.target.value })}
                  placeholder="如：陕西西安"
                  className="h-9"
                />
              </Field>
              <Field label="学历">
                <Select
                  value={draft.education}
                  items={EDUCATION_LABELS}
                  onValueChange={(v) => patch({ education: v as Staff['education'] })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EDUCATION_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="婚姻状况">
                <Select
                  value={draft.maritalStatus}
                  items={MARITAL_LABELS}
                  onValueChange={(v) => patch({ maritalStatus: v as Staff['maritalStatus'] })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">未婚</SelectItem>
                    <SelectItem value="married">已婚</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FormSection>

            <FormSection title="联系方式">
              <Field label="本人手机号" required>
                <Input
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="请输入手机号"
                  className="h-9 font-mono"
                  inputMode="numeric"
                  maxLength={11}
                />
              </Field>
              <Field label="紧急联系人">
                <Input
                  value={draft.emergencyContact}
                  onChange={(e) => patch({ emergencyContact: e.target.value })}
                  placeholder="如：张三（父亲）"
                  className="h-9"
                />
              </Field>
              <Field label="紧急联系电话">
                <Input
                  value={draft.emergencyPhone}
                  onChange={(e) => patch({ emergencyPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="请输入电话"
                  className="h-9 font-mono"
                  inputMode="numeric"
                  maxLength={11}
                />
              </Field>
            </FormSection>

            <FormSection title="任职信息">
              <Field label="工号">
                <Input
                  value={draft.employeeNo}
                  onChange={(e) => patch({ employeeNo: e.target.value })}
                  placeholder="如 G0001"
                  className="h-9"
                />
              </Field>
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
              <Field label="用工性质">
                <Select
                  value={draft.employmentType}
                  items={EMPLOYMENT_TYPE_LABELS}
                  onValueChange={(v) => patch({ employmentType: v as Staff['employmentType'] })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="入职日期"
                hint={draft.hireDate ? `工龄 ${calcSeniority(draft.hireDate)}` : '工龄将自动推算'}
              >
                <Input
                  type="date"
                  value={draft.hireDate}
                  onChange={(e) => patch({ hireDate: e.target.value })}
                  className="h-9"
                />
              </Field>
            </FormSection>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button disabled={!draft.name.trim() || !draft.phone.trim()} onClick={save}>
              保存
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
