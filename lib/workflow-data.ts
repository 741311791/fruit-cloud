/**
 * 审批流 (Approval Workflow) data models, seed data, and helpers.
 *
 * Two concerns live here:
 *  1. 审批流配置 (admin side) — WorkflowProcess: which business doc triggers
 *     which chain of approval nodes, plus optional advanced escalation
 *     conditions (金额 / 损耗率 / 统货扣减比例) tailored to the fresh-produce
 *     purchasing scenario.
 *  2. 我的待办 (user side) — ApprovalInstance: a live document flowing through
 *     the chain, bucketed relative to the current user (待我处理 / 我已处理 /
 *     我发起的 / 抄送我的) with a timeline and read-only business snapshot.
 */

/* ------------------------------------------------------------------ */
/* 关联业务单据                                                          */
/* ------------------------------------------------------------------ */

export type BusinessDoc =
  | 'purchase-order'
  | 'purchase-request'
  | 'sales-order'
  | 'warehouse-count'
  | 'hr-reimburse'
  | 'hr-attendance'

export const BUSINESS_DOC_LABELS: Record<BusinessDoc, string> = {
  'purchase-order': '采购单',
  'purchase-request': '请购单',
  'sales-order': '销售订单',
  'warehouse-count': '盘点单',
  'hr-reimburse': '报销申请',
  'hr-attendance': '请假申请',
}

/* ------------------------------------------------------------------ */
/* 审批人配置                                                            */
/* ------------------------------------------------------------------ */

/** 审批人指定方式：角色 / 岗位 / 相对关系（上级）/ 指定人。 */
export type ApproverType = 'role' | 'position' | 'superior' | 'user'

export const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
  role: '按角色',
  position: '按岗位',
  superior: '相对关系',
  user: '指定人',
}

/** 多人审批策略：或签（一人通过即可）/ 会签（须全部通过）。 */
export type MultiPolicy = 'or' | 'and'

export const MULTI_POLICY_LABELS: Record<MultiPolicy, string> = {
  or: '或签（一人通过即可）',
  and: '会签（须全部通过）',
}

/** 候选审批人（用于下拉选择）。 */
export const APPROVER_CANDIDATES: Record<ApproverType, string[]> = {
  role: ['采购主管', '仓库主管', '生产主管', '销售主管', '财务主管', '人事主管'],
  position: ['部门负责人', '财务岗', '总经理', '董事长'],
  superior: ['发起人的直接上级', '发起人的部门负责人', '发起人的上级的上级'],
  user: ['张伟（总经理）', '李强（采购主管）', '王芳（仓库主管）', '赵敏（生产主管）', '王五（财务总监）'],
}

/* ------------------------------------------------------------------ */
/* 高级触发条件（鲜果云特有）                                             */
/* ------------------------------------------------------------------ */

/** 触发字段：采购金额 / 损耗率 / 统货扣件比例。 */
export type TriggerField = 'amount' | 'lossRate' | 'tareRatio'

export const TRIGGER_FIELD_LABELS: Record<TriggerField, string> = {
  amount: '采购金额（元）',
  lossRate: '损耗率（%）',
  tareRatio: '统货扣件比例（%）',
}

export type TriggerOperator = 'gte' | 'lt'

export const TRIGGER_OPERATOR_LABELS: Record<TriggerOperator, string> = {
  gte: '大于等于 ≥',
  lt: '小于 <',
}

/** 高级触发：命中后强制加签到指定审批人（如老板亲审）。 */
export type AdvancedTrigger = {
  enabled: boolean
  field: TriggerField
  operator: TriggerOperator
  value: number
  /** 命中后追加的审批人（显示名）。 */
  escalateTo: string
}

/* ------------------------------------------------------------------ */
/* 审批节点 & 流程                                                       */
/* ------------------------------------------------------------------ */

export type ApprovalStep = {
  id: string
  /** 节点名称，如「采购主管审批」。 */
  name: string
  approverType: ApproverType
  /** 审批人显示名（对应候选项）。 */
  approver: string
  multiPolicy: MultiPolicy
}

export type WorkflowProcess = {
  id: number
  name: string
  doc: BusinessDoc
  version: number
  updatedBy: string
  updatedAt: string
  enabled: boolean
  /** 发起人节点说明（自动带出提交人）。 */
  initiatorNote: string
  steps: ApprovalStep[]
  advancedTrigger: AdvancedTrigger
}

let stepSeq = 0
export function newStep(): ApprovalStep {
  stepSeq += 1
  return {
    id: `st-${Date.now()}-${stepSeq}`,
    name: '',
    approverType: 'role',
    approver: '采购主管',
    multiPolicy: 'or',
  }
}

export function defaultTrigger(): AdvancedTrigger {
  return { enabled: false, field: 'amount', operator: 'gte', value: 10000, escalateTo: '张伟（总经理）' }
}

/** 流程节点数（含发起人 + 各审批节点 + 命中的高级加签）。 */
export function stepCount(p: WorkflowProcess): number {
  return 1 + p.steps.length + (p.advancedTrigger.enabled ? 1 : 0)
}

export function describeTrigger(t: AdvancedTrigger): string {
  return `当${TRIGGER_FIELD_LABELS[t.field]} ${TRIGGER_OPERATOR_LABELS[t.operator]} ${t.value} 时，加签「${t.escalateTo}」`
}

export const INITIAL_PROCESSES: WorkflowProcess[] = [
  {
    id: 1,
    name: '采购单标准审批流',
    doc: 'purchase-order',
    version: 3,
    updatedBy: '张伟',
    updatedAt: '2026-07-06 10:24',
    enabled: true,
    initiatorNote: '采购员提交采购单时自动触发',
    steps: [
      { id: 'p1s1', name: '采购主管审批', approverType: 'role', approver: '采购主管', multiPolicy: 'or' },
      { id: 'p1s2', name: '财务复核', approverType: 'position', approver: '财务岗', multiPolicy: 'and' },
    ],
    advancedTrigger: {
      enabled: true,
      field: 'tareRatio',
      operator: 'gte',
      value: 20,
      escalateTo: '张伟（总经理）',
    },
  },
  {
    id: 2,
    name: '请购单审批流',
    doc: 'purchase-request',
    version: 1,
    updatedBy: '李强',
    updatedAt: '2026-07-05 16:10',
    enabled: true,
    initiatorNote: '各部门提交请购申请时触发',
    steps: [
      { id: 'p2s1', name: '部门负责人审批', approverType: 'superior', approver: '发起人的部门负责人', multiPolicy: 'or' },
      { id: 'p2s2', name: '采购主管审批', approverType: 'role', approver: '采购主管', multiPolicy: 'or' },
    ],
    advancedTrigger: defaultTrigger(),
  },
  {
    id: 3,
    name: '销售订单审批流',
    doc: 'sales-order',
    version: 2,
    updatedBy: '王芳',
    updatedAt: '2026-07-04 09:32',
    enabled: false,
    initiatorNote: '销售专员提交销售订单时触发',
    steps: [
      { id: 'p3s1', name: '销售主管审批', approverType: 'role', approver: '销售主管', multiPolicy: 'or' },
    ],
    advancedTrigger: {
      enabled: true,
      field: 'amount',
      operator: 'gte',
      value: 50000,
      escalateTo: '王五（财务总监）',
    },
  },
  {
    id: 4,
    name: '报销审批流',
    doc: 'hr-reimburse',
    version: 5,
    updatedBy: '郑华',
    updatedAt: '2026-07-03 14:05',
    enabled: true,
    initiatorNote: '员工提交报销申请时触发',
    steps: [
      { id: 'p4s1', name: '直接上级审批', approverType: 'superior', approver: '发起人的直接上级', multiPolicy: 'or' },
      { id: 'p4s2', name: '财务审批', approverType: 'position', approver: '财务岗', multiPolicy: 'or' },
      { id: 'p4s3', name: '总经理审批', approverType: 'position', approver: '总经理', multiPolicy: 'or' },
    ],
    advancedTrigger: {
      enabled: true,
      field: 'amount',
      operator: 'gte',
      value: 5000,
      escalateTo: '张伟（总经理）',
    },
  },
  {
    id: 5,
    name: '请假审批流',
    doc: 'hr-attendance',
    version: 1,
    updatedBy: '郑华',
    updatedAt: '2026-07-02 11:48',
    enabled: true,
    initiatorNote: '员工提交请假申请时触发',
    steps: [
      { id: 'p5s1', name: '直接上级审批', approverType: 'superior', approver: '发起人的直接上级', multiPolicy: 'or' },
    ],
    advancedTrigger: defaultTrigger(),
  },
]

/* ------------------------------------------------------------------ */
/* 我的待办 — 审批实例                                                    */
/* ------------------------------------------------------------------ */

/** 当前登录用户（用于将待办分栏）。示例设为财务总监，可审可发可被抄送。 */
export const CURRENT_USER = '王五（财务总监）'

export type TaskBucket = 'pending' | 'approved' | 'mine' | 'cc'

export const BUCKET_LABELS: Record<TaskBucket, string> = {
  pending: '待我处理',
  approved: '我已处理',
  mine: '我发起的',
  cc: '抄送我的',
}

export type InstanceStatus = 'processing' | 'approved' | 'rejected'

export const INSTANCE_STATUS_LABELS: Record<InstanceStatus, string> = {
  processing: '审批中',
  approved: '已通过',
  rejected: '已驳回',
}

export type TimelineAction = 'submit' | 'approve' | 'reject' | 'transfer' | 'pending' | 'cc'

export const TIMELINE_ACTION_LABELS: Record<TimelineAction, string> = {
  submit: '发起',
  approve: '已同意',
  reject: '已驳回',
  transfer: '转办',
  pending: '待处理',
  cc: '抄送',
}

export type TimelineEntry = {
  actor: string
  role: string
  action: TimelineAction
  time?: string
  comment?: string
}

/** 只读业务快照的一行明细。 */
export type SnapshotLine = { name: string; pieces: number; net: number; amount: number }

export type BusinessSnapshot = {
  /** 概要字段（键值对），如 农户 / 交货工厂 / 日期。 */
  fields: { label: string; value: string }[]
  /** 明细行（采购/销售类单据）。 */
  lines?: SnapshotLine[]
  totalPieces?: number
  totalNet?: number
  totalAmount?: number
}

export type ApprovalInstance = {
  id: number
  docType: BusinessDoc
  docCode: string
  title: string
  submittedBy: string
  submittedAt: string
  amount: number
  /** 当前处理节点名称。 */
  currentNode: string
  status: InstanceStatus
  bucket: TaskBucket
  /** 是否未读（用于红点提示）。 */
  unread?: boolean
  snapshot: BusinessSnapshot
  timeline: TimelineEntry[]
  ccUsers: string[]
}

export const INITIAL_INSTANCES: ApprovalInstance[] = [
  {
    id: 1,
    docType: 'purchase-order',
    docCode: 'PO2026070712',
    title: '采购单审批 · 秦岭鲜果基地',
    submittedBy: '刘洋（采购员）',
    submittedAt: '2026-07-07 15:40',
    amount: 13462,
    currentNode: '财务复核',
    status: 'processing',
    bucket: 'pending',
    unread: true,
    snapshot: {
      fields: [
        { label: '供应商（农户）', value: '秦岭鲜果基地' },
        { label: '交货工厂', value: '秦岭鲜果冷链仓' },
        { label: '采购日期', value: '2026-07-07' },
        { label: '结算方式', value: '账期结算' },
      ],
      lines: [
        { name: '徐香猕猴桃', pieces: 30, net: 1085, amount: 6944 },
        { name: '红阳猕猴桃', pieces: 20, net: 742, amount: 5268 },
      ],
      totalPieces: 50,
      totalNet: 1827,
      totalAmount: 13462,
    },
    timeline: [
      { actor: '刘洋', role: '采购员', action: 'submit', time: '2026-07-07 15:40', comment: '早市收购，货品新鲜' },
      { actor: '李强', role: '采购主管', action: 'approve', time: '2026-07-07 16:12', comment: '价格合理，同意' },
      { actor: '王五', role: '财务总监', action: 'pending' },
    ],
    ccUsers: ['张伟（总经理）'],
  },
  {
    id: 2,
    docType: 'hr-reimburse',
    docCode: 'BX2026070603',
    title: '报销申请 · 差旅费',
    submittedBy: '孙丽（销售专员）',
    submittedAt: '2026-07-06 09:15',
    amount: 6800,
    currentNode: '财务审批',
    status: 'processing',
    bucket: 'pending',
    unread: true,
    snapshot: {
      fields: [
        { label: '报销类别', value: '差旅费' },
        { label: '申请部门', value: '销售部' },
        { label: '发生日期', value: '2026-06-28 ~ 07-02' },
        { label: '报销金额', value: '¥6,800.00' },
        { label: '事由', value: '华东区客户拜访差旅（高铁+住宿+餐补）' },
      ],
    },
    timeline: [
      { actor: '孙丽', role: '销售专员', action: 'submit', time: '2026-07-06 09:15', comment: '附发票 8 张' },
      { actor: '周敏', role: '销售主管', action: 'approve', time: '2026-07-06 10:02', comment: '属实，同意' },
      { actor: '王五', role: '财务总监', action: 'pending' },
    ],
    ccUsers: ['郑华（人事专员）'],
  },
  {
    id: 3,
    docType: 'purchase-order',
    docCode: 'PO2026070621',
    title: '采购单审批 · 王老三',
    submittedBy: '刘洋（采购员）',
    submittedAt: '2026-07-06 18:05',
    amount: 2834,
    currentNode: '已结束',
    status: 'rejected',
    bucket: 'approved',
    snapshot: {
      fields: [
        { label: '供应商（农户）', value: '王老三' },
        { label: '交货工厂', value: '长丰草莓加工厂' },
        { label: '采购日期', value: '2026-07-06' },
      ],
      lines: [{ name: '奶油草莓', pieces: 25, net: 94, amount: 2834 }],
      totalPieces: 25,
      totalNet: 94,
      totalAmount: 2834,
    },
    timeline: [
      { actor: '刘洋', role: '采购员', action: 'submit', time: '2026-07-06 18:05' },
      { actor: '李强', role: '采购主管', action: 'approve', time: '2026-07-06 18:40' },
      { actor: '王五', role: '财务总监', action: 'reject', time: '2026-07-06 19:10', comment: '单价 26 元/件明显高于指导价 18 元/件，请核实后重新提交' },
    ],
    ccUsers: [],
  },
  {
    id: 4,
    docType: 'sales-order',
    docCode: 'SO2026070508',
    title: '销售订单审批 · 优鲜配送',
    submittedBy: '周敏（销售主管）',
    submittedAt: '2026-07-05 14:20',
    amount: 68200,
    currentNode: '已结束',
    status: 'approved',
    bucket: 'approved',
    snapshot: {
      fields: [
        { label: '客户', value: '优鲜配送（连锁）' },
        { label: '交货日期', value: '2026-07-10' },
        { label: '结算方式', value: '月结 30 天' },
      ],
      lines: [
        { name: '奶油草莓', pieces: 200, net: 760, amount: 30400 },
        { name: '阳光玫瑰葡萄', pieces: 180, net: 900, amount: 37800 },
      ],
      totalPieces: 380,
      totalNet: 1660,
      totalAmount: 68200,
    },
    timeline: [
      { actor: '周敏', role: '销售主管', action: 'submit', time: '2026-07-05 14:20' },
      { actor: '王五', role: '财务总监', action: 'approve', time: '2026-07-05 15:36', comment: '大额订单，授信充足，同意' },
    ],
    ccUsers: ['张伟（总经理）'],
  },
  {
    id: 5,
    docType: 'hr-reimburse',
    docCode: 'BX2026070801',
    title: '报销申请 · 业务招待费',
    submittedBy: '王五（财务总监）',
    submittedAt: '2026-07-08 08:30',
    amount: 3200,
    currentNode: '总经理审批',
    status: 'processing',
    bucket: 'mine',
    snapshot: {
      fields: [
        { label: '报销类别', value: '业务招待费' },
        { label: '申请部门', value: '财务部' },
        { label: '发生日期', value: '2026-07-07' },
        { label: '报销金额', value: '¥3,200.00' },
        { label: '事由', value: '重要供应商年度洽谈晚宴' },
      ],
    },
    timeline: [
      { actor: '王五', role: '财务总监', action: 'submit', time: '2026-07-08 08:30' },
      { actor: '张伟', role: '总经理', action: 'pending' },
    ],
    ccUsers: [],
  },
  {
    id: 6,
    docType: 'hr-attendance',
    docCode: 'QJ2026070402',
    title: '请假申请 · 年假',
    submittedBy: '王五（财务总监）',
    submittedAt: '2026-07-04 17:00',
    amount: 0,
    currentNode: '已结束',
    status: 'approved',
    bucket: 'mine',
    snapshot: {
      fields: [
        { label: '请假类型', value: '年假' },
        { label: '请假时段', value: '2026-07-11 ~ 07-12（2 天）' },
        { label: '事由', value: '家中有事，年假处理' },
      ],
    },
    timeline: [
      { actor: '王五', role: '财务总监', action: 'submit', time: '2026-07-04 17:00' },
      { actor: '张伟', role: '总经理', action: 'approve', time: '2026-07-04 17:20', comment: '准假' },
    ],
    ccUsers: [],
  },
  {
    id: 7,
    docType: 'purchase-order',
    docCode: 'PO2026070615',
    title: '采购单审批 · 云岭生态农业',
    submittedBy: '赵敏（生产主管）',
    submittedAt: '2026-07-06 11:30',
    amount: 8624,
    currentNode: '已结束',
    status: 'approved',
    bucket: 'cc',
    unread: true,
    snapshot: {
      fields: [
        { label: '供应商（农户）', value: '云岭生态农业' },
        { label: '交货工厂', value: '云岭生态预处理厂' },
        { label: '采购日期', value: '2026-07-06' },
      ],
      lines: [{ name: '云南蓝莓', pieces: 50, net: 98, amount: 8624 }],
      totalPieces: 50,
      totalNet: 98,
      totalAmount: 8624,
    },
    timeline: [
      { actor: '赵敏', role: '生产主管', action: 'submit', time: '2026-07-06 11:30' },
      { actor: '李强', role: '采购主管', action: 'approve', time: '2026-07-06 12:05', comment: '冷链直发，同意' },
    ],
    ccUsers: [CURRENT_USER],
  },
  {
    id: 8,
    docType: 'purchase-request',
    docCode: 'QG2026070701',
    title: '请购单审批 · 包装耗材',
    submittedBy: '王芳（仓库主管）',
    submittedAt: '2026-07-07 10:12',
    amount: 12600,
    currentNode: '已结束',
    status: 'approved',
    bucket: 'cc',
    snapshot: {
      fields: [
        { label: '请购部门', value: '仓储部' },
        { label: '需求日期', value: '2026-07-15' },
        { label: '用途', value: '猕猴桃分选包装礼盒补货' },
        { label: '预估金额', value: '¥12,600.00' },
      ],
    },
    timeline: [
      { actor: '王芳', role: '仓库主管', action: 'submit', time: '2026-07-07 10:12' },
      { actor: '王芳', role: '仓库主管', action: 'approve', time: '2026-07-07 10:12' },
      { actor: '李强', role: '采购主管', action: 'approve', time: '2026-07-07 13:28', comment: '已转采购下单' },
    ],
    ccUsers: [CURRENT_USER],
  },
]
