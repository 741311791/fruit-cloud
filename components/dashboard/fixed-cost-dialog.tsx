'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fixedCostRecords } from '@/lib/dashboard-data'
import { formatYuan } from '@/lib/format'

export function FixedCostDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('房租')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="size-4" />
            <span className="hidden sm:inline">录入固定支出</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>录入固定支出</DialogTitle>
          <DialogDescription>
            房租、水电、运费等固定支出可一笔录入，自动计入当日盈利核算。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>支出类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="房租">房租</SelectItem>
                  <SelectItem value="水电费">水电费</SelectItem>
                  <SelectItem value="运费">运费</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">金额（元）</Label>
              <Input id="amount" type="number" placeholder="0.00" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">发生日期</Label>
            <Input id="date" type="date" defaultValue="2026-06-19" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">备注</Label>
            <Input id="note" placeholder="如：加工厂区6月租金" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">本月已录入记录</p>
          <ul className="flex flex-col gap-1.5">
            {fixedCostRecords.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {r.date} · {r.type}
                </span>
                <span className="font-mono font-medium text-foreground">
                  {formatYuan(r.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => setOpen(false)}>确认录入</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
