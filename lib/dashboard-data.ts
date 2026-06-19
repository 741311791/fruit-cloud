// 模拟数据 — 所有金额单位：元。后续可替换为真实接口返回。

export const profitTrend = [
  { date: '06-01', revenue: 184200, cost: 142800, profit: 41400 },
  { date: '06-03', revenue: 196500, cost: 151200, profit: 45300 },
  { date: '06-05', revenue: 172800, cost: 138400, profit: 34400 },
  { date: '06-07', revenue: 211400, cost: 158600, profit: 52800 },
  { date: '06-09', revenue: 205300, cost: 161900, profit: 43400 },
  { date: '06-11', revenue: 228700, cost: 169500, profit: 59200 },
  { date: '06-13', revenue: 198400, cost: 152300, profit: 46100 },
  { date: '06-15', revenue: 243600, cost: 178200, profit: 65400 },
  { date: '06-17', revenue: 219800, cost: 165400, profit: 54400 },
  { date: '06-19', revenue: 256300, cost: 184700, profit: 71600 },
]

export const costBreakdown = [
  { name: '出库成本', value: 1284600, key: 'inventory' },
  { name: '加工费用', value: 386400, key: 'processing' },
  { name: '运费', value: 92800, key: 'freight' },
  { name: '固定支出', value: 148000, key: 'fixed' },
  { name: '报销支出', value: 36500, key: 'reimburse' },
]

export const topMargin = [
  { name: '赣南脐橙·精品', margin: 168400, rate: 32.4 },
  { name: '海南金钻凤梨', margin: 142600, rate: 28.7 },
  { name: '阳光玫瑰葡萄', margin: 121800, rate: 26.1 },
  { name: '烟台红富士', margin: 98300, rate: 21.5 },
  { name: '泰国椰青', margin: 86700, rate: 19.8 },
]

export const negativeMargin = [
  { name: '进口车厘子J', margin: -38600, rate: -8.2 },
  { name: '麒麟西瓜', margin: -21400, rate: -5.6 },
  { name: '海南香蕉', margin: -12800, rate: -3.1 },
  { name: '红心火龙果', margin: -7300, rate: -1.9 },
]

export const laborEfficiency = [
  { name: '一号分拣线', output: 4280, cost: 28600, perCapita: 856 },
  { name: '二号包装线', output: 3640, cost: 24200, perCapita: 728 },
  { name: '鲜切加工组', output: 2980, cost: 31500, perCapita: 596 },
  { name: '冷链预处理', output: 2410, cost: 19800, perCapita: 482 },
  { name: '质检复核组', output: 1860, cost: 16400, perCapita: 372 },
]

export const supplierRanking = [
  { name: '云南鲜源农业', amount: 684500, share: 24.6 },
  { name: '海南果业合作社', amount: 512300, share: 18.4 },
  { name: '赣州脐橙基地', amount: 438700, share: 15.8 },
  { name: '烟台果品集团', amount: 356200, share: 12.8 },
  { name: '泰国进口直采', amount: 284600, share: 10.2 },
]

export const returnRanking = [
  { name: '进口车厘子J', amount: 42600, count: 38 },
  { name: '红心火龙果', amount: 28400, count: 56 },
  { name: '麒麟西瓜', amount: 19800, count: 22 },
  { name: '海南香蕉', amount: 12300, count: 41 },
]

export const inventoryTurnover = [
  { name: '柑橘类', turnover: 8.4, days: 4.3 },
  { name: '浆果类', turnover: 11.2, days: 3.2 },
  { name: '瓜果类', turnover: 6.1, days: 6.0 },
  { name: '热带水果', turnover: 9.7, days: 3.8 },
  { name: '鲜切产品', turnover: 14.6, days: 2.5 },
]

export const oemTrend = [
  { date: '第1周', income: 86400, cost: 52300 },
  { date: '第2周', income: 92800, cost: 56700 },
  { date: '第3周', income: 78600, cost: 49200 },
  { date: '第4周', income: 104500, cost: 61800 },
]

export const fixedCostRecords = [
  { id: 1, type: '房租', amount: 68000, date: '2026-06-01', note: '加工厂区6月租金' },
  { id: 2, type: '水电费', amount: 42600, date: '2026-06-05', note: '冷库 + 生产线' },
  { id: 3, type: '运费', amount: 28400, date: '2026-06-10', note: '冷链干线运输' },
  { id: 4, type: '其他', amount: 9000, date: '2026-06-12', note: '设备维护' },
]
