import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import AuditFilter from '../components/AuditFilter';
import { useFinanceAuditTrail } from './useFinanceAuditTrail';

import type { AuditFilterValues } from '../types/financeAudit.types';

const query = vi.hoisted(() => ({
  args: [] as any[],
  year: { id: 'year', startDate: '2026-04-01', endDate: '2027-03-31' },
  result: {
    data: { items: [], totalCount: 50 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  lookup: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: query.year } }),
}));
vi.mock('src/redux/finance/audit/financeAuditApi', () => ({
  useGetFinanceAuditEventsQuery: (args: any, options: any) => {
    const next = { ...args, skipped: options.skip };
    if (JSON.stringify(query.args.at(-1)) !== JSON.stringify(next)) query.args.push(next);
    return query.result;
  },
  useLazyGetFinanceAuditStudentLookupQuery: () => [query.lookup],
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange }: any) => (
    <input aria-label={label} value={value?.toISOString() ?? ''} onChange={() => onChange(null)} />
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">All</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ onClick }: any) =>
    onClick ? (
      <button type="button" aria-label="Clear search" onClick={onClick}>
        Clear
      </button>
    ) : null,
}));
vi.mock('../components/AuditStudentAutocomplete', () => ({ default: () => null }));

let audit: ReturnType<typeof useFinanceAuditTrail>;
function Harness({ initialFilters }: { initialFilters?: Partial<AuditFilterValues> }) {
  audit = useFinanceAuditTrail(initialFilters);
  return (
    <>
      <AuditFilter
        filters={audit.filters}
        isFiltered={audit.isFiltered}
        onFilterChange={audit.handleFilterChange}
        onSelectStudent={audit.handleSelectStudent}
        onReset={audit.handleResetFilters}
        totalCount={audit.totalCount}
        filteredCount={audit.filteredCount}
      />
      <output aria-label="Filtered">{String(audit.isFiltered)}</output>
    </>
  );
}
const latest = () => query.args.at(-1);
const type = (value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: 'Search activity' }), { target: { value } });
const tick = (ms = 400) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const removeKeyword = () => {
  const chip = screen.getByText(/^Keyword:/).parentElement!;
  fireEvent.click(chip.querySelector('[data-testid="CancelIcon"]')!);
};
beforeEach(() => {
  vi.useFakeTimers();
  query.args = [];
  query.year = { id: 'year', startDate: '2026-04-01', endDate: '2027-03-31' };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Audit Trail controlled search and query debounce', () => {
  it('updates the input and keyword chip immediately and queries once after 400ms', () => {
    render(<Harness />);
    type('FIN-2026-000040');
    expect(screen.getByText('Keyword: "FIN-2026-000040"')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled();
    expect(latest().search).toBeUndefined();
    tick(399);
    expect(latest().search).toBeUndefined();
    tick(1);
    expect(latest().search).toBe('FIN-2026-000040');
    tick(400);
    expect(query.args.filter((args) => args.search === 'FIN-2026-000040')).toHaveLength(1);
  });

  it('resets while typing is pending without restoring the stale keyword', () => {
    render(<Harness />);
    type('first-search');
    tick();
    tick();
    type('pending-search');
    tick(200);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox', { name: 'Search activity' })).toHaveValue('');
    expect(screen.queryByText(/^Keyword:/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Filtered')).toHaveTextContent('false');
    expect(latest().search).toBeUndefined();
    tick(1200);
    expect(audit.filters.search).toBe('');
    expect(latest().search).toBeUndefined();
    expect(query.args.some((args) => args.search === 'pending-search')).toBe(false);
  });

  it.each(['keyword chip', 'search clear'])(
    'clears from %s while a replacement term is pending',
    (control) => {
      render(<Harness />);
      type('first-search');
      tick();
      tick();
      type('pending-search');
      tick(200);
      if (control === 'keyword chip') removeKeyword();
      else fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(screen.getByRole('textbox', { name: 'Search activity' })).toHaveValue('');
      expect(audit.filters.search).toBe('');
      expect(screen.queryByText(/^Keyword:/)).not.toBeInTheDocument();
      expect(latest().search).toBeUndefined();
      tick(1200);
      expect(latest().search).toBeUndefined();
      expect(query.args.some((args) => args.search === 'pending-search')).toBe(false);
    }
  );

  it('queries the same keyword again after Reset has settled', () => {
    render(<Harness />);
    type('same-search');
    tick();
    tick();
    expect(latest().search).toBe('same-search');
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    tick();
    tick();
    type('same-search');
    tick(400);
    expect(latest().search).toBe('same-search');
  });

  it('restores initial deep-link filters immediately and cancels pending search', () => {
    const initialFilters = {
      search: 'initial-search',
      studentId: 'student',
      selectedStudentLabel: 'Deep linked student',
      correlationId: 'thread',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-06-01T00:00:00.000Z',
      subModule: 'Collections',
      action: 'PAYMENT',
    };
    render(<Harness initialFilters={initialFilters} />);
    expect(latest()).toMatchObject({
      search: 'initial-search',
      studentId: 'student',
      correlationId: 'thread',
      subModuleCode: 'collections',
      action: 'payment',
    });
    type('pending-search');
    act(() => {
      audit.handleFilterChange('subModule', 'Refunds');
      audit.handleSelectStudent(null);
    });
    tick(200);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox', { name: 'Search activity' })).toHaveValue('initial-search');
    expect(audit.filters).toEqual(initialFilters);
    expect(latest()).toMatchObject({
      search: 'initial-search',
      studentId: 'student',
      correlationId: 'thread',
      fromDate: initialFilters.startDate,
      toDate: initialFilters.endDate,
    });
    tick(1200);
    expect(latest().search).toBe('initial-search');
    expect(query.args.some((args) => args.search === 'pending-search')).toBe(false);
  });

  it('keeps independent filters immediate while search waits and preserves scope', () => {
    const { rerender } = render(<Harness />);
    type('  active-search  ');
    tick(200);
    act(() => {
      audit.handleFilterChange('startDate', '2026-05-01T00:00:00.000Z');
      audit.handleFilterChange('endDate', '2026-06-01T00:00:00.000Z');
      audit.handleFilterChange('subModule', 'Refunds');
      audit.handleFilterChange('action', 'APPROVE');
      audit.handleFilterChange('correlationId', 'thread');
      audit.handleFilterByStudent('student', 'Selected student');
    });
    expect(latest()).toMatchObject({
      academicYearId: 'year',
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-06-01T00:00:00.000Z',
      subModuleCode: 'refunds',
      action: 'approve',
      correlationId: 'thread',
      studentId: 'student',
      skipCount: 0,
      maxResultCount: 20,
      sorting: 'occurredAt desc',
    });
    expect(latest().search).toBeUndefined();
    tick(200);
    expect(latest().search).toBe('active-search');
    query.year = { ...query.year, id: 'next-year' };
    rerender(<Harness />);
    expect(latest().academicYearId).toBe('next-year');
    expect(latest().studentId).toBe('student');
    act(() => audit.handleFilterChange('studentId', ''));
    expect(audit.filters.selectedStudentLabel).toBe('');
    expect(latest().studentId).toBeUndefined();
  });

  it('resets load-more to the first page when a search is applied or cleared', () => {
    render(<Harness />);
    act(() => audit.loadMore());
    expect(latest().skipCount).toBe(20);
    type('active-search');
    tick(400);
    expect(latest()).toMatchObject({ search: 'active-search', skipCount: 0 });
    act(() => audit.loadMore());
    expect(latest().skipCount).toBe(20);
    removeKeyword();
    expect(latest().skipCount).toBe(0);
    expect(latest().search).toBeUndefined();
  });

  it('keeps the minimum two-character query threshold and trims the query only', () => {
    render(<Harness />);
    type(' a ');
    tick(400);
    expect(audit.filters.search).toBe(' a ');
    expect(latest().search).toBeUndefined();
    type(' ab ');
    tick(400);
    expect(audit.filters.search).toBe(' ab ');
    expect(latest().search).toBe('ab');
  });
});
