import type { AdmissionFormPurpose } from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { newField } from './form-dialog-model';
import { FormBuilderPalette } from './form-builder-palette';
import { configureStudentField } from './student-field-configuration';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const source = {
  key: 'Inquiry.Source',
  displayName: 'Source',
  description: 'How this inquiry reached the school.',
  fieldType: 6 as const,
  readOnly: false,
  optionsJson: '[{"value":0,"label":"Website"},{"value":1,"label":"Walk-in"}]',
};

describe('Inquiry question palette', () => {
  it.each([0, 1] as AdmissionFormPurpose[])(
    'keeps optional Inquiry questions purpose-scoped: %s',
    async (purpose) => {
      const onAddField = vi.fn();
      render(
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <FormBuilderPalette purpose={purpose} systemFields={[source]} onAddField={onAddField} />
        </ThemeProvider>
      );
      if (purpose === 1) {
        expect(
          screen.queryByRole('button', { name: 'Inquiry details (1)' })
        ).not.toBeInTheDocument();
        expect(onAddField).not.toHaveBeenCalled();
        return;
      }
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Inquiry details (1)' }));
      await user.click(screen.getByRole('button', { name: 'Add Source' }));
      expect(onAddField).toHaveBeenCalledWith(6, 'Inquiry.Source');
    }
  );

  it('keeps Source zero as a real option when connecting the configured field', () => {
    const configured = configureStudentField(newField('section', 0), source);
    expect(configured.bindingKey).toBe('Inquiry.Source');
    expect(JSON.parse(configured.optionsJson!)).toEqual([
      { value: 0, label: 'Website' },
      { value: 1, label: 'Walk-in' },
    ]);
    expect(configured.required).toBe(false);
  });
});
