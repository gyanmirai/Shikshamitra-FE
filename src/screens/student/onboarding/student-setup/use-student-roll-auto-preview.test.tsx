import type { StudentOnboardingRollPreview } from 'src/redux/student/onboarding/student-onboarding-api';

import { StrictMode } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useStudentRollAutoPreview } from './use-student-roll-auto-preview';

const feedback = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: feedback.error } }));

const resultFor = (divisionId = 'A', proposedRollNumber = 7): StudentOnboardingRollPreview => ({
  divisionId,
  schoolAssignmentMode: 'both',
  rollAssignmentMode: 'automatic',
  proposedRollNumber,
  concurrencyStamp: 'v1',
});
const preview = vi.fn();
const defaults = () => ({
  caseId: 'case-1',
  divisionId: 'A',
  concurrencyStamp: 'v1',
  reason: '',
  enabled: true,
  preview,
});
beforeEach(() => {
  preview.mockReset().mockResolvedValue(resultFor());
  feedback.error.mockReset();
});

it('reads a server preview for the selected division without allocating a number', async () => {
  const { result } = renderHook(() => useStudentRollAutoPreview(defaults()));
  await waitFor(() => expect(result.current.number).toBe(7));
  expect(preview).toHaveBeenCalledExactlyOnceWith({
    id: 'case-1',
    divisionId: 'A',
    rollAssignmentMode: 'automatic',
  });
  expect(result.current.status).toBe('ready');
});

it.each([{ divisionId: '' }, { concurrencyStamp: '' }, { enabled: false }, { caseId: '' }])(
  'does not request a preview until its context is ready: %j',
  async (override) => {
    const { result } = renderHook(() => useStudentRollAutoPreview({ ...defaults(), ...override }));
    await act(async () => undefined);
    expect(result.current.number).toBeUndefined();
    expect(result.current.status).toBe('idle');
    expect(preview).not.toHaveBeenCalled();
  }
);

it('deduplicates unchanged rerenders and StrictMode effect replay', async () => {
  const { result, rerender } = renderHook(() => useStudentRollAutoPreview(defaults()), {
    wrapper: StrictMode,
  });
  await waitFor(() => expect(result.current.number).toBe(7));
  rerender();
  expect(preview).toHaveBeenCalledOnce();
});

it('clears a previous number immediately and ignores a late response for another division', async () => {
  let resolveOld!: (value: StudentOnboardingRollPreview) => void;
  preview.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve;
    })
  );
  const { result, rerender } = renderHook(
    ({ divisionId }) => useStudentRollAutoPreview({ ...defaults(), divisionId }),
    { initialProps: { divisionId: 'A' } }
  );
  await waitFor(() => expect(result.current.status).toBe('loading'));
  preview.mockResolvedValueOnce(resultFor('B', 11));
  rerender({ divisionId: 'B' });
  expect(result.current.number).toBeUndefined();
  await waitFor(() => expect(result.current.number).toBe(11));
  await act(async () => resolveOld(resultFor('A', 7)));
  expect(result.current.number).toBe(11);
  expect(feedback.error).not.toHaveBeenCalled();
});

it('does not show an old failure after leaving Auto mode', async () => {
  let rejectOld!: (reason: unknown) => void;
  preview.mockReturnValueOnce(
    new Promise((_, reject) => {
      rejectOld = reject;
    })
  );
  const { result, rerender } = renderHook(
    ({ enabled }) => useStudentRollAutoPreview({ ...defaults(), enabled }),
    { initialProps: { enabled: true } }
  );
  await waitFor(() => expect(preview).toHaveBeenCalledOnce());
  rerender({ enabled: false });
  await act(async () => rejectOld(new Error('offline')));
  expect(result.current.status).toBe('idle');
  expect(feedback.error).not.toHaveBeenCalled();
});

it('reports a request failure once and retries only when explicitly requested', async () => {
  preview.mockRejectedValueOnce(new Error('offline'));
  const { result, rerender } = renderHook(() => useStudentRollAutoPreview(defaults()));
  await waitFor(() => expect(result.current.status).toBe('failed'));
  expect(feedback.error).toHaveBeenCalledExactlyOnceWith({
    message: 'Roll number preview could not be loaded. Select Auto to try again.',
  });
  rerender();
  expect(preview).toHaveBeenCalledOnce();
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.number).toBe(7));
  expect(preview).toHaveBeenCalledTimes(2);
});

it.each([
  { divisionId: 'other' },
  { concurrencyStamp: 'stale' },
  { proposedRollNumber: 0 },
  { proposedRollNumber: 1.5 },
  { rollAssignmentMode: 'manual' },
])('does not display an unverified preview: %j', async (override) => {
  preview.mockResolvedValueOnce({ ...resultFor(), ...override });
  const { result } = renderHook(() => useStudentRollAutoPreview(defaults()));
  await waitFor(() => expect(result.current.status).toBe('failed'));
  expect(result.current.number).toBeUndefined();
  expect(feedback.error).toHaveBeenCalledOnce();
});
