export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function readText(value: unknown, maxLength = 2000): string | undefined {
  return typeof value === 'string' && value.trim() && value.length <= maxLength ? value.trim() : undefined;
}

export function readNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER ? value : undefined;
}

export function readEnum<T extends string>(value: unknown, choices: readonly T[]): T | undefined {
  return typeof value === 'string' && choices.includes(value as T) ? value as T : undefined;
}

export function readList<T>(value: unknown, max: number, parse: (item: unknown) => T | undefined): T[] | undefined {
  if (!Array.isArray(value) || value.length > max) return undefined;
  const results = value.map(parse);
  return results.every((result): result is T => result !== undefined) ? results : undefined;
}

export function readDate(value: unknown): string | undefined {
  const text = readText(value, 100);
  return text && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) && Number.isFinite(Date.parse(text)) ? text : undefined;
}
