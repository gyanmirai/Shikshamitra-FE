import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import auth from 'src/redux/auth/authSlice';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { shikshaMitraToast } from 'src/components/toast';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';

import { useWorkflowListActions } from './use-workflow-list-actions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

const workflow: AdmissionWorkflow = {
  id: 'workflow-1',
  name: 'Regular admission',
  code: 'REGULAR',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'original',
  creationTime: '2026-10-28T00:00:00Z',
  stages: [],
  transitions: [],
};
const makeStore = (canManage = true) =>
  configureStore({
    reducer: { auth, [api.reducerPath]: api.reducer },
    preloadedState: {
      auth: {
        ...auth(undefined, { type: 'init' }),
        permissions: [{ name: 'Students.Admissions.Workflows.Add', isGranted: canManage }],
      },
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof makeStore>;
let publishedStamps: string[];
let requests: string[];
let current: AdmissionWorkflow;
let invalid: boolean;
let failPublish: boolean;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

beforeEach(() => {
  vi.clearAllMocks();
  store = makeStore();
  current = workflow;
  publishedStamps = [];
  requests = [];
  invalid = false;
  failPublish = false;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () => {
      requests.push('read');
      return HttpResponse.json({ data: current });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/validate', () => {
      requests.push('validate');
      current = { ...current, status: 3, concurrencyStamp: 'after-validation' };
      return HttpResponse.json({
        data: {
          isValid: !invalid,
          issues: invalid
            ? [
                {
                  code: 'missing-form',
                  message: 'Select a published registration form.',
                  severity: 0,
                },
              ]
            : [],
          errors: [],
          warnings: [],
        },
      });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/publish', ({ request }) => {
      requests.push('publish');
      publishedStamps.push(new URL(request.url).searchParams.get('concurrencyStamp') ?? '');
      return failPublish
        ? HttpResponse.json({ error: { message: 'Workflow changed; reload it.' } }, { status: 409 })
        : HttpResponse.json({ data: { ...current, status: 1 } });
    })
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
});

it('validates the latest saved journey and publishes once with the post-validation stamp', async () => {
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await Promise.all([result.current.publish(workflow), result.current.publish(workflow)]);
  });
  expect(requests).toEqual(['read', 'validate', 'read', 'publish']);
  expect(publishedStamps).toEqual(['after-validation']);
  expect(shikshaMitraToast.success).toHaveBeenCalledWith({ message: 'Workflow published' });
  expect(result.current.publishingId).toBeNull();
});

it('reports validation issues and never publishes an invalid journey', async () => {
  invalid = true;
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(publishedStamps).toEqual([]);
  expect(shikshaMitraToast.warning).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining('Select a published registration form.'),
    })
  );
  expect(result.current.publishingId).toBeNull();
});

it('requires review again when the list version has changed', async () => {
  current = { ...workflow, concurrencyStamp: 'changed-elsewhere' };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(requests).toEqual(['read']);
  expect(shikshaMitraToast.warning).toHaveBeenCalled();
});

it('does not send any request without the existing manage grant', async () => {
  store = makeStore(false);
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(requests).toEqual([]);
});

it.each([1, 2, 4, 7] as const)('does not mutate ineligible status %s', async (status) => {
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish({ ...workflow, status });
  });
  expect(requests).toEqual([]);
});

it('rejects a fresh record that became published before the row click', async () => {
  current = { ...workflow, status: 1 };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(requests).toEqual(['read']);
});

it('releases the lock and reports a failed publication', async () => {
  failPublish = true;
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(shikshaMitraToast.error).toHaveBeenCalled();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  expect(result.current.publishingId).toBeNull();
});

it.each([3, 5, 6] as const)('preserves the existing publishable status %s', async (status) => {
  current = { ...workflow, status };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(current);
  });
  expect(publishedStamps).toEqual(['after-validation']);
});

it.each([5, 6] as const)(
  'validates and publishes immutable status %s without updating its legacy stage configuration',
  async (status) => {
    current = {
      ...workflow,
      status,
      stages: [
        {
          id: 'form-stage',
          code: 'FORM',
          name: 'Registration',
          stageType: 1,
          displayOrder: 0,
          isRequired: true,
          allowManualSkip: true,
          isEntryStage: true,
          isTerminalStage: true,
          configurationJson: '{}',
        },
      ],
    };
    const originalStages = current.stages;
    mswServer.use(
      http.put('*/api/student/enrollment/admissions/workflows/workflow-1', () => {
        requests.push('update');
        return HttpResponse.json(
          { error: { message: 'Only draft workflows can be edited.' } },
          { status: 400 }
        );
      })
    );
    const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
    await act(async () => {
      await result.current.publish(current);
    });
    expect(requests).toEqual(['read', 'validate', 'read', 'publish']);
    expect(publishedStamps).toEqual(['after-validation']);
    expect(current.stages).toEqual(originalStages);
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  }
);

it('upgrades the saved graph using the builder normalizer while retaining its identity and routes', async () => {
  current = {
    ...workflow,
    description: 'Saved details',
    defaultInquiryFormDefinitionId: 'inquiry-form',
    stages: [
      {
        id: 'form-stage',
        code: 'FORM',
        name: 'Registration',
        stageType: 1,
        displayOrder: 0,
        isRequired: true,
        allowManualSkip: true,
        isEntryStage: true,
        isTerminalStage: true,
        configurationJson: '{}',
      },
    ],
    transitions: [
      {
        id: 'route-1',
        fromStageId: 'first',
        toStageId: 'form-stage',
        priority: 0,
        isDefault: true,
      },
    ],
  };
  const saved = current;
  let updated: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', async ({ request }) => {
      requests.push('update');
      updated = (await request.json()) as Record<string, unknown>;
      current = { ...current, ...updated, concurrencyStamp: 'upgraded' } as AdmissionWorkflow;
      return HttpResponse.json({ data: current });
    })
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await act(async () => {
    await result.current.publish(workflow);
  });
  expect(requests).toEqual(['read', 'update', 'validate', 'read', 'publish']);
  expect(updated).toMatchObject({
    name: 'Regular admission',
    code: 'REGULAR',
    description: 'Saved details',
    concurrencyStamp: 'original',
    defaultInquiryFormDefinitionId: 'inquiry-form',
    transitions: saved.transitions,
    stages: [expect.objectContaining({ id: 'form-stage', code: 'FORM', allowManualSkip: false })],
  });
  expect(JSON.parse(current.stages[0].configurationJson!)).toMatchObject({
    form: { enabled: true, autoAdvanceOnSubmit: true, requireSectionVerification: false },
  });
  expect(publishedStamps).toEqual(['after-validation']);
});
