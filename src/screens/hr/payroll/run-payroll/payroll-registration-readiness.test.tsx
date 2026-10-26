import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PayrollRegistrationReadiness } from './payroll-registration-readiness';

const captured = vi.hoisted(() => ({ table: {} as any, query: {} as any, exportQuery: {} as any }));
vi.mock('src/redux/hr/statutory-profile-api', () => ({
  useGetPayrollRegistrationReadinessQuery: (query: any) => {
    captured.query = query;
    return { currentData: { items: [], totalCount: 50 }, isFetching: false, refetch: vi.fn() };
  },
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({
  useHrTableExport: (_: string, query: any) => {
    captured.exportQuery = query;
    return vi.fn();
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    captured.table = props;
    return null;
  },
}));

describe('payroll readiness server search', () => {
  it('resets the page and captures the same search for complete export', () => {
    render(<PayrollRegistrationReadiness month="2026-10" />);
    act(() => captured.table.onServerPagination(4, 10));
    expect(captured.query.page).toBe(4);
    act(() => captured.table.onServerSearch('Synthetic'));
    expect(captured.query).toEqual({
      month: '2026-10',
      page: 1,
      pageSize: 10,
      search: 'Synthetic',
    });
    expect(captured.exportQuery).toEqual({ month: '2026-10', search: 'Synthetic' });
    expect(captured.table.searchTerm).toBe('Synthetic');
  });
  it('resets pagination when the owning payroll month changes', () => {
    const view = render(<PayrollRegistrationReadiness month="2026-10" />);
    act(() => captured.table.onServerPagination(4, 10));
    view.rerender(<PayrollRegistrationReadiness month="2026-11" />);
    expect(captured.query).toMatchObject({ month: '2026-11', page: 1 });
    expect(captured.exportQuery.month).toBe('2026-11');
  });
});
