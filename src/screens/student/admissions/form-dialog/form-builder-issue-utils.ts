export function isJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed));
  } catch {
    return false;
  }
}

export function parseOptions(value?: string | null) {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof (parsed as { source?: unknown }).source === 'string'
    )
      return true;
    if (!Array.isArray(parsed) || parsed.length === 0) return false;
    const values = new Set<string>();
    return parsed.every((item) => {
      const optionValue =
        typeof item === 'string'
          ? item
          : item && typeof item === 'object' && typeof (item as { value?: unknown }).value === 'string'
            ? (item as { value: string }).value
            : '';
      const optionLabel =
        item && typeof item === 'object' && 'label' in item
          ? (item as { label?: unknown }).label
          : undefined;
      if (
        !optionValue.trim() ||
        (optionLabel !== undefined &&
          (typeof optionLabel !== 'string' || !optionLabel.trim())) ||
        values.has(optionValue.toLowerCase())
      )
        return false;
      values.add(optionValue.toLowerCase());
      return true;
    });
  } catch {
    return false;
  }
}

export function extractRuleFields(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as { field?: string; conditions?: unknown[] };
    return [
      ...(parsed.field ? [parsed.field] : []),
      ...(Array.isArray(parsed.conditions)
        ? parsed.conditions.flatMap((item) => extractRuleFields(JSON.stringify(item)))
        : []),
    ];
  } catch {
    return [];
  }
}
