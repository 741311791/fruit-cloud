/**
 * Basic archive (基础档案) data models and seed data.
 *
 * Design principle (per PRD): "unified framework, differentiated fields".
 * All four archives share the same status/search/soft-delete semantics but
 * carry their own business-specific fields.
 *
 * Pinyin initials (`pinyin`) are stored so the frontend can support
 * first-letter fuzzy search (e.g. 徐香猕猴桃 -> XXMHT) for fast blind entry.
 */

export type ArchiveStatusFilter = 'all' | 'enabled' | 'disabled'

/* ------------------------------------------------------------------ */
/* 供应商（农户）档案                                                    */
/* ------------------------------------------------------------------ */

export type SupplierType = 'individual' | 'enterprise'
export type Settlement = 'account' | 'cash'
export type CreditLevel = 'premium' | 'normal' | 'blacklist'

export type Supplier = {
  id: number
  code: string
  name: string
  pinyin: string
  type: SupplierType
  phone: string
  settlement: Settlement
  bankName: string
  bankAccount: string
  accountName: string
  creditLevel: CreditLevel
  mainCategory: string
  /** 预付款余额（元）— 采购单对账用 */
  prepaidBalance: number
  enabled: boolean
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  individual: '个人散户',
  enterprise: '企业供应商',
}

export const SETTLEMENT_LABELS: Record<Settlement, string> = {
  account: '账期结算',
  cash: '现结',
}

export const CREDIT_LEVEL_LABELS: Record<CreditLevel, string> = {
  premium: '优质',
  normal: '普通',
  blacklist: '黑名单',
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 1, code: 'SP0001', name: '李大娘', pinyin: 'LDN', type: 'individual', phone: '13700010001', settlement: 'cash', bankName: '中国农业银行', bankAccount: '6228480010001', accountName: '李桂芳', creditLevel: 'premium', mainCategory: '猕猴桃', prepaidBalance: 8600, enabled: true },
  { id: 2, code: 'SP0002', name: '周家庄合作社', pinyin: 'ZJZHZS', type: 'enterprise', phone: '13700010002', settlement: 'account', bankName: '中国工商银行', bankAccount: '6222020020002', accountName: '周家庄果蔬专业合作社', creditLevel: 'premium', mainCategory: '苹果、梨', prepaidBalance: 25000, enabled: true },
  { id: 3, code: 'SP0003', name: '王老三', pinyin: 'WLS', type: 'individual', phone: '13700010003', settlement: 'cash', bankName: '中国邮政储蓄', bankAccount: '6217990030003', accountName: '王老三', creditLevel: 'normal', mainCategory: '草莓', prepaidBalance: 0, enabled: true },
  { id: 4, code: 'SP0004', name: '秦岭鲜果基地', pinyin: 'QLXGJD', type: 'enterprise', phone: '13700010004', settlement: 'account', bankName: '中国建设银行', bankAccount: '6217000040004', accountName: '秦岭鲜果种植有限公司', creditLevel: 'premium', mainCategory: '猕猴桃、蓝莓', prepaidBalance: 42000, enabled: true },
  { id: 5, code: 'SP0005', name: '刘二叔', pinyin: 'LES', type: 'individual', phone: '13700010005', settlement: 'cash', bankName: '中国农业银行', bankAccount: '6228480050005', accountName: '刘建国', creditLevel: 'normal', mainCategory: '柑橘', prepaidBalance: 1200, enabled: true },
  { id: 6, code: 'SP0006', name: '张记果园', pinyin: 'ZJGY', type: 'individual', phone: '13700010006', settlement: 'cash', bankName: '中国银行', bankAccount: '6217850060006', accountName: '张建军', creditLevel: 'blacklist', mainCategory: '桃、李', prepaidBalance: 0, enabled: false },
  { id: 7, code: 'SP0007', name: '云岭生态农业', pinyin: 'YLSTNY', type: 'enterprise', phone: '13700010007', settlement: 'account', bankName: '招商银行', bankAccount: '6225880070007', accountName: '云岭生态农业发展有限公司', creditLevel: 'premium', mainCategory: '蓝莓、树莓', prepaidBalance: 31500, enabled: true },
]

/* ------------------------------------------------------------------ */
/* 商品（货品）档案                                                      */
/* ------------------------------------------------------------------ */

export type QualityGrade = 'special' | 'first' | 'standard'
export type PricingMethod = 'weight' | 'piece'

export type Product = {
  id: number
  code: string
  name: string
  pinyin: string
  category: string
  quality: QualityGrade
  pricingMethod: PricingMethod
  packaging: string
  /** 固定皮重（斤/件）— 前端采购录入自动带出 */
  tareWeight: number
  /** 标准件重（每件净果，斤） */
  standardPieceWeight: number
  stockUpper: number
  stockLower: number
  enabled: boolean
}

export const QUALITY_LABELS: Record<QualityGrade, string> = {
  special: '特级',
  first: '一级',
  standard: '统货',
}

export const PRICING_LABELS: Record<PricingMethod, string> = {
  weight: '按斤计价',
  piece: '按件计价',
}

export const PACKAGING_OPTIONS = ['标准绿塑料筐', '纸箱', '泡沫箱', '网袋', '礼品盒']

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, code: 'GD0001', name: '徐香猕猴桃', pinyin: 'XXMHT', category: '猕猴桃', quality: 'special', pricingMethod: 'weight', packaging: '标准绿塑料筐', tareWeight: 3.5, standardPieceWeight: 40, stockUpper: 5000, stockLower: 500, enabled: true },
  { id: 2, code: 'GD0002', name: '红阳猕猴桃', pinyin: 'HYMHT', category: '猕猴桃', quality: 'first', pricingMethod: 'weight', packaging: '标准绿塑料筐', tareWeight: 3.5, standardPieceWeight: 38, stockUpper: 4000, stockLower: 400, enabled: true },
  { id: 3, code: 'GD0003', name: '奶油草莓', pinyin: 'NYCM', category: '草莓', quality: 'special', pricingMethod: 'piece', packaging: '泡沫箱', tareWeight: 0.6, standardPieceWeight: 4, stockUpper: 800, stockLower: 80, enabled: true },
  { id: 4, code: 'GD0004', name: '烟台红富士', pinyin: 'YTHFS', category: '苹果', quality: 'first', pricingMethod: 'weight', packaging: '纸箱', tareWeight: 1.2, standardPieceWeight: 45, stockUpper: 6000, stockLower: 600, enabled: true },
  { id: 5, code: 'GD0005', name: '阳光玫瑰葡萄', pinyin: 'YGMGPT', category: '葡萄', quality: 'special', pricingMethod: 'piece', packaging: '礼品盒', tareWeight: 0.8, standardPieceWeight: 5, stockUpper: 1200, stockLower: 120, enabled: true },
  { id: 6, code: 'GD0006', name: '赣南脐橙', pinyin: 'GNQC', category: '柑橘', quality: 'standard', pricingMethod: 'weight', packaging: '网袋', tareWeight: 0.5, standardPieceWeight: 40, stockUpper: 5000, stockLower: 500, enabled: true },
  { id: 7, code: 'GD0007', name: '云南蓝莓', pinyin: 'YNLM', category: '蓝莓', quality: 'special', pricingMethod: 'piece', packaging: '泡沫箱', tareWeight: 0.4, standardPieceWeight: 2, stockUpper: 600, stockLower: 60, enabled: false },
]

/* ------------------------------------------------------------------ */
/* 职员（员工）档案                                                      */
/* ------------------------------------------------------------------ */

export type Gender = 'male' | 'female'
export type Education = 'highschool' | 'college' | 'bachelor' | 'master' | 'other'
export type MaritalStatus = 'single' | 'married'
export type EmploymentType = 'fulltime' | 'parttime' | 'intern' | 'contractor'

export type Staff = {
  id: number
  code: string
  employeeNo: string
  name: string
  pinyin: string
  gender: Gender
  /** 出生日期（yyyy-MM-dd）— 年龄由此实时推算 */
  birthday: string
  idCard: string
  nativePlace: string
  education: Education
  maritalStatus: MaritalStatus
  phone: string
  /** 紧急联系人及电话 */
  emergencyContact: string
  emergencyPhone: string
  deptId: number
  position: string
  employmentType: EmploymentType
  /** 入职日期（yyyy-MM-dd）— 工龄由此实时推算 */
  hireDate: string
  enabled: boolean
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: '男',
  female: '女',
}

export const EDUCATION_LABELS: Record<Education, string> = {
  highschool: '高中及以下',
  college: '大专',
  bachelor: '本科',
  master: '硕士及以上',
  other: '其他',
}

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  single: '未婚',
  married: '已婚',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习',
  contractor: '劳务',
}

export const INITIAL_STAFF: Staff[] = [
  { id: 1, code: 'EMP001', employeeNo: 'G0001', name: '张伟', pinyin: 'ZW', gender: 'male', birthday: '1980-05-12', idCard: '610103198005121234', nativePlace: '陕西西安', education: 'master', maritalStatus: 'married', phone: '18800000001', emergencyContact: '刘婷（配偶）', emergencyPhone: '13911112222', deptId: 1, position: '总经理', employmentType: 'fulltime', hireDate: '2015-03-01', enabled: true },
  { id: 2, code: 'EMP002', employeeNo: 'G0002', name: '李强', pinyin: 'LQ', gender: 'male', birthday: '1988-09-23', idCard: '610103198809234567', nativePlace: '河南郑州', education: 'bachelor', maritalStatus: 'married', phone: '18800000002', emergencyContact: '王梅（配偶）', emergencyPhone: '13933334444', deptId: 2, position: '采购主管', employmentType: 'fulltime', hireDate: '2018-06-15', enabled: true },
  { id: 3, code: 'EMP003', employeeNo: 'G0003', name: '刘洋', pinyin: 'LY', gender: 'male', birthday: '1995-02-08', idCard: '610103199502087890', nativePlace: '山东济南', education: 'college', maritalStatus: 'single', phone: '18800000003', emergencyContact: '刘建国（父亲）', emergencyPhone: '13955556666', deptId: 2, position: '采购员', employmentType: 'fulltime', hireDate: '2021-04-10', enabled: true },
  { id: 4, code: 'EMP004', employeeNo: 'G0004', name: '王芳', pinyin: 'WF', gender: 'female', birthday: '1990-11-30', idCard: '610103199011302345', nativePlace: '四川成都', education: 'bachelor', maritalStatus: 'married', phone: '18800000004', emergencyContact: '陈刚（配偶）', emergencyPhone: '13977778888', deptId: 3, position: '仓库主管', employmentType: 'fulltime', hireDate: '2019-08-01', enabled: true },
  { id: 5, code: 'EMP005', employeeNo: 'G0005', name: '黄磊', pinyin: 'HL', gender: 'male', birthday: '1998-07-19', idCard: '610103199807196543', nativePlace: '湖北武汉', education: 'highschool', maritalStatus: 'single', phone: '18800000005', emergencyContact: '黄德华（父亲）', emergencyPhone: '13999990000', deptId: 3, position: '仓库操作员', employmentType: 'fulltime', hireDate: '2022-09-05', enabled: true },
  { id: 6, code: 'EMP006', employeeNo: 'G0006', name: '赵敏', pinyin: 'ZM', gender: 'female', birthday: '1992-03-27', idCard: '610103199203274321', nativePlace: '江苏南京', education: 'bachelor', maritalStatus: 'married', phone: '18800000006', emergencyContact: '孙浩（配偶）', emergencyPhone: '13800001111', deptId: 4, position: '生产主管', employmentType: 'fulltime', hireDate: '2020-02-18', enabled: true },
  { id: 7, code: 'EMP007', employeeNo: 'G0007', name: '孙丽', pinyin: 'SL', gender: 'female', birthday: '2001-12-05', idCard: '610103200112059876', nativePlace: '浙江杭州', education: 'college', maritalStatus: 'single', phone: '18800000011', emergencyContact: '孙志强（父亲）', emergencyPhone: '13822223333', deptId: 6, position: '销售专员', employmentType: 'intern', hireDate: '2024-07-01', enabled: true },
  { id: 8, code: 'EMP008', employeeNo: 'G0008', name: '郑华', pinyin: 'ZH', gender: 'female', birthday: '1993-06-14', idCard: '610103199306145678', nativePlace: '广东广州', education: 'bachelor', maritalStatus: 'married', phone: '18800000009', emergencyContact: '林涛（配偶）', emergencyPhone: '13844445555', deptId: 9, position: '人事专员', employmentType: 'fulltime', hireDate: '2020-11-23', enabled: false },
]

/** 根据出生日期实时推算年龄（周岁）。 */
export function calcAge(birthday: string): number | null {
  if (!birthday) return null
  const b = new Date(birthday)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

/** 根据入职日期实时推算工龄，返回“x年y个月”。 */
export function calcSeniority(hireDate: string): string {
  if (!hireDate) return '-'
  const h = new Date(hireDate)
  if (Number.isNaN(h.getTime())) return '-'
  const now = new Date()
  let months = (now.getFullYear() - h.getFullYear()) * 12 + (now.getMonth() - h.getMonth())
  if (now.getDate() < h.getDate()) months--
  if (months < 0) return '-'
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} 个月`
  if (m === 0) return `${y} 年`
  return `${y} 年 ${m} 个月`
}

/* ------------------------------------------------------------------ */
/* 客户（销货渠道）档案                                                  */
/* ------------------------------------------------------------------ */

export type CustomerType = 'retail' | 'chain' | 'online'

export type Customer = {
  id: number
  code: string
  name: string
  pinyin: string
  type: CustomerType
  contact: string
  phone: string
  address: string
  logistics: string
  /** 账期（天）— 到期未付款系统预警 */
  creditDays: number
  /** 授信额度（元）— 超额时销售打单拦截 */
  creditLimit: number
  /** 当前欠款（元）— 用于额度校验演示 */
  currentDebt: number
  enabled: boolean
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  retail: '档口散客',
  chain: '企业连锁',
  online: '线上渠道',
}

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, code: 'KH0001', name: '百果园', pinyin: 'BGY', type: 'chain', contact: '陈经理', phone: '13600020001', address: '深圳市南山区科技园百果园总部', logistics: '顺丰冷链', creditDays: 30, creditLimit: 200000, currentDebt: 156000, enabled: true },
  { id: 2, code: 'KH0002', name: '盒马鲜生', pinyin: 'HMXS', type: 'online', contact: '林采购', phone: '13600020002', address: '上海市杨浦区盒马生鲜配送中心', logistics: '盒马自营冷链', creditDays: 45, creditLimit: 500000, currentDebt: 210000, enabled: true },
  { id: 3, code: 'KH0003', name: '新发地批发商-老赵', pinyin: 'XFDPFSLZ', type: 'retail', contact: '赵老板', phone: '13600020003', address: '北京市丰台区新发地农产品批发市场B区', logistics: '货运队(冀A货车)', creditDays: 7, creditLimit: 80000, currentDebt: 82000, enabled: true },
  { id: 4, code: 'KH0004', name: '大润发', pinyin: 'DRF', type: 'chain', contact: '周主管', phone: '13600020004', address: '南京市建邺区大润发生鲜采购部', logistics: '第三方冷链', creditDays: 30, creditLimit: 300000, currentDebt: 98000, enabled: true },
  { id: 5, code: 'KH0005', name: '拼多多水果旗舰店', pinyin: 'PDDSGQJD', type: 'online', contact: '客服小王', phone: '13600020005', address: '杭州市余杭区电商产业园', logistics: '中通/圆通', creditDays: 15, creditLimit: 150000, currentDebt: 32000, enabled: true },
  { id: 6, code: 'KH0006', name: '街角水果摊-刘姐', pinyin: 'JJSGTLJ', type: 'retail', contact: '刘姐', phone: '13600020006', address: '成都市武侯区太平园街角', logistics: '自提', creditDays: 0, creditLimit: 5000, currentDebt: 0, enabled: false },
]

/* ------------------------------------------------------------------ */
/* 通用工具                                                             */
/* ------------------------------------------------------------------ */

/** Fuzzy match: name (substring) OR pinyin initials (prefix/substring), case-insensitive. */
export function archiveMatch(keyword: string, name: string, pinyin: string): boolean {
  const k = keyword.trim().toLowerCase()
  if (!k) return true
  return name.toLowerCase().includes(k) || pinyin.toLowerCase().includes(k)
}

/** Filter by the shared status filter. */
export function statusMatch(filter: ArchiveStatusFilter, enabled: boolean): boolean {
  if (filter === 'all') return true
  return filter === 'enabled' ? enabled : !enabled
}

/** Next incremental record code, e.g. SP0001 -> SP0008. */
export function nextCode(prefix: string, existing: string[], pad = 4): string {
  const max = existing.reduce((m, c) => {
    const n = Number(c.replace(prefix, ''))
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}

/** Generate a strong random password for new staff accounts. */
export function generatePassword(len = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digit = '23456789'
  const special = '!@#$%'
  const all = upper + lower + digit + special
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
  const base = [pick(upper), pick(lower), pick(digit), pick(special)]
  for (let i = base.length; i < len; i++) base.push(pick(all))
  return base.sort(() => Math.random() - 0.5).join('')
}
