import { navGroups } from './nav'

/** Operation-level (button) permissions available per menu leaf. */
export type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve'

export const ACTION_LABELS: { key: ActionKey; label: string }[] = [
  { key: 'view', label: '查看' },
  { key: 'create', label: '新增' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' },
  { key: 'export', label: '导出' },
  { key: 'approve', label: '审批' },
]

/** Data scope options — separates data permission from functional permission (RBAC best practice). */
export type DataScope = 'all' | 'dept' | 'self' | 'custom'

export const DATA_SCOPE_LABELS: Record<DataScope, string> = {
  all: '全部数据',
  dept: '本部门',
  self: '仅本人',
  custom: '自定义',
}

/** A leaf in the permission tree — corresponds to a real menu child. */
export type PermLeaf = {
  id: string
  label: string
}

/** A top-level node in the permission tree — corresponds to a menu module. */
export type PermNode = {
  id: string
  label: string
  children: PermLeaf[]
}

/**
 * Build the permission tree directly from the live navigation config so that
 * permission items always stay in sync with the real menus.
 */
export function buildPermissionTree(): PermNode[] {
  const nodes: PermNode[] = []
  for (const group of navGroups) {
    for (const item of group.items) {
      const children = item.children?.filter((c) => !c.excludeFromPermissions) ?? []
      if (!children.length) continue
      nodes.push({
        id: item.id,
        label: item.label,
        children: children.map((c) => ({ id: c.id, label: c.label })),
      })
    }
  }
  return nodes
}

export const PERMISSION_TREE = buildPermissionTree()

/** Flat list of all leaf ids for "select all" helpers. */
export const ALL_LEAF_IDS = PERMISSION_TREE.flatMap((n) => n.children.map((c) => c.id))

export type Role = {
  id: number
  name: string
  code: string
  description: string
  dataScope: DataScope
  scopeNote?: string
  enabled: boolean
  remark?: string
  builtIn?: boolean
  /** View-only role: only the "查看" action can be granted; other actions are locked. */
  viewOnly?: boolean
  /** Menu leaf ids granted for this role. */
  menuIds: string[]
  /** Map of leaf id -> granted action keys. */
  actions: Record<string, ActionKey[]>
}

const ALL_ACTIONS: ActionKey[] = ['view', 'create', 'edit', 'delete', 'export', 'approve']

function grantAll(): { menuIds: string[]; actions: Record<string, ActionKey[]> } {
  const actions: Record<string, ActionKey[]> = {}
  for (const id of ALL_LEAF_IDS) actions[id] = [...ALL_ACTIONS]
  return { menuIds: [...ALL_LEAF_IDS], actions }
}

/** Grant view-only on every leaf. */
function grantViewAll(): { menuIds: string[]; actions: Record<string, ActionKey[]> } {
  const actions: Record<string, ActionKey[]> = {}
  for (const id of ALL_LEAF_IDS) actions[id] = ['view']
  return { menuIds: [...ALL_LEAF_IDS], actions }
}

/** Grant a set of leaves with a given action set. */
function grant(
  ids: string[],
  acts: ActionKey[],
): { menuIds: string[]; actions: Record<string, ActionKey[]> } {
  const actions: Record<string, ActionKey[]> = {}
  const present = ids.filter((id) => ALL_LEAF_IDS.includes(id))
  for (const id of present) actions[id] = [...acts]
  return { menuIds: present, actions }
}

// Convenience id groups by module.
const purchaseIds = ['purchase-order', 'purchase-request']
const warehouseIds = ['warehouse-inbound', 'warehouse-stock', 'warehouse-count', 'warehouse-amount-adjust']
const productionIds = [
  'production-plan',
  'production-schedule',
  'production-mrp',
  'production-process',
  'production-report',
  'production-delivery',
]
const salesIds = ['sales-order', 'sales-shipment', 'sales-outsource']
const financeIds = ['finance-reconcile', 'finance-invoice', 'finance-closing', 'finance-cost']
const hrIds = ['hr-reimburse', 'hr-attendance']
const dashboardIds = ['dashboard']

export const INITIAL_ROLES: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '系统最高权限，拥有所有功能模块的全部操作权限',
    dataScope: 'all',
    enabled: true,
    remark: '通常仅 1-2 人，内置角色不可删除',
    builtIn: true,
    ...grantAll(),
  },
  {
    id: 2,
    name: '采购主管',
    code: 'PURCHASE_MGR',
    description: '采购管理全部权限 + 查看仓储/生产/销售数据',
    dataScope: 'dept',
    enabled: true,
    remark: '含审批权限',
    ...(() => {
      const base = grant(purchaseIds, ALL_ACTIONS)
      const view = grant([...warehouseIds, ...productionIds, ...salesIds, ...dashboardIds], ['view'])
      return {
        menuIds: [...base.menuIds, ...view.menuIds],
        actions: { ...view.actions, ...base.actions },
      }
    })(),
  },
  {
    id: 3,
    name: '采购员',
    code: 'PURCHASE_OP',
    description: '采购单录入、查询、打印；无删除和审批权限',
    dataScope: 'self',
    scopeNote: '仅查看自己创建的采购单',
    enabled: true,
    ...grant(purchaseIds, ['view', 'create', 'edit', 'export']),
  },
  {
    id: 4,
    name: '仓库主管',
    code: 'WH_MGR',
    description: '仓储管理全部权限 + 查看采购/生产数据',
    dataScope: 'all',
    enabled: true,
    remark: '含盘点审批',
    ...(() => {
      const base = grant(warehouseIds, ALL_ACTIONS)
      const view = grant([...purchaseIds, ...productionIds, ...dashboardIds], ['view'])
      return {
        menuIds: [...base.menuIds, ...view.menuIds],
        actions: { ...view.actions, ...base.actions },
      }
    })(),
  },
  {
    id: 5,
    name: '仓库操作员',
    code: 'WH_OP',
    description: '入库、库存操作、盘点录入；无删除权限',
    dataScope: 'dept',
    enabled: true,
    ...grant(warehouseIds, ['view', 'create', 'edit']),
  },
  {
    id: 6,
    name: '生产主管',
    code: 'PROD_MGR',
    description: '生产计划、加工执行、完工交付全部权限',
    dataScope: 'dept',
    enabled: true,
    ...grant(productionIds, ALL_ACTIONS),
  },
  {
    id: 7,
    name: '销售主管',
    code: 'SALES_MGR',
    description: '销售订单、发货管理全部权限',
    dataScope: 'dept',
    enabled: true,
    ...grant(salesIds, ALL_ACTIONS),
  },
  {
    id: 8,
    name: '财务',
    code: 'FINANCE',
    description: '财务中心全部权限 + 查看各模块统计数据',
    dataScope: 'all',
    enabled: true,
    remark: '含扎帐权限',
    ...(() => {
      const base = grant(financeIds, ALL_ACTIONS)
      const view = grant(
        [...purchaseIds, ...warehouseIds, ...productionIds, ...salesIds, ...dashboardIds],
        ['view', 'export'],
      )
      return {
        menuIds: [...base.menuIds, ...view.menuIds],
        actions: { ...view.actions, ...base.actions },
      }
    })(),
  },
  {
    id: 9,
    name: '人事行政',
    code: 'HR_ADMIN',
    description: '报销管理、考勤薪资管理权限',
    dataScope: 'dept',
    enabled: true,
    ...grant(hrIds, ALL_ACTIONS),
  },
  {
    id: 10,
    name: '只读查看者',
    code: 'VIEWER',
    description: '所有模块仅查看权限，无任何操作权限',
    dataScope: 'self',
    enabled: true,
    remark: '给老板 / 外部审计',
    viewOnly: true,
    ...grantViewAll(),
  },
]

export type Department = {
  id: number
  name: string
  code: string
  parentId: number | null
  leader: string
  sort: number
  enabled: boolean
}

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: '鲜果云集团', code: 'HQ', parentId: null, leader: '张伟', sort: 1, enabled: true },
  { id: 2, name: '采购部', code: 'PURCHASE', parentId: 1, leader: '李强', sort: 1, enabled: true },
  { id: 3, name: '仓储部', code: 'WAREHOUSE', parentId: 1, leader: '王芳', sort: 2, enabled: true },
  { id: 4, name: '生产部', code: 'PRODUCTION', parentId: 1, leader: '赵敏', sort: 3, enabled: true },
  { id: 5, name: '销售部', code: 'SALES', parentId: 1, leader: '陈杰', sort: 4, enabled: true },
  { id: 6, name: '华东销售组', code: 'SALES_EAST', parentId: 5, leader: '孙丽', sort: 1, enabled: true },
  { id: 7, name: '华南销售组', code: 'SALES_SOUTH', parentId: 5, leader: '周涛', sort: 2, enabled: true },
  { id: 8, name: '财务部', code: 'FINANCE', parentId: 1, leader: '吴静', sort: 5, enabled: true },
  { id: 9, name: '人事行政部', code: 'HR', parentId: 1, leader: '郑华', sort: 6, enabled: false },
]

export type User = {
  id: number
  account: string
  name: string
  phone: string
  deptId: number
  roleId: number
  enabled: boolean
  createdAt: string
}

export const INITIAL_USERS: User[] = [
  { id: 1, account: 'admin', name: '张伟', phone: '18800000001', deptId: 1, roleId: 1, enabled: true, createdAt: '2024-01-02' },
  { id: 2, account: 'lqiang', name: '李强', phone: '18800000002', deptId: 2, roleId: 2, enabled: true, createdAt: '2024-01-05' },
  { id: 3, account: 'purchase01', name: '刘洋', phone: '18800000003', deptId: 2, roleId: 3, enabled: true, createdAt: '2024-02-11' },
  { id: 4, account: 'wfang', name: '王芳', phone: '18800000004', deptId: 3, roleId: 4, enabled: true, createdAt: '2024-01-08' },
  { id: 5, account: 'wh01', name: '黄磊', phone: '18800000005', deptId: 3, roleId: 5, enabled: true, createdAt: '2024-03-01' },
  { id: 6, account: 'zmin', name: '赵敏', phone: '18800000006', deptId: 4, roleId: 6, enabled: true, createdAt: '2024-01-15' },
  { id: 7, account: 'cjie', name: '陈杰', phone: '18800000007', deptId: 5, roleId: 7, enabled: true, createdAt: '2024-01-18' },
  { id: 8, account: 'wjing', name: '吴静', phone: '18800000008', deptId: 8, roleId: 8, enabled: true, createdAt: '2024-01-20' },
  { id: 9, account: 'zhua', name: '郑华', phone: '18800000009', deptId: 9, roleId: 9, enabled: false, createdAt: '2024-02-02' },
  { id: 10, account: 'boss', name: '孙老板', phone: '18800000010', deptId: 1, roleId: 10, enabled: true, createdAt: '2024-01-01' },
]

/** Flatten departments for select options with indentation by depth. */
export function flattenDepartments(depts: Department[]): { id: number; label: string; depth: number }[] {
  const out: { id: number; label: string; depth: number }[] = []
  const walk = (parentId: number | null, depth: number) => {
    depts
      .filter((d) => d.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .forEach((d) => {
        out.push({ id: d.id, label: d.name, depth })
        walk(d.id, depth + 1)
      })
  }
  walk(null, 0)
  return out
}
