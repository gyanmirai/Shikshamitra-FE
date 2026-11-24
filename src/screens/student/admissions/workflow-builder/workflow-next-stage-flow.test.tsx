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
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { getAdmissionWorkflowTemplate } from '../workflow-template';
import AdmissionWorkflowBuilder from '../admission-workflow-builder';

import type { WorkflowBuilderHeaderProps } from './components/workflow-builder-header';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const navigationPush = vi.hoisted(() => vi.fn());
beforeEach(() => {
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-next/validate-preview', () =>
      HttpResponse.json({ data: { isValid: true, issues: [] } })
    )
  );
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigationPush }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('../use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../admission-workflow-dialog', () => ({
  AdmissionWorkflowDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <button type="button" onClick={onClose}>
        Return to Build Journey
      </button>
    ) : null,
}));
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
vi.mock('./components/workflow-builder-header', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./components/workflow-builder-header')>()),
  WorkflowBuilderHeader: ({ children, onBack }: WorkflowBuilderHeaderProps) => (
    <>
      <button type="button" onClick={onBack}>
        Back to workflows
      </button>
      {children}
    </>
  ),
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
  navigationPush.mockClear();
  cleanup();
  stores.forEach((store) => store.dispatch(api.util.resetApiState()));
  stores.length = 0;
});

async function setup(openNextStage = true, initialWorkflow = workflow, types = [metadata]) {
  const saves: Array<Pick<AdmissionWorkflow, 'stages' | 'transitions'>> = [];
  let saved = initialWorkflow;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/workflows/stage-types', () =>
      HttpResponse.json({ data: types })
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
  await screen.findByRole('list', { name: 'Journey Stage Sequence' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add Stage' })).toBeEnabled());
  if (!openNextStage) return { saves };
  const source = within(screen.getByRole('list', { name: 'Journey Stage Sequence' })).getAllByRole(
    'listitem'
  )[0];
  fireEvent.click(within(source).getByRole('button', { name: 'Choose Next Step' }));
  expect(await screen.findByText('Configure Assessment')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Stage name *' })).toHaveValue('Assessment');
  expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Continue To *' })).not.toBeInTheDocument();
  expect(screen.queryByText('Next Step', { exact: true })).not.toBeInTheDocument();
  return { saves };
}

it('keeps route guidance and independent setup errors after Save Draft', async () => {
  const journey = getAdmissionWorkflowTemplate('standard', 'registration-form');
  const documents = journey.stages.find((stage) => stage.stageType === 5)!;
  const form = journey.stages.find((stage) => stage.stageType === 1)!;
  const payment = journey.stages.find((stage) => stage.stageType === 4)!;
  const entry = journey.stages.find((stage) => stage.isEntryStage)!;
  const message = `Stage '${documents.name}' has no incoming transition.`;
  const connectionHint = `Connect ${form.name} to ${documents.name} before publishing.`;
  const issue = {
    code: 'Admissions.WorkflowOrphanStage',
    stageId: documents.id,
    severity: 0,
    message,
  };
  const unreachable = {
    ...issue,
    code: 'Admissions.WorkflowUnreachableStage',
    message: `Stage '${documents.name}' cannot be reached from the entry stage.`,
  };
  const documentSetup = {
    ...issue,
    code: 'Admissions:Documents:InvalidPolicy',
    message: 'Configure between 1 and 30 document requirements.',
  };
  const routeIssues = [
    issue,
    unreachable,
    {
      ...issue,
      stageId: form.id,
      code: 'Admissions.WorkflowDeadEndStage',
      message: `Stage '${form.name}' has no outgoing transition.`,
    },
    {
      ...unreachable,
      stageId: payment.id,
      message: `Stage '${payment.name}' cannot be reached from the entry stage.`,
    },
    {
      ...issue,
      stageId: entry.id,
      code: 'Admissions.WorkflowTerminalUnreachable',
      message: `Stage '${entry.name}' cannot reach a terminal stage.`,
    },
  ];
  let finishValidation!: () => void;
  const waitForValidationRelease = new Promise<void>((resolve) => {
    finishValidation = resolve;
  });
  const publish = vi.fn();
  const previewedConnection = vi.fn();
  mswServer.use(
    http.post(
      '*/api/student/enrollment/admissions/workflows/workflow-next/validate-preview',
      async ({ request }) => {
        const graph = (await request.json()) as Pick<AdmissionWorkflow, 'transitions'>;
        const connected = graph.transitions.some((route) => route.toStageId === documents.id);
        previewedConnection(connected);
        return HttpResponse.json({
          data: {
            isValid: false,
            issues: connected ? [documentSetup] : [documentSetup, ...routeIssues],
          },
        });
      }
    ),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-next/validate', async () => {
      await waitForValidationRelease;
      return HttpResponse.json({
        data: { isValid: false, issues: [documentSetup, ...routeIssues] },
      });
    }),
    http.post('*/api/student/enrollment/admissions/workflows/workflow-next/publish', () => {
      publish();
      return HttpResponse.json({ data: workflow });
    })
  );
  await setup(false, { ...workflow, ...journey });
  fireEvent.click(screen.getByRole('button', { name: 'Remove Route To Document verification' }));
  const card = () => within(document.getElementById(`workflow-stage-${documents.id}`)!);
  expect(await card().findByText(connectionHint)).toBeVisible();
  expect(card().queryByText(message)).not.toBeInTheDocument();
  const formCard = within(document.getElementById(`workflow-stage-${form.id}`)!);
  expect(formCard.getByText('Choose the Next Step Before Publishing')).toBeVisible();
  expect(formCard.queryByText(/has no outgoing transition/)).not.toBeInTheDocument();
  expect(formCard.queryByText(/\d+ Issues?/)).not.toBeInTheDocument();
  expect(
    screen.queryByText(`Stage '${payment.name}' cannot be reached from the entry stage.`)
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(`Stage '${entry.name}' cannot reach a terminal stage.`)
  ).not.toBeInTheDocument();
  expect(card().getByText(documentSetup.message)).toBeVisible();
  const save = screen.getByRole('button', { name: 'Save Draft' });
  fireEvent.click(save);
  await waitFor(() => expect(save).toBeDisabled());
  expect(await card().findByText(connectionHint)).toBeVisible();
  expect(screen.getByRole('status', { name: 'Journey Validation Summary' })).toHaveTextContent(
    'Journey Needs Attention'
  );
  const publishButton = screen.getByRole('button', { name: 'Publish' });
  await waitFor(() => expect(publishButton).toBeEnabled());
  fireEvent.click(publishButton);
  expect(await within(publishButton).findByRole('progressbar')).toBeVisible();
  expect(save).toBeDisabled();
  expect(within(save).queryByRole('progressbar')).not.toBeInTheDocument();
  await act(async () => finishValidation());
  await waitFor(() => expect(publishButton).toBeEnabled());
  expect(publish).not.toHaveBeenCalled();
  fireEvent.click(card().getByRole('button', { name: 'Connect Route for Document verification' }));
  expect(await screen.findByRole('combobox', { name: 'Continue To *' })).toHaveTextContent(
    documents.name
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Path' }));
  await waitFor(() => expect(previewedConnection).toHaveBeenLastCalledWith(true));
  expect(await card().findByText(documentSetup.message)).toBeVisible();
  expect(card().queryByText(connectionHint)).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Journey Validation Summary' })).toHaveTextContent(
    'Journey Needs Attention'
  );
});

it('replaces duplicate route errors with compact guidance for a disconnected final stage', async () => {
  const [source, decision] = workflow.stages;
  const deadEnd = `Stage '${source.name}' has no outgoing transition.`;
  const orphan = `Stage '${decision.name}' has no incoming transition.`;
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-next/validate-preview', () =>
      HttpResponse.json({
        data: {
          isValid: false,
          issues: [
            {
              code: 'Admissions.WorkflowDeadEndStage',
              stageId: source.id,
              severity: 0,
              message: deadEnd,
            },
            {
              code: 'Admissions.WorkflowOrphanStage',
              stageId: decision.id,
              severity: 0,
              message: orphan,
            },
          ],
        },
      })
    )
  );

  await setup(false);
  const journey = within(screen.getByRole('list', { name: 'Journey Stage Sequence' }));
  const [sourceCard, decisionCard] = journey.getAllByRole('listitem').map((card) => within(card));
  expect(
    await decisionCard.findByText(`Connect ${source.name} to ${decision.name} before publishing.`)
  ).toBeVisible();
  expect(
    decisionCard.getByRole('button', { name: `Connect Route for ${decision.name}` })
  ).toBeVisible();
  expect(decisionCard.getByText('End of Journey')).toBeVisible();
  expect(sourceCard.getByText('Choose the Next Step Before Publishing')).toBeVisible();
  expect(sourceCard.getByRole('button', { name: 'Choose Next Step' })).toBeVisible();
  expect(journey.queryByRole('alert')).not.toBeInTheDocument();
  expect(journey.queryByText(/\d+ Issues?/)).not.toBeInTheDocument();
});

it('shows missing document requirements when opening a connected standard draft', async () => {
  const journey = getAdmissionWorkflowTemplate('standard', 'registration-form');
  const documents = journey.stages.find((stage) => stage.stageType === 5)!;
  mswServer.use(
    http.post('*/api/student/enrollment/admissions/workflows/workflow-next/validate-preview', () =>
      HttpResponse.json({
        data: {
          isValid: false,
          issues: [
            {
              code: 'Admissions:Documents:InvalidPolicy',
              severity: 0,
              stageId: documents.id,
              message: 'Configure between 1 and 30 document requirements.',
            },
          ],
        },
      })
    )
  );
  await setup(false, { ...workflow, ...journey });
  const card = within(document.getElementById(`workflow-stage-${documents.id}`)!);
  expect(await card.findByText('Configure between 1 and 30 document requirements.')).toBeVisible();
  expect(
    card.getByRole('button', { name: 'Edit Document Setup for Document verification' })
  ).toBeEnabled();
});

it('reconnects the standard document stage when Payment is inserted after Admission Form', async () => {
  const journey = getAdmissionWorkflowTemplate('standard', 'registration-form');
  const form = journey.stages.find((stage) => stage.stageType === 1)!;
  const documents = journey.stages.find((stage) => stage.stageType === 5)!;
  const { saves } = await setup(false, { ...workflow, ...journey }, [
    {
      ...metadata,
      type: 4,
      displayName: 'Payment',
      supportedConfiguration: ['payment'],
    },
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Remove Route To Document verification' }));
  const source = within(document.getElementById(`workflow-stage-${form.id}`)!);
  fireEvent.click(source.getByRole('button', { name: 'Choose Next Step' }));
  fireEvent.change(await screen.findByRole('textbox', { name: 'Stage name *' }), {
    target: { value: 'Inserted payment' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
  await waitFor(() => expect(saves).toHaveLength(1));
  const inserted = saves[0].stages.find((stage) => stage.name === 'Inserted payment')!;
  expect(inserted.stageType).toBe(4);
  expect(saves[0].transitions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ fromStageId: form.id, toStageId: inserted.id }),
      expect.objectContaining({ fromStageId: inserted.id, toStageId: documents.id }),
    ])
  );
});

describe('Choose next step creates and configures a connected stage', { timeout: 20000 }, () => {
  it('applies one new stage and its default route even when other saved stages exist', async () => {
    const { saves } = await setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Additional assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(
      () => expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    const sequence = await screen.findByRole(
      'list',
      { name: 'Journey Stage Sequence' },
      { timeout: 10000 }
    );
    expect(within(sequence).getAllByRole('listitem')).toHaveLength(3);
    expect(within(sequence).getByText('Additional assessment')).toBeInTheDocument();
    expect(within(sequence).getByText('Existing finalization')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save path' })).not.toBeInTheDocument();
    expect(saves).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 10000 });
    const added = saves[0].stages.find((stage) => stage.name === 'Additional assessment');
    expect(added).toMatchObject({ stageType: 2, isEntryStage: false });
    expect(saves[0].stages.map((stage) => stage.id)).toEqual(['source', added!.id, 'decision']);
    expect(saves[0].transitions).toEqual([
      expect.objectContaining({ fromStageId: 'source', toStageId: added!.id, isDefault: true }),
      expect.objectContaining({ fromStageId: added!.id, toStageId: 'decision', isDefault: true }),
    ]);
  });
  it('lets Add stage choose an insertion point and splits the saved usual path', async () => {
    const { saves } = await setup(false, {
      ...workflow,
      transitions: [
        { id: 'usual', fromStageId: 'source', toStageId: 'decision', priority: 0, isDefault: true },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Stage' }));
    expect(await screen.findByRole('combobox', { name: 'Insert After *' })).toBeVisible();
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Inserted assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    await waitFor(() => expect(saves).toHaveLength(1));
    const inserted = saves[0].stages.find((stage) => stage.name === 'Inserted assessment')!;
    expect(saves[0].stages.map((stage) => stage.id)).toEqual(['source', inserted.id, 'decision']);
    expect(saves[0].transitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'usual',
          fromStageId: 'source',
          toStageId: inserted.id,
          isDefault: true,
        }),
        expect.objectContaining({
          fromStageId: inserted.id,
          toStageId: 'decision',
          isDefault: true,
        }),
      ])
    );
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      within(screen.getByRole('list', { name: 'Journey Stage Sequence' })).getAllByRole('listitem')
    ).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(
      within(screen.getByRole('list', { name: 'Journey Stage Sequence' })).getAllByRole('listitem')
    ).toHaveLength(3);
  });
  it('abandons the next-stage editor without adding a stage or route', async () => {
    const { saves } = await setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Unsaved assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(
      () => expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument(),
      { timeout: 10000 }
    );
    const sequence = await screen.findByRole(
      'list',
      { name: 'Journey Stage Sequence' },
      { timeout: 10000 }
    );
    expect(within(sequence).getAllByRole('listitem')).toHaveLength(2);
    expect(within(sequence).queryByText('Unsaved Assessment')).not.toBeInTheDocument();
    expect(within(sequence).getByRole('button', { name: 'Choose Next Step' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(saves).toHaveLength(0);
  });
  it('honors the selected insertion position instead of the default last non-ending stage', async () => {
    const middle = {
      ...workflow.stages[0],
      id: 'middle',
      code: 'MIDDLE',
      name: 'Middle assessment',
      displayOrder: 1,
      isEntryStage: false,
    };
    const { saves } = await setup(false, {
      ...workflow,
      stages: [workflow.stages[0], middle, { ...workflow.stages[1], displayOrder: 2 }],
      transitions: [
        { id: 'first', fromStageId: 'source', toStageId: 'middle', priority: 0, isDefault: true },
        { id: 'last', fromStageId: 'middle', toStageId: 'decision', priority: 0, isDefault: true },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Stage' }));
    const position = await screen.findByRole('combobox', { name: 'Insert After *' });
    expect(position).toHaveTextContent('Middle assessment');
    fireEvent.mouseDown(position);
    fireEvent.click(await screen.findByRole('option', { name: 'Entrance assessment' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
      target: { value: 'Chosen position assessment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    await waitFor(() => expect(saves).toHaveLength(1));
    const inserted = saves[0].stages.find((stage) => stage.name === 'Chosen position assessment')!;
    expect(saves[0].stages.map((stage) => stage.id)).toEqual([
      'source',
      inserted.id,
      'middle',
      'decision',
    ]);
    expect(saves[0].transitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'first', fromStageId: 'source', toStageId: inserted.id }),
        expect.objectContaining({ fromStageId: inserted.id, toStageId: 'middle', isDefault: true }),
        expect.objectContaining({ id: 'last', fromStageId: 'middle', toStageId: 'decision' }),
      ])
    );
  });
});

it('guards leaving the main workflow draft after a staged edit is applied', async () => {
  await setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Stage name *' }), {
    target: { value: 'Unsaved graph stage' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Apply Changes' })).not.toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back to workflows' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to workflows' }));
  expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
  expect(navigationPush).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Return to Build Journey' }));
  expect(screen.getByText('Unsaved graph stage')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to workflows' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to workflows' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigationPush).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Unsaved graph stage')).not.toBeInTheDocument();
});

it('blocks saving and publishing a single non-decision stage even with an old Final flag', async () => {
  const { saves } = await setup(false, {
    ...workflow,
    stages: [{ ...workflow.stages[0], isTerminalStage: true }],
    transitions: [],
  });
  expect(screen.getByRole('button', { name: 'Save Draft' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Publish' })).toHaveAccessibleDescription(
    'End of Journey must be on for the last Admission decision stage only.'
  );
  expect(saves).toHaveLength(0);
});
