export function parseTimeRange(timeStr: string): { start: number; end: number } {
  const [start, end] = timeStr.split('-')
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  return { start: toMinutes(start), end: toMinutes(end) }
}

export function getCurrentPeriodIndex(periods: { time: string; type: string }[]): number {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return periods.findIndex((p) => {
    const { start, end } = parseTimeRange(p.time)
    return currentMinutes >= start && currentMinutes < end
  })
}
