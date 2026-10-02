import { useFormik } from 'formik';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { getOfferingInitialValues } from './admission-offering-model';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

import type { AdmissionOfferingFormValues } from './admission-offering-model';

const mocks = vi.hoisted(() => ({ loadWorkflow: vi.fn() }));

vi.mock('src/redux/student/admissions/admission-workflows-api', () => ({
  useLazyGetAdmissionWorkflowQuery: () => [mocks.loadWorkflow],
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: (id: string) => ({
    data: id
      ? { id, name: id === 'inquiry-1' ? 'Parent inquiry' : 'Student registration', version: 1 }
      : undefined,
  }),
}));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({ data: [], isError: false }),
}));

const workflow = { id: 'workflow-1', name: 'Grade 1 Admission', version: 1 };
const fetchWorkflows = vi.fn(async () => ({ data: [workflow], hasMore: false }));
const fetchForms = vi.fn(async () => ({ data: [], hasMore: false }));

function Form({ entryMode = 0 }: { entryMode?: 0 | 1 }) {
  const formik = useFormik<AdmissionOfferingFormValues>({
    initialValues: { ...getOfferingInitialValues(null), entryMode },
    onSubmit: vi.fn(),
  });
  return (
    <>
      <AdmissionOfferingConfigurationFields
        formik={formik}
        fetchWorkflows={fetchWorkflows}
        fetchInquiryForms={fetchForms}
        fetchRegistrationForms={fetchForms}
      />
      <output data-testid="selected-forms">
        {JSON.stringify({
          workflow: formik.values.workflowDefinitionId,
          inquiry: formik.values.inquiryFormDefinitionId,
          registration: formik.values.applicationFormDefinitionId,
        })}
      </output>
    </>
  );
}

describe('Offering workflow form defaults', () => {
  beforeEach(() => {
    mocks.loadWorkflow.mockReset();
    mocks.loadWorkflow.mockReturnValue({
      unwrap: async () => ({
        ...workflow,
        defaultInquiryFormDefinitionId: 'inquiry-1',
        stages: [{ stageType: 1, configurationJson: '{"formDefinitionId":"registration-1"}' }],
      }),
    });
  });

  it('prefills both linked forms when a published workflow is selected', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Form />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('combobox', { name: 'Published workflow' }));
    await user.click(await screen.findByRole('option', { name: 'Grade 1 Admission · v1' }));

    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('selected-forms').textContent ?? '{}')).toEqual({
        workflow: 'workflow-1',
        inquiry: 'inquiry-1',
        registration: 'registration-1',
      })
    );
    expect(screen.getByRole('combobox', { name: 'Published inquiry form' })).toHaveValue(
      'Parent inquiry · v1'
    );
    expect(screen.getByRole('combobox', { name: 'Published application form' })).toHaveValue(
      'Student registration · v1'
    );
  });

  it('does not add an inquiry form to direct registration', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Form entryMode={1} />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('combobox', { name: 'Published workflow' }));
    await user.click(await screen.findByRole('option', { name: 'Grade 1 Admission · v1' }));

    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('selected-forms').textContent ?? '{}')).toEqual({
        workflow: 'workflow-1',
        inquiry: null,
        registration: 'registration-1',
      })
    );
  });
});
