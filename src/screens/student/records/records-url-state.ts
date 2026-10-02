export function positivePageValue(raw: string | null, fallback: number, maximum: number) {
  const value = Number(raw);
  return raw !== null && Number.isInteger(value) && value >= 0 && value <= maximum
    ? value
    : fallback;
}

export function recordsQueryUrl(
  pathname: string,
  current: string,
  changes: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams(current);
  Object.entries(changes).forEach(([key, value]) => {
    if (value === undefined || value === '') params.delete(key);
    else params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
