import { useFormik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { getOfferingInitialValues } from './admission-offering-model';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

import type { AdmissionOfferingFormValues } from './admission-offering-model';

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: (id: string) => ({
    data: id ? { id, name: 'Parent inquiry', version: 1 } : undefined,
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
    initialValues: {
      ...getOfferingInitialValues(null),
      entryMode,
      inquiryFormDefinitionId: entryMode === 0 ? 'inquiry-1' : null,
      applicationFormDefinitionId: 'old-application-form',
    },
    onSubmit: vi.fn(),
  });
  return (
    <>
      <AdmissionOfferingConfigurationFields
        formik={formik}
        fetchWorkflows={fetchWorkflows}
        fetchInquiryForms={fetchForms}
      />
      <output data-testid="selected-forms">
        {JSON.stringify({
          workflow: formik.values.workflowDefinitionId,
          inquiry: formik.values.inquiryFormDefinitionId,
          application: formik.values.applicationFormDefinitionId,
          entryMode: formik.values.entryMode,
        })}
      </output>
    </>
  );
}

describe('Offering workflow form ownership', () => {
  it('keeps inquiry selection and clears the application reference for server derivation', async () => {
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
        application: null,
        entryMode: 0,
      })
    );
    expect(screen.getByRole('combobox', { name: 'Published inquiry form' })).toHaveValue(
      'Parent inquiry · v1'
    );
    expect(screen.queryByRole('combobox', { name: /application form/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Admission track|Entry mode/)).not.toBeInTheDocument();
  });
  it('preserves a historic registration entry mode when editing its workflow', async () => {
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
        application: null,
        entryMode: 1,
      })
    );
    expect(
      screen.queryByRole('combobox', { name: 'Published inquiry form' })
    ).not.toBeInTheDocument();
  });
});
