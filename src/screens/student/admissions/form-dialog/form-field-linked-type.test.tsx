import type {
  AdmissionFormField,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormValidationPanel } from './form-validation-panel';
import { FormFieldCoreFields } from './form-field-core-fields';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

const catalogue = vi.hoisted(() => vi.fn());
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: catalogue,
}));

const transport: AdmissionFormSystemFieldMetadata = {
  key: 'Preference.TransportRequired',
  displayName: 'Transport needed',
  description: '',
  fieldType: 9,
  readOnly: false,
};

function mount(
  patch: Partial<AdmissionFormField>,
  query: {
    data?: AdmissionFormSystemFieldMetadata[];
    isLoading: boolean;
    isError: boolean;
  } = { data: [transport], isLoading: false, isError: false }
) {
  catalogue.mockReturnValue(query);
  const form = getBlankAdmissionFormInitialValues(0);
  form.sections[0].fields = [
    { ...newField(form.sections[0].id, 0, 9), bindingType: 0, bindingKey: transport.key, ...patch },
  ];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormFieldCoreFields formik={formik} sectionIndex={0} fieldIndex={0} />
            <FormValidationPanel form={formik.values} />
            <output data-testid="field-json">
              {JSON.stringify(formik.values.sections[0].fields[0])}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}
const current = () => JSON.parse(screen.getByTestId('field-json').textContent ?? '{}');

describe('linked field answer types', () => {
  it('prevents a linked checkbox from becoming an incompatible select', () => {
    mount({});
    expect(screen.getByRole('combobox', { name: 'Field type' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('explicitly repairs a malformed draft while preserving custom copy and rules', async () => {
    const user = userEvent.setup();
    const preserved = {
      code: 'PREFERENCE_TRANSPORTREQUIRED',
      label: 'Preferences idea',
      helpText: 'Our custom prompt',
      visibilityRuleJson: '{"field":"PREFERENCE_TRANSPORTREQUIRED","operator":"IsNotEmpty"}',
      translations: { hi: { label: 'Custom label' } },
      required: true,
    };
    mount({ ...preserved, fieldType: 6, optionsJson: '[{"value":"Bus","label":"Bus"}]' });
    expect(screen.queryByRole('button', { name: 'Form checks passed' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restore Checkbox' }));
    expect(current()).toMatchObject({
      ...preserved,
      fieldType: 9,
      bindingType: 0,
      bindingKey: transport.key,
    });
    expect(current().optionsJson).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Form checks passed' })).toBeVisible();
  });

  it('keeps genuine custom types editable', async () => {
    const user = userEvent.setup();
    mount({ fieldType: 0, bindingType: 1, bindingKey: 'MY_QUESTION' });
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Select' }));
    expect(current()).toMatchObject({ fieldType: 6, bindingType: 1, bindingKey: 'MY_QUESTION' });
    expect(screen.getByRole('button', { name: 'Add choice' })).toBeVisible();
  });

  it('restores authoritative validation without losing custom validation messages', async () => {
    const user = userEvent.setup();
    mount(
      {
        bindingKey: 'Identity.AadhaarNumber',
        fieldType: 6,
        validationJson: '{"format":"phone","messages":{"required":"Our prompt"}}',
      },
      {
        data: [
          {
            ...transport,
            key: 'Identity.AadhaarNumber',
            displayName: 'Aadhaar number',
            fieldType: 0,
            validationJson: '{"format":"aadhaar","regex":"^[2-9][0-9]{11}$"}',
          },
        ],
        isLoading: false,
        isError: false,
      }
    );
    await user.click(screen.getByRole('button', { name: 'Restore Text' }));
    expect(JSON.parse(current().validationJson)).toEqual({
      format: 'aadhaar',
      regex: '^[2-9][0-9]{11}$',
      messages: { required: 'Our prompt' },
    });
  });

  it.each([
    { data: undefined, isLoading: true, isError: false },
    { data: [transport], isLoading: false, isError: true },
  ])('does not show passed checks during catalogue loading/failure', (query) => {
    mount({}, query);
    expect(screen.queryByRole('button', { name: 'Form checks passed' })).not.toBeInTheDocument();
  });
});
