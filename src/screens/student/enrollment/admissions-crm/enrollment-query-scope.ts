import type { IParams } from 'src/components/customizabaleTable/types';

const normalizeScopeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeScopeValue);

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = normalizeScopeValue((value as Record<string, unknown>)[key]);
        return normalized;
      }, {});
  }

  return value;
};

export const createEnrollmentQueryScopeKey = (scope: Record<string, unknown>) =>
  JSON.stringify(normalizeScopeValue(scope));

export const getEnrollmentFilterQueryScope = (filters: IParams['filters']) =>
  filters.map(({ column, type, value, valueType }) => ({ column, type, value, valueType }));
