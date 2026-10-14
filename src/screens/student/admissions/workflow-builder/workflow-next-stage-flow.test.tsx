import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, afterEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import AdmissionWorkflowBuilder from '../admission-workflow-builder';

import type {
  WorkflowBuilderHeaderProps,
  WorkflowLifecycleActionsProps,
} from './components/workflow-builder-header';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('../use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../admission-workflow-dialog', () => ({ AdmissionWorkflowDialog: () => null }));
vi.mock('./components/workflow-standard-template-dialog', () => ({
  WorkflowStandardTemplateDialog: () => null,
}));
vi.mock('./components/workflow-side-panel', () => ({ WorkflowSidePanel: () => null }));
// Full stage-type settings are covered by their editor suites; keep this test focused on wiring.
vi.mock('./components/workflow-stage-fields', () => ({
  WorkflowStageFields: ({ formik }: { formik: FormikProps<AdmissionWorkflowStage> }) => (
    <label htmlFor="next-stage-name">
      Stage name *
      <input id="next-stage-name" {...formik.getFieldProps('name')} />
    </label>
  ),
}));
vi.mock('./components/workflow-builder-header', () => ({
  WorkflowBuilderHeader: ({ children }: WorkflowBuilderHeaderProps) => children,
  WorkflowLifecycleActions: ({ dirty, saving, onSave }: WorkflowLifecycleActionsProps) => (
    <button type="button" disabled={!dirty || saving} onClick={onSave}>
      Save draft
    </button>
  ),
}));
vi.mock('../admission-workflow-transition-drawer', () => ({
  AdmissionWorkflowTransitionDrawer: ({ open }: { open: boolean }) =>
    open ? <button type="button">Save path</button> : null,
}));

const metadata: AdmissionWorkflowStageTypeMetadata = {
  type: 2,
  displayName: 'Assessment',
  description: 'Evaluate applicants',
  icon: 'mdi:clipboard-check-outline',
  defaultColor: '#1976d2',
  supportedConfiguration: ['assessment'],
  runtimeHandler: 'Assessment',
  nextRequiredAction: 'Record assessment',
  canBeEntryStage: true,
  canBeTerminalStage: false,
  supportsFormAttachment: false,
  supportsConditions: true,
  isRuntimeReady: true,
};
const workflow: AdmissionWorkflow = {
  id: 'workflow-next',
  name: 'Next stage flow',
  code: 'NEXT_STAGE',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'initial',
  creationTime: '2026-10-13T00:00:00Z',
  stages: [
    {
      id: 'source',
      code: 'ENTRANCE',
      name: 'Entrance assessment',
      stageType: 2,
      displayOrder: 0,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
    },
    {
      id: 'decision',
      code: 'DECISION',
      name: 'Existing finalization',
      stageType: 7,
      displayOrder: 1,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: false,
      isTerminalStage: true,
    },
  ],
  transitions: [],
};
const stores: Array<ReturnType<typeof makeStore>> = [];
const makeStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      confirmPopup,
      auth: () => ({
        permissions: [
          { name: 'Students.Admissions.Workflows.Add', isGranted: true },
          { name: 'Students.Admissions.Workflows.View', isGranted: true },
        ],
      }),
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
afterEach(() => {
  cleanup();
  stores.forEach((store) => store.dispatch(api.util.resetApiState()));
  stores.length = 0;
});

async function setup() {
  const saves: Array<Pick<AdmissionWorkflow, 'stages' | 'transitions'>> = [];
  let saved = workflow;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/stage-types', () =>
      HttpResponse.json({ data: [metadata] })
    ),
    http.get('*/api/student/enrollment/admissions/workflows/workflow-next', () =>
      HttpResponse.json({ data: saved })
    ),
    http.get('*/api/student/enrollment/admissions/workflows/workflow-next/versions', () =>
      HttpResponse.json({ data: [] })
    ),
    http.get('*/api/student/enrollment/admissions/workflows/workflow-next/usage', () =>
      HttpResponse.json({ data: { offeringCount: 0, applicationCount: 0 } })
    ),
    http.get('*/api/student/enrollment/admissions/forms', () =>
      HttpResponse.json({ data: { items: [], totalCount: 0 } })
    ),
    http.put('*/api/student/enrollment/admissions/workflows/workflow-next', async ({ request }) => {
      const body = (await request.json()) as Pick<AdmissionWorkflow, 'stages' | 'transitions'>;
      saves.push(body);
      saved = { ...saved, ...body, concurrencyStamp: 'saved' };
      return HttpResponse.json({ data: saved });
    })
  );
  const store = makeStore();
  stores.push(store);
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionWorkflowBuilder workflowId={workflow.id} />
      </ThemeProvider>
    </Provider>
  );
  await screen.findByRole('list', { name: 'Journey stage sequence' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add stage' })).toBeEnabled());
  const source = within(screen.getByRole('list', { name: 'Journey stage sequence' })).getAllByRole(
    'listitem'
  )[0];
  fireEvent.click(within(source).getByRole('button', { name: 'Choose next step' }));
  expect(await screen.findByText('Configure Assessment')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Assessment');
  expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Continue to *' })).not.toBeInTheDocument();
  expect(screen.queryByText('Next step', { exact: true })).not.toBeInTheDocument();
  return { saves };
}

describe('Choose next step creates and configures a connected stage', { timeout: 20000 }, () => {
  it('applies one new stage and its default route even when other saved stages exist', async () => {
    const { saves } = await setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Additional assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(
      () => expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    const sequence = await screen.findByRole(
      'list',
      { name: 'Journey stage sequence' },
      { timeout: 10000 }
    );
    expect(within(sequence).getAllByRole('listitem')).toHaveLength(3);
    expect(within(sequence).getByText('Additional assessment')).toBeInTheDocument();
    expect(within(sequence).getByText('Existing finalization')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
    expect(saves).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 10000 });
    const added = saves[0].stages.find((stage) => stage.name === 'Additional assessment');
    expect(added).toMatchObject({ stageType: 2, isEntryStage: false });
    expect(saves[0].stages).toHaveLength(3);
    expect(saves[0].transitions).toEqual([
      expect.objectContaining({ fromStageId: 'source', toStageId: added!.id, isDefault: true }),
    ]);
  });
  it('abandons the next-stage editor without adding a stage or route', async () => {
    const { saves } = await setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Unsaved assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(
      () => expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    const sequence = await screen.findByRole(
      'list',
      { name: 'Journey stage sequence' },
      { timeout: 10000 }
    );
    expect(within(sequence).getAllByRole('listitem')).toHaveLength(2);
    expect(within(sequence).queryByText('Unsaved assessment')).not.toBeInTheDocument();
    expect(within(sequence).getByRole('button', { name: 'Choose next step' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(saves).toHaveLength(0);
  });
});
