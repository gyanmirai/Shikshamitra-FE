import type { IParams } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryColumnFilter } from 'src/redux/student/records/student-records-types';

const columns = {
  name: { label: 'Student', valueType: 'string' },
  grNumber: { label: 'GR number', valueType: 'string' },
  classDivision: { label: 'Class / Division', valueType: 'string' },
  rollNo: { label: 'Roll number', valueType: 'number' },
  status: { label: 'Status', valueType: 'enum' },
} as const;
const statuses: Record<string, string> = { '6': 'Active', '7': 'Inactive', '8': 'Left' };
const textOperators = ['contains', 'equals', 'startsWith', 'endsWith'];
const numberOperators = ['equals', 'greaterThan', 'lessThan', 'between'];
const validNumber = (value: unknown) =>
  (typeof value === 'string' || typeof value === 'number') &&
  value !== null &&
  value !== undefined &&
  value !== '' &&
  Number.isFinite(Number(value)) &&
  Math.abs(Number(value)) <= 2147483647;

export function directoryColumnFilters(raw: string | null): StudentDirectoryColumnFilter[] {
  if (!raw || raw.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed.flatMap((filter): StudentDirectoryColumnFilter[] => {
      if (!filter || typeof filter !== 'object' || !Object.hasOwn(columns, filter.column))
        return [];
      const column = filter.column as StudentDirectoryColumnFilter['column'];
      const operator = filter.operator as StudentDirectoryColumnFilter['operator'];
      if (column === 'rollNo') {
        if (!numberOperators.includes(operator)) return [];
        if (operator === 'between')
          return validNumber(filter.min) &&
            validNumber(filter.max) &&
            Number(filter.min) <= Number(filter.max)
            ? [{ column, operator, min: Number(filter.min), max: Number(filter.max) }]
            : [];
        return validNumber(filter.value) ? [{ column, operator, value: String(filter.value) }] : [];
      }
      if (column === 'status')
        return operator === 'equals' && Object.hasOwn(statuses, String(filter.value))
          ? [{ column, operator, value: String(filter.value) }]
          : [];
      return textOperators.includes(operator) &&
        typeof filter.value === 'string' &&
        filter.value.trim().length > 0 &&
        filter.value.length <= 150
        ? [{ column, operator, value: filter.value }]
        : [];
    });
  } catch {
    return [];
  }
}

export function directoryTableFilters(filters: StudentDirectoryColumnFilter[]): IParams['filters'] {
  return filters.map((filter) => ({
    column: filter.column,
    type: filter.operator,
    value: filter.operator === 'between' ? { min: filter.min, max: filter.max } : filter.value,
    ...columns[filter.column],
    displayValue: filter.column === 'status' ? statuses[filter.value!] : undefined,
  }));
}

export function serializeDirectoryFilters(filters: IParams['filters']): string | undefined {
  const criteria = directoryColumnFilters(
    JSON.stringify(
      filters.map((filter) => ({
        column: filter.column,
        operator: filter.type,
        ...(filter.type === 'between'
          ? { min: filter.value?.min, max: filter.value?.max }
          : { value: String(filter.value ?? '') }),
      }))
    )
  );
  return criteria.length ? JSON.stringify(criteria) : undefined;
}
