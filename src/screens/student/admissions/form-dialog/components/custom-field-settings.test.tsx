import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

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

function renderSettings(fieldType: AdmissionFormFieldType, preset?: AdmissionFieldPreset) {
  const form = getAdmissionFormInitialValues();
  const section = form.sections[0];
  section.fields = [newField(section.id!, 0, fieldType, preset)];
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

describe('Admission Form Builder custom field settings', () => {
  it.each(CREATABLE_FIELD_TYPES)(
    'edits Basic, Rules and Data settings for %s',
    async (_label, fieldType) => {
      const user = userEvent.setup();
      renderSettings(fieldType);

      const fieldLabel = screen.getByRole('textbox', { name: 'Field label' });
      fireEvent.change(fieldLabel, { target: { value: 'School question' } });
      expect(currentField().label).toBe('School question');
      fireEvent.change(screen.getByRole('textbox', { name: 'Help text (optional)' }), {
        target: { value: 'Ask the school office if unsure.' },
      });
      expect(currentField().helpText).toBe('Ask the school office if unsure.');

      await user.click(screen.getByRole('button', { name: /More options/ }));
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
      await user.click(screen.getByRole('button', { name: /Advanced rules/ }));
      expect(screen.getByRole('textbox', { name: 'Validation JSON' })).toBeVisible();
      const validationJson = '{"messages":{"required":"Please answer this question."}}';
      fireEvent.change(screen.getByRole('textbox', { name: 'Validation JSON' }), {
        target: { value: validationJson },
      });
      expect(currentField().validationJson).toBe(validationJson);

      await user.click(screen.getByRole('tab', { name: 'Data' }));
      const fieldCode = screen.getByRole('textbox', { name: 'Field code' });
      fireEvent.change(fieldCode, { target: { value: 'school_question' } });
      expect(currentField().code).toBe('SCHOOL_QUESTION');
      if (fieldType === 12) {
        expect(screen.queryByRole('combobox', { name: 'Save answer to' })).not.toBeInTheDocument();
      } else {
        expect(screen.getByRole('combobox', { name: 'Save answer to' })).toBeVisible();
        expect(currentField().bindingKey).toBe('SCHOOL_QUESTION');
      }
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
      await user.click(screen.getByRole('button', { name: /Advanced rules/ }));
      expect(screen.getByRole('textbox', { name: 'Validation JSON' })).toHaveValue(
        JSON.stringify(preset.validation)
      );
      if (preset.key === 'state' || preset.key === 'city') {
        expect(screen.getByText('Location dependency')).toBeVisible();
        expect(screen.getByRole('combobox', { name: 'Country field' })).toBeVisible();
      }
    }
  );
});
