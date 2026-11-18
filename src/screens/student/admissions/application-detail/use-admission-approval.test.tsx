import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAdmissionApproval } from './use-admission-approval';

const mocks = vi.hoisted(() => ({
  approve: vi.fn(),
  history: vi.fn(),
  reload: vi.fn(),
  workflow: vi.fn(),
  preview: vi.fn(),
  permissions: [{ name: 'Students.Admissions.Applications.Add', isGranted: true }],
}));
vi.mock('react-redux', () => ({ useSelector: () => mocks.permissions }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useApproveAndFinalizeAdmissionApplicationMutation: () => [mocks.approve, {}],
  useRejectAdmissionApplicationMutation: () => [vi.fn(), {}],
  useWaitlistAdmissionApplicationMutation: () => [vi.fn(), {}],
  useGetAdmissionApprovalPreviewQuery: () => ({ refetch: () => ({ unwrap: mocks.preview }) }),
  useGetAdmissionApplicationDecisionHistoryQuery: mocks.history,
  useLazyGetAdmissionApplicationQuery: () => [
    (...args: unknown[]) => ({ unwrap: () => mocks.reload(...args) }),
  ],
  useLazyGetAdmissionApplicationWorkflowQuery: () => [
    (...args: unknown[]) => ({ unwrap: () => mocks.workflow(...args) }),
  ],
}));
const application = { id: 'qa-app', status: 1, concurrencyStamp: 'stamp' } as AdmissionApplication;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [{ name: 'Students.Admissions.Applications.Add', isGranted: true }];
  mocks.approve.mockReturnValue({
    unwrap: () =>
      Promise.reject(Object.assign(new Error('Network error'), { status: 'FETCH_ERROR' })),
  });
  mocks.preview.mockResolvedValue({});
  mocks.reload.mockResolvedValue(application);
  mocks.workflow.mockResolvedValue({});
});

it('retries the exact command after an uncertain response and does not eagerly load history', async () => {
  const hook = renderHook(() => useAdmissionApproval(application));
  await act(async () => {
    await hook.result.current.runApproval({ confirmCreateNew: true });
  });
  await act(async () => {
    await hook.result.current.runApproval({
      confirmCreateNew: false,
      existingStudentId: 'different',
    });
  });
  expect(mocks.approve).toHaveBeenCalledTimes(2);
  expect(mocks.approve.mock.calls[1][0]).toEqual(mocks.approve.mock.calls[0][0]);
  expect(mocks.history).toHaveBeenCalledWith('qa-app', { skip: true });
  expect(hook.result.current.error).toBeTruthy();
});

it('reloads app, workflow and readiness before clearing the failed request for renewed review', async () => {
  const hook = renderHook(() => useAdmissionApproval(application));
  await act(async () => {
    await hook.result.current.runApproval({ confirmCreateNew: true });
  });
  const initial = mocks.approve.mock.calls[0][0].input.idempotencyKey;
  await act(async () => {
    await hook.result.current.reloadLatest();
  });
  expect(mocks.reload).toHaveBeenCalledWith('qa-app');
  expect(mocks.workflow).toHaveBeenCalledWith('qa-app');
  expect(mocks.preview).toHaveBeenCalledOnce();
  expect(hook.result.current.error).toBeNull();
  await act(async () => {
    await hook.result.current.runApproval({
      confirmCreateNew: false,
      existingStudentId: 'reviewed',
    });
  });
  expect(mocks.approve.mock.calls[1][0].input).toMatchObject({ existingStudentId: 'reviewed' });
  expect(mocks.approve.mock.calls[1][0].input.idempotencyKey).not.toBe(initial);
});

it('does not issue a command without exact manage access', async () => {
  mocks.permissions = [];
  const hook = renderHook(() => useAdmissionApproval(application));
  await act(async () => {
    await hook.result.current.runApproval({ confirmCreateNew: true });
  });
  expect(mocks.approve).not.toHaveBeenCalled();
});
