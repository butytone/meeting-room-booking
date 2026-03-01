/**
 * 将 "09:00" 转为分钟数便于比较
 */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * 判断两段时间是否重叠
 * @param aStart "09:00"
 * @param aEnd   "10:30"
 * @param bStart "10:00"
 * @param bEnd   "11:00"
 */
export function timeRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = toMinutes(aStart);
  const aE = toMinutes(aEnd);
  const bS = toMinutes(bStart);
  const bE = toMinutes(bEnd);
  return aS < bE && bS < aE;
}

/**
 * 检查新区间是否与已有区间列表中的任意一个重叠
 */
export function hasConflict(
  start: string,
  end: string,
  existing: { startTime: string; endTime: string }[]
): boolean {
  return existing.some((e) => timeRangesOverlap(start, end, e.startTime, e.endTime));
}
