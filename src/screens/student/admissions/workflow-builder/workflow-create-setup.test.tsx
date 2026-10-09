import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { addIcon } from '@iconify/react';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, renderHook, fireEvent } from '@testing-library/react';

import { WorkflowSetupProgress } from './components/workflow-setup-progress';
import { useWorkflowBuilderDraft } from './hooks/use-workflow-builder-draft';
import { useWorkflowBuilderCommands } from './hooks/use-workflow-builder-commands';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('../use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

addIcon('mdi:arrow-left', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
addIcon('eva:checkmark-fill', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });

const workflow: AdmissionWorkflow = {
  id: 'workflow-1',
  name: 'Fresh admission',
  code: 'FRESH_ADMISSION',
  description: 'First details',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp-1',
  creationTime: '2026-10-02T00:00:00Z',
  defaultInquiryFormDefinitionId: null,
  stages: [
    {
      id: 'stage-1',
      code: 'FORM',
      name: 'Application form',
      stageType: 1,
      displayOrder: 0,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
    },
  ],
  transitions: [],
};

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

afterEach(() => {
  mswServer.resetHandlers();
});

it('shows saved details and the active journey as read-only progress without a Back button', () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <WorkflowSetupProgress />
    </ThemeProvider>
  );

  const steps = screen.getByRole('list', { name: 'Workflow setup steps' });
  expect(steps).toHaveTextContent('Workflow details');
  expect(steps).toHaveTextContent('Build journey');
  expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
  expect(screen.getAllByRole('listitem')[0]).toHaveClass('Mui-completed');
  expect(screen.queryByRole('button', { name: /Step 2/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/Step \d of 2/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Back to details' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('keeps the details step compact without duplicated progress text', () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <WorkflowSetupProgress activeStep={0} />
    </ThemeProvider>
  );
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step');
  expect(screen.queryByText(/Step \d of 2/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Back to details' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Back to workflow details' })
  ).not.toBeInTheDocument();
});

it('returns to saved workflow details through its completed step and locks it while busy', () => {
  const onBackToDetails = vi.fn();
  const { rerender } = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <WorkflowSetupProgress onBackToDetails={onBackToDetails} />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back to workflow details' }));
  expect(onBackToDetails).toHaveBeenCalledOnce();
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <WorkflowSetupProgress onBackToDetails={onBackToDetails} disabled />
    </ThemeProvider>
  );
  expect(screen.getByRole('button', { name: 'Back to workflow details' })).toBeDisabled();
});

it('saves the current journey, validates, reloads its stamp and publishes immediately once', async () => {
  const store = makeStore();
  const requests: string[] = [];
  let saved = workflow;
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', async ({ request }) => {
      requests.push('save');
      saved = { ...workflow, ...(await request.json() as object), concurrencyStamp: 'saved-stamp' };
      return HttpResponse.json({ data: saved });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/validate', () => {
      requests.push('validate');
      saved = { ...saved, status: 3, concurrencyStamp: 'validated-stamp' };
      return HttpResponse.json({ data: { isValid: true, issues: [] } });
    }),
    http.get('*/api/student/enrollment/admissions/workflows/workflow-1', () => {
      requests.push('refresh');
      return HttpResponse.json({ data: saved });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/publish', ({ request }) => {
      requests.push('publish');
      expect(new URL(request.url).searchParams.get('concurrencyStamp')).toBe('validated-stamp');
      expect(new URL(request.url).searchParams.has('effectiveAt')).toBe(false);
      return HttpResponse.json({ data: { ...saved, status: 1 } });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => {
    const draft = useWorkflowBuilderDraft(workflow, null);
    return { draft, commands: useWorkflowBuilderCommands(workflow.id, workflow, draft) };
  }, { wrapper });
  act(() => result.current.draft.markDirty());
  await act(async () => {
    const first = result.current.commands.publish();
    const duplicate = await result.current.commands.publish();
    expect(duplicate).toBeNull();
    expect((await first)?.status).toBe(1);
  });
  expect(requests.slice(0, 4)).toEqual(['save', 'validate', 'refresh', 'publish']);
  expect(requests.filter((request) => request === 'publish')).toHaveLength(1);
  expect(result.current.draft.dirty).toBe(false);
  store.dispatch(api.util.resetApiState());
});

it('keeps an invalid workflow in the builder without publishing', async () => {
  const store = makeStore();
  const publish = vi.fn();
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', () => HttpResponse.json({ data: workflow })),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/validate', () =>
      HttpResponse.json({ data: { isValid: false, issues: [{ code: 'MissingRoute', message: 'Add a route' }] } })),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-1/publish', () => {
      publish(); return HttpResponse.json({ data: workflow });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => {
    const draft = useWorkflowBuilderDraft(workflow, null);
    return { draft, commands: useWorkflowBuilderCommands(workflow.id, workflow, draft) };
  }, { wrapper });
  await act(async () => expect(await result.current.commands.publish()).toBeNull());
  expect(publish).not.toHaveBeenCalled();
  expect(result.current.draft.sidePanel).toBe('validation');
  store.dispatch(api.util.resetApiState());
});

it('updates the same draft with edited details and its unsaved journey', async () => {
  const store = makeStore();
  const requests: Array<{ method: string; body: Record<string, unknown> }> = [];
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows', async ({ request }) => {
      requests.push({
        method: request.method,
        body: (await request.json()) as Record<string, unknown>,
      });
      return HttpResponse.json({ data: workflow });
    }),
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      requests.push({ method: request.method, body });
      return HttpResponse.json({ data: { ...workflow, ...body, concurrencyStamp: 'stamp-2' } });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(
    () => {
      const draft = useWorkflowBuilderDraft(workflow, null);
      const commands = useWorkflowBuilderCommands(workflow.id, workflow, draft);
      return { draft, commands };
    },
    { wrapper }
  );

  act(() => {
    result.current.draft.setStages([{ ...workflow.stages[0], name: 'Edited form stage' }]);
    result.current.draft.markDirty();
  });
  await act(async () => {
    await result.current.commands.saveDetails({
      name: 'Updated admission',
      code: 'FRESH_ADMISSION',
      description: 'Updated details',
    });
  });

  expect(requests).toHaveLength(1);
  expect(requests[0].method).toBe('PUT');
  expect(requests[0].body).toMatchObject({
    name: 'Updated admission',
    description: 'Updated details',
    concurrencyStamp: 'stamp-1',
    stages: [{ id: 'stage-1', name: 'Edited form stage' }],
    transitions: [],
  });
  await waitFor(() => expect(result.current.draft.loadedStamp).toBe('stamp-2'));
  expect(result.current.draft.stages[0].name).toBe('Edited form stage');
  expect(result.current.draft.dirty).toBe(false);
  expect(result.current.commands.getCurrentDetails()).toMatchObject({
    name: 'Updated admission',
    description: 'Updated details',
  });

  act(() => {
    result.current.draft.setStages([{ ...workflow.stages[0], name: 'Final form stage' }]);
    result.current.draft.markDirty();
  });
  await act(async () => {
    await result.current.commands.saveDraft();
  });
  expect(requests).toHaveLength(2);
  expect(requests[1].method).toBe('PUT');
  expect(requests[1].body).toMatchObject({
    name: 'Updated admission',
    description: 'Updated details',
    concurrencyStamp: 'stamp-2',
    stages: [{ id: 'stage-1', name: 'Final form stage' }],
  });

  store.dispatch(api.util.resetApiState());
});

it('saves a selected template to the same draft while retaining inquiry configuration', async () => {
  const store = makeStore();
  const existing = { ...workflow, defaultInquiryFormDefinitionId: 'inquiry-1' };
  let requestBody: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        data: { ...existing, ...requestBody, concurrencyStamp: 'stamp-2' },
      });
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(
    () => {
      const draft = useWorkflowBuilderDraft(existing, null);
      return { draft, commands: useWorkflowBuilderCommands(existing.id, existing, draft) };
    },
    { wrapper }
  );
  await act(async () => {
    await result.current.commands.saveDetails({
      name: 'Updated',
      code: 'FRESH_ADMISSION',
      starterJourney: 'simple',
      registrationFormDefinitionId: 'registration-2',
    });
  });
  expect(requestBody).toMatchObject({
    name: 'Updated',
    concurrencyStamp: 'stamp-1',
    defaultInquiryFormDefinitionId: 'inquiry-1',
  });
  expect(result.current.draft.stages).toHaveLength(3);
  expect(result.current.draft.transitions).toHaveLength(2);
  expect(JSON.parse(result.current.draft.stages[0].configurationJson!)).toMatchObject({
    formDefinitionId: 'registration-2',
  });
  expect(result.current.draft.loadedStamp).toBe('stamp-2');
  store.dispatch(api.util.resetApiState());
});

it('retains the original graph and stamp when saving a replacement fails', async () => {
  const store = makeStore();
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/workflows/workflow-1', () =>
      HttpResponse.json({ error: { message: 'Conflict' } }, { status: 409 })
    )
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(
    () => {
      const draft = useWorkflowBuilderDraft(workflow, null);
      return { draft, commands: useWorkflowBuilderCommands(workflow.id, workflow, draft) };
    },
    { wrapper }
  );
  const previousStages = result.current.draft.stages;
  await act(async () => {
    await expect(
      result.current.commands.saveDetails({
        name: 'Replacement',
        code: 'FRESH_ADMISSION',
        starterJourney: 'simple',
        registrationFormDefinitionId: 'form-2',
      })
    ).rejects.toBeDefined();
  });
  expect(result.current.draft.stages).toBe(previousStages);
  expect(result.current.draft.loadedStamp).toBe('stamp-1');
  expect(result.current.commands.getCurrentDetails()?.name).toBe('Fresh admission');
  store.dispatch(api.util.resetApiState());
});
