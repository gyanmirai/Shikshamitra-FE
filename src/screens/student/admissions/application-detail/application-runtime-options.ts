type RuntimeChoiceOption = { value: string; label: string };

type ResolveOptionsInput = {
  configuredOptionsJson?: string | null;
  resolvedOptionsJson?: string;
  currentValue: string;
  multiple: boolean;
};

export function parseRuntimeOptionsSource(
  value?: string | null
): { source: string; parentField?: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { source?: unknown; parentField?: unknown };
    return parsed && typeof parsed.source === 'string'
      ? {
          source: parsed.source,
          parentField: typeof parsed.parentField === 'string' ? parsed.parentField : undefined,
        }
      : null;
  } catch {
    return null;
  }
}

export function resolveRuntimeOptionsJson({
  configuredOptionsJson,
  resolvedOptionsJson,
  currentValue,
  multiple,
}: ResolveOptionsInput): string | null | undefined {
  if (!parseRuntimeOptionsSource(configuredOptionsJson)) return configuredOptionsJson;

  const options = readOptions(resolvedOptionsJson);
  const selectedValues = multiple ? readMultipleValues(currentValue) : [currentValue];
  selectedValues.filter(Boolean).forEach((value) => {
    if (!options.some((option) => option.value === value)) options.push({ value, label: value });
  });
  return JSON.stringify(options);
}

function readOptions(value?: string): RuntimeChoiceOption[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as RuntimeChoiceOption[];
    return Array.isArray(parsed) ? [...parsed] : [];
  } catch {
    return [];
  }
}

function readMultipleValues(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    return [value];
  }
}
