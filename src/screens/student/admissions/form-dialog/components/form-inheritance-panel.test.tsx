import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { FormInheritancePanel, InheritedFieldSettings } from './form-inheritance-panel';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
const inheritanceContext = vi.hoisted(() => ({ value: null as unknown }));
vi.mock('../hooks/use-form-inheritance', () => ({
  useFormInheritance: () => inheritanceContext.value,
}));
beforeEach(() => {
  inheritanceContext.value = null;
});
const inherited = {
  id: 'dob',
  code: 'DOB',
  label: 'DOB',
  fieldType: 5 as const,
  bindingType: 0 as const,
  bindingKey: 'Applicant.DateOfBirth',
  required: false,
  readOnly: false,
  displayOrder: 0,
  inheritedFrom: {
    inquiryFormDefinitionId: 'inquiry-b',
    sourceFieldCode: 'BIRTH',
    fieldIdentity: 'system:applicant.dateofbirth',
    sourceRequired: false,
    sourceReadOnly: false,
  },
};
function setup(sourceRequired = false, registrationRequired = false) {
  const initialValues: CreateUpdateAdmissionForm = {
    ...getBlankAdmissionFormInitialValues(1),
    inheritance: {
      enabled: true,
      sources: [
        {
          inquiryFormDefinitionId: 'inquiry-b',
          requiredFieldIdentities: [],
          fieldMappings: [],
          layouts: [],
        },
      ],
    },
  };
  if (registrationRequired)
    initialValues.sections[0].fields = [{ ...inherited, inheritedFrom: undefined, required: true }];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <InheritedFieldSettings
              formik={formik}
              field={{
                ...inherited,
                inheritedFrom: { ...inherited.inheritedFrom, sourceRequired },
              }}
              sourceName="Inquiry B · v3"
            />
            <output data-testid="draft">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}
describe('Inherited Registration field settings', () => {
  it('selects an exact retained fourth Inquiry version independently of the published picker', () => {
    const selectSource = vi.fn();
    const connected = ['Inquiry A', 'Inquiry B', 'Inquiry C', 'Archived Inquiry D'].map(
      (name, index) => ({
        inquiryFormDefinitionId: `source-${index}`,
        name,
        version: 1,
        connections: [],
        isApproved: false,
      })
    );
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik
          initialValues={{
            ...getBlankAdmissionFormInitialValues(1),
            inheritance: { enabled: true, sources: [] },
          }}
          onSubmit={() => undefined}
        >
          {(formik) => {
            inheritanceContext.value = {
              formik,
              enabled: true,
              setEnabled: vi.fn(),
              sourceId: 'source-0',
              selectSource,
              source: { id: 'source-0', name: 'Inquiry A', version: 1 },
              canViewSources: true,
              sourceFailed: false,
              sourceLoading: false,
              connected,
              loading: false,
              failed: false,
              approved: false,
              fetchSources: async () => ({ data: [], hasMore: false }),
              approve: vi.fn(),
              refresh: vi.fn(),
            };
            return <FormInheritancePanel />;
          }}
        </Formik>
      </ThemeProvider>
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Connected Inquiry version' }));
    fireEvent.click(screen.getByRole('option', { name: 'Archived Inquiry D · v1' }));
    expect(selectSource).toHaveBeenCalledWith('source-3');
  });
  it('repairs an invalid empty preview through selected-source reset without discarding other draft data', async () => {
    const values = {
      ...getBlankAdmissionFormInitialValues(1),
      inheritance: {
        enabled: true,
        sources: [
          {
            inquiryFormDefinitionId: 'inquiry-b',
            requiredFieldIdentities: ['unknown-field'],
            fieldMappings: [],
            layouts: [],
          },
          {
            inquiryFormDefinitionId: 'inquiry-a',
            requiredFieldIdentities: ['keep-this'],
            fieldMappings: [],
            layouts: [],
          },
        ],
      },
    };
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={values} onSubmit={() => undefined}>
          {(formik) => {
            const valid = formik.values.inheritance.sources[0].requiredFieldIdentities.length === 0;
            inheritanceContext.value = {
              formik,
              enabled: true,
              setEnabled: vi.fn(),
              sourceId: 'inquiry-b',
              selectSource: vi.fn(),
              source: undefined,
              canViewSources: false,
              sourceFailed: false,
              sourceLoading: false,
              connected: [],
              loading: false,
              failed: false,
              approved: true,
              preview: {
                isValid: valid,
                definition: { sections: [] },
                issues: valid
                  ? []
                  : [
                      {
                        code: 'UnknownOverrideField',
                        message: 'Review the removed field override.',
                      },
                    ],
              },
              fetchSources: vi.fn(),
              approve: vi.fn(),
              refresh: vi.fn(),
            };
            return (
              <>
                <FormInheritancePanel />
                <output data-testid="draft">{JSON.stringify(formik.values)}</output>
              </>
            );
          }}
        </Formik>
      </ThemeProvider>
    );
    expect(screen.getByText('Review the removed field override.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Reset source overrides' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset overrides' }));
    await waitFor(() =>
      expect(screen.queryByText('Review the removed field override.')).not.toBeInTheDocument()
    );
    const repaired = JSON.parse(screen.getByTestId('draft').textContent!);
    expect(repaired.sections).toEqual(values.sections);
    expect(repaired.inheritance.sources[1]).toEqual(values.inheritance.sources[1]);
    expect(repaired.inheritance.sources[0].inquiryFormDefinitionId).toBe('inquiry-b');
    expect(screen.getByText('Source version approved')).toBeVisible();
  });
  it('locks the source label and type and explains why deletion is unavailable', () => {
    setup();
    expect(screen.getByLabelText('Field label')).toBeDisabled();
    expect(screen.getByLabelText('Field label')).toHaveValue('DOB');
    expect(screen.getByLabelText('Field type')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete field' })).toBeDisabled();
    expect(screen.getByText('Inherited fields are managed in Inquiry.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open Inquiry form' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/forms/inquiry-b/preview'
    );
    expect(screen.getByRole('link', { name: 'Open Inquiry form' })).toHaveAttribute(
      'target',
      '_blank'
    );
  });
  it('strengthens requiredness through a source-specific policy without copying fields', async () => {
    setup();
    fireEvent.click(screen.getByRole('switch', { name: 'Required during Registration' }));
    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources[0]
          .requiredFieldIdentities
      ).toEqual(['system:applicant.dateofbirth'])
    );
    expect(JSON.parse(screen.getByTestId('draft').textContent!).sections[0].fields).toEqual([]);
  });
  it('does not allow weakening a source requirement', () => {
    setup(true);
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeChecked();
  });
  it('keeps an already required Registration slot mandatory when there is no source override', () => {
    setup(false, true);
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.getByText('Required by the Registration definition.')).toBeVisible();
  });
});
