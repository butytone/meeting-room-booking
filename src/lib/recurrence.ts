/**
 * 根据重复规则与结束日期，生成从 startDate 到 endDate 之间的所有发生日期（YYYY-MM-DD）
 */
export function getRecurrenceDates(
  startDate: string,
  rule: string,
  endDate: string
): string[] {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  if (end < start) return [];

  const dates: string[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");

  switch (rule) {
    case "daily": {
      const d = new Date(start);
      while (d <= end) {
        dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        d.setDate(d.getDate() + 1);
      }
      break;
    }
    case "weekdays": {
      const d = new Date(start);
      while (d <= end) {
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
          dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        }
        d.setDate(d.getDate() + 1);
      }
      break;
    }
    case "weekly": {
      const d = new Date(start);
      while (d <= end) {
        dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        d.setDate(d.getDate() + 7);
      }
      break;
    }
    case "biweekly": {
      const d = new Date(start);
      while (d <= end) {
        dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        d.setDate(d.getDate() + 14);
      }
      break;
    }
    default:
      return [startDate];
  }

  return dates;
}

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** 用于展示的重复规则文案 */
export function getRecurrenceLabel(rule: string | null): string {
  if (!rule) return "";
  const map: Record<string, string> = {
    daily: "每天",
    weekdays: "每个工作日",
    weekly: "每周",
    biweekly: "每两周",
  };
  return map[rule] ?? rule;
}

/** 用于展示：如「每周二 10:00–11:00 至 2025-06-30」 */
export function formatRecurrenceSummary(
  rule: string,
  startDate: string,
  startTime: string,
  endTime: string,
  endDate: string
): string {
  const label = getRecurrenceLabel(rule);
  const d = new Date(startDate + "T12:00:00");
  const dayName = WEEKDAY_NAMES[d.getDay()];
  return `${label}${rule === "weekly" || rule === "biweekly" ? dayName : ""} ${startTime}–${endTime} 至 ${endDate}`;
}
