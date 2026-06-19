'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function num(v: string) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function CostCalculator() {
  const [price, setPrice] = useState('12.8')
  const [processing, setProcessing] = useState('1.5')
  const [freight, setFreight] = useState('0.8')
  const [other, setOther] = useState('0.4')
  const [margin, setMargin] = useState('15')

  const p = num(price)
  const variableCost = num(processing) + num(freight) + num(other)
  // 保本采购成本：利润为 0
  const breakeven = Math.max(p - variableCost, 0)
  // 目标采购成本上限：满足目标毛利率
  const target = Math.max(p * (1 - num(margin) / 100) - variableCost, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Calculator className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">采购成本倒推</CardTitle>
            <CardDescription>按目标毛利倒推不亏钱的采购成本上限</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="预计售价 (元/kg)" value={price} onChange={setPrice} />
          <Field label="目标毛利率 (%)" value={margin} onChange={setMargin} />
          <Field label="单位加工费 (元/kg)" value={processing} onChange={setProcessing} />
          <Field label="单位运费 (元/kg)" value={freight} onChange={setFreight} />
          <Field label="其他分摊 (元/kg)" value={other} onChange={setOther} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">保本采购成本</p>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              ¥{breakeven.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">高于此价即亏损</p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">目标采购成本上限</p>
            <p className="mt-1 font-mono text-xl font-semibold text-primary">
              ¥{target.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">达成 {num(margin)}% 毛利</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 bg-background font-mono"
      />
    </div>
  )
}
