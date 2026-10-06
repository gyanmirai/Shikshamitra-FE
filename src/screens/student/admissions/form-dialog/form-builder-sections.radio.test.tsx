import { Formik } from 'formik';
import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderSections } from './form-builder-sections';
import { getAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
}));

it('adds a Radio field in Build form and edits its option name through Field settings', async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={getAdmissionFormInitialValues()} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderSections formik={formik} />
            <output data-testid="form-json">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );

  await user.click(screen.getByRole('tab', { name: 'Student fields' }));
  await user.click(screen.getByRole('tab', { name: 'Custom fields' }));
  await user.click(screen.getByRole('button', { name: 'More field formats' }));
  await user.click(screen.getByRole('button', { name: 'Add Radio' }));
  await user.click(screen.getByRole('tab', { name: 'Your form' }));
  await user.click(screen.getByRole('button', { name: 'Edit Radio field' }));
  await user.click(screen.getByRole('button', { name: 'Add choice' }));

  const option = screen.getByRole('textbox', { name: 'Option 1' });
  await user.clear(option);
  await user.type(option, 'Yes');

  const form = JSON.parse(screen.getByTestId('form-json').textContent ?? '{}');
  const radio = form.sections[0].fields.find(
    (field: { fieldType: number }) => field.fieldType === 8
  );
  expect(JSON.parse(radio.optionsJson)).toEqual([{ value: 'OPTION_1', label: 'Yes' }]);
}, 30000);
