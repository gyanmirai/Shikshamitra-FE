import type { AdmissionApplicationStatus } from 'src/redux/student/admissions/admission-applications-api';

import { studentPaths } from 'src/constants/student-menu';

import { getApplicationWorkspaceUrl } from '../application-detail/application-return-url';

export const PIPELINE_ACTIVE_STATUSES: AdmissionApplicationStatus[] = [0, 1, 4, 5, 6, 7, 8];
export const PIPELINE_SORT_COLUMNS = [
  'applicationNumber',
  'applicantName',
  'currentStageName',
  'enteredAt',
  'creationTime',
];
type Params = Pick<URLSearchParams, 'get'>;

export function readAdmissionPipelineState(params: Params) {
  const page = Number(params.get('page'));
  const size = Number(params.get('size'));
  const status = params.get('status');
  const sort = params.get('sort');
  return {
    search: params.get('search') ?? '',
    page: Number.isSafeInteger(page) && page > 0 ? page - 1 : 0,
    rowsPerPage: [10, 25, 100].includes(size) ? size : 25,
    myCases:
      params.get('queue') === 'my' ? true : params.get('queue') === 'all' ? false : undefined,
    assignedCounsellorId: params.get('counsellor') || undefined,
    currentStageCode: params.get('stage') || undefined,
    status:
      status !== null &&
      /^\d+$/.test(status) &&
      PIPELINE_ACTIVE_STATUSES.includes(Number(status) as AdmissionApplicationStatus)
        ? (Number(status) as AdmissionApplicationStatus)
        : undefined,
    sorts:
      sort && PIPELINE_SORT_COLUMNS.includes(sort)
        ? [
            {
              column: sort,
              direction: params.get('direction') === 'desc' ? ('desc' as const) : ('asc' as const),
            },
          ]
        : [],
  };
}

export function admissionPipelineUrl(
  params: URLSearchParams,
  changes: Record<string, string | undefined>,
  resetPage = true
) {
  const next = new URLSearchParams(params);
  Object.entries(changes).forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });
  if (resetPage) next.delete('page');
  const query = next.toString();
  return query ? `${studentPaths.enrollment.pipeline}?${query}` : studentPaths.enrollment.pipeline;
}

export function admissionPipelineApplicationUrl(id: string, params: URLSearchParams) {
  return getApplicationWorkspaceUrl(
    id,
    admissionPipelineUrl(params, { application: undefined }, false)
  );
}
