import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import {
  canPerformAdmissionDecision,
  useAdmissionApplicationDecisions,
} from './use-admission-application-decisions';

const mutations = vi.hoisted(() => ({ finalize: vi.fn(), other: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: { permissions: [{ name: 'Students.Admissions.Applications.Add', isGranted: true }] },
    }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationDecisionHistoryQuery: () => ({}),
  useGetAdmissionFinalizationPreviewQuery: () => ({}),
  useApproveAdmissionApplicationMutation: () => [mutations.other, { isLoading: false }],
  useRejectAdmissionApplicationMutation: () => [mutations.other, { isLoading: false }],
  useWaitlistAdmissionApplicationMutation: () => [mutations.other, { isLoading: false }],
  useFinalizeAdmissionApplicationMutation: () => [mutations.finalize, { isLoading: false }],
}));

describe('finalization request after form correction', () => {
  beforeEach(() => {
    mutations.finalize.mockReset();
    mutations.other.mockReset();
  });
  it('retains a failed request key for retry, then starts a new request after a confirmed correction', async () => {
    mutations.finalize.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('Identity is incomplete.')),
    }));
    const { result } = renderHook(() => useAdmissionApplicationDecisions('app-46', 6, true));
    const value = { confirmCreateNew: true, confirmGuardianContactVerified: true };
    await act(async () => {
      await result.current.runFinalization('stamp-before', value);
    });
    const first = mutations.finalize.mock.calls[0][0].input.idempotencyKey;
    expect(first).toEqual(expect.any(String));
    await act(async () => {
      await result.current.runFinalization('stamp-before', value);
    });
    expect(mutations.finalize.mock.calls[1][0].input.idempotencyKey).toBe(first);
    act(() => result.current.resetFinalizationRequest());
    await act(async () => {
      await result.current.runFinalization('stamp-after-correction', value);
    });
    expect(mutations.finalize.mock.calls[2][0]).toMatchObject({
      id: 'app-46',
      input: { concurrencyStamp: 'stamp-after-correction', ...value },
    });
    expect(mutations.finalize.mock.calls[2][0].input.idempotencyKey).not.toBe(first);
    expect(mutations.other).not.toHaveBeenCalled();
  });
});

describe('five-stage admission decisions', () => {
  it('allows approval after submission and waitlist without an intermediate review action', () => {
    expect(canPerformAdmissionDecision(1, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(4, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(5, 'approve')).toBe(true);
    expect(canPerformAdmissionDecision(1, 'waitlist')).toBe(true);
    expect(canPerformAdmissionDecision(5, 'waitlist')).toBe(false);
    expect(canPerformAdmissionDecision(6, 'reject')).toBe(true);
  });
  it.each([0, 3, 7, 8, 9, 10, 11] as const)(
    'does not expose decisions for draft, terminal or retired offer status %s',
    (status) => {
      expect(canPerformAdmissionDecision(status, 'approve')).toBe(false);
      expect(canPerformAdmissionDecision(status, 'reject')).toBe(false);
      expect(canPerformAdmissionDecision(status, 'waitlist')).toBe(false);
    }
  );
});
