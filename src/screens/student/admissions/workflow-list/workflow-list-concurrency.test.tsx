import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import auth from 'src/redux/auth/authSlice';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';

import { useWorkflowListActions } from './use-workflow-list-actions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
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
  store = makeStore();
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
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
