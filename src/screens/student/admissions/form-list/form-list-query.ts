import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionFormStatus,
  AdmissionFormPurpose,
} from 'src/redux/student/admissions/admission-forms-api';

import { serializeAdmissionFormColumnFilters } from './form-column-filters';

export type AdmissionFormListState = {
  page: number;
  rowsPerPage: number;
  search: string;
  filters: IParams['filters'];
};

export function getAdmissionFormStatusFilter(
  filters: IParams['filters']
): AdmissionFormStatus | undefined {
  const value = filters.findLast((filter) => filter.column === 'status')?.value;
  if (value === undefined || value === null || value === '') return undefined;
  const status = Number(value);
  return status === 0 || status === 1 || status === 2 ? status : undefined;
}

export function buildAdmissionFormListQuery(state: AdmissionFormListState) {
  const columnFilters = serializeAdmissionFormColumnFilters(state.filters);
  const purpose = getAdmissionFormPurposeFilter(state.filters);
  return {
    search: state.search.trim() || undefined,
    status: getAdmissionFormStatusFilter(state.filters),
    ...(purpose !== undefined ? { purpose } : {}),
    ...(columnFilters ? { columnFilters } : {}),
    skipCount: state.page * state.rowsPerPage,
    maxResultCount: state.rowsPerPage,
  };
}

export function getAdmissionFormPurposeFilter(
  filters: IParams['filters']
): AdmissionFormPurpose | undefined {
  const value = filters.findLast((filter) => filter.column === 'purpose')?.value;
  if (value === undefined || value === null || value === '') return undefined;
  const purpose = Number(value);
  return purpose === 0 || purpose === 1 ? purpose : undefined;
}
