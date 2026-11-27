import { normalizeIsTeachingFilter } from 'src/redux/hr/employeeApi';

export const staffDirectoryCacheFreshnessSeconds = 30;

export const initialStaffDirectoryFilters = {
  page: 1,
  pageSize: 10,
  search: '',
  mediumStageId: 'All',
  isTeaching: 'All',
  status: 'All',
  reportingManagerStatus: '',
};

export function staffDirectoryQuery(filters: typeof initialStaffDirectoryFilters) {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    mediumStageId: filters.mediumStageId === 'All' ? '' : filters.mediumStageId,
    isTeaching: normalizeIsTeachingFilter(filters.isTeaching),
    status: filters.status === 'All' ? '' : filters.status,
    reportingManagerStatus: filters.reportingManagerStatus,
  };
}
