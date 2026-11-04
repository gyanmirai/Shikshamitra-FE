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

const mocks = vi.hoisted(() => ({ isError: false, refetch: vi.fn(), query: vi.fn() }));
const setup = {
  id: 'setup-1',
  name: 'School intake',
  inquiryIntakeProfileId: 'inquiry-profile-1',
  counsellorAssignmentProfileId: 'assignment-profile-1',
} as AdmissionIntakeSetup;
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => {
    mocks.query();
    return { data: [setup], isError: mocks.isError, refetch: mocks.refetch };
  },
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
            <output data-testid="draft">{JSON.stringify(formik.values)}</output>
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
    mocks.query.mockClear();
  });

  it('has no admission window or date controls and always sends cycle-date inheritance', () => {
    show({ useCycleDates: false, openDate: null, closeDate: null });
    expect(screen.queryByRole('combobox', { name: 'Admission Window' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications Open/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications Close/)).not.toBeInTheDocument();
    expect(screen.getByTestId('payload')).toHaveTextContent('"useCycleDates":true');
    expect(screen.getByTestId('payload')).toHaveTextContent('"openDate":null');
    expect(screen.getByTestId('payload')).toHaveTextContent('"closeDate":null');
  });

  it('omits Inquiry and retired setup controls for RTE and sends no routing profiles', () => {
    show({
      track: 1,
      entryMode: 1,
      isActive: true,
      workflowDefinitionId: 'workflow-1',
      inquiryIntakeProfileId: setup.inquiryIntakeProfileId,
      counsellorAssignmentProfileId: setup.counsellorAssignmentProfileId,
    });
    expect(screen.queryByRole('combobox', { name: 'Inquiry Form' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Intake & Assignment Setup (optional)' })
    ).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('payload').textContent!)).toMatchObject({
      track: 1,
      entryMode: 1,
      workflowDefinitionId: 'workflow-1',
      inquiryIntakeProfileId: null,
      inquiryFormDefinitionId: null,
      counsellorAssignmentProfileId: null,
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('defaults both routing profiles to null without requesting retired setup options', () => {
    show();
    expect(screen.getAllByRole('combobox').map((field) => field.getAttribute('name'))).toEqual([
      'workflowDefinitionId',
      'inquiryFormDefinitionId',
    ]);
    expect(JSON.parse(screen.getByTestId('payload').textContent!)).toMatchObject({
      inquiryIntakeProfileId: null,
      counsellorAssignmentProfileId: null,
    });
    expect(screen.getByTestId('payload')).not.toHaveTextContent('__manual__');
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('preserves legacy profile values in the draft but clears counsellor routing in the payload', () => {
    show({
      inquiryIntakeProfileId: 'legacy-inquiry',
      counsellorAssignmentProfileId: 'legacy-assignment',
    });
    expect(JSON.parse(screen.getByTestId('draft').textContent!)).toMatchObject({
      inquiryIntakeProfileId: 'legacy-inquiry',
      counsellorAssignmentProfileId: 'legacy-assignment',
    });
    expect(JSON.parse(screen.getByTestId('payload').textContent!)).toMatchObject({
      inquiryIntakeProfileId: 'legacy-inquiry',
      counsellorAssignmentProfileId: null,
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('serializes a preselected combined setup without restoring the retired setup selector', () => {
    show({
      inquiryIntakeProfileId: setup.inquiryIntakeProfileId,
      counsellorAssignmentProfileId: setup.counsellorAssignmentProfileId,
    });
    expect(
      screen.queryByRole('combobox', { name: 'Intake & Assignment Setup (optional)' })
    ).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('payload').textContent!)).toMatchObject({
      inquiryIntakeProfileId: 'inquiry-profile-1',
      counsellorAssignmentProfileId: null,
    });
    expect(JSON.parse(screen.getByTestId('draft').textContent!)).toMatchObject({
      inquiryIntakeProfileId: 'inquiry-profile-1',
      counsellorAssignmentProfileId: 'assignment-profile-1',
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('marks activation-required fields and shows validation directly below each invalid field', async () => {
    show({ isActive: true });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Validate configuration' }));
    const workflow = screen.getByRole('combobox', { name: 'Published Workflow' });
    const inquiry = screen.getByRole('combobox', { name: 'Inquiry Form' });
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
    const inquiry = screen.getByRole('combobox', { name: 'Inquiry Form' });
    const workflow = screen.getByRole('combobox', { name: 'Published Workflow' });
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

  it('keeps workflow and inquiry configuration independent of retired setup lookup failures', () => {
    mocks.isError = true;
    show();
    expect(screen.getByRole('combobox', { name: 'Published Workflow' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Inquiry Form' })).toBeEnabled();
    expect(screen.queryByText('Unable to load Admission intake setups.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry intake setups' })).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('payload').textContent!)).toMatchObject({
      inquiryIntakeProfileId: null,
      counsellorAssignmentProfileId: null,
    });
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.refetch).not.toHaveBeenCalled();
  });
});
