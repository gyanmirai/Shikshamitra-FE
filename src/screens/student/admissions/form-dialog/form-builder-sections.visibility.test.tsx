import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderSections } from './form-builder-sections';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

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

it('keeps settings above the builder dialog and its select menus above the settings drawer', async () => {
  const user = userEvent.setup({ delay: null });
  const theme = createTheme(defaultSettings);
  const form = getBlankAdmissionFormInitialValues();
  const section = form.sections[0];
  section.fields = [
    { ...newField(section.id!, 0, 0), code: 'NAME', label: 'Student name' },
    { ...newField(section.id!, 1, 5), code: 'DOB', label: 'Date of birth' },
  ];
  render(
    <ThemeProvider theme={theme}>
      <Dialog open aria-labelledby="visibility-builder-title">
        <DialogTitle id="visibility-builder-title">Form builder</DialogTitle>
        <Formik initialValues={form} onSubmit={() => undefined}>
          {(formik) => <FormBuilderSections formik={formik} />}
        </Formik>
      </Dialog>
    </ThemeProvider>
  );
  await user.click(screen.getByRole('button', { name: 'Edit Student name field' }));
  await user.click(screen.getByRole('tab', { name: 'Rules' }));
  await user.click(screen.getByRole('combobox', { name: /Show field when/ }));
  const option = screen.getByRole('option', { name: 'Date of birth' });
  const menu = option.closest('.MuiMenu-root')!;
  const drawer = document.querySelector('.MuiDrawer-root')!;
  expect(Number(getComputedStyle(drawer).zIndex)).toBeGreaterThanOrEqual(theme.zIndex.modal);
  expect(Number(getComputedStyle(menu).zIndex)).toBeGreaterThanOrEqual(
    Number(getComputedStyle(drawer).zIndex)
  );
  expect(drawer.compareDocumentPosition(menu)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  await user.click(option);
  expect(screen.getByRole('combobox', { name: /Show field when/ })).toHaveTextContent(
    'Date of birth'
  );
  await user.click(screen.getByRole('combobox', { name: 'Condition' }));
  await user.click(screen.getByRole('option', { name: 'is not empty' }));
  expect(screen.queryByRole('textbox', { name: 'Answer to match' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear condition' }));
  await user.click(screen.getByRole('tab', { name: 'Basic' }));
  await user.click(screen.getByRole('combobox', { name: 'Field type' }));
  await user.click(screen.getByRole('option', { name: 'Textarea' }));
  expect(screen.getByRole('combobox', { name: 'Field type' })).toHaveTextContent('Textarea');
  await user.click(screen.getByRole('button', { name: 'Done' }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Close field settings' })).not.toBeInTheDocument()
  );
  expect(screen.getByRole('dialog', { name: 'Form builder' })).toBeVisible();
}, 15000);
