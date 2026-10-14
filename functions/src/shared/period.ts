export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${m}-${day}`;
}

export function getPeriodStartForType(
  date: Date,
  type?: "monthly" | "weekly" | "general" | ""
): string | null {
  if (!type) return null;
  if (type === "monthly") {
    const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
    return formatISODate(start);
  }
  if (type === "weekly") {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setUTCDate(diff));
    sunday.setUTCHours(0, 0, 0, 0);
    return formatISODate(sunday);
  }
  return null;
}

export function getNowInBrasilia(): Date {
  const now = new Date();

  const localOffsetInMs = now.getTimezoneOffset() * 60 * 1000;
  const brasiliaOffsetInMs = -3 * 60 * 60 * 1000;
  const utcTime = now.getTime() + localOffsetInMs;
  return new Date(utcTime + brasiliaOffsetInMs);
}
