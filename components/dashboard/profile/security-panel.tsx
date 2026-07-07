'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { OPERATION_LOGS } from '@/lib/current-user'

function passwordStrength(pw: string): { score: number; label: string; tone: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (!pw) return { score: 0, label: '', tone: '' }
  if (score <= 1) return { score: 1, label: '弱', tone: 'bg-destructive' }
  if (score === 2) return { score: 2, label: '中', tone: 'bg-warning' }
  if (score === 3) return { score: 3, label: '强', tone: 'bg-primary' }
  return { score: 4, label: '很强', tone: 'bg-success' }
}

export function SecurityPanel() {
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const strength = useMemo(() => passwordStrength(next), [next])
  const mismatch = confirm.length > 0 && confirm !== next

  return (
    <div className="space-y-10">
      {/* Change password */}
      <section className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">修改登录密码</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            定期更换密码可提升账户安全性，建议使用大小写字母、数字与符号的组合。
          </p>
        </div>

        <div className="grid max-w-md gap-5">
          <div className="grid gap-2">
            <Label htmlFor="cur-pw">当前密码</Label>
            <Input id="cur-pw" type="password" placeholder="请输入当前密码" className="h-9" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-pw">新密码</Label>
            <Input
              id="new-pw"
              type="password"
              placeholder="请输入新密码"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="h-9"
            />
            {next && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full',
                        i <= strength.score ? strength.tone : 'bg-muted',
                      )}
                    />
                  ))}
                </div>
                <span className="w-8 text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-pw">确认新密码</Label>
            <Input
              id="confirm-pw"
              type="password"
              placeholder="请再次输入新密码"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn('h-9', mismatch && 'border-destructive')}
            />
            {mismatch && <p className="text-xs text-destructive">两次输入的密码不一致。</p>}
          </div>

          <div>
            <Button disabled={!next || mismatch}>更新密码</Button>
          </div>
        </div>
      </section>

      {/* Operation log audit */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">操作日志审计</h3>
          <p className="mt-1 text-sm text-muted-foreground">记录近期登录与关键操作，便于安全追溯。</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>操作内容</TableHead>
                <TableHead className="hidden sm:table-cell">IP 地址</TableHead>
                <TableHead className="hidden md:table-cell">设备 / 浏览器</TableHead>
                <TableHead>时间</TableHead>
                <TableHead className="text-right">结果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OPERATION_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {log.ip}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{log.device}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{log.time}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.result === 'success' ? 'secondary' : 'destructive'}>
                      {log.result === 'success' ? '成功' : '失败'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
