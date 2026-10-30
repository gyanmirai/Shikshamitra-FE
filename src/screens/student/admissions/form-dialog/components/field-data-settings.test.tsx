import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FieldDataSettings } from './field-data-settings';
import { newField, getAdmissionFormInitialValues } from '../form-dialog-model';

const catalogueQuery = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ error: vi.fn(), dismiss: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => catalogueQuery(),
}));

const systemFields = [
  { key: 'Applicant.FirstName', displayName: 'First name', fieldType: 0, readOnly: false },
  { key: 'Applicant.DateOfBirth', displayName: 'Date of birth', fieldType: 5, readOnly: false },
  {
    key: 'Applicant.Gender',
    displayName: 'Gender',
    fieldType: 6,
    readOnly: false,
    optionsJson: '[{"value":"F","label":"Female"}]',
  },
];

function renderSettings(fieldType: AdmissionFormFieldType, bindingKey?: string) {
  const form = getAdmissionFormInitialValues();
  const section = form.sections[0];
  const field = newField(section.id!, 0, fieldType);
  if (bindingKey) Object.assign(field, { bindingType: 0, bindingKey });
  section.fields = [field];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FieldDataSettings formik={formik} sectionIndex={0} fieldIndex={0} />
            <output data-testid="field-json">
              {JSON.stringify(formik.values.sections[0].fields[0])}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}

const currentField = () => JSON.parse(screen.getByTestId('field-json').textContent ?? '{}');

describe('custom field student-record mapping', () => {
  it('configures shared identity controls when a custom question is mapped to the Student Aadhaar field', async () => {
    catalogueQuery.mockReturnValue({
      data: [
        ...systemFields,
        {
          key: 'Identity.AadhaarNumber',
          displayName: 'Student Aadhaar number',
          fieldType: 0,
          readOnly: false,
          destination: 'studentProfile',
        },
      ],
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    renderSettings(0, 'Applicant.FirstName');
    await user.click(screen.getByRole('combobox', { name: 'Student record field' }));
    await user.click(screen.getByRole('option', { name: 'Student Aadhaar number' }));
    expect(JSON.parse(currentField().validationJson)).toMatchObject({ format: 'aadhaar' });
    expect(screen.getByText(/Populates the Student profile/)).toBeVisible();
  });
  beforeEach(() => {
    catalogueQuery.mockReturnValue({ data: systemFields, isLoading: false, isError: false });
  });

  it('only offers student-record fields with the same answer type', async () => {
    const user = userEvent.setup();
    renderSettings(0, 'Applicant.FirstName');
    await user.click(screen.getByRole('combobox', { name: 'Student record field' }));
    expect(screen.getByRole('option', { name: 'First name' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Date of birth' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Gender' })).not.toBeInTheDocument();
  });

  it('disables student-record mapping when no compatible field exists', async () => {
    const user = userEvent.setup();
    renderSettings(8);
    await user.click(screen.getByRole('combobox', { name: 'Save answer to' }));
    expect(screen.getByRole('option', { name: /^Student record/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(currentField().bindingType).toBe(1);
  });

  it('keeps an existing incompatible mapping visible and lets the user repair it', async () => {
    const user = userEvent.setup();
    renderSettings(0, 'Applicant.DateOfBirth');
    expect(screen.getByText(/does not match this answer type/)).toBeVisible();
    expect(currentField().bindingKey).toBe('Applicant.DateOfBirth');
    await user.click(screen.getByRole('combobox', { name: 'Student record field' }));
    await user.click(screen.getByRole('option', { name: 'First name' }));
    expect(currentField().bindingKey).toBe('Applicant.FirstName');
    expect(screen.queryByText(/does not match this answer type/)).not.toBeInTheDocument();
  });

  it('copies the configured choices when selecting a compatible record field', async () => {
    const user = userEvent.setup();
    renderSettings(6);
    await user.click(screen.getByRole('combobox', { name: 'Save answer to' }));
    await user.click(screen.getByRole('option', { name: 'Student record' }));
    await user.click(screen.getByRole('combobox', { name: 'Student record field' }));
    await user.click(screen.getByRole('option', { name: 'Gender' }));
    expect(currentField().optionsJson).toBe(systemFields[2].optionsJson);
    await user.click(screen.getByRole('combobox', { name: 'Save answer to' }));
    await user.click(screen.getByRole('option', { name: 'This admission form only' }));
    expect(currentField().bindingKey).toBe(currentField().code);
  });

  it('does not label a saved mapping invalid while the catalogue is loading', () => {
    catalogueQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderSettings(0, 'Applicant.FirstName');
    expect(screen.queryByText(/The linked student record field/)).not.toBeInTheDocument();
    expect(currentField().bindingKey).toBe('Applicant.FirstName');
  });

  it('reports catalogue failure through standard feedback without changing the saved mapping', () => {
    const refetch = vi.fn();
    catalogueQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    renderSettings(0, 'Applicant.FirstName');
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Could not load student record fields.' })
    );
    expect(screen.queryByText('Could not load student record fields.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Student record field' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(refetch).not.toHaveBeenCalled();
    expect(currentField().bindingKey).toBe('Applicant.FirstName');
  });
});
