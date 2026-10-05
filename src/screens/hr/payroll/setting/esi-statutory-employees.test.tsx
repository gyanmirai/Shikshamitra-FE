import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { EsiStatutoryEmployees } from './esi-statutory-employees';

vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    const row = props.data[0];
    return (
      <div>
        <button type="button" onClick={() => props.onServerSearch('  Patel  ')}>
          Search table
        </button>
        <button type="button" onClick={() => props.onServerPagination(2, 50)}>
          Next table page
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerSort('statutoryWages', [{ column: 'statutoryWages', direction: 'desc' }])
          }
        >
          Sort wages
        </button>
        {row
          ? props.columns.map((column: any) => (
              <div key={column.id}>{column.render?.(row[column.id], row)}</div>
            ))
          : null}
      </div>
    );
  },
}));

const query = {
  view: 'employees' as const,
  month: '2026-08',
  search: '',
  coverage: 'all' as const,
  readiness: 'all' as const,
  enrollmentStatuses: [],
  page: 0,
  pageSize: 25 as const,
  sortBy: 'employeeName' as const,
  sortDirection: 'asc' as const,
};

const preview = {
  schemeCode: 'ESI' as const,
  monthYear: '08-2026',
  summary: {
    employeesNeedingAttention: 0,
    employeeCount: 1,
    coveredEmployeeCount: 1,
    employeeContributionTotal: 96,
    employerContributionTotal: 416,
    governmentContributionTotal: 0,
    canActivate: false,
    blockingIssues: [],
  },
  totalCount: 1,
  page: 0,
  pageSize: 25,
  generatedAtUtc: '2026-08-18T10:00:00Z',
  previewFingerprint: 'A'.repeat(64),
  items: [
    {
      employeeId: 'employee-1',
      employeeIdentifier: 'EMP-001',
      employeeName: 'Rashilaben Patel',
      isCovered: true,
      canCalculate: false,
      coverageDecisionCode: 'WITHIN_WAGE_CEILING',
      coverageDecisionLabel: 'Within the ESI wage ceiling',
      statutoryWages: 12800,
      wageCeiling: 21000,
      employeeContribution: 96,
      employerContribution: 416,
      governmentContribution: 0,
      enrollmentStatus: 'Covered' as const,
      wageCeilingCategory: 'Standard' as const,
      issues: [
        {
          code: 'COMPENSATION_REVISION_REQUIRED',
          severity: 'blocking',
          title: 'Approve compensation revisions',
          message: 'Approve this staff member revision.',
          resolutionTarget: 'compensationRevision',
          affectedEmployeeCount: 1,
        },
      ],
    },
  ],
};

describe('ESI staff panel', () => {
  it('sends debounced table state to the URL query and presents server-authored issues', () => {
    const onQueryChange = vi.fn();
    render(
      <EsiStatutoryEmployees
        query={query}
        preview={preview}
        isLoading={false}
        isError={false}
        canManageEnrollment
        canApproveOverride
        onRetry={vi.fn()}
        onQueryChange={onQueryChange}
        onOpenEmployee={vi.fn()}
      />
    );

    expect(screen.getByText('Approve compensation revisions')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Payroll structure' })).toHaveAttribute(
      'href',
      '/hr/payroll/structure?employeeId=employee-1'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search table' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next table page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort wages' }));

    expect(onQueryChange).toHaveBeenNthCalledWith(1, { search: 'Patel', page: 0 });
    expect(onQueryChange).toHaveBeenNthCalledWith(2, { page: 1, pageSize: 50 });
    expect(onQueryChange).toHaveBeenNthCalledWith(3, {
      sort: 'statutoryWages',
      direction: 'desc',
      page: 0,
    });
  });
});
