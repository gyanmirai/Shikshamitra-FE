import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionFormStatus,
  AdmissionFormPurpose,
} from 'src/redux/student/admissions/admission-forms-api';

export type AdmissionFormListState = {
  page: number;
  rowsPerPage: number;
  search: string;
  filters: IParams['filters'];
  purpose?: AdmissionFormPurpose;
};

export function getAdmissionFormStatusFilter(
  filters: IParams['filters']
): AdmissionFormStatus | undefined {
  const value = filters.find((filter) => filter.column === 'status')?.value;
  const status = Number(value);
  return status === 0 || status === 1 || status === 2 ? status : undefined;
}

export function buildAdmissionFormListQuery(state: AdmissionFormListState) {
  return {
    search: state.search.trim() || undefined,
    status: getAdmissionFormStatusFilter(state.filters),
    ...(state.purpose === undefined ? {} : { purpose: state.purpose }),
    skipCount: state.page * state.rowsPerPage,
    maxResultCount: state.rowsPerPage,
  };
}
