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
function setup(
  sourceRequired = false,
  registrationRequired = false,
  approved = true,
  custom = false,
  reference = false
) {
  const field = {
    ...inherited,
    required: sourceRequired,
    ...(custom ? { bindingType: 1 as const, bindingKey: undefined } : {}),
    ...(reference
      ? { label: 'Student name', bindingKey: 'Applicant.Name', required: false, readOnly: true }
      : {}),
  };
  const initialValues: CreateUpdateAdmissionForm = {
    ...getBlankAdmissionFormInitialValues(1),
    inheritance: {
      enabled: true,
      sources: approved
        ? [
            {
              inquiryFormDefinitionId: 'inquiry-b',
              requiredFieldIdentities: [],
              fieldMappings: [],
              layouts: [],
            },
          ]
        : [],
    },
  };
  if (registrationRequired || custom)
    initialValues.sections[0].fields = [
      { ...field, inheritedFrom: undefined, required: registrationRequired },
    ];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <InheritedFieldSettings
              formik={formik}
              field={{
                ...field,
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
  it('shows the captured full-name reference as non-required during Registration', () => {
    setup(true, false, true, false, true);
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).not.toBeChecked();
    expect(screen.getByText('The captured Inquiry answer is a read-only reference.')).toBeVisible();
  });

  it('keeps connection-load recovery reachable before a source has been selected', async () => {
    const refresh = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={getBlankAdmissionFormInitialValues(1)} onSubmit={() => undefined}>
          {(formik) => {
            inheritanceContext.value = {
              formik,
              enabled: true,
              setEnabled: vi.fn(),
              sourceId: null,
              selectSource: vi.fn(),
              canViewSources: true,
              connected: [],
              connectionsFailed: true,
              loading: false,
              fetchSources: async () => ({ data: [], hasMore: false }),
              refresh,
            };
            return <FormInheritancePanel />;
          }}
        </Formik>
      </ThemeProvider>
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Check again' }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Inquiry versions could not be loaded.');
  });
  it('does not implicitly allow Inquiry questions through a question match before approval', () => {
    setup(false, false, false, true);
    expect(screen.getByRole('combobox', { name: 'Same question in Registration' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.queryByRole('combobox', { name: 'Section' })).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources).toHaveLength(
      0
    );
  });
  it('uses one picker for exact retained versions and published forms with the approved wording', async () => {
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
              fetchSources: async () => ({
                data: [
                  { id: 'source-0', name: 'Inquiry A', version: 1 },
                  { id: 'published-same-name', name: 'Inquiry A', version: 1 },
                ],
                hasMore: false,
              }),
              approve: vi.fn(),
              refresh: vi.fn(),
            };
            return <FormInheritancePanel />;
          }}
        </Formik>
      </ThemeProvider>
    );
    expect(screen.getByText('Reuse Inquiry Questions')).toBeVisible();
    expect(
      screen.getByRole('switch', { name: 'Include Inquiry questions in Registration' })
    ).toBeChecked();
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(
      screen.queryByText('Each applicant sees the questions from their own Inquiry form.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Choosing a form changes this preview.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check again' })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
    await screen.findByRole('option', { name: 'Archived Inquiry D · v1' });
    await waitFor(() =>
      expect(screen.getAllByRole('option', { name: 'Inquiry A · v1' })).toHaveLength(2)
    );
    fireEvent.click(screen.getByRole('option', { name: 'Archived Inquiry D · v1' }));
    expect(selectSource).toHaveBeenCalledWith('source-3');
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    expect(screen.getByRole('menuitem', { name: 'Check again' })).toBeVisible();
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
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Reset question adjustments' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset adjustments' }));
    await waitFor(() =>
      expect(screen.queryByText('Review the removed field override.')).not.toBeInTheDocument()
    );
    const repaired = JSON.parse(screen.getByTestId('draft').textContent!);
    expect(repaired.sections).toEqual(values.sections);
    expect(repaired.inheritance.sources[1]).toEqual(values.inheritance.sources[1]);
    expect(repaired.inheritance.sources[0].inquiryFormDefinitionId).toBe('inquiry-b');
    expect(screen.getByText('Allowed for Registration')).toBeVisible();
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
  it('locks optional Inquiry requiredness and does not offer Registration placement or order overrides', () => {
    setup();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).not.toBeChecked();
    expect(screen.queryByRole('combobox', { name: 'Section' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Field order')).not.toBeInTheDocument();
    expect(
      JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources[0]
        .requiredFieldIdentities
    ).toEqual([]);
    expect(JSON.parse(screen.getByTestId('draft').textContent!).sections[0].fields).toEqual([]);
  });
  it('does not allow weakening a source requirement', () => {
    setup(true);
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeChecked();
  });
  it('shows the Inquiry requirement even when the duplicate Registration slot had stricter requiredness', () => {
    setup(false, true);
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Required during Registration' })).toBeDisabled();
    expect(screen.getByText('Optional in the source Inquiry.')).toBeVisible();
  });
});
