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
import { act, render, screen, within, waitFor, fireEvent, renderHook } from '@testing-library/react';

import { WorkflowListDialogs } from './workflow-list-dialogs';
import { useWorkflowListActions } from './use-workflow-list-actions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const routerPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: routerPush }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));
vi.mock('../admission-workflow-dialog', () => ({ AdmissionWorkflowDialog: () => null }));
vi.mock('../use-admission-definition-options', () => ({
  useAdmissionDefinitionOptions: () => ({ fetchRegistrationForms: vi.fn() }),
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

const confirmPublish = async (
  result: { current: ReturnType<typeof useWorkflowListActions> },
  workflowToPublish: AdmissionWorkflow
) => {
  act(() => result.current.publish(workflowToPublish));
  await act(async () => result.current.confirm());
};

beforeEach(() => {
  vi.clearAllMocks();
  store = makeStore();
  current = workflow;
  publishedStamps = [];
  requests = [];
  invalid = false;
  failPublish = false;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () => {
      requests.push('read');
      return HttpResponse.json({ data: current });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/new-version', () => {
      requests.push('new-version');
      return HttpResponse.json({ data: { ...workflow, id: 'new-version' } });
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

it('waits for confirmation and cancels publication without requesting any changes', () => {
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });

  act(() => result.current.publish(workflow));
  expect(result.current.pendingConfirmation).toEqual({ workflow, action: 'publish' });
  expect(requests).toEqual([]);
  expect(result.current.publishingId).toBeNull();

  act(() => result.current.closeConfirmation());
  expect(result.current.pendingConfirmation).toBeNull();
  expect(requests).toEqual([]);
});

it('cancels creating a new version without requesting a draft or navigating', () => {
  const published = { ...workflow, status: 1 as const };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });

  act(() => result.current.createVersion(published));
  expect(result.current.pendingConfirmation).toEqual({
    workflow: published,
    action: 'createVersion',
  });
  expect(result.current.creatingVersionId).toBeNull();

  act(() => result.current.closeConfirmation());
  expect(result.current.pendingConfirmation).toBeNull();
  expect(requests).toEqual([]);
  expect(routerPush).not.toHaveBeenCalled();
});

it.each([
  ['delete', 'Delete Workflow Draft?', 'Delete'],
  ['createVersion', 'Create New Version?', 'Create New Version'],
  ['publish', 'Publish Workflow?', 'Publish Workflow'],
] as const)('keeps the %s confirmation loading feedback inside its action button', async (action, title, label) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const endpoint = '*/api/student/enrollment/admissions/workflows/workflow-1';
  mswServer.use(
    http.get(endpoint, async () => {
      await pending;
      return HttpResponse.json({ data: current });
    }),
    http.delete(endpoint, () => new HttpResponse(null, { status: 204 })),
    http.post(`${endpoint}/new-version`, async () => {
      await pending;
      return HttpResponse.json({ data: { ...workflow, id: 'new-version' } });
    })
  );

  function Harness() {
    const actions = useWorkflowListActions();
    return (
      <>
        <button
          type="button"
          onClick={() => {
            if (action === 'createVersion') actions.createVersion({ ...workflow, status: 1 });
            else if (action === 'publish') actions.publish(workflow);
            else actions.requestConfirmation(workflow, action);
          }}
        >
          Open confirmation
        </button>
        <WorkflowListDialogs actions={actions} />
      </>
    );
  }

  render(<Harness />, { wrapper });
  fireEvent.click(screen.getByRole('button', { name: 'Open confirmation' }));
  const dialog = within(screen.getByRole('dialog', { name: title }));
  expect(dialog.getByText(/Regular admission/)).toBeVisible();
  const submit = dialog.getByRole('button', { name: label });
  expect(submit).toBeEnabled();
  fireEvent.click(submit);
  expect(submit).toBeDisabled();
  expect(submit).toHaveClass('MuiButton-loadingPositionCenter');
  expect(submit).toHaveTextContent(label);
  expect(within(submit).getByRole('progressbar')).toBeInTheDocument();
  expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  release();
  await waitFor(() => expect(screen.queryByRole('dialog', { name: title })).not.toBeInTheDocument());
});

it('validates the latest saved journey and publishes once with the post-validation stamp', async () => {
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.publish(workflow));
  await act(async () => {
    await Promise.all([result.current.confirm(), result.current.confirm()]);
  });
  expect(requests).toEqual(['read', 'validate', 'read', 'publish']);
  expect(publishedStamps).toEqual(['after-validation']);
  expect(shikshaMitraToast.success).toHaveBeenCalledWith({ message: 'Workflow published' });
  expect(result.current.publishingId).toBeNull();
  expect(result.current.pendingConfirmation).toBeNull();
});

it('guards duplicate new-version commands and identifies the pending row through completion', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let versionCalls = 0;
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/new-version', async () => {
      versionCalls += 1;
      await pending;
      return HttpResponse.json({ data: { ...workflow, id: 'new-version' } });
    })
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.createVersion({ ...workflow, status: 1 }));
  let first!: Promise<void>;
  let duplicate!: Promise<void>;
  act(() => {
    first = result.current.confirm();
    duplicate = result.current.confirm();
    result.current.closeConfirmation();
  });
  expect(result.current.creatingVersionId).toBe('workflow-1');
  expect(result.current.confirmationBusy).toBe(true);
  expect(result.current.pendingConfirmation?.action).toBe('createVersion');
  await act(async () => {
    finish();
    await Promise.all([first, duplicate]);
  });
  expect(versionCalls).toBe(1);
  expect(result.current.creatingVersionId).toBeNull();
  expect(result.current.confirmationBusy).toBe(false);
  expect(result.current.pendingConfirmation).toBeNull();
});

it('shows the existing draft guidance and opens the identified draft after a repeated version request', async () => {
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/new-version', () =>
      HttpResponse.json(
        {
          error: {
            code: 'Admissions.WorkflowDraftRequired',
            message:
              'A draft version already exists for this workflow. Open the existing draft to continue editing.',
            data: { DraftId: 'workflow-draft-2' },
          },
        },
        { status: 400 }
      )
    )
  );

  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.createVersion({ ...workflow, status: 1 }));
  await act(async () => result.current.confirm());

  expect(result.current.existingDraftNotice).toEqual({
    workflowName: 'Regular admission',
    draftId: 'workflow-draft-2',
  });
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();

  await act(async () => {
    result.current.openExistingDraft();
  });
  await waitFor(() =>
    expect(routerPush.mock.calls[0]?.[0]).toBe(
      '/student/admissions/settings/workflows/workflow-draft-2'
    )
  );
});

it('reports validation issues and never publishes an invalid journey', async () => {
  invalid = true;
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, workflow);
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
  await confirmPublish(result, workflow);
  expect(requests).toEqual(['read']);
  expect(shikshaMitraToast.warning).toHaveBeenCalled();
});

it('does not send any request without the existing manage grant', async () => {
  store = makeStore(false);
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, workflow);
  expect(requests).toEqual([]);
});

it.each([1, 2, 4, 7] as const)('does not mutate ineligible status %s', async (status) => {
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, { ...workflow, status });
  expect(requests).toEqual([]);
});

it('rejects a fresh record that became published before the row click', async () => {
  current = { ...workflow, status: 1 };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, workflow);
  expect(requests).toEqual(['read']);
});

it('keeps the confirmation available when publication fails after validation and permits retry', async () => {
  failPublish = true;
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, workflow);
  expect(shikshaMitraToast.error).toHaveBeenCalled();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  expect(result.current.publishingId).toBeNull();
  expect(result.current.confirmationBusy).toBe(false);
  expect(result.current.pendingConfirmation?.action).toBe('publish');

  failPublish = false;
  await act(async () => result.current.confirm());
  expect(publishedStamps).toEqual(['after-validation', 'after-validation']);
  expect(result.current.pendingConfirmation).toBeNull();
});

it('can retry new-version creation after a failed request without starting a second confirmation', async () => {
  let failCreate = true;
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/new-version', () => {
      requests.push('new-version');
      return failCreate
        ? HttpResponse.json({ error: { message: 'Please try again.' } }, { status: 500 })
        : HttpResponse.json({ data: { ...workflow, id: 'new-version' } });
    })
  );
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  act(() => result.current.createVersion({ ...workflow, status: 1 }));
  await act(async () => result.current.confirm());
  expect(shikshaMitraToast.error).toHaveBeenCalledWith({ message: 'Please try again.' });
  expect(result.current.confirmationBusy).toBe(false);
  expect(result.current.pendingConfirmation?.action).toBe('createVersion');

  failCreate = false;
  await act(async () => result.current.confirm());
  expect(requests).toEqual(['new-version', 'new-version']);
  expect(result.current.pendingConfirmation).toBeNull();
});

it.each([3, 5, 6] as const)('preserves the existing publishable status %s', async (status) => {
  current = { ...workflow, status };
  const { result } = renderHook(() => useWorkflowListActions(), { wrapper });
  await confirmPublish(result, current);
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
    await confirmPublish(result, current);
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
  await confirmPublish(result, workflow);
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
