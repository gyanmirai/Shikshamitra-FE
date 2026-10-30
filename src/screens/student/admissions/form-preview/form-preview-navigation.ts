import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionFormPurpose } from 'src/redux/student/admissions/admission-forms-api';

import { studentPaths } from 'src/constants/student-menu';

import { normalizeAdmissionFormFilters } from '../form-list/form-column-filters';

import type { AdmissionFormListState } from '../form-list/form-list-query';

const { forms } = studentPaths.enrollment.settings;

export function getAdmissionFormPreviewReturnUrl(
  value: string | null,
  _purpose?: AdmissionFormPurpose
) {
  return value === forms || value?.startsWith(`${forms}?`) ? value : forms;
}

export function getAdmissionFormPreviewUrl(id: string, returnTo?: string) {
  const params = new URLSearchParams({
    returnTo: getAdmissionFormPreviewReturnUrl(returnTo ?? null),
  });
  return `${forms}/${encodeURIComponent(id)}/preview?${params}`;
}

export function getAdmissionFormListReturnUrl(state: AdmissionFormListState) {
  const params = new URLSearchParams();
  if (state.page) params.set('page', String(state.page + 1));
  if (state.rowsPerPage !== 10) params.set('size', String(state.rowsPerPage));
  if (state.search) params.set('search', state.search);
  if (state.filters.length) params.set('columns', JSON.stringify(state.filters));
  return params.size ? `${forms}?${params}` : forms;
}

export function readAdmissionFormListReturnState(
  params: Pick<URLSearchParams, 'get'>
): AdmissionFormListState {
  const requestedPage = Number(params.get('page') ?? 1);
  const requestedSize = Number(params.get('size') ?? 10);
  let filters: IParams['filters'] = [];
  try {
    const serialized = params.get('columns') ?? '[]';
    const parsed: unknown = serialized.length <= 12000 ? JSON.parse(serialized) : [];
    if (Array.isArray(parsed) && parsed.length <= 20) {
      filters = normalizeAdmissionFormFilters(
        parsed
          .filter((filter) => {
            if (!filter || typeof filter !== 'object' || typeof filter.type !== 'string')
              return false;
            if (filter.column === 'name')
              return (
                filter.valueType === 'string' &&
                typeof filter.value === 'string' &&
                ['contains', 'equals', 'startsWith', 'endsWith'].includes(filter.type)
              );
            if (filter.column === 'status')
              return (
                filter.valueType === 'enum' &&
                filter.type === 'equals' &&
                [0, 1, 2].includes(Number(filter.value))
              );
            if (
              !['version', 'sectionCount'].includes(filter.column) ||
              filter.valueType !== 'number' ||
              !['equals', 'greaterThan', 'lessThan', 'between'].includes(filter.type)
            )
              return false;
            const validNumber = (value: unknown) =>
              (typeof value === 'number' || typeof value === 'string') &&
              value !== '' &&
              Number.isFinite(Number(value));
            return filter.type === 'between'
              ? validNumber(filter.value?.min) && validNumber(filter.value?.max)
              : validNumber(filter.value);
          })
          .map(({ column, type, value, valueType, label, displayValue }) => ({
            column,
            type,
            value,
            valueType,
            ...(typeof label === 'string' ? { label } : {}),
            ...(typeof displayValue === 'string' ? { displayValue } : {}),
          }))
      );
    }
  } catch {
    // A copied or outdated URL must not prevent opening the Forms list.
  }
  return {
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0,
    rowsPerPage:
      Number.isInteger(requestedSize) && requestedSize > 0 && requestedSize <= 100
        ? requestedSize
        : 10,
    search: params.get('search') ?? '',
    filters,
  };
}
