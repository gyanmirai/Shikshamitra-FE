import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionIntakeSetup } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { BulkAdmissionConfigurationFields } from './bulk-admission-configuration-fields';
import {
  bulkOfferingSchema,
  toBulkOfferingInput,
  bulkOfferingInitialValues,
} from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';
import type { BulkOfferingFieldIssues } from './bulk-admission-offering-validation';

const mocks = vi.hoisted(() => ({ isError: false, refetch: vi.fn() }));
const setup = {
  id: 'setup-1',
  name: 'School intake',
  inquiryIntakeProfileId: 'inquiry-profile-1',
  counsellorAssignmentProfileId: 'assignment-profile-1',
} as AdmissionIntakeSetup;
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({
    data: [setup],
    isError: mocks.isError,
    refetch: mocks.refetch,
  }),
}));

const cycle = { id: 'cycle-1', status: 1, windowStatus: 1 } as AdmissionCycle;
const fetchDefinitions = async () => ({ data: [], hasMore: false });
function show(values: Partial<BulkOfferingValues> = {}, fieldIssues: BulkOfferingFieldIssues = {}) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik
        initialValues={{
          ...bulkOfferingInitialValues,
          admissionCycle: cycle,
          boardId: 'board-1',
          mediumId: 'medium-1',
          standardIds: ['class-1'],
          ...values,
        }}
        validationSchema={bulkOfferingSchema}
        onSubmit={vi.fn()}
      >
        {(formik) => (
          <>
            <BulkAdmissionConfigurationFields
              formik={formik}
              fetchWorkflows={fetchDefinitions}
              fetchInquiryForms={fetchDefinitions}
              change={(updates) => formik.setValues({ ...formik.values, ...updates }, true)}
              fieldIssues={fieldIssues}
            />
            <button
              type="button"
              onClick={() =>
                formik.setTouched(
                  { workflowDefinitionId: true, inquiryFormDefinitionId: true },
                  true
                )
              }
            >
              Validate configuration
            </button>
            <output data-testid="payload">
              {JSON.stringify(toBulkOfferingInput(formik.values, [], true))}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}

describe('Bulk offering configuration', () => {
  beforeEach(() => {
    mocks.isError = false;
    mocks.refetch.mockClear();
  });

  it('has no admission window or date controls and always sends cycle-date inheritance', () => {
    show({ useCycleDates: false, openDate: null, closeDate: null });
    expect(screen.queryByRole('combobox', { name: 'Admission window' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications open/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications close/)).not.toBeInTheDocument();
    expect(screen.getByTestId('payload')).toHaveTextContent('"useCycleDates":true');
    expect(screen.getByTestId('payload')).toHaveTextContent('"openDate":null');
    expect(screen.getByTestId('payload')).toHaveTextContent('"closeDate":null');
  });

  it('omits Inquiry for RTE and applies only the counsellor-routing part of an intake setup', async () => {
    const user = userEvent.setup();
    show({ track: 1, entryMode: 1, isActive: true, workflowDefinitionId: 'workflow-1' });
    expect(screen.queryByRole('combobox', { name: 'Inquiry form' })).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' })
    );
    await user.click(screen.getByRole('option', { name: 'School intake' }));
    await waitFor(() => {
      expect(screen.getByTestId('payload')).toHaveTextContent('"track":1');
      expect(screen.getByTestId('payload')).toHaveTextContent('"entryMode":1');
      expect(screen.getByTestId('payload')).toHaveTextContent('"inquiryIntakeProfileId":null');
      expect(screen.getByTestId('payload')).toHaveTextContent('"inquiryFormDefinitionId":null');
      expect(screen.getByTestId('payload')).toHaveTextContent(
        '"counsellorAssignmentProfileId":"assignment-profile-1"'
      );
    });
    expect(
      screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' })
    ).toHaveTextContent('School intake');
  });

  it('displays manual assignment initially and after clearing a setup, while sending both profiles as null', async () => {
    const user = userEvent.setup();
    show();
    const select = screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' });
    expect(select).toHaveTextContent('No setup — manual assignment');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'School intake' }));
    await waitFor(() =>
      expect(screen.getByTestId('payload')).toHaveTextContent(
        '"counsellorAssignmentProfileId":"assignment-profile-1"'
      )
    );
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'No setup — manual assignment' }));
    await waitFor(() => {
      expect(select).toHaveTextContent('No setup — manual assignment');
      expect(screen.getByTestId('payload')).toHaveTextContent('"inquiryIntakeProfileId":null');
      expect(screen.getByTestId('payload')).toHaveTextContent(
        '"counsellorAssignmentProfileId":null'
      );
    });
    expect(screen.getByTestId('payload')).not.toHaveTextContent('__manual__');
  });

  it('preserves legacy profiles until an explicit manual-assignment choice', async () => {
    const user = userEvent.setup();
    show({
      inquiryIntakeProfileId: 'legacy-inquiry',
      counsellorAssignmentProfileId: 'legacy-assignment',
    });
    const select = screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' });
    expect(select).toHaveTextContent('Legacy profile selection');
    expect(screen.getByTestId('payload')).toHaveTextContent('legacy-assignment');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'No setup — manual assignment' }));
    await waitFor(() => expect(select).toHaveTextContent('No setup — manual assignment'));
    expect(screen.getByTestId('payload')).not.toHaveTextContent('legacy-assignment');
  });

  it('can clear a preselected combined setup and keep manual assignment visibly selected', async () => {
    show({
      inquiryIntakeProfileId: setup.inquiryIntakeProfileId,
      counsellorAssignmentProfileId: setup.counsellorAssignmentProfileId,
    });
    const user = userEvent.setup();
    const select = screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' });
    expect(select).toHaveTextContent('School intake');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'No setup — manual assignment' }));
    await waitFor(() => expect(select).toHaveTextContent('No setup — manual assignment'));
    expect(screen.getByTestId('payload')).toHaveTextContent('"inquiryIntakeProfileId":null');
    expect(screen.getByTestId('payload')).toHaveTextContent('"counsellorAssignmentProfileId":null');
    expect(screen.queryByText('Legacy profile selection')).not.toBeInTheDocument();
  });

  it('marks activation-required fields and shows validation directly below each invalid field', async () => {
    show({ isActive: true });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Validate configuration' }));
    const workflow = screen.getByRole('combobox', { name: 'Published workflow' });
    const inquiry = screen.getByRole('combobox', { name: 'Inquiry form' });
    expect(
      workflow.closest('.MuiFormControl-root')?.querySelector('.MuiInputLabel-asterisk')
    ).toHaveTextContent('*');
    expect(
      inquiry.closest('.MuiFormControl-root')?.querySelector('.MuiInputLabel-asterisk')
    ).toHaveTextContent('*');
    expect(workflow).toBeRequired();
    expect(inquiry).toBeRequired();
    await waitFor(() => {
      expect(
        within(workflow.closest('.MuiFormControl-root')! as HTMLElement).getByText(
          'Workflow is required for activation'
        )
      ).toBeVisible();
      expect(
        within(inquiry.closest('.MuiFormControl-root')! as HTMLElement).getByText(
          'Inquiry form is required for activation'
        )
      ).toBeVisible();
    });
    expect(workflow).toHaveAttribute('name', 'workflowDefinitionId');
  });

  it('shows server feedback under its field without making inactive activation checks required', () => {
    show(
      {},
      {
        inquiryFormDefinitionId: {
          message: 'Published Inquiry Form is required.',
          blocking: false,
        },
        workflowDefinitionId: {
          message: 'The selected workflow is no longer published.',
          blocking: true,
        },
      }
    );
    const inquiry = screen.getByRole('combobox', { name: 'Inquiry form' });
    const workflow = screen.getByRole('combobox', { name: 'Published workflow' });
    expect(inquiry).not.toBeRequired();
    expect(
      within(inquiry.closest('.MuiFormControl-root')! as HTMLElement).getByText(
        'Before activation: Published Inquiry Form is required.'
      )
    ).toBeVisible();
    expect(
      within(workflow.closest('.MuiFormControl-root')! as HTMLElement).getByText(
        'The selected workflow is no longer published.'
      )
    ).toBeVisible();
    expect(workflow).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps setup-load failure actionable without hiding the optional manual choice', async () => {
    mocks.isError = true;
    show();
    expect(
      screen.getByRole('combobox', { name: 'Intake & assignment setup (optional)' })
    ).toHaveTextContent('No setup — manual assignment');
    expect(screen.getByText('Unable to load admission intake setups.')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry intake setups' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
