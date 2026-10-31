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
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

function renderLockedCanvas(stepper = false, settings = false, purpose: 0 | 1 = 0) {
  const form = getBlankAdmissionFormInitialValues(0);
  form.purpose = purpose;
  form.layoutType = stepper ? 1 : 0;
  const section = form.sections[0];
  section.fields.push({ ...newField(section.id, 3), label: 'School notes' });
  render(
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
  expect(screen.getByRole('button', { name: 'Locked Student name field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Locked Parent/Guardian name field' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Locked Parent/Guardian mobile field' })).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Actions for Student name field' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Reorder Student name' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit School notes field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Delete Student Details section' })).toBeDisabled();
});

it('blocks step deletion containing locked fields', async () => {
  renderLockedCanvas(true);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Actions for Student details step' }));
  expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('aria-disabled', 'true');
  expect(
    JSON.parse(screen.getByTestId('form-values').textContent!).sections[0].fields
  ).toHaveLength(5);
});

it('does not expose editable settings when a locked field is selected indirectly', () => {
  renderLockedCanvas(false, true);
  expect(screen.getByText('Required inquiry field')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /Field label/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('switch', { name: /Required field/ })).not.toBeInTheDocument();
});

it('leaves generated fields editable when the draft is Registration', () => {
  renderLockedCanvas(false, false, 1);
  expect(
    screen.queryByRole('button', { name: 'Locked Student name field' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit Student name field' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Delete Student Details section' })).toBeEnabled();
});
