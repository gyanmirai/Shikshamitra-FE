import { teachingMethodLabel, teachingMethodOptions } from './lessonPlanData';

const teachingMethodValues = new Set(teachingMethodOptions.map(({ value }) => value));
const teachingMethodValueByLabel = new Map(
  teachingMethodOptions.map(({ label, value }) => [label.toLocaleLowerCase(), value])
);

const normalizeTeachingMethod = (value: string) => {
  const trimmed = value.trim();

  if (teachingMethodValues.has(trimmed)) return trimmed;

  return teachingMethodValueByLabel.get(trimmed.toLocaleLowerCase());
};

export function parseTeachingMethods(value?: string | null): string[] {
  if (!value?.trim()) return [];

  let candidates: unknown = value.split(',');

  if (value.trim().startsWith('[')) {
    try {
      candidates = JSON.parse(value);
    } catch {
      candidates = value.split(',');
    }
  }

  if (!Array.isArray(candidates)) return [];

  return Array.from(
    new Set(
      candidates
        .filter((candidate): candidate is string => typeof candidate === 'string')
        .map(normalizeTeachingMethod)
        .filter((candidate): candidate is string => Boolean(candidate))
    )
  );
}

export function serializeTeachingMethods(values: readonly string[]): string {
  return parseTeachingMethods(values.join(',')).join(',');
}

export function formatTeachingMethods(value?: string | null): string {
  const methods = parseTeachingMethods(value);

  if (!methods.length) return value?.trim() || '-';

  return methods.map((method) => teachingMethodLabel[method] || method).join(', ');
}

export function getPrimaryTeachingMethod(value?: string | null): string {
  return parseTeachingMethods(value)[0] || 'ExplanationBoardWork';
}
