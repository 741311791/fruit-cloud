import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  Factory,
  TrendingUp,
  Handshake,
  FileBarChart,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavChild = {
  id: string
  label: string
  desc?: string
}

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
  children?: NavChild[]
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: '概览',
    items: [{ id: 'dashboard', label: '数据看板', icon: LayoutDashboard }],
  },
  {
    title: '业务管理',
    items: [
      {
        id: 'purchase',
        label: '采购管理',
        icon: ShoppingCart,
        children: [
          { id: 'purchase-order', label: '采购单录入', desc: '供应商、商品、单价数量与售后规则录入' },
          { id: 'purchase-return', label: '采购退货单', desc: '结合售后条件自动触发或手动发起退货' },
          { id: 'purchase-exchange', label: '采购换货', desc: '同原料同重量不良库存等价换货' },
          { id: 'purchase-stats', label: '采购商品统计', desc: '采购数量统计与单价波动分析' },
          { id: 'purchase-query', label: '采购订单查询', desc: '采购订单检索与明细查看' },
          { id: 'purchase-amount-adjust', label: '入库金额调整', desc: '针对成本延后或补录单价的订单' },
          { id: 'purchase-request', label: '请购单', desc: '库管/办公发起请购，审核后转采购' },
        ],
      },
      {
        id: 'warehouse',
        label: '仓储管理',
        icon: Warehouse,
        children: [
          { id: 'warehouse-inbound', label: '到货入库', desc: '质检/扣损/正常收货与批次拍照入库' },
          { id: 'warehouse-stock', label: '库存管理', desc: '在库/在途数量金额、预警与周转率' },
          { id: 'warehouse-other-io', label: '其他出入库管理', desc: '非领料流程的调货、代加工出库' },
          { id: 'warehouse-lock', label: '库存锁定', desc: '手动锁定与解除' },
          { id: 'warehouse-alert', label: '库存不足预警', desc: '自动提醒并下发请购任务' },
          { id: 'warehouse-transfer', label: '库存移库', desc: '次果、退货、报损等库位转移' },
          { id: 'warehouse-reconcile', label: '库存对盘', desc: '同成本商品名称转换不影响毛利' },
          { id: 'warehouse-count', label: '盘点管理', desc: '盘点任务、报损单、报溢单与审批' },
          { id: 'warehouse-report', label: '仓库报表', desc: '进销存、出入库、报损报溢与批次跟踪' },
        ],
      },
      {
        id: 'production',
        label: '生产管理',
        icon: Factory,
        children: [
          { id: 'production-plan', label: '生产计划', desc: '提前一天预估，12点校准为正式任务单' },
          { id: 'production-mrp', label: 'MRP运算', desc: '结合库存与领料测算所需原料耗材' },
          { id: 'production-process', label: '生产加工', desc: '领料、加工进度单、工时与损耗反馈' },
          { id: 'production-delivery', label: '完工交付', desc: '成品入库、次果坏果标记与售后退货' },
          { id: 'production-cost', label: '出库成本', desc: '原料+加工+耗材+人工+框板的成本报表' },
          { id: 'production-stats', label: '加工数据统计报表', desc: '商品/供应商/时间维度损耗与出品率' },
          { id: 'production-rework', label: '退货二次加工/返工', desc: '退货位返工的二次分选与成本叠加' },
        ],
      },
      {
        id: 'sales',
        label: '销售管理',
        icon: TrendingUp,
        children: [
          { id: 'sales-shipment', label: '发货', desc: '按订单分批成品出库与框板记录' },
          { id: 'sales-handover', label: '交货', desc: '交货数量、报损/拒收差异拍照反馈' },
          { id: 'sales-order', label: '销售订单', desc: '正式订单同步、拆分、单价与扣点核算' },
          { id: 'sales-return', label: '销售退货单', desc: '交货拒收退货收货与跟踪' },
          { id: 'sales-outsource', label: '委外销售', desc: '次果及积压商品委托销售与回款提醒' },
          { id: 'sales-product-stats', label: '商品销售数据统计', desc: '商品维度销售统计查询' },
          { id: 'sales-customer-stats', label: '客户销售数据查询', desc: '客户维度销售与毛利查询' },
        ],
      },
      {
        id: 'oem',
        label: '代加工管理',
        icon: Handshake,
        children: [
          { id: 'oem-inbound', label: '代加工入库', desc: '其他入库单零成本入库与工时损耗记录' },
          { id: 'oem-outbound', label: '代加工销售出库单', desc: '记录代加工成本与利润结算' },
        ],
      },
    ],
  },
  {
    title: '财务中心',
    items: [
      {
        id: 'finance',
        label: '财务报表中心',
        icon: FileBarChart,
        children: [
          { id: 'finance-operating', label: '经营报表', desc: '经营日报/月报/年报与资产负债表' },
          { id: 'finance-reconcile', label: '会计对账管理', desc: '科目设置、往来资金与上下游对账' },
          { id: 'finance-invoice', label: '总账发票管理', desc: '进销项发票、付款凭证与成本费用' },
          { id: 'finance-closing', label: '财务扎帐功能', desc: '月底核对锁死数据，修改走审批' },
        ],
      },
    ],
  },
  {
    title: '组织管理',
    items: [
      {
        id: 'hr',
        label: '行政人事 · OA',
        icon: Users,
        children: [
          { id: 'hr-reimburse', label: '报销管理', desc: '报销申请、类别发票与财务审批请款' },
          { id: 'hr-attendance', label: '考勤薪资管理', desc: '请假审批、考勤录入与工资条生成' },
        ],
      },
    ],
  },
  {
    title: '系统',
    items: [
      {
        id: 'system',
        label: '系统管理',
        icon: Settings,
        children: [
          { id: 'system-base', label: '系统基础设置', desc: '权限、审批流、数据重建与系统开账' },
          { id: 'system-archive', label: '基础档案管理', desc: '商品/客户/供应商/职员与期初信息' },
        ],
      },
    ],
  },
]

const labelEntries: [string, string][] = navGroups.flatMap((g) =>
  g.items.flatMap((i) => [
    [i.id, i.label] as [string, string],
    ...(i.children?.map((c) => [c.id, c.label] as [string, string]) ?? []),
  ]),
)

export const navLabels: Record<string, string> = Object.fromEntries(labelEntries)

const descEntries: [string, string][] = navGroups.flatMap((g) =>
  g.items.flatMap((i) => i.children?.map((c) => [c.id, c.desc ?? ''] as [string, string]) ?? []),
)

export const navDescriptions: Record<string, string> = Object.fromEntries(descEntries)

/** Map a (sub)module id back to its parent module label for breadcrumbs. */
export const parentLabels: Record<string, string> = Object.fromEntries(
  navGroups.flatMap((g) =>
    g.items.flatMap((i) => i.children?.map((c) => [c.id, i.label] as [string, string]) ?? []),
  ),
)
