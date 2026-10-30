import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
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
            <output data-testid="form-dirty">{String(formik.dirty)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
}
function savedForm(): CreateUpdateAdmissionForm {
  return JSON.parse(screen.getByTestId('form-json').textContent ?? '{}');
}

it('collapses sections without losing fields and reveals newly added fields in a collapsed section', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  const before = savedForm();
  await user.click(screen.getByRole('button', { name: 'Collapse Student Details section' }));
  const expand = screen.getByRole('button', { name: 'Expand Student Details section' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() =>
    expect(screen.queryByRole('heading', { name: 'Add your first field' })).not.toBeInTheDocument()
  );
  expect(savedForm()).toEqual(before);
  await user.click(screen.getByRole('tab', { name: 'Student fields' }));
  await user.click(screen.getByRole('tab', { name: 'Custom fields' }));
  await user.type(screen.getByRole('textbox', { name: 'Question' }), 'School activity');
  await user.click(screen.getByRole('button', { name: 'Add custom field' }));
  await user.click(screen.getByRole('tab', { name: 'Your form' }));
  expect(screen.getByRole('button', { name: 'Collapse Student Details section' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Edit School activity field' })).toBeVisible()
  );
  expect(savedForm().sections[0].fields).toHaveLength(before.sections[0].fields.length + 1);
  await user.click(screen.getByRole('button', { name: 'Collapse Student Details section' }));
  await user.click(screen.getByRole('button', { name: 'Add fields to Student Details' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Edit School activity field' })).toBeVisible()
  );
}, 15000);

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

it.each([0, 1] as const)(
  'edits the section heading directly for purpose %s while preserving existing repeatable and conditional metadata',
  async (purpose) => {
    const user = userEvent.setup({ delay: null });
    const values = getBlankAdmissionFormInitialValues();
    values.purpose = purpose;
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
  },
  15000
);

it.each([0, 1] as const)(
  'confirms direct section deletion for purpose %s and preserves the draft on cancel',
  async (purpose) => {
    const user = userEvent.setup({ delay: null });
    const values = { ...getBlankAdmissionFormInitialValues(), purpose };
    renderBuilder(values);
    expect(
      screen.queryByRole('button', { name: 'Actions for Student Details section' })
    ).not.toBeInTheDocument();
    const remove = screen.getByRole('button', { name: 'Delete Student Details section' });
    await user.click(remove);
    expect(screen.getByRole('dialog', { name: 'Delete section?' })).toBeVisible();
    expect(savedForm()).toEqual(values);
    expect(screen.getByTestId('form-dirty')).toHaveTextContent('false');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(remove).toHaveFocus());
    expect(savedForm()).toEqual(values);
    await user.click(remove);
    await user.click(screen.getByRole('button', { name: 'Delete section' }));
    expect(savedForm().sections).toEqual([]);
    expect(screen.getByTestId('form-dirty')).toHaveTextContent('true');
  },
  15000
);

it('adds a step, edits its heading inline, and returns to earlier sections without losing the draft', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  await user.click(screen.getByRole('button', { name: 'Add step' }));
  const heading = screen.getByRole('textbox', { name: 'Step heading' });
  await user.clear(heading);
  await user.click(screen.getByRole('button', { name: 'Finish editing step heading' }));
  expect(screen.getByText('Step heading is required')).toBeVisible();
  expect(heading).toBeVisible();
  await user.click(heading);
  await user.paste('Family details');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Family details' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Family details' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Family details' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Actions for Family details step' }));
  await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
  await user.clear(screen.getByRole('textbox', { name: 'Step heading' }));
  await user.paste('Parent information');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Parent information' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Student details' }));
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(savedForm().sections).toHaveLength(2);
  expect(savedForm().sections[1].stepName).toBe('Parent information');
}, 15000);
