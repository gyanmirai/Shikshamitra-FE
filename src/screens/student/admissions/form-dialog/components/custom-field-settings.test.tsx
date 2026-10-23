import type {
  AdmissionFormField,
  AdmissionFormFieldType,
} from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { CUSTOM_FIELD_PRESETS } from '../form-field-presets';
import { FormBuilderProperties } from '../form-builder-properties';
import {
  newField,
  CREATABLE_FIELD_TYPES,
  getAdmissionFormInitialValues,
} from '../form-dialog-model';

import type { AdmissionFieldPreset } from '../form-field-presets';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [] }),
}));

function renderSettings(
  fieldType: AdmissionFormFieldType,
  preset?: AdmissionFieldPreset,
  patch: Partial<AdmissionFormField> = {},
  otherFields: AdmissionFormField[] = []
) {
  const form = getAdmissionFormInitialValues();
  const section = form.sections[0];
  section.fields = [{ ...newField(section.id!, 0, fieldType, preset), ...patch }, ...otherFields];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderProperties
              formik={formik}
              selectedLocation={{ sectionIndex: 0, fieldIndex: 0 }}
            />
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

function expectTechnicalEditorsHidden() {
  expect(screen.queryByRole('tab', { name: 'Data' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Advanced rules/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Validation JSON' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Required rule JSON' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Field code' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Save answer to' })).not.toBeInTheDocument();
}

describe('Admission Form Builder custom field settings', () => {
  it('shows Always visible by default and restores it without retaining a condition', async () => {
    const user = userEvent.setup();
    const date = { ...newField('section-1', 1, 5), code: 'DATE_OF_BIRTH', label: 'Date of birth' };
    renderSettings(0, undefined, {}, [date]);
    const before = currentField();
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    const selector = screen.getByRole('combobox', { name: /Show field when/ });
    expect(selector).toHaveTextContent('Always visible');
    expect(currentField()).toEqual(before);
    await user.click(selector);
    await user.click(screen.getByRole('option', { name: 'Date of birth' }));
    expect(JSON.parse(currentField().visibilityRuleJson).field).toBe('DATE_OF_BIRTH');
    await user.click(selector);
    await user.click(screen.getByRole('option', { name: 'Always visible' }));
    expect(selector).toHaveTextContent('Always visible');
    expect(currentField()).toEqual(before);
    expect(screen.queryByRole('combobox', { name: 'Condition' })).not.toBeInTheDocument();
  });

  it('shows Always visible when the form has no other condition fields', async () => {
    const user = userEvent.setup();
    renderSettings(0);
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    const selector = screen.getByRole('combobox', { name: /Show field when/ });
    expect(selector).toHaveTextContent('Always visible');
    await user.click(selector);
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Always visible' })).toBeVisible();
  });

  it.each(CREATABLE_FIELD_TYPES)(
    'edits Basic settings with directly available More options and Rules for %s',
    async (_label, fieldType) => {
      const user = userEvent.setup();
      renderSettings(fieldType);

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Basic', 'Rules']);
      expect(screen.getByText('Basic settings')).toBeVisible();
      expect(screen.getByText('More options')).toBeVisible();
      expect(screen.getByRole('tabpanel', { name: 'Basic' })).toBeVisible();
      expectTechnicalEditorsHidden();

      const fieldLabel = screen.getByRole('textbox', { name: 'Field label' });
      fireEvent.change(fieldLabel, { target: { value: 'School question' } });
      expect(currentField().label).toBe('School question');
      fireEvent.change(screen.getByRole('textbox', { name: 'Help text (optional)' }), {
        target: { value: 'Ask the school office if unsure.' },
      });
      expect(currentField().helpText).toBe('Ask the school office if unsure.');

      fireEvent.change(screen.getByRole('textbox', { name: 'Placeholder' }), {
        target: { value: 'Enter answer' },
      });
      expect(currentField().placeholder).toBe('Enter answer');
      fireEvent.change(screen.getByRole('textbox', { name: 'Default value' }), {
        target: { value: 'School default' },
      });
      expect(currentField().defaultValue).toBe('School default');

      if (fieldType === 12) {
        expect(screen.queryByRole('switch', { name: /Required field/ })).not.toBeInTheDocument();
      } else {
        await user.click(screen.getByRole('switch', { name: /Read-only/ }));
        expect(currentField().readOnly).toBe(true);
        await user.click(screen.getByRole('switch', { name: /Required field/ }));
        expect(currentField().required).toBe(true);
      }

      expect(Boolean(screen.queryByText('Answer options'))).toBe(
        fieldType === 6 || fieldType === 7 || fieldType === 8
      );

      await user.click(screen.getByRole('tab', { name: 'Rules' }));
      expect(screen.getByText('Visibility conditions')).toBeVisible();
      expect(screen.getByRole('tabpanel', { name: 'Rules' })).toBeVisible();
      expect(screen.getByRole('combobox', { name: 'Show field when' })).toBeVisible();
      expectTechnicalEditorsHidden();
      expect(currentField().label).toBe('School question');
      expect(currentField().placeholder).toBe('Enter answer');
    },
    10000
  );

  it.each(CUSTOM_FIELD_PRESETS)(
    'keeps the $label preset configuration available in settings',
    async (preset) => {
      const user = userEvent.setup();
      renderSettings(preset.fieldType, preset);

      expect(screen.getByRole('textbox', { name: 'Field label' })).toHaveValue(preset.label);
      expect(JSON.parse(currentField().validationJson)).toEqual(preset.validation);
      await user.click(screen.getByRole('tab', { name: 'Rules' }));
      expectTechnicalEditorsHidden();
      expect(JSON.parse(currentField().validationJson)).toEqual(preset.validation);
      if (preset.key === 'state' || preset.key === 'city') {
        expect(screen.getByText('Location dependency')).toBeVisible();
        expect(screen.getByRole('combobox', { name: 'Country field' })).toBeVisible();
      }
    }
  );

  it('preserves stored validation, conditional required rules and Student binding while editing labels and visibility', async () => {
    const user = userEvent.setup();
    const stored = {
      code: 'SCHOOL_IDENTITY',
      bindingType: 1 as const,
      bindingKey: 'Identity.AadhaarNumber',
      validationJson:
        '{"format":"aadhaar","regex":"^[2-9][0-9]{11}$","messages":{"regex":"Check the number."}}',
      requiredRuleJson: '{"field":"COUNTRY","operator":"Equals","value":"India"}',
    };
    const country = { ...newField('section-1', 1, 0), code: 'COUNTRY', label: 'Country' };
    renderSettings(0, undefined, stored, [country]);
    fireEvent.change(screen.getByRole('textbox', { name: 'Field label' }), {
      target: { value: 'Identity number' },
    });
    await user.click(screen.getByRole('switch', { name: /Required field/ }));
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    expectTechnicalEditorsHidden();
    await user.click(screen.getByRole('combobox', { name: 'Show field when' }));
    await user.click(screen.getByRole('option', { name: 'Country' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Answer to match' }), {
      target: { value: 'India' },
    });
    expect(JSON.parse(currentField().visibilityRuleJson)).toEqual({
      field: 'COUNTRY',
      operator: 'Equals',
      value: 'India',
    });
    expect(currentField()).toMatchObject({ ...stored, label: 'Identity number', required: true });
    await user.click(screen.getByRole('button', { name: 'Clear condition' }));
    expect(currentField().visibilityRuleJson).toBeUndefined();
    expect(currentField()).toMatchObject(stored);
  });

  it('updates an existing simple visibility operator and keeps missing field references visible', async () => {
    const user = userEvent.setup();
    renderSettings(0, undefined, {
      visibilityRuleJson: '{"field":"REMOVED_FIELD","operator":"Equals","value":"Yes"}',
    });
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(screen.getByRole('combobox', { name: 'Show field when' })).toHaveTextContent(
      'REMOVED_FIELD (field not found)'
    );
    expect(screen.getByRole('textbox', { name: 'Answer to match' })).toHaveValue('Yes');
    await user.click(screen.getByRole('combobox', { name: 'Condition' }));
    await user.click(screen.getByRole('option', { name: 'is not empty' }));
    expect(JSON.parse(currentField().visibilityRuleJson)).toMatchObject({
      field: 'REMOVED_FIELD',
      operator: 'IsNotEmpty',
    });
    expect(screen.queryByRole('textbox', { name: 'Answer to match' })).not.toBeInTheDocument();
  });

  it('preserves unsupported visibility rules until the user explicitly replaces them', async () => {
    const user = userEvent.setup();
    const savedRule = '{"all":[{"field":"COUNTRY","operator":"Equals","value":"India"}]}';
    const country = { ...newField('section-1', 1, 0), code: 'COUNTRY', label: 'Country' };
    renderSettings(0, undefined, { visibilityRuleJson: savedRule }, [country]);
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(screen.getByText('It has not been changed.', { exact: false })).toBeVisible();
    expect(currentField().visibilityRuleJson).toBe(savedRule);
    expect(screen.getByRole('textbox', { name: 'Compatibility rule' })).toHaveValue(savedRule);
    expectTechnicalEditorsHidden();
    await user.click(screen.getByRole('tab', { name: 'Basic' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Field label' }), {
      target: { value: 'Travel details' },
    });
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(currentField().visibilityRuleJson).toBe(savedRule);
    await user.click(screen.getByRole('button', { name: 'Replace with simple condition' }));
    expect(JSON.parse(currentField().visibilityRuleJson)).toEqual({
      field: 'COUNTRY',
      operator: 'Equals',
      value: '',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Answer to match' })).toBeVisible();
  });

  it('changes the custom answer type without modifying hidden stored field metadata', async () => {
    const user = userEvent.setup();
    const stored = {
      code: 'SCHOOL_QUESTION',
      bindingType: 1 as const,
      bindingKey: 'SCHOOL_QUESTION',
      validationJson: '{"maxLength":120}',
      requiredRuleJson: '{"field":"COUNTRY","operator":"IsNotEmpty"}',
    };
    renderSettings(0, undefined, stored);
    await user.click(screen.getByRole('combobox', { name: 'Field type' }));
    await user.click(screen.getByRole('option', { name: 'Textarea' }));
    expect(currentField()).toMatchObject({ ...stored, fieldType: 1 });
    expectTechnicalEditorsHidden();
  });

  it('edits location dependencies without losing stored validation or required rules', async () => {
    const user = userEvent.setup();
    const country = {
      ...newField('section-1', 1, 0),
      code: 'COUNTRY',
      label: 'Current country',
      validationJson: '{"format":"country"}',
    };
    const requiredRuleJson = '{"field":"COUNTRY","operator":"IsNotEmpty"}';
    renderSettings(
      0,
      undefined,
      {
        validationJson:
          '{"format":"state","minLength":2,"messages":{"required":"Choose a state."}}',
        requiredRuleJson,
      },
      [country]
    );
    await user.click(screen.getByRole('tab', { name: 'Rules' }));
    await user.click(screen.getByRole('combobox', { name: 'Country field' }));
    await user.click(screen.getByRole('option', { name: 'Current country' }));
    expect(JSON.parse(currentField().validationJson)).toEqual({
      format: 'state',
      minLength: 2,
      messages: { required: 'Choose a state.' },
      countryField: 'COUNTRY',
    });
    expect(currentField().requiredRuleJson).toBe(requiredRuleJson);
    expectTechnicalEditorsHidden();
  });
});
