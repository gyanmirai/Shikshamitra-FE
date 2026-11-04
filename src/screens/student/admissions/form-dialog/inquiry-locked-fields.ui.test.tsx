import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderProperties } from './form-builder-properties';
import { FormBuilderCanvas } from './components/form-builder-canvas';
import { newField, getAdmissionFormInitialValues, getBlankAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

function renderLockedCanvas(stepper = false, settings = false, purpose: 0 | 1 = 0, saved?: ReturnType<typeof getBlankAdmissionFormInitialValues>) {
  const form = saved ?? getBlankAdmissionFormInitialValues(purpose);
  form.supportedLanguages = ['en', 'hi'];
  form.layoutType = stepper ? 1 : 0;
  const section = form.sections[0];
  if (!saved) section.fields.push({ ...newField(section.id, 3), label: 'School notes' });
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <Formik initialValues={form} onSubmit={() => undefined}>
          {(formik) => (
            <>
              {settings ? (
                <FormBuilderProperties
                  formik={formik}
                  selectedLocation={{ sectionIndex: 0, fieldIndex: 0 }}
                />
              ) : (
                <FormBuilderCanvas
                  formik={formik}
                  selectedSectionId={section.id}
                  selectedFieldId={null}
                  onSelect={vi.fn()}
                  newStepId={null}
                  onAddStep={vi.fn()}
                  onNewStepReady={vi.fn()}
                />
              )}
              <output data-testid="form-values">{JSON.stringify(formik.values)}</output>
            </>
          )}
        </Formik>
      </DndContext>
    </ThemeProvider>
  );
}

it('shows Inquiry field locks and keeps ordinary field actions', () => {
  renderLockedCanvas();
  expect(screen.getByRole('button', { name: 'Locked First name Field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Locked Parent name Field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Locked Parent contact number Field' })).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Actions For First Name field' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reorder First name' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Edit First name Field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Edit School notes Field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Delete Student Details Section' })).toBeDisabled();
});

it('blocks step deletion containing locked fields', async () => {
  renderLockedCanvas(true);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Actions For Student details step' }));
  expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('aria-disabled', 'true');
  expect(
    JSON.parse(screen.getByTestId('form-values').textContent!).sections[0].fields
  ).toHaveLength(7);
});

it('edits core labels and translations while its structure and required state stay locked', async () => {
  renderLockedCanvas(false, true);
  const user = userEvent.setup();
  expect(screen.getByText('Core Field')).toBeVisible();
  const labels = screen.getAllByRole('textbox', { name: /Field Label/ });
  await user.clear(labels[0]);
  await user.type(labels[0], 'Child given name');
  await user.clear(labels[1]);
  await user.type(labels[1], 'School translation');
  expect(screen.getByRole('switch', { name: /Required Field/ })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Field Type' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.queryByRole('tab', { name: 'Rules' })).not.toBeInTheDocument();
  const field = JSON.parse(screen.getByTestId('form-values').textContent!).sections[0].fields[0];
  expect(field).toMatchObject({
    label: 'Child given name',
    required: true,
    bindingKey: 'Applicant.FirstName',
    translations: { hi: { label: 'School translation' } },
  });
});

it('protects Registration core fields and their containing section', () => {
  renderLockedCanvas(false, false, 1);
  expect(screen.getByRole('button', { name: 'Locked First name Field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit First name Field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Delete Student Details Section' })).toBeDisabled();
});

it('retains core ownership after a renamed label is saved and reopened', async () => {
  const user = userEvent.setup();
  const view = renderLockedCanvas(false, true);
  const label = screen.getAllByRole('textbox', { name: /Field Label/ })[0];
  await user.clear(label);
  await user.type(label, 'Child given name');
  const saved = getAdmissionFormInitialValues({
    ...JSON.parse(screen.getByTestId('form-values').textContent!),
    id: 'saved', version: 1, status: 0, sectionCount: 1,
  });
  view.unmount();
  renderLockedCanvas(false, false, 0, saved);
  expect(screen.getByRole('button', { name: 'Locked Child given name Field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit Child given name Field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Reorder Child given name' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Delete Student Details Section' })).toBeDisabled();
});
