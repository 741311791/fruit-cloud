export function formatYuan(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 10000) {
    return `${sign}¥${(abs / 10000).toFixed(1)}万`
  }
  return `${sign}¥${abs.toLocaleString('zh-CN')}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
