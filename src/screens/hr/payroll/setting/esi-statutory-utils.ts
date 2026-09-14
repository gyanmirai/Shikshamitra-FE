import type { EsiEnrollment, EsiImpactPreviewRequest } from 'src/redux/hr/statutory-scheme-api';

export const ESI_VIEWS = ['overview', 'employees', 'advanced'] as const;

export type EsiWorkspaceView = (typeof ESI_VIEWS)[number];

export type EsiWorkspaceQuery = {
  view: EsiWorkspaceView;
  month: string;
  search: string;
  coverage: NonNullable<EsiImpactPreviewRequest['coverage']>;
  readiness: NonNullable<EsiImpactPreviewRequest['readiness']>;
  enrollmentStatuses: EsiEnrollment['status'][];
  page: number;
  pageSize: 10 | 25 | 50;
  sortBy: NonNullable<EsiImpactPreviewRequest['sortBy']>;
  sortDirection: NonNullable<EsiImpactPreviewRequest['sortDirection']>;
};

const OLD_TAB_VIEWS: Record<string, EsiWorkspaceView> = {
  applicability: 'overview',
  wages: 'advanced',
  employees: 'employees',
  review: 'overview',
};

const OLD_TAB_HASHES: Record<string, string> = {
  applicability: '#setup-readiness',
  wages: '#earning-classifications',
  review: '#monthly-impact',
};

export const getLegacyEsiTabHash = (tab: string | null) => OLD_TAB_HASHES[tab || ''] || '';

const ENROLLMENT_STATUSES: EsiEnrollment['status'][] = [
  'PendingReview',
  'Covered',
  'NotCovered',
  'Exited',
  'RegistrationPending',
];

const SORT_FIELDS: EsiWorkspaceQuery['sortBy'][] = [
  'employeeName',
  'employeeIdentifier',
  'statutoryWages',
  'employeeContribution',
  'employerContribution',
  'readiness',
];

export const currentPayrollMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const toApiMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${month}-${year}`;
};

export const getPayrollMonthEnd = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return `${value}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
};

export const formatPayrollMonth = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
};

const isPayrollMonth = (value: string | null): value is string =>
  Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));

const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export const parseEsiWorkspaceQuery = (searchParams: URLSearchParams): EsiWorkspaceQuery => {
  const requestedView = searchParams.get('view');
  const oldTab = searchParams.get('tab');
  const enrollmentStatuses = (searchParams.get('enrollment') || '')
    .split(',')
    .filter((status): status is EsiEnrollment['status'] =>
      ENROLLMENT_STATUSES.includes(status as EsiEnrollment['status'])
    );
  const pageSize = positiveInteger(searchParams.get('pageSize'), 25);
  const sortBy = searchParams.get('sort');

  return {
    view: ESI_VIEWS.includes(requestedView as EsiWorkspaceView)
      ? (requestedView as EsiWorkspaceView)
      : OLD_TAB_VIEWS[oldTab || ''] || 'overview',
    month: isPayrollMonth(searchParams.get('month'))
      ? (searchParams.get('month') as string)
      : currentPayrollMonth(),
    search: searchParams.get('search')?.trim().slice(0, 100) || '',
    coverage:
      searchParams.get('coverage') === 'covered' || searchParams.get('coverage') === 'notCovered'
        ? (searchParams.get('coverage') as EsiWorkspaceQuery['coverage'])
        : 'all',
    readiness:
      searchParams.get('readiness') === 'ready' ||
      searchParams.get('readiness') === 'needsAttention'
        ? (searchParams.get('readiness') as EsiWorkspaceQuery['readiness'])
        : 'all',
    enrollmentStatuses,
    page: positiveInteger(searchParams.get('page'), 0),
    pageSize: pageSize === 10 || pageSize === 50 ? pageSize : 25,
    sortBy: SORT_FIELDS.includes(sortBy as EsiWorkspaceQuery['sortBy'])
      ? (sortBy as EsiWorkspaceQuery['sortBy'])
      : 'employeeName',
    sortDirection: searchParams.get('direction') === 'desc' ? 'desc' : 'asc',
  };
};

export const buildEsiWorkspaceHref = (
  searchParams: URLSearchParams,
  updates: Record<string, string | number | null | undefined>
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('tab');
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') params.delete(key);
    else params.set(key, String(value));
  });
  return `?${params.toString()}`;
};

export const enrollmentStatusLabel = (status: EsiEnrollment['status']) =>
  status.replace(/([a-z])([A-Z])/g, '$1 $2');

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatEsiCurrency = (value: number) => currencyFormatter.format(value);

export const formatPreviewTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Not reviewed yet';
