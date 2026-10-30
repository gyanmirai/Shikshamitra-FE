import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { DndContext } from '@dnd-kit/core';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderCanvas } from './form-builder-canvas';
import { admissionFormSchema } from '../form-dialog-model';
import { getSystemAdmissionFormTemplate } from '../admission-form-template-catalog';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

function renderCanvas(onlyBank = false) {
  const template = getSystemAdmissionFormTemplate('student-registration');
  const bank = template.sections.find((section) => section.code === 'BANK_DETAILS')!;
  const retainedSection = template.sections.find((section) => section.stepId !== bank.stepId)!;
  // Exercise step deletion without mounting the full preset again after the active step is removed.
  const initialValues: CreateUpdateAdmissionForm = {
    ...template,
    layoutType: 1,
    sections: onlyBank
      ? [bank]
      : [{ ...retainedSection, fields: retainedSection.fields.slice(0, 1) }, bank],
  };

  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <Formik initialValues={initialValues} onSubmit={() => undefined}>
          {(formik) => (
            <>
              <FormBuilderCanvas
                formik={formik}
                selectedSectionId={bank.id}
                selectedFieldId={null}
                onSelect={() => undefined}
                newStepId={null}
                onAddStep={() => undefined}
                onNewStepReady={() => undefined}
              />
              <output data-testid="section-codes">
                {formik.values.sections.map((section) => section.code).join(',')}
              </output>
            </>
          )}
        </Formik>
      </DndContext>
    </ThemeProvider>
  );
  return { bank, retainedSection };
}

describe('FormBuilderCanvas section deletion', () => {
  it('removes Bank Details even when it is the only section in its step', async () => {
    const user = userEvent.setup();
    const { bank, retainedSection } = renderCanvas();
    const steps = screen.getByRole('navigation', { name: 'Form steps' });
    const bankStepName = bank.stepName ?? bank.name;
    const retainedStepName = retainedSection.stepName ?? retainedSection.name;

    expect(within(steps).getByRole('button', { name: bankStepName })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete Bank Details section' }));
    expect(screen.getByText(/removes that step too/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Delete section' }));

    expect(screen.getByTestId('section-codes')).not.toHaveTextContent('BANK_DETAILS');
    expect(screen.getByTestId('section-codes').textContent).not.toBe('');
    expect(screen.getByTestId('section-codes')).toHaveTextContent(retainedSection.code);
    expect(within(steps).queryByRole('button', { name: bankStepName })).not.toBeInTheDocument();
    expect(within(steps).getByRole('button', { name: retainedStepName })).toBeVisible();
  });

  it('allows an empty draft while still requiring a section before save', async () => {
    const user = userEvent.setup();
    renderCanvas(true);

    await user.click(screen.getByRole('button', { name: 'Delete Bank Details section' }));
    await user.click(screen.getByRole('button', { name: 'Delete section' }));

    expect(screen.getByTestId('section-codes').textContent).toBe('');
    expect(screen.getByText(/This draft has no sections/i)).toBeVisible();
    await expect(
      admissionFormSchema.validate({
        ...getSystemAdmissionFormTemplate('student-registration'),
        sections: [],
      })
    ).rejects.toThrow('Add at least one section');
  });
});
