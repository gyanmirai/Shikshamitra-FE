import type { IParams } from 'src/components/customizabaleTable/types';

import { PAYROLL_ISSUE_LABELS } from 'src/constants/payroll-issues';

export const payrollStatusOptions = [
  { label: 'Needs review', value: 'PENDING' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Pending finalization', value: 'SUBMITTED' },
  { label: 'Finalized', value: 'LOCKED' },
];

export const payrollIssueOptions = [
  { label: 'Clear', value: 'CLEAN' },
  { label: 'Has issues', value: 'HAS_ISSUES' },
  { label: 'Blocking issues', value: 'CRITICAL' },
  ...Object.entries(PAYROLL_ISSUE_LABELS).map(([code, issue]) => ({
    label: issue.label,
    value: `code:${code}`,
  })),
];

export const payrollRegisterSortFields: Record<string, string> = {
  employeeName: 'employeeName',
  payableDays: 'payableDays',
  netSalary: 'netPay',
  netPayDelta: 'netPayDelta',
};

export function getPayrollRegisterFilters(criteria?: {
  reviewState?: string;
  issueClass?: string;
  issueCode?: string;
}): IParams['filters'] {
  const filter = (
    column: string,
    label: string,
    options: typeof payrollStatusOptions,
    value?: string
  ): IParams['filters'] => {
    const option = options.find((item) => item.value === value);
    return option
      ? [
          {
            column,
            label,
            type: 'equals',
            value: option.value,
            valueType: 'enum',
            displayValue: option.label,
          },
        ]
      : [];
  };
  return [
    ...filter('status', 'Status', payrollStatusOptions, criteria?.reviewState),
    ...filter('issueFilter', 'Issues', payrollIssueOptions, criteria?.issueClass),
    ...filter(
      'issueFilter',
      'Issues',
      payrollIssueOptions,
      criteria?.issueCode ? `code:${criteria.issueCode}` : undefined
    ),
  ];
}

export function getPayrollRegisterQuery(filters: IParams['filters']) {
  const lastValue = (column: string) =>
    filters
      .slice()
      .reverse()
      .find((filter) => filter.column === column && typeof filter.value === 'string')?.value as
      string | undefined;
  const issueValues = filters
    .filter((filter) => filter.column === 'issueFilter' && typeof filter.value === 'string')
    .map((filter) => String(filter.value))
    .reverse();
  return {
    registerState: lastValue('status') ?? null,
    registerIssue: issueValues.find((value) => !value.startsWith('code:')) ?? null,
    registerIssueCode: issueValues.find((value) => value.startsWith('code:'))?.slice(5) ?? null,
    page: 0,
  };
}
