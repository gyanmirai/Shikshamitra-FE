import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAttendanceReportRange } from './use-attendance-report-range';

it('retains an invalid typed date while blocking its request value and keeping the last valid URL', () => {
  const update = vi.fn();
  const view = renderHook(({ from }) => useAttendanceReportRange(from, '2026-11-05', update), {
    initialProps: { from: '2026-11-01' },
  });
  act(() => view.result.current.changeFrom(dayjs('invalid')));
  expect(view.result.current.fromValue?.isValid()).toBe(false);
  expect(view.result.current.startDate).toBe('');
  expect(update).not.toHaveBeenCalled();
  act(() => view.result.current.changeFrom(dayjs('2026-11-03')));
  expect(view.result.current.startDate).toBe('2026-11-03');
  expect(update).toHaveBeenCalledWith({ from: '2026-11-03', page: undefined });
  view.rerender({ from: '2026-10-01' });
  expect(view.result.current.startDate).toBe('2026-10-01');
  view.rerender({ from: '2026-11-01' });
  expect(view.result.current.startDate).toBe('2026-11-01');
});
