import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { usePayrollMonth } from './use-payroll-month';

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => '/hr/payroll',
  useSearchParams: () => navigation.params,
}));
beforeEach(() => {
  navigation.params = new URLSearchParams('month=2026-09&previewRunId=old&page=4&tab=register');
  navigation.replace.mockClear();
});

it('reads the selected month and responds to browser navigation', () => {
  const { result, rerender } = renderHook(usePayrollMonth);
  expect(result.current[0].format('YYYY-MM')).toBe('2026-09');
  navigation.params = new URLSearchParams('month=2026-08');
  rerender();
  expect(result.current[0].format('YYYY-MM')).toBe('2026-08');
});

it('changes month without carrying a preview or page from another month', () => {
  const { result } = renderHook(usePayrollMonth);
  act(() => result.current[1](dayjs('2026-08-01')));
  expect(navigation.replace).toHaveBeenCalledWith('/hr/payroll?month=2026-08&tab=register', {
    scroll: false,
  });
});

it.each(['', '2026-13', '2026-00', '2026-09-01', 'private-diagnostic'])(
  'falls back to the current month for invalid query %s',
  (value) => {
    navigation.params = new URLSearchParams({ month: value });
    const { result } = renderHook(usePayrollMonth);
    expect(result.current[0].format('YYYY-MM')).toBe(dayjs().format('YYYY-MM'));
    expect(navigation.replace).not.toHaveBeenCalled();
  }
);

it('ignores incomplete picker values', () => {
  const { result } = renderHook(usePayrollMonth);
  act(() => result.current[1](null));
  act(() => result.current[1](dayjs('invalid')));
  expect(navigation.replace).not.toHaveBeenCalled();
});
