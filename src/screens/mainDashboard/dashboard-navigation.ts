export function toSafeDashboardHref(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return undefined;
  try {
    let decoded = value;
    for (let pass = 0; pass < 2; pass += 1) decoded = decodeURIComponent(decoded);
    if (decoded.startsWith('//') || [...decoded].some((char) => char === '\\' || char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return undefined;
    const target = new URL(value, 'https://dashboard.invalid');
    return target.origin === 'https://dashboard.invalid' ? value : undefined;
  } catch {
    return undefined;
  }
}
