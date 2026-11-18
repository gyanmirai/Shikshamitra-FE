import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { usePaymentTermForm } from './usePaymentTermForm';
import { getInitialPaymentTermData } from '../Components/PaymentTermInitialValues';

const state = vi.hoisted(() => {
  const lateBoard = {
    id: 'late-board',
    name: 'Late-year board',
    academicYearId: 'late-year',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
  };
  return {
    currentYear: { id: 'late-year', startDate: '2026-04-01', endDate: '2027-03-31' } as any,
    lateBoard,
    hierarchy: vi.fn(),
    legacy: vi.fn(),
    results: {
      'late-year': { data: { items: [lateBoard] }, isLoading: false, isFetching: false },
    } as Record<string, any>,
    firstPage: Array.from({ length: 10 }, (_, index) => ({
      id: `old-board-${index}`,
      academicYearId: `old-year-${index}`,
      name: `Old board ${index}`,
      startDate: '2025-04-01',
      endDate: '2026-03-31',
    })),
  };
});

vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ globalState: { currentYear: state.currentYear } }),
}));
vi.mock('src/redux/board/boardApi', () => ({
  useGetAcademicHierarchyQuery: (year: string, options: any) => {
    state.hierarchy(year, options);
    return state.results[year] ?? { data: { items: [] }, isLoading: false, isFetching: false };
  },
  useGetBoardsQuery: (...args: any[]) => {
    state.legacy(...args);
    return { data: { items: state.firstPage } };
  },
}));
vi.mock(
  'src/redux/finance/paymentTerm',
  () => import('../../../../../../e2e/fixtures/payment-term-impact/mock-api')
);
vi.mock(
  'src/redux/customQueryAndMutation',
  () => import('../../../../../../e2e/fixtures/payment-term-impact/mock-mutation')
);
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

it('loads a board beyond the obsolete global first page and validates against its board calendar', async () => {
  state.hierarchy.mockClear();
  state.legacy.mockClear();
  state.currentYear = { id: 'late-year', startDate: '2026-04-01', endDate: '2027-03-31' };
  const { result } = renderHook(() => usePaymentTermForm(null, vi.fn()));
  expect(state.firstPage).toHaveLength(10);
  expect(state.firstPage.some((board) => board.academicYearId === 'late-year')).toBe(false);
  expect(state.hierarchy).toHaveBeenLastCalledWith('late-year', { skip: false });
  expect(state.legacy).not.toHaveBeenCalled();
  expect(result.current.boards).toEqual([state.lateBoard]);

  const installment = {
    installmentName: 'Board summer period',
    sequence: 1,
    startDate: '2027-04-01',
    endDate: '2027-05-31',
    dueDate: '2027-04-15',
    demandDate: '2027-04-01',
    allocationPercentage: 100,
    description: '',
    reminderDate: null,
    gracePeriod: null,
    allowPartialOverride: null,
    demandEnabled: true,
    reminderEnabled: false,
  };
  await act(async () => {
    await result.current.formik.setValues(
      getInitialPaymentTermData(
        {
          paymentTermName: 'Board summer schedule',
          boardId: 'late-board',
          installments: [installment],
        },
        'late-year'
      )
    );
  });
  expect(result.current.calendarMissing).toBe(false);
  // April-May 2027 belongs to this board even though the global year ends in March.
  expect(result.current.checks.periodsWithinBoard).toBe(true);
  await act(async () => {
    await result.current.formik.setFieldValue('installments', [
      {
        ...installment,
        startDate: '2026-04-01',
        endDate: '2026-05-31',
        dueDate: '2026-04-15',
        demandDate: '2026-04-01',
      },
    ]);
  });
  expect(result.current.checks.periodsWithinBoard).toBe(false);
});

it('never reuses the preceding year board when the selected year changes or is cleared', () => {
  state.currentYear = { id: 'late-year' };
  const { result, rerender } = renderHook(() => usePaymentTermForm(null, vi.fn()));
  expect(result.current.boards[0].id).toBe('late-board');
  state.currentYear = { id: 'unconfigured-year' };
  rerender();
  expect(state.hierarchy).toHaveBeenLastCalledWith('unconfigured-year', { skip: false });
  expect(result.current.boards).toEqual([]);
  state.currentYear = {};
  rerender();
  expect(state.hierarchy).toHaveBeenLastCalledWith('', { skip: true });
  expect(result.current.boards).toEqual([]);
});
