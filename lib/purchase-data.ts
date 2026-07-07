/**
 * 采购单管理 (Purchase Order) data models, seed data, and business helpers.
 *
 * Domain notes for the 农产品 (fresh-produce) purchasing scenario:
 *  - Non-standard goods are weighed; net weight is derived from gross weight
 *    minus per-piece tare and impurity deduction:
 *      净重 = 毛重 - (件数 × 皮重) - 扣杂
 *      金额 = 净重 × 单价
 *  - Each product carries a 指导价 (guide price); a line whose unit price
 *    deviates > ±20% is flagged as a 价格异常 (price anomaly) for review.
 *  - Suppliers may carry a 预付款余额 (prepaid balance) that can be deducted;
 *    deducting more than the balance is blocked at submission time.
 */

export type PurchaseStatus = 'draft' | 'pending' | 'rejected' | 'completed'

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  rejected: '已驳回',
  completed: '已完成',
}

/** 交货工厂 (delivery factories). */
export type Factory = { id: number; name: string }

export const FACTORIES: Factory[] = [
  { id: 1, name: '长丰草莓加工厂' },
  { id: 2, name: '蒲江猕猴桃分选中心' },
  { id: 3, name: '秦岭鲜果冷链仓' },
  { id: 4, name: '云岭生态预处理厂' },
]

/**
 * 价格行情指导价（元/斤 或 元/件，与商品计价方式一致）。
 * 采购录入单价偏离该值 ±20% 触发价格异常预警。
 */
export const GUIDE_PRICES: Record<number, number> = {
  1: 6.5, // 徐香猕猴桃
  2: 7.2, // 红阳猕猴桃
  3: 18, // 奶油草莓（按件）
  4: 4.2, // 烟台红富士
  5: 12, // 阳光玫瑰葡萄（按件）
  6: 3.6, // 赣南脐橙
  7: 9, // 云南蓝莓（按件）
}

export const PRICE_ANOMALY_THRESHOLD = 0.2

export type PurchaseLine = {
  key: string
  productId: number | null
  productName: string
  /** 计价单位：斤 / 件（跟随商品档案） */
  unit: string
  pieces: number
  grossWeight: number
  tareWeight: number
  impurity: number
  unitPrice: number
}

export type PurchaseOrder = {
  id: number
  code: string
  supplierId: number
  supplierName: string
  supplierPhone: string
  factoryId: number
  factoryName: string
  date: string
  status: PurchaseStatus
  lines: PurchaseLine[]
  /** 是否抵扣预付款 */
  deductPrepaid: boolean
  /** 抵扣金额（元） */
  deductAmount: number
  remark: string
  createdBy: string
  createdAt: string
  /** 驳回原因（status = rejected 时） */
  rejectReason?: string
}

/* ------------------------------------------------------------------ */
/* 行 / 单据 计算                                                        */
/* ------------------------------------------------------------------ */

/** 净重 = 毛重 - (件数 × 皮重) - 扣杂，结果不小于 0。 */
export function lineNetWeight(l: PurchaseLine): number {
  const net = l.grossWeight - l.pieces * l.tareWeight - l.impurity
  return Math.max(0, Number(net.toFixed(2)))
}

/** 金额 = 净重 × 单价。 */
export function lineAmount(l: PurchaseLine): number {
  return Number((lineNetWeight(l) * l.unitPrice).toFixed(2))
}

/** 单行是否价格异常（偏离指导价 ±20%）。无指导价或未填单价时不判定。 */
export function lineHasPriceAnomaly(l: PurchaseLine): boolean {
  if (!l.productId || l.unitPrice <= 0) return false
  const guide = GUIDE_PRICES[l.productId]
  if (!guide) return false
  return Math.abs(l.unitPrice - guide) / guide > PRICE_ANOMALY_THRESHOLD
}

export type OrderTotals = {
  pieces: number
  gross: number
  net: number
  amount: number
}

export function orderTotals(lines: PurchaseLine[]): OrderTotals {
  return lines.reduce<OrderTotals>(
    (acc, l) => ({
      pieces: acc.pieces + (Number(l.pieces) || 0),
      gross: Number((acc.gross + (Number(l.grossWeight) || 0)).toFixed(2)),
      net: Number((acc.net + lineNetWeight(l)).toFixed(2)),
      amount: Number((acc.amount + lineAmount(l)).toFixed(2)),
    }),
    { pieces: 0, gross: 0, net: 0, amount: 0 },
  )
}

export function orderHasAnomaly(o: PurchaseOrder): boolean {
  return o.lines.some(lineHasPriceAnomaly)
}

/** 单据实付 = 货款总额 - 抵扣预付款。 */
export function orderPayable(o: PurchaseOrder): number {
  const total = orderTotals(o.lines).amount
  const deduct = o.deductPrepaid ? o.deductAmount : 0
  return Number(Math.max(0, total - deduct).toFixed(2))
}

/* ------------------------------------------------------------------ */
/* 工具                                                                 */
/* ------------------------------------------------------------------ */

/** 采购单号：PO + yyyyMMdd + 两位流水。 */
export function nextOrderCode(existing: string[]): string {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const prefix = `PO${stamp}`
  const max = existing
    .filter((c) => c.startsWith(prefix))
    .reduce((m, c) => {
      const n = Number(c.slice(prefix.length))
      return Number.isFinite(n) && n > m ? n : m
    }, 0)
  return `${prefix}${String(max + 1).padStart(2, '0')}`
}

/** 金额转人民币大写（防篡改，打印用）。 */
export function amountToChinese(n: number): string {
  if (!Number.isFinite(n)) return ''
  if (n === 0) return '零元整'
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const intUnits = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿', '兆']
  const negative = n < 0
  const fixed = Math.abs(n).toFixed(2)
  const [intPart, decPart] = fixed.split('.')

  let intText = ''
  if (Number(intPart) === 0) {
    intText = '零'
  } else {
    const groups: string[] = []
    let rest = intPart
    while (rest.length > 0) {
      groups.unshift(rest.slice(-4))
      rest = rest.slice(0, -4)
    }
    groups.forEach((group, gi) => {
      const padded = group.padStart(4, '0')
      let section = ''
      let zeroFlag = false
      for (let i = 0; i < 4; i++) {
        const d = Number(padded[i])
        const unit = intUnits[3 - i]
        if (d === 0) {
          zeroFlag = true
        } else {
          if (zeroFlag) section += '零'
          zeroFlag = false
          section += digits[d] + unit
        }
      }
      const bigUnit = bigUnits[groups.length - 1 - gi]
      if (section) intText += section + bigUnit
      else if (intText && !intText.endsWith('零') && gi < groups.length - 1) intText += '零'
    })
  }

  let decText = ''
  const jiao = Number(decPart[0])
  const fen = Number(decPart[1])
  if (jiao === 0 && fen === 0) {
    decText = '整'
  } else {
    if (jiao > 0) decText += digits[jiao] + '角'
    if (fen > 0) decText += digits[fen] + '分'
    else if (jiao > 0) decText += '整'
  }

  return `${negative ? '负' : ''}${intText}元${decText}`
}

/* ------------------------------------------------------------------ */
/* 种子数据                                                             */
/* ------------------------------------------------------------------ */

function mkLine(
  key: string,
  productId: number,
  productName: string,
  unit: string,
  pieces: number,
  grossWeight: number,
  tareWeight: number,
  impurity: number,
  unitPrice: number,
): PurchaseLine {
  return { key, productId, productName, unit, pieces, grossWeight, tareWeight, impurity, unitPrice }
}

export const INITIAL_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    code: 'PO2026070801',
    supplierId: 1,
    supplierName: '李大娘',
    supplierPhone: '13700010001',
    factoryId: 1,
    factoryName: '长丰草莓加工厂',
    date: '2026-07-08',
    status: 'draft',
    lines: [mkLine('l1', 3, '奶油草莓', '件', 40, 180, 0.6, 2, 18)],
    deductPrepaid: false,
    deductAmount: 0,
    remark: '早市收购，果品新鲜',
    createdBy: '刘洋',
    createdAt: '2026-07-08 07:20',
  },
  {
    id: 2,
    code: 'PO2026070712',
    supplierId: 4,
    supplierName: '秦岭鲜果基地',
    supplierPhone: '13700010004',
    factoryId: 3,
    factoryName: '秦岭鲜果冷链仓',
    date: '2026-07-07',
    status: 'pending',
    lines: [
      mkLine('l1', 1, '徐香猕猴桃', '斤', 30, 1200, 3.5, 10, 6.4),
      mkLine('l2', 2, '红阳猕猴桃', '斤', 20, 820, 3.5, 8, 7.1),
    ],
    deductPrepaid: true,
    deductAmount: 5000,
    remark: '',
    createdBy: '刘洋',
    createdAt: '2026-07-07 15:40',
  },
  {
    id: 3,
    code: 'PO2026070705',
    supplierId: 2,
    supplierName: '周家庄合作社',
    supplierPhone: '13700010002',
    factoryId: 2,
    factoryName: '蒲江猕猴桃分选中心',
    date: '2026-07-07',
    status: 'completed',
    lines: [mkLine('l1', 4, '烟台红富士', '斤', 60, 3000, 1.2, 20, 4.15)],
    deductPrepaid: false,
    deductAmount: 0,
    remark: '按合同价收购',
    createdBy: '李强',
    createdAt: '2026-07-07 09:10',
  },
  {
    id: 4,
    code: 'PO2026070621',
    supplierId: 3,
    supplierName: '王老三',
    supplierPhone: '13700010003',
    factoryId: 1,
    factoryName: '长丰草莓加工厂',
    date: '2026-07-06',
    status: 'rejected',
    lines: [mkLine('l1', 3, '奶油草莓', '件', 25, 110, 0.6, 1, 26)],
    deductPrepaid: false,
    deductAmount: 0,
    remark: '',
    createdBy: '刘洋',
    createdAt: '2026-07-06 18:05',
    rejectReason: '单价 26 元/件明显高于指导价 18 元/件，请核实后重新提交。',
  },
  {
    id: 5,
    code: 'PO2026070615',
    supplierId: 7,
    supplierName: '云岭生态农业',
    supplierPhone: '13700010007',
    factoryId: 4,
    factoryName: '云岭生态预处理厂',
    date: '2026-07-06',
    status: 'completed',
    lines: [mkLine('l1', 7, '云南蓝莓', '件', 50, 100, 0.4, 2, 8.8)],
    deductPrepaid: true,
    deductAmount: 3000,
    remark: '冷链直发',
    createdBy: '赵敏',
    createdAt: '2026-07-06 11:30',
  },
]
