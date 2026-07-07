/** The signed-in user. In a real app this comes from the auth session. */
export type CurrentUser = {
  name: string
  account: string
  roleLabel: string
  deptLabel: string
  email: string
  phone: string
  /** Fallback avatar initial shown when no image is set. */
  initial: string
}

export const CURRENT_USER: CurrentUser = {
  name: '管理员',
  account: 'admin',
  roleLabel: '超级管理员',
  deptLabel: '鲜果云集团 · 信息技术部',
  email: 'admin@fruitcloud.com',
  phone: '138****8888',
  initial: '管',
}

/** A single operation-log record for the security audit table. */
export type OperationLog = {
  id: number
  action: string
  ip: string
  device: string
  time: string
  result: 'success' | 'fail'
}

export const OPERATION_LOGS: OperationLog[] = [
  { id: 1, action: '登录系统', ip: '116.25.xx.18', device: 'Chrome · macOS', time: '2026-07-08 09:12:04', result: 'success' },
  { id: 2, action: '修改角色权限「采购主管」', ip: '116.25.xx.18', device: 'Chrome · macOS', time: '2026-07-07 18:33:41', result: 'success' },
  { id: 3, action: '导出采购单报表', ip: '116.25.xx.18', device: 'Chrome · macOS', time: '2026-07-07 15:20:09', result: 'success' },
  { id: 4, action: '尝试登录（密码错误）', ip: '223.104.xx.7', device: 'Safari · iOS', time: '2026-07-06 22:47:55', result: 'fail' },
  { id: 5, action: '登录系统', ip: '116.25.xx.18', device: 'Edge · Windows', time: '2026-07-06 08:59:12', result: 'success' },
  { id: 6, action: '新增部门「冷链物流部」', ip: '116.25.xx.18', device: 'Chrome · macOS', time: '2026-07-05 11:04:33', result: 'success' },
]
