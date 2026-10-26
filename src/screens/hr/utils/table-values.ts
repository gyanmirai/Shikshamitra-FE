/** Hours worked arrive as decimal hours or HH:mm[:ss], never as a business date. */
export function durationHours(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  const parts = /^(\d+):(\d{2})(?::(\d{2}))?$/.exec(text);
  if (parts) {
    if (Number(parts[2]) > 59 || Number(parts[3] || 0) > 59) return null;
    return Number(parts[1]) + Number(parts[2]) / 60 + Number(parts[3] || 0) / 3600;
  }
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
