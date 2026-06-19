'use client'

import { KpiCards } from './kpi-cards'
import { ProfitChart } from './profit-chart'
import { CostBreakdown } from './cost-breakdown'
import { MarginRanking } from './margin-ranking'
import { LaborEfficiency } from './labor-efficiency'
import { OemChart } from './oem-chart'
import { ReceivablesPayables } from './receivables-payables'
import { InventoryTurnover } from './inventory-turnover'
import { InvoiceCard } from './invoice-card'
import { SupplierRanking } from './supplier-ranking'
import { ReturnRanking } from './return-ranking'
import { CostCalculator } from './cost-calculator'

export function Overview() {
  return (
    <div className="flex flex-col gap-4">
      <KpiCards />

      {/* 主趋势 + 成本结构 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        <CostBreakdown />
      </div>

      {/* 毛利排名 + 人效 + 代加工 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MarginRanking />
        <LaborEfficiency />
        <OemChart />
      </div>

      {/* 往来款 + 库存周转 + 发票 + 成本倒推 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReceivablesPayables />
        <InventoryTurnover />
        <InvoiceCard />
        <CostCalculator />
      </div>

      {/* 供应商 + 退货 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SupplierRanking />
        <ReturnRanking />
      </div>
    </div>
  )
}
