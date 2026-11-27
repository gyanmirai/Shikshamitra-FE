import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { addAddressFieldGroup } from './address-field-group';
import { FormBuilderSections } from './form-builder-sections';
import { addAcademicClassSelector } from './academic-class-selector';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

const warning = vi.hoisted(() => vi.fn());
vi.mock('src/components/toast', async (importOriginal) => {
  const original = await importOriginal<typeof import('src/components/toast')>();
  return { ...original, shikshaMitraToast: { ...original.shikshaMitraToast, warning } };
});

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <svg aria-hidden="true" data-icon={icon} />,
}));
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

it('moves the whole address group to another step and removes only that group after confirmation', async () => {
  const user = userEvent.setup({ delay: null });
  const form = { ...getBlankAdmissionFormInitialValues(1), layoutType: 1 as const };
  const source = form.sections[0];
  const destination = {
    ...source,
    id: 'destination',
    code: 'CONTACT',
    name: 'Contact',
    displayOrder: 1,
    stepId: 'another-step',
    stepName: 'Family',
    stepDisplayOrder: 1,
    fields: [],
  };
  form.sections.push(destination);
  form.sections = addAddressFieldGroup(
    form,
    source.id,
    { name: 'City', group: 'Address' },
    [],
    []
  ).sections;
  form.sections = addAddressFieldGroup(
    form,
    source.id,
    { name: 'City', group: 'PermanentAddress' },
    [],
    []
  ).sections;
  renderBuilder(form);

  await user.click(screen.getByRole('button', { name: 'Actions For City field' }));
  await user.click(screen.getByRole('menuitem', { name: 'Move to' }));
  const move = screen.getByRole('dialog', { name: 'Move address fields' });
  await user.click(within(move).getByRole('combobox', { name: 'Destination section' }));
  await user.click(screen.getByRole('option', { name: 'Contact' }));
  await user.click(within(move).getByRole('button', { name: 'Move fields' }));
  expect(savedForm().sections[1].fields.map((field) => field.bindingKey)).toEqual([
    'Address.Country',
    'Address.State',
    'Address.City',
  ]);
  await user.click(screen.getByRole('button', { name: 'Actions For State field' }));
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
  const cancelDelete = screen.getByRole('dialog', { name: 'Delete address fields?' });
  await user.click(within(cancelDelete).getByRole('button', { name: 'Cancel' }));
  expect(savedForm().sections[1].fields).toHaveLength(3);
  await user.click(screen.getByRole('button', { name: 'Actions For Country field' }));
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
  const confirmDelete = screen.getByRole('dialog', { name: 'Delete address fields?' });
  await user.click(within(confirmDelete).getByRole('button', { name: 'Delete fields' }));
  expect(savedForm().sections[1].fields).toHaveLength(0);
  expect(
    savedForm().sections[0].fields.filter((field) =>
      field.bindingKey?.startsWith('PermanentAddress.')
    )
  ).toHaveLength(3);
}, 15000);

it('moves an ordinary field to another section of a single-page form', async () => {
  const user = userEvent.setup({ delay: null });
  const form = getBlankAdmissionFormInitialValues(0);
  const source = form.sections[0];
  const field = { ...newField(source.id, source.fields.length), label: 'School notes' };
  source.fields.push(field);
  form.sections.push({
    ...source,
    id: 'contact',
    code: 'CONTACT',
    name: 'Contact',
    displayOrder: 1,
    fields: [],
  });
  renderBuilder(form);
  await user.click(screen.getByRole('button', { name: 'Actions For School notes field' }));
  await user.click(screen.getByRole('menuitem', { name: 'Move to' }));
  const dialog = screen.getByRole('dialog', { name: 'Move field' });
  expect(within(dialog).getByRole('button', { name: 'Move field' })).toBeDisabled();
  await user.click(within(dialog).getByRole('combobox', { name: 'Destination section' }));
  await user.click(screen.getByRole('option', { name: 'Contact' }));
  await user.click(within(dialog).getByRole('button', { name: 'Move field' }));
  const moved = savedForm();
  expect(moved.sections[0].fields.some((item) => item.id === field.id)).toBe(false);
  expect(moved.sections[1].fields).toEqual([{ ...field, displayOrder: 0, sectionId: 'contact' }]);
}, 15000);

it('keeps linked questions when the user tries to delete a field or its step', async () => {
  const user = userEvent.setup({ delay: null });
  const form = { ...getBlankAdmissionFormInitialValues(1), layoutType: 1 as const };
  renderBuilder(addAcademicClassSelector(form, form.sections[0].id).form);
  const before = savedForm();
  await user.click(screen.getByRole('button', { name: 'Actions For Medium field' }));
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
  expect(warning).toHaveBeenLastCalledWith({
    message: 'Board, Medium and Class must stay together so the class choices work.',
  });
  const stepActions = screen.getByRole('button', { name: /Actions For .* step$/i });
  await user.click(stepActions);
  await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
  expect(warning).toHaveBeenCalledTimes(2);
  expect(savedForm()).toEqual(before);
});

it.each([0, 1] as const)('shows inquiry toolbar actions for layout %s', (layoutType) => {
  renderBuilder({ ...getBlankAdmissionFormInitialValues(0), layoutType });
  expect(screen.queryAllByRole('button', { name: 'Add Step' })).toHaveLength(layoutType);
  expect(screen.getByRole('button', { name: 'Add Section' })).toBeVisible();
  expect(screen.getByRole('button', { name: /Grid Layout/i })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
});

it('shows a field drag preview while reordering and removes it when cancelled', async () => {
  const values = getBlankAdmissionFormInitialValues(0);
  const section = values.sections[0];
  section.fields = [
    {
      id: 'drag-field',
      sectionId: section.id,
      code: 'DRAG_FIELD',
      label: 'Preferred campus',
      fieldType: 0,
      bindingType: 1,
      bindingKey: 'DRAG_FIELD',
      required: true,
      readOnly: false,
      displayOrder: 0,
    },
  ];
  const user = userEvent.setup({ delay: null });
  renderBuilder(values);

  const handle = screen.getByRole('button', { name: 'Reorder Preferred campus' });
  handle.focus();
  await user.keyboard(' ');

  expect(screen.getByTestId('admission-field-drag-overlay')).toHaveTextContent('Preferred campus');

  await user.keyboard('{Escape}');
  expect(screen.queryByTestId('admission-field-drag-overlay')).not.toBeInTheDocument();
}, 15000);

it('collapses sections without losing fields and reveals newly added fields in a collapsed section', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  const before = savedForm();
  await user.click(screen.getByRole('button', { name: 'Collapse Student Details Section' }));
  const expand = screen.getByRole('button', { name: 'Expand Student Details Section' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() =>
    expect(screen.queryByRole('heading', { name: 'Add Your First Field' })).not.toBeInTheDocument()
  );
  expect(savedForm()).toEqual(before);
  await user.click(screen.getByRole('tab', { name: 'Student Fields' }));
  await user.click(screen.getByRole('tab', { name: 'Custom Fields' }));
  await user.type(screen.getByRole('textbox', { name: 'Question' }), 'School activity');
  await user.click(screen.getByRole('button', { name: 'Add Custom Field' }));
  await user.click(screen.getByRole('tab', { name: 'Your Form' }));
  expect(screen.getByRole('button', { name: 'Collapse Student Details Section' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Edit School activity Field' })).toBeVisible()
  );
  expect(savedForm().sections[0].fields).toHaveLength(before.sections[0].fields.length + 1);
  await user.click(screen.getByRole('button', { name: 'Collapse Student Details Section' }));
  await user.click(screen.getByRole('button', { name: 'Add Fields To Student Details' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Edit School activity Field' })).toBeVisible()
  );
}, 15000);

it('keeps earlier sections visible when adding and selecting another section in the same step', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  await user.click(screen.getByRole('button', { name: 'Add Section' }));
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Section 2' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Add Fields To Student Details' }));
  expect(screen.getByRole('heading', { name: 'Section 2' })).toBeVisible();
  expect(savedForm().sections).toHaveLength(2);
  expect(savedForm().sections[0].stepId).toBe(savedForm().sections[1].stepId);
  expect(screen.getAllByRole('button', { name: 'Add Section' })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Add Step' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Add Custom Field' })).not.toBeInTheDocument();
}, 15000);

it.each([0, 1] as const)(
  'edits the section heading for purpose %s from the icon menu while preserving existing metadata',
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
    const actions = screen.getByRole('button', {
      name: 'More Actions For Student Details Section',
    });
    actions.focus();
    await user.keyboard('{Enter}');
    const popover = screen.getByRole('dialog', { name: 'Actions for Student Details section' });
    const edit = within(popover).getByRole('button', { name: 'Edit Student Details Section' });
    const remove = within(popover).getByRole('button', { name: 'Delete Student Details Section' });
    expect(within(popover).getAllByRole('button')).toHaveLength(2);
    expect(popover).not.toHaveTextContent(/Edit|Delete/);
    expect(edit.querySelector('svg')).toHaveAttribute('data-icon', 'solar:pen-bold');
    expect(remove.querySelector('svg')).toHaveAttribute('data-icon', 'solar:trash-bin-trash-bold');
    await waitFor(() => expect(edit).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('textbox', { name: 'Section name *' })).not.toBeInTheDocument();
    expect(screen.queryByText('Advanced Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Allow multiple entries')).not.toBeInTheDocument();
    const heading = screen.getByRole('textbox', { name: 'Section Heading' });
    await user.clear(heading);
    await user.paste('Student information');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Student information' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'More Actions For Student information Section' })
    ).toHaveFocus();
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

it('keeps a core section protected when composition has moved its fields into an Inquiry section', async () => {
  const values = getBlankAdmissionFormInitialValues(1);
  const baseSection = values.sections[0];
  const composedSection = { ...baseSection, fields: [] };
  const { isSectionDeletionLocked } = await import('./inquiry-default-fields');

  expect(
    isSectionDeletionLocked(
      values.purpose,
      values.sections,
      composedSection,
      values.coreFieldPolicyVersion
    )
  ).toBe(true);
});

it.each([0, 1] as const)(
  'confirms section deletion for purpose %s and preserves the draft on cancel',
  async (purpose) => {
    const user = userEvent.setup({ delay: null });
    const values = { ...getBlankAdmissionFormInitialValues(), purpose };
    // This test exercises deletion of an ordinary empty section; core sections are protected.
    values.sections[0].fields = [];
    renderBuilder(values);
    expect(
      screen.queryByRole('button', { name: 'Actions For Student Details section' })
    ).not.toBeInTheDocument();
    const actions = screen.getByRole('button', {
      name: 'More Actions For Student Details Section',
    });
    const openDelete = async () => {
      await user.click(actions);
      await user.click(screen.getByRole('button', { name: 'Delete Student Details Section' }));
    };
    expect(
      screen.queryByRole('button', { name: 'Delete Student Details Section' })
    ).not.toBeInTheDocument();
    await openDelete();
    expect(screen.getByRole('dialog', { name: 'Delete section?' })).toBeVisible();
    expect(savedForm()).toEqual(values);
    expect(screen.getByTestId('form-dirty')).toHaveTextContent('false');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(actions).toHaveFocus());
    expect(savedForm()).toEqual(values);
    await openDelete();
    await user.click(screen.getByRole('button', { name: 'Delete section' }));
    expect(savedForm().sections).toEqual([]);
    expect(screen.getByTestId('form-dirty')).toHaveTextContent('true');
  },
  15000
);

it('adds a step, edits its heading inline, and returns to earlier sections without losing the draft', async () => {
  const user = userEvent.setup({ delay: null });
  renderBuilder();
  await user.click(screen.getByRole('button', { name: 'Add Step' }));
  const heading = screen.getByRole('textbox', { name: 'Step Heading' });
  await user.clear(heading);
  await user.click(screen.getByRole('button', { name: 'Finish Editing Step Heading' }));
  expect(screen.getByText('Step heading is required')).toBeVisible();
  expect(heading).toBeVisible();
  await user.click(heading);
  await user.paste('Family details');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Family details' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Family details' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Family details' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Actions For Family details step' }));
  await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
  await user.clear(screen.getByRole('textbox', { name: 'Step Heading' }));
  await user.paste('Parent information');
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Parent information' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Student details' }));
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(savedForm().sections).toHaveLength(2);
  expect(savedForm().sections[1].stepName).toBe('Parent information');
}, 15000);
