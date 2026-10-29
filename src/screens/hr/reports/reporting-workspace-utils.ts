import type {
  ReportDesign,
  ReportDataset,
  ReportParameters,
  ReportConditionGroup,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const isMonthlyRegister = (design: ReportDesign) =>
  design.layout === 'attendanceMatrix' || design.dataSource === 'payroll_register';

export const isIssuedSalaryDocument = (design: Pick<ReportDesign, 'dataSource'>) =>
  design.dataSource === 'payroll_statement' || design.dataSource === 'payroll_register';

export const defaultReportParameters = (period = 'thisMonth'): ReportParameters => ({
  period,
  employeeIds: [],
  departments: [],
  includeDrafts: false,
});
export const describeReportRules = (
  group: ReportConditionGroup,
  parameters: ReportParameters,
  dataset?: ReportDataset,
  path = 'filters'
): string => {
  const operators: Record<string, string> = {
    equals: 'is',
    notEquals: 'is not',
    gte: 'at least',
    lte: 'at most',
    gt: 'greater than',
    lt: 'less than',
    in: 'is one of',
    notIn: 'is not one of',
    empty: 'is empty',
    notEmpty: 'is not empty',
    between: 'between',
  };
  return [
    ...group.conditions.map((condition, index) => {
      const supplied = condition.askWhenGenerating
        ? parameters.filterValues?.[`${path}.${index}`]
        : undefined;
      const value = supplied?.value ?? condition.value;
      const values = supplied?.values ?? condition.values;
      return `${dataset?.fields.find((field) => field.id === condition.field)?.label || condition.field.replace(/([A-Z])/g, ' $1')} ${operators[condition.operator] || condition.operator} ${values?.length ? values.join(', ') : value || (condition.askWhenGenerating ? '(chosen above)' : '')}`;
    }),
    ...group.groups.map(
      (child, index) => `(${describeReportRules(child, parameters, dataset, `${path}.g${index}`)})`
    ),
  ].join(group.match === 'any' ? ' OR ' : ' AND ');
};
export const emptyReportDesign = (dataset: ReportDataset): ReportDesign => ({
  version: 2,
  dataSource: dataset.id,
  layout: 'detail',
  columns: dataset.fields.slice(0, 7).map((f) => ({ field: f.id, label: '', format: 'auto' })),
  filters: { match: 'all', conditions: [], groups: [] },
  sorts: [],
  groups: [],
  summaries: [],
  chart: { type: 'none', function: 'count' },
  parameters:
    dataset.id === 'employee'
      ? dataset.parameters.filter((p) => p !== 'period')
      : [...dataset.parameters],
  defaultPeriod: 'thisMonth',
  dateField: '',
  paperSize: 'A4',
  orientation: 'landscape',
});
export const reportError = (error: unknown) => {
  const e = error as {
    status?: string | number;
    data?: {
      data?: { errors?: string };
      error?: { message?: string; details?: string; data?: { errors?: string } };
    };
    message?: string;
  };
  if (e?.status === 'FETCH_ERROR' || e?.status === 'TIMEOUT_ERROR')
    return 'The request could not be confirmed. Check your connection and try again.';
  if (e?.status === 'PARSING_ERROR')
    return 'The server response could not be read. Reload the page and try again.';
  const problem = parseApiProblemDetail(error);
  const messages: Record<string, string> = {
    'HR:Reports:TemplateConflict':
      'This template changed. Reload the latest version before saving or generating.',
    'HR:Reports:ResultExpired':
      'This result expired. Generate a new report to capture current data.',
    'HR:Reports:RunTransitionInvalid':
      'This report changed state. Reload it before trying that action again.',
    'HR:Reports:PopulationTooLarge':
      'The report exceeds 500,000 source rows. Narrow the period or staff selection.',
  };
  return (
    e?.data?.data?.errors ||
    e?.data?.error?.data?.errors ||
    messages[problem.errorCode || ''] ||
    (problem.detail !== 'Something went wrong' ? problem.detail : undefined) ||
    e?.message ||
    'The request failed. Try again.'
  );
};
export const displayReportValue = (value: unknown, type: string, timezone = 'Asia/Kolkata') => {
  if (value === null || value === undefined) return 'Unavailable';
  if (type === 'money' && typeof value === 'number')
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  if (type === 'number' && typeof value === 'number')
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
  if (type === 'datetime' && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf()))
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: timezone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
  }
  if (type === 'boolean' || typeof value === 'boolean')
    return value === true || value === 'true' ? 'Yes' : 'No';
  return String(value);
};

export function reportListPagination(query: Pick<URLSearchParams, 'get'>) {
  const requestedPage = Number(query.get('page') || 0);
  const requestedSize = Number(query.get('pageSize') || 50);
  return {
    page:
      Number.isSafeInteger(requestedPage) && requestedPage >= 0 && requestedPage <= 1000000
        ? requestedPage
        : 0,
    pageSize: [10, 25, 50, 100].includes(requestedSize) ? requestedSize : 50,
  };
}
