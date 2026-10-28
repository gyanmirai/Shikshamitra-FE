import type { IParams } from 'src/components/customizabaleTable/types';

import { formatDateOnly } from 'src/utils/date-only';

import type { AdmissionOfferingFilters } from './use-admission-offering-filters';

export const offeringScopeColumns = {
  boardName: 'boardId',
  mediumName: 'mediumId',
  stageName: 'stageId',
  standardName: 'standardId',
  availabilityStatus: 'availabilityStatus',
  configurationStatus: 'configurationStatus',
} as const;

export function offeringScopeChanges(
  criteria: IParams['filters'],
  current: Pick<AdmissionOfferingFilters, 'boardId' | 'mediumId'> &
    Partial<Pick<AdmissionOfferingFilters, 'stageId'>>
): Partial<AdmissionOfferingFilters> {
  const changes: Partial<AdmissionOfferingFilters> = {};
  Object.entries(offeringScopeColumns).forEach(([column, field]) => {
    const value = criteria.findLast((filter) => filter.column === column)?.value;
    // Board and Medium are compulsory context, so removing table criteria retains them.
    changes[field] =
      value === undefined && (field === 'boardId' || field === 'mediumId')
        ? current[field]
        : value === undefined
          ? ''
          : String(value);
  });
  if (changes.boardId !== current.boardId) {
    changes.mediumId = '';
    changes.stageId = '';
    changes.standardId = '';
  } else if (changes.mediumId !== current.mediumId) {
    changes.stageId = '';
    changes.standardId = '';
  } else if (current.stageId !== undefined && changes.stageId !== current.stageId) {
    changes.standardId = '';
  }
  return changes;
}

const columnLabels: Record<string, string> = {
  name: 'Offering',
  effectiveOpenDate: 'Open',
  effectiveCloseDate: 'Close',
  applicationCount: 'Applications',
};

const validCount = (value: unknown) =>
  (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) &&
  Number.isInteger(Number(value)) &&
  Number(value) >= 0 &&
  Number(value) <= 2147483647;

const validDate = (value: unknown) => {
  if (typeof value !== 'string') return false;
  const date = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  const iso = date ? `${date[3]}-${date[2]}-${date[1]}` : value;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && formatDateOnly(iso, 'YYYY-MM-DD') === iso;
};

const validFilter = (filter: IParams['filters'][number]) => {
  if (!filter || typeof filter !== 'object' || !Object.hasOwn(columnLabels, filter.column))
    return false;
  const { column, type, value, valueType } = filter;
  if (column === 'name')
    return (
      valueType === 'string' &&
      ['contains', 'equals', 'startsWith', 'endsWith'].includes(type) &&
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.length <= 150
    );
  if (column === 'effectiveOpenDate' || column === 'effectiveCloseDate')
    return valueType === 'date' && ['equals', 'after', 'before'].includes(type) && validDate(value);
  if (valueType !== 'number') return false;
  if (type === 'between')
    return (
      value &&
      typeof value === 'object' &&
      validCount(value.min) &&
      validCount(value.max) &&
      Number(value.min) <= Number(value.max)
    );
  return ['equals', 'greaterThan', 'lessThan'].includes(type) && validCount(value);
};

// Keep presentation-only labels out of the API and shareable URL contract.
export function serializeOfferingColumnFilters(filters: IParams['filters']): string {
  const criteria = filters.filter(validFilter).map(({ column, type, value, valueType }) => ({
    column,
    type,
    value:
      valueType === 'number'
        ? type === 'between'
          ? { min: Number(value.min), max: Number(value.max) }
          : Number(value)
        : value,
    valueType,
  }));
  return criteria.length ? JSON.stringify(criteria) : '';
}

export function offeringColumnFilters(serialized: string): IParams['filters'] {
  if (!serialized || serialized.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed.filter(validFilter).map(({ column, type, value, valueType }) => ({
      column,
      type,
      value,
      valueType,
      label: columnLabels[column],
    }));
  } catch {
    return [];
  }
}
