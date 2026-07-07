/**
 * Mock account directory for the login module.
 *
 * In a real ERP these records live server-side and are provisioned by an
 * administrator (no self sign-up). Here they back the client-side demo so the
 * full login / first-login-reset / disabled state machine can be exercised.
 */

export type DemoAccount = {
  /** 11-digit mobile number — the unique login identifier. */
  phone: string
  /** Current password. Mutable in the demo so a reset "sticks" for the session. */
  password: string
  name: string
  roleLabel: string
  deptLabel: string
  initial: string
  /** Whether the account is enabled by the administrator. */
  enabled: boolean
  /** True when the password is still the system-issued initial one. */
  initialPassword: boolean
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    phone: '13800138000',
    password: 'Admin@2026',
    name: '管理员',
    roleLabel: '超级管理员',
    deptLabel: '鲜果云集团 · 信息技术部',
    initial: '管',
    enabled: true,
    initialPassword: false,
  },
  {
    phone: '13800138001',
    password: 'Fruit@123',
    name: '周敏',
    roleLabel: '采购主管',
    deptLabel: '鲜果云集团 · 采购部',
    initial: '周',
    enabled: true,
    initialPassword: true,
  },
  {
    phone: '13800138002',
    password: 'Fruit@123',
    name: '李强',
    roleLabel: '仓库主管',
    deptLabel: '鲜果云集团 · 仓储中心',
    initial: '李',
    enabled: false,
    initialPassword: false,
  },
]
