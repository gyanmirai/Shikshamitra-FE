import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useStudentDrawerExit } from './use-student-drawer-exit';

it('runs an approved close action once after the drawer finishes exiting', () => {
  const { result } = renderHook(() => useStudentDrawerExit());
  const close = vi.fn();
  const duplicate = vi.fn();

  act(() => {
    result.current.closeAfterExit(close);
    result.current.closeAfterExit(duplicate);
  });
  expect(result.current.closing).toBe(true);
  expect(close).not.toHaveBeenCalled();

  act(() => {
    result.current.onExited();
    result.current.closeAfterExit(duplicate);
    result.current.onExited();
  });
  expect(close).toHaveBeenCalledOnce();
  expect(duplicate).not.toHaveBeenCalled();
  expect(result.current.closing).toBe(true);
});

it('allows a new session to supersede an unfinished close', () => {
  const { result } = renderHook(() => useStudentDrawerExit());
  const first = vi.fn();
  const next = vi.fn();

  act(() => result.current.closeAfterExit(first));
  act(() => result.current.reopen());
  act(() => result.current.onExited());
  expect(result.current.closing).toBe(false);
  expect(first).not.toHaveBeenCalled();

  act(() => result.current.closeAfterExit(next));
  act(() => result.current.onExited());
  expect(next).toHaveBeenCalledOnce();
});
