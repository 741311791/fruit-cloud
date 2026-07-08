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
  /** Personal/universal menus that should not appear in the RBAC permission tree. */
  excludeFromPermissions?: boolean
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
    items: [
      {
        id: 'dashboard-board',
        label: '数据看板',
        icon: LayoutDashboard,
        children: [
          {
            id: 'dashboard',
            label: '经营盈亏全景',
            desc: '经营仪表盘，含盈亏趋势、成本结构、毛利排名、应收应付等',
          },
        ],
      },
    ],
  },
  {
    title: '业务管理',
    items: [
      {
        id: 'purchase',
        label: '采购管理',
        icon: ShoppingCart,
        children: [
          { id: 'purchase-order', label: '采购单管理', desc: '采购单全生命周期：录入、查询、退货、换货统一入口' },
          { id: 'purchase-request', label: '请购单', desc: '部门请购申请 → 审批 → 生成采购单' },
        ],
      },
      {
        id: 'warehouse',
        label: '仓储管理',
        icon: Warehouse,
        children: [
          { id: 'warehouse-inbound', label: '到货入库', desc: '扫码/选择采购单，验收入库' },
          { id: 'warehouse-stock', label: '库存管理', desc: '库存台账 + 锁定/移库/对盘/其他出入库等操作' },
          { id: 'warehouse-count', label: '盘点管理', desc: '盘点计划 → 盘点执行 → 盘点差异处理' },
          { id: 'warehouse-amount-adjust', label: '入库金额调整', desc: '入库后发现金额差异，在此调整' },
        ],
      },
      {
        id: 'production',
        label: '生产管理',
        icon: Factory,
        children: [
          { id: 'production-plan', label: '生产计划', desc: '制定加工计划，分配产线和人员' },
          {
            id: 'production-schedule',
            label: '生产计划排期',
            desc: '结合近一周平均动销、同期订单量及节假日等因素做生产计划提前预估',
          },
          { id: 'production-mrp', label: 'MRP运算', desc: '物料需求计划计算，自动生成采购建议' },
          { id: 'production-process', label: '生产加工', desc: '加工执行 + 退货二次加工/返工' },
          { id: 'production-report', label: '生产报工', desc: '员工扫码填数实时反馈工时进度，支持拍照与视频上传' },
          { id: 'production-delivery', label: '完工交付', desc: '完工入库确认，关联入库单' },
        ],
      },
      {
        id: 'sales',
        label: '销售管理',
        icon: TrendingUp,
        children: [
          { id: 'sales-order', label: '销售订单管理', desc: '销售订单 + 退货 + 客户数据查询，统一入口' },
          { id: 'sales-shipment', label: '发货管理', desc: '发货 & 交货操作，合并原两个独立菜单' },
          { id: 'sales-outsource', label: '委外销售', desc: '委托外部渠道销售的管理' },
        ],
      },
      {
        id: 'oem',
        label: '代加工管理',
        icon: Handshake,
        children: [
          { id: 'oem-inbound', label: '代加工入库', desc: '受托加工方的来料入库记录' },
          { id: 'oem-outbound', label: '代加工销售出库单', desc: '代加工完成品销售出库' },
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
          { id: 'finance-reconcile', label: '会计对账管理', desc: '往来对账、银行对账' },
          { id: 'finance-invoice', label: '总账发票管理', desc: '进项/销项发票登记与管理' },
          { id: 'finance-closing', label: '财务扎帐功能', desc: '月度/季度财务扎帐操作' },
          { id: 'finance-cost', label: '出库成本核算', desc: '按加工单归集出库成本' },
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
          {
            id: 'hr-todo',
            label: '我的待办',
            desc: '统一审批工作台：待我处理、我已处理、我发起的、抄送我的',
            excludeFromPermissions: true,
          },
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
          { id: 'system-permission', label: '权限管理', desc: '用户、角色与部门的统一权限配置（RBAC）' },
          { id: 'system-workflow', label: '审批流配置', desc: '按业务单据可视化编排审批节点、条件分支与会签/或签策略' },
          { id: 'system-base', label: '系统基础设置', desc: '权限、审批流、数据重建与系统开账' },
          { id: 'system-archive', label: '基础档案管理', desc: '商品/客户/供应商/职员与期初信息' },
          {
            id: 'system-profile',
            label: '个人中心',
            desc: '账户设置：基本资料、安全设置与个性化偏好',
            excludeFromPermissions: true,
          },
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
