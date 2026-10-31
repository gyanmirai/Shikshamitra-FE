import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { FormBuilderCanvas } from './form-builder-canvas';
import { getSystemAdmissionFormTemplate } from '../admission-form-template-catalog';
import {
  newField,
  admissionFormSchema,
  getBlankAdmissionFormInitialValues,
} from '../form-dialog-model';

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

function renderCombinedCanvas(layoutType: 0 | 1, effectiveLayout = layoutType) {
  const base = getBlankAdmissionFormInitialValues(1);
  const baseField = { ...newField(base.sections[0].id, 0), label: 'Registration question' };
  base.sections[0].fields = [baseField];
  base.layoutType = layoutType;
  base.fieldsPerRow = 3;
  const sources = ['Student questions', 'Family questions'].map((name, index) => {
    const id = `source-section-${index}`;
    const field = {
      ...newField(id, index),
      label: `Inquiry question ${index + 1}`,
      inheritedFrom: {
        inquiryFormDefinitionId: 'inquiry-a',
        sourceFieldCode: `SOURCE_${index}`,
        fieldIdentity: `custom:source-${index}`,
      },
    };
    return {
      id,
      code: `INQ_SOURCE_${index}`,
      name,
      displayOrder: index,
      stepId: 'source-step',
      stepCode: 'SOURCE_STEP',
      stepName: 'Inquiry step',
      stepDisplayOrder: 0,
      fields: [field],
    };
  });
  function CombinedCanvas() {
    const [selected, select] = useState(sources[0].id);
    return (
      <Formik initialValues={base} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <FormBuilderCanvas
              formik={formik}
              effectiveForm={{
                ...formik.values,
                layoutType: effectiveLayout,
                sections: [
                  ...sources,
                  ...formik.values.sections.map((section) => ({
                    ...section,
                    displayOrder: section.displayOrder + sources.length,
                    stepDisplayOrder: 1,
                  })),
                ],
              }}
              selectedSectionId={selected}
              selectedFieldId={null}
              onSelect={(id) => select(id)}
              newStepId={null}
              onAddStep={() => undefined}
              onNewStepReady={() => undefined}
            />
            <output data-testid="base-draft">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <CombinedCanvas />
      </DndContext>
    </ThemeProvider>
  );
  return { base, sources };
}

describe('combined Inquiry and Registration canvas', () => {
  it('uses the selected Inquiry stepper even when the Registration draft is single-page', () => {
    renderCombinedCanvas(0, 1);
    const navigation = screen.getByRole('navigation', { name: 'Form steps' });
    expect(within(navigation).getByRole('button', { name: 'Inquiry step' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Student questions' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Family questions' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Student Details' })).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('base-draft').textContent!).layoutType).toBe(0);
  });
  it('preserves multiple source sections and locks their definitions without copying them into the base draft', async () => {
    const user = userEvent.setup();
    const { base } = renderCombinedCanvas(0);
    expect(screen.getByRole('heading', { name: 'Student questions' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Family questions' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit Inquiry question 1 field' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reorder Inquiry question 1' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Student questions section' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Family questions section' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Student Details section' }));
    const heading = screen.getByRole('textbox', { name: 'Section heading' });
    fireEvent.change(heading, { target: { value: 'Registration details' } });
    await user.keyboard('{Enter}');
    const saved = JSON.parse(screen.getByTestId('base-draft').textContent!);
    expect(saved.sections).toHaveLength(1);
    expect(saved.sections[0]).toEqual({ ...base.sections[0], name: 'Registration details' });
  });

  it('navigates source steps with their original section grouping alongside Registration steps', async () => {
    const user = userEvent.setup();
    renderCombinedCanvas(1);
    const navigation = screen.getByRole('navigation', { name: 'Form steps' });
    expect(within(navigation).getByRole('button', { name: 'Inquiry step' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Student questions' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Family questions' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Student Details' })).not.toBeInTheDocument();
    expect(
      within(navigation).queryByRole('button', { name: 'Actions for Inquiry step step' })
    ).not.toBeInTheDocument();
    await user.click(within(navigation).getByRole('button', { name: 'Student details' }));
    expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Family questions' })).not.toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('base-draft').textContent!).sections).toHaveLength(1);
  });
});
