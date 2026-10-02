import { Formik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderProperties } from '../form-builder-properties';
import { newField, getAdmissionFormInitialValues } from '../form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [] }),
}));

function renderFieldSettings(fieldType: 6 | 7 | 8) {
  const form = getAdmissionFormInitialValues();
  const section = form.sections[0];
  section.fields = [newField(section.id!, 0, fieldType)];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderProperties formik={formik} selectedLocation={{ sectionIndex: 0, fieldIndex: 0 }} />
            <output data-testid="choices-json">{formik.values.sections[0].fields[0].optionsJson}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}

describe('Admission Form Builder choice field settings', () => {
  it.each([6, 7, 8] as const)(
    'lets a custom field of type %s replace the default option name',
    async (fieldType) => {
      const user = userEvent.setup();
      renderFieldSettings(fieldType);

      await user.click(screen.getByRole('button', { name: 'Add choice' }));
      const firstOption = screen.getByRole('textbox', { name: 'Option 1' });
      await user.clear(firstOption);
      expect(firstOption).toHaveValue('');
      expect(screen.getByText('Enter an option name.')).toBeVisible();

      await user.type(firstOption, 'School bus');
      expect(firstOption).toHaveValue('School bus');
      expect(screen.queryByText('Enter an option name.')).not.toBeInTheDocument();
      expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
        { value: 'OPTION_1', label: 'School bus' },
      ]);
    }
  );

  it('keeps radio option values stable while renaming, reordering, and deleting choices', async () => {
    const user = userEvent.setup();
    renderFieldSettings(8);

    await user.click(screen.getByRole('button', { name: 'Add choice' }));
    await user.click(screen.getByRole('button', { name: 'Add choice' }));
    await user.clear(screen.getByRole('textbox', { name: 'Option 1' }));
    await user.type(screen.getByRole('textbox', { name: 'Option 1' }), 'Yes');
    await user.clear(screen.getByRole('textbox', { name: 'Option 2' }));
    await user.type(screen.getByRole('textbox', { name: 'Option 2' }), 'No');

    await user.click(screen.getByRole('button', { name: 'Move No up' }));
    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'OPTION_2', label: 'No' },
      { value: 'OPTION_1', label: 'Yes' },
    ]);

    await user.click(screen.getByRole('button', { name: 'Delete Yes' }));
    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'OPTION_2', label: 'No' },
    ]);
  }, 10000);

  it('adds pasted radio choices with distinct stored values', async () => {
    const user = userEvent.setup();
    renderFieldSettings(8);

    await user.click(screen.getByRole('button', { name: 'Paste choices' }));
    await user.type(screen.getByRole('textbox', { name: 'Paste choices' }), 'Bus{enter}Bus');
    await user.click(screen.getByRole('button', { name: 'Add choices' }));

    expect(JSON.parse(screen.getByTestId('choices-json').textContent ?? '[]')).toEqual([
      { value: 'BUS', label: 'Bus' },
      { value: 'BUS_2', label: 'Bus' },
    ]);
  });
});
