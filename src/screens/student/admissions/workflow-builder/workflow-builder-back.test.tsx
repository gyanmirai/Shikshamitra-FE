import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { studentPaths } from 'src/constants/student-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { studentSetupReturnUrl } from 'src/screens/student/setup/embedding/student-setup-return';

import { getAdmissionWorkflowTemplate } from '../workflow-template';
import AdmissionWorkflowBuilder from '../admission-workflow-builder';

const route = vi.hoisted(() => ({ push: vi.fn(), params: '' }));
const workflow: AdmissionWorkflow = {
  ...getAdmissionWorkflowTemplate('standard', 'registration-1'),
  id: 'workflow-1',
  name: 'Saved admission',
  code: 'SAVED',
  description: 'Saved details',
  status: 0,
  version: 1,
  offeringCount: 0,
  applicationCount: 0,
  creationTime: '2026-11-23T00:00:00Z',
  concurrencyStamp: 'workflow-stamp',
};
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: route.push }),
  useSearchParams: () => new URLSearchParams(route.params),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../use-admission-definition-options', () => ({
  useAdmissionDefinitionOptions: () => ({}),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({}),
  useGetAdmissionFormsQuery: () => ({}),
}));
vi.mock('src/redux/student/admissions/admission-workflows-api', () => ({
  useGetAdmissionWorkflowQuery: () => ({ data: workflow }),
  useGetAdmissionWorkflowStageTypesQuery: () => ({}),
  useGetAdmissionWorkflowUsageQuery: () => ({}),
  useGetAdmissionWorkflowVersionsQuery: () => ({}),
}));
vi.mock('./hooks/use-workflow-builder-commands', () => ({
  useWorkflowBuilderCommands: () => ({
    getCurrentDetails: () => workflow,
    updateState: { isLoading: false },
    validateState: { isLoading: false },
    publishState: { isLoading: false },
    validateDraftPreview: vi.fn(),
    cancelDraftPreview: vi.fn(),
  }),
}));
vi.mock('./components/workflow-builder-canvas', () => ({
  WorkflowBuilderCanvas: ({
    transitions,
    onDeleteTransition,
  }: {
    transitions: AdmissionWorkflow['transitions'];
    onDeleteTransition: (id: string) => void;
  }) => (
    <>
      <output>{transitions.length} journey routes</output>
      <button type="button" onClick={() => onDeleteTransition(transitions[0].id)}>
        Remove journey route
      </button>
    </>
  ),
}));
vi.mock('./components/workflow-builder-editors', () => ({ WorkflowBuilderEditors: () => null }));
vi.mock('./components/workflow-side-panel', () => ({ WorkflowSidePanel: () => null }));
vi.mock('./components/workflow-standard-template-dialog', () => ({
  WorkflowStandardTemplateDialog: () => null,
}));

function renderBuilder() {
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: [{ name: 'Students.Admissions.Workflows.Add', isGranted: true }],
      }),
      confirmPopup,
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return render(<AdmissionWorkflowBuilder workflowId="workflow-1" />, { wrapper: Wrapper });
}

const clickBack = () => fireEvent.click(screen.getByRole('button', { name: 'Back' }));

beforeEach(() => {
  route.push.mockClear();
  route.params = '';
});

it.each([
  ['new draft', 'setup=1'],
  ['existing draft', ''],
])(
  'steps back through the saved details of the %s and then exits to the listing',
  (_entry, params) => {
    route.params = params;
    renderBuilder();

    clickBack();
    expect(screen.getByRole('textbox', { name: 'Workflow name *' })).toHaveValue(workflow.name);
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(workflow.description);
    expect(route.push).not.toHaveBeenCalled();

    clickBack();
    expect(route.push).toHaveBeenCalledExactlyOnceWith(studentPaths.enrollment.settings.workflows);
  }
);

it('retains both edits when keeping work and confirms once before returning to the setup guide', () => {
  const destination = studentSetupReturnUrl('admission-stages', 'year-1');
  route.params = new URLSearchParams({ returnTo: destination, setup: '1' }).toString();
  renderBuilder();
  expect(screen.getByText('4 journey routes')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Remove journey route' }));
  clickBack();
  const name = screen.getByRole('textbox', { name: 'Workflow name *' });
  fireEvent.change(name, { target: { value: 'Unsaved details' } });

  clickBack();
  const confirmation = screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Keep editing' }));
  expect(name).toHaveValue('Unsaved details');
  expect(screen.getByText('3 Routes')).toBeInTheDocument();
  expect(route.push).not.toHaveBeenCalled();

  clickBack();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(route.push).toHaveBeenCalledExactlyOnceWith(destination);
});

it('uses the same labeled progress in both steps and keeps the completed step clickable', () => {
  renderBuilder();
  const journeyProgress = screen.getByRole('list', { name: 'Workflow setup steps' });
  const completed = within(journeyProgress).getByRole('button', {
    name: 'Step 1: Workflow details',
  });
  expect(within(completed).getByTestId('CheckCircleIcon')).toBeInTheDocument();
  expect(within(journeyProgress).getAllByRole('listitem')[1]).toHaveAttribute(
    'aria-current',
    'step'
  );

  fireEvent.click(completed);
  const detailsProgress = screen.getByRole('list', { name: 'Workflow setup steps' });
  expect(within(detailsProgress).getAllByRole('listitem')[0]).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(screen.queryByRole('button', { name: 'Close Workflow Editor' })).not.toBeInTheDocument();
  expect(route.push).not.toHaveBeenCalled();
});
