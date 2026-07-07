'use client'

import type { ReactNode } from 'react'
import { Plus, Search, Upload, Download, Pencil, Trash2, Eye } from 'lucide-react'
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
import type { ArchiveStatusFilter } from '@/lib/archive-data'

const STATUS_ITEMS = { all: '全部', enabled: '启用', disabled: '停用' }

/** Unified three-段 scaffold: toolbar (search + status + new + import/export) → count → table. */
export function ArchiveScaffold({
  title,
  hint,
  searchPlaceholder,
  keyword,
  onKeyword,
  status,
  onStatus,
  count,
  onNew,
  newLabel = '新建',
  onImport,
  onExport,
  children,
}: {
  title: string
  hint?: string
  searchPlaceholder: string
  keyword: string
  onKeyword: (v: string) => void
  status: ArchiveStatusFilter
  onStatus: (v: ArchiveStatusFilter) => void
  count: number
  onNew: () => void
  newLabel?: string
  onImport?: () => void
  onExport?: () => void
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => onKeyword(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-56 pl-8"
            />
          </div>
          <Select
            value={status}
            items={STATUS_ITEMS}
            onValueChange={(v) => onStatus(v as ArchiveStatusFilter)}
          >
            <SelectTrigger className="h-9 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="enabled">启用</SelectItem>
              <SelectItem value="disabled">停用</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9 gap-1.5" onClick={onImport}>
            <Upload className="size-4" />
            导入
          </Button>
          <Button variant="outline" className="h-9 gap-1.5" onClick={onExport}>
            <Download className="size-4" />
            导出
          </Button>
          <Button className="h-9 gap-1.5" onClick={onNew}>
            <Plus className="size-4" />
            {newLabel}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">{children}</div>

      <p className="text-xs text-muted-foreground">
        共 <span className="font-medium text-foreground">{count}</span> 条记录
        {status !== 'all' && `（已按「${STATUS_ITEMS[status]}」筛选）`}
      </p>
    </div>
  )
}

/** A labelled form field for drawer forms. */
export function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : 'space-y-1.5'}>
      <Label className="text-xs">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Section heading inside a drawer form. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-3.5 w-1 rounded-full bg-primary" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

/** Fixed operation column: 详情 / 编辑 / 启用停用开关 / 删除. */
export function RowActions({
  enabled,
  onDetail,
  onEdit,
  onToggle,
  onDelete,
}: {
  enabled: boolean
  onDetail?: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {onDetail && (
        <IconAction icon={<Eye className="size-3.5" />} label="详情" onClick={onDetail} />
      )}
      <IconAction icon={<Pencil className="size-3.5" />} label="编辑" onClick={onEdit} />
      <div className="mx-1 flex items-center gap-1.5">
        <Switch checked={enabled} onCheckedChange={onToggle} aria-label={enabled ? '停用' : '启用'} />
      </div>
      <IconAction
        icon={<Trash2 className="size-3.5" />}
        label="删除"
        danger
        onClick={onDelete}
      />
    </div>
  )
}

function IconAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode
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

/** Status badge cell. */
export function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={
        enabled
          ? 'inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success'
          : 'inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
      }
    >
      <span className={`size-1.5 rounded-full ${enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
      {enabled ? '启用' : '停用'}
    </span>
  )
}
