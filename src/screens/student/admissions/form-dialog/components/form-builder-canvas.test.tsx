import { Formik } from 'formik';
import { DndContext } from '@dnd-kit/core';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
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
  const initialValues = onlyBank ? { ...template, sections: [bank] } : template;

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
                showFullStructure={false}
                onSelect={() => undefined}
                onShowFullStructureChange={() => undefined}
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
  return { bank };
}

describe('FormBuilderCanvas section deletion', () => {
  it('removes Bank Details even when it is the only section in its step', async () => {
    const user = userEvent.setup();
    renderCanvas();

    await user.click(screen.getByRole('button', { name: 'Delete Bank Details' }));
    expect(screen.getByText(/removes that step too/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Delete section' }));

    expect(screen.getByTestId('section-codes')).not.toHaveTextContent('BANK_DETAILS');
    expect(screen.getByTestId('section-codes').textContent).not.toBe('');
  });

  it('allows an empty draft while still requiring a section before save', async () => {
    const user = userEvent.setup();
    renderCanvas(true);

    await user.click(screen.getByRole('button', { name: 'Delete Bank Details' }));
    await user.click(screen.getByRole('button', { name: 'Delete section' }));

    expect(screen.getByTestId('section-codes').textContent).toBe('');
    expect(screen.getByText(/This draft has no sections/i)).toBeVisible();
    await expect(admissionFormSchema.validate({
      ...getSystemAdmissionFormTemplate('student-registration'),
      sections: [],
    })).rejects.toThrow('Add at least one section');
  });
});
