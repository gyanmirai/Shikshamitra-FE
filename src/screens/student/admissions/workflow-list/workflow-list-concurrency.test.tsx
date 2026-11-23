import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import auth from 'src/redux/auth/authSlice';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useWorkflowListActions } from './use-workflow-list-actions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const staleWorkflow: AdmissionWorkflow = {
  id: 'workflow-1',
  name: 'Regular admission',
  code: 'REGULAR_ADMISSION',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stale-stamp',
  creationTime: '2026-09-18T00:00:00Z',
  stages: [],
  transitions: [],
};

const makeStore = () =>
  configureStore({
    reducer: { auth, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

let store: ReturnType<typeof makeStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = makeStore();
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
});

it('passes duplicate create and clone responses to their forms without a second error message', async () => {
  const problem = { errorCode: 'Admissions.WorkflowNameAlreadyExists' };
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows', () =>
      HttpResponse.json(problem, { status: 403 })
    ),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/clone', () =>
      HttpResponse.json(problem, { status: 403 })
    )
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  const details = { name: 'Reserved workflow', code: '' };

  act(() => result.current.openClone(staleWorkflow));
  await act(async () => {
    await expect(result.current.create(details)).rejects.toMatchObject({ data: problem });
    await expect(result.current.clone(details)).rejects.toMatchObject({ data: problem });
  });

  expect(result.current.cloneDialog.value).toBe(true);
  expect(result.current.openingCreatedWorkflow).toBe(false);
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
});

it('reloads a changed workflow and requires confirmation again before deleting', async () => {
  const deleteStamps: string[] = [];
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () =>
      HttpResponse.json({ data: { ...staleWorkflow, concurrencyStamp: 'fresh-stamp' } })
    ),
    http.delete('*/api/student/enrollment/admissions/workflows/workflow-1', ({ request }) => {
      deleteStamps.push(new URL(request.url).searchParams.get('concurrencyStamp') ?? '');
      return new HttpResponse(null, { status: 204 });
    })
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });

  act(() => result.current.requestConfirmation(staleWorkflow, 'delete'));
  await act(async () => result.current.confirm());

  expect(deleteStamps).toEqual([]);
  expect(result.current.pendingConfirmation?.workflow.concurrencyStamp).toBe('fresh-stamp');
  expect(result.current.confirmationNotice).toContain('latest version is now loaded');

  await act(async () => result.current.confirm());

  await waitFor(() => expect(result.current.pendingConfirmation).toBeNull());
  expect(deleteStamps).toEqual(['fresh-stamp']);
});

it('rechecks the archived version before reopening that same record with its current stamp', async () => {
  const archived = { ...staleWorkflow, status: 2 as const };
  const reopenStamps: string[] = [];
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () =>
      HttpResponse.json({ data: { ...archived, concurrencyStamp: 'fresh-stamp' } })
    ),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/reopen', ({ request }) => {
      reopenStamps.push(new URL(request.url).searchParams.get('concurrencyStamp') ?? '');
      return HttpResponse.json({
        data: { ...archived, status: 1, concurrencyStamp: 'reopened-stamp' },
      });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.requestConfirmation(archived, 'reopen'));
  await act(async () => result.current.confirm());
  expect(reopenStamps).toEqual([]);
  expect(result.current.pendingConfirmation?.workflow.concurrencyStamp).toBe('fresh-stamp');
  await act(async () => {
    await Promise.all([result.current.confirm(), result.current.confirm()]);
  });
  expect(reopenStamps).toEqual(['fresh-stamp']);
  expect(result.current.pendingConfirmation).toBeNull();
});

it.each([1, 13])('retains the archive confirmation with the exact active offering count (%i), then allows retry', async (count) => {
  const published = { ...staleWorkflow, status: 1 as const };
  let blocked = true;
  let calls = 0;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () =>
      HttpResponse.json({ data: published })),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/archive', () => {
      calls += 1;
      return blocked
        ? HttpResponse.json({ errorCode: 'Admissions.WorkflowInUse', detail: 'One or more business rules were violated.', data: { ActiveOfferingCount: count } }, { status: 403 })
        : HttpResponse.json({ data: { ...published, status: 2 } });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.requestConfirmation(published, 'archive'));
  await act(async () => { await Promise.all([result.current.confirm(), result.current.confirm()]); });
  expect(calls).toBe(1);
  expect(result.current.pendingConfirmation?.workflow.status).toBe(1);
  expect(result.current.confirmationNotice).toContain(`${count} active admission offering${count === 1 ? '.' : 's.'}`);
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  blocked = false;
  await act(async () => result.current.confirm());
  expect(result.current.pendingConfirmation).toBeNull();
  expect(result.current.confirmationNotice).toBeNull();
  expect(shikshaMitraToast.success).toHaveBeenCalledWith({ message: 'Workflow archived' });
});
