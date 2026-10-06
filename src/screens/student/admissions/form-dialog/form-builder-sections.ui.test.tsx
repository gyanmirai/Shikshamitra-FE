import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderSections } from './form-builder-sections';
import { getBlankAdmissionFormInitialValues } from './form-dialog-model';

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

function renderBuilder(
  values: CreateUpdateAdmissionForm = { ...getBlankAdmissionFormInitialValues(), layoutType: 1 }
) {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik initialValues={values} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderSections formik={formik} />
            <output data-testid="form-json">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}
function savedForm(): CreateUpdateAdmissionForm {
  return JSON.parse(screen.getByTestId('form-json').textContent ?? '{}');
}

it('keeps earlier sections visible when adding and selecting another section in the same step', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  await user.click(screen.getByRole('button', { name: 'Add section' }));
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Section 2' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Add fields to Student Details' }));
  expect(screen.getByRole('heading', { name: 'Section 2' })).toBeVisible();
  expect(savedForm().sections).toHaveLength(2);
  expect(savedForm().sections[0].stepId).toBe(savedForm().sections[1].stepId);
  expect(screen.getAllByRole('button', { name: 'Add section' })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Add step' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Add custom field' })).not.toBeInTheDocument();
}, 15000);

it('edits the section heading in place while preserving existing repeatable and conditional metadata', async () => {
  const user = userEvent.setup({ delay: null });
  const values = getBlankAdmissionFormInitialValues();
  Object.assign(values.sections[0], {
    isRepeatable: true,
    minEntries: 0,
    maxEntries: 3,
    entryLabel: 'Sibling',
    visibilityRuleJson: '{"field":"HAS_SIBLING","equals":true}',
  });
  renderBuilder(values);
  await user.click(screen.getByRole('button', { name: 'Edit Student Details section' }));
  expect(screen.queryByRole('textbox', { name: 'Section name *' })).not.toBeInTheDocument();
  expect(screen.queryByText('Advanced settings')).not.toBeInTheDocument();
  expect(screen.queryByText('Allow multiple entries')).not.toBeInTheDocument();
  const heading = screen.getByRole('textbox', { name: 'Section heading' });
  await user.clear(heading);
  await user.paste('Student information');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Student information' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit Student information section' })).toHaveFocus();
  expect(savedForm().sections[0]).toMatchObject({
    name: 'Student information',
    code: values.sections[0].code,
    isRepeatable: true,
    minEntries: 0,
    maxEntries: 3,
    entryLabel: 'Sibling',
    visibilityRuleJson: values.sections[0].visibilityRuleJson,
  });
}, 15000);

it('adds a step, edits its heading inline, and returns to earlier sections without losing the draft', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  await user.click(screen.getByRole('button', { name: 'Add step' }));
  const heading = screen.getByRole('textbox', { name: 'Step heading' });
  await user.clear(heading);
  await user.paste('Family details');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Family details' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit Family details step' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Student details' }));
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(savedForm().sections).toHaveLength(2);
  expect(savedForm().sections[1].stepName).toBe('Family details');
}, 15000);
