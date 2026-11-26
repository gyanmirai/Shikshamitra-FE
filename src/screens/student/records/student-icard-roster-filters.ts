import type { IParams } from 'src/components/customizabaleTable/types';
import type { ICardRosterFilter } from 'src/redux/student/records/student-icard-assignment-api';

const columns = {
  studentName: { label: 'Student', valueType: 'string' },
  grNumber: { label: 'GR number', valueType: 'string' },
  rollNumber: { label: 'Roll number', valueType: 'number' },
  hasValidIssuedCard: { label: 'Card status', valueType: 'enum' },
} as const;

const textOperators = ['contains', 'equals', 'startsWith', 'endsWith'];
const numberOperators = ['equals', 'greaterThan', 'lessThan'];

function readNumber(value: unknown) {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= -2147483648 && number <= 2147483647
    ? number
    : undefined;
}

function normalizeRosterFilters(parsed: unknown): ICardRosterFilter[] {
  if (!Array.isArray(parsed) || parsed.length > 20) return [];
  return parsed.flatMap((filter): ICardRosterFilter[] => {
    if (!filter || !Object.hasOwn(columns, filter.column)) return [];
    const column = filter.column as ICardRosterFilter['column'];
    const operator = filter.operator as ICardRosterFilter['operator'];
    if (column === 'rollNumber') {
      if (operator === 'between') {
        const min = readNumber(filter.min);
        const max = readNumber(filter.max);
        return min !== undefined && max !== undefined && min <= max
          ? [{ column, operator, min, max }]
          : [];
      }
      const value = readNumber(filter.value);
      return numberOperators.includes(operator) && value !== undefined
        ? [{ column, operator, value: String(value) }]
        : [];
    }
    if (column === 'hasValidIssuedCard') {
      const value = String(filter.value);
      return operator === 'equals' && (value === 'true' || value === 'false')
        ? [{ column, operator, value }]
        : [];
    }
    const value = typeof filter.value === 'string' ? filter.value.trim() : '';
    return textOperators.includes(operator) && value && value.length <= 150
      ? [{ column, operator, value }]
      : [];
  });
}

export function readRosterFilters(raw: string | null): ICardRosterFilter[] {
  if (!raw || raw.length > 12000) return [];
  try {
    return normalizeRosterFilters(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function cardStatusLabel(value: unknown) {
  return value === true ? 'Issued' : 'Pending';
}

export function rosterTableFilters(filters: ICardRosterFilter[]): IParams['filters'] {
  return filters.map(({ column, operator, value, min, max }) => ({
    column,
    type: operator,
    ...columns[column],
    value:
      operator === 'between'
        ? { min, max }
        : column === 'hasValidIssuedCard'
          ? value === 'true'
          : value,
    displayValue: column === 'hasValidIssuedCard' ? cardStatusLabel(value === 'true') : undefined,
  }));
}

export function criteriaFromRosterTable(filters: IParams['filters']): ICardRosterFilter[] {
  return normalizeRosterFilters(
    filters.map(({ column, type, value }) => ({
      column,
      operator: type,
      ...(type === 'between' ? { min: value?.min, max: value?.max } : { value }),
    }))
  );
}

export function serializeRosterFilters(filters: IParams['filters']): string | undefined {
  const criteria = criteriaFromRosterTable(filters);
  return criteria.length ? JSON.stringify(criteria) : undefined;
}
