import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { getAdmissionFormStepGroups } from '../form-step-groups';
import { useFormBuilderCommands } from './use-form-builder-commands';
import { getSystemAdmissionFormTemplate } from '../admission-form-template-catalog';

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [] }),
}));

function Commands({
  formik,
  selectedSectionId,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedSectionId: string | null;
}) {
  const commands = useFormBuilderCommands(formik, selectedSectionId, () => undefined);
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  return (
    <>
      <button type="button" onClick={commands.addSection}>
        Add section
      </button>
      <button type="button" onClick={() => commands.addCanvasUnit(steps[0]?.id)}>
        Add next step
      </button>
      <output data-testid="sections">
        {JSON.stringify(formik.values.sections.map(({ code, stepId }) => ({ code, stepId })))}
      </output>
      <output data-testid="steps">
        {JSON.stringify(steps.map(({ id, name, code }) => ({ id, name, code })))}
      </output>
    </>
  );
}

function renderCommands(empty = false) {
  const template = getSystemAdmissionFormTemplate('student-registration');
  const bank = template.sections.find((section) => section.code === 'BANK_DETAILS')!;
  const initialValues = empty ? { ...template, sections: [] } : template;
  render(
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {(formik) => <Commands formik={formik} selectedSectionId={empty ? null : bank.id} />}
    </Formik>
  );
  return { bank };
}

describe('useFormBuilderCommands', () => {
  it('adds a section to the selected template step', async () => {
    const user = userEvent.setup();
    const { bank } = renderCommands();

    await user.click(screen.getByRole('button', { name: 'Add section' }));

    const sections = JSON.parse(screen.getByTestId('sections').textContent || '[]') as {
      code: string;
      stepId: string;
    }[];
    expect(sections).toHaveLength(16);
    expect(sections.at(-1)?.stepId).toBe(bank.stepId);
    expect(sections.at(-1)?.code).toMatch(/^SECTION_/);
  });

  it('can start a new section after every section was removed', async () => {
    const user = userEvent.setup();
    renderCommands(true);

    await user.click(screen.getByRole('button', { name: 'Add section' }));

    const sections = JSON.parse(screen.getByTestId('sections').textContent || '[]') as {
      code: string;
      stepId: string;
    }[];
    expect(sections).toHaveLength(1);
    expect(sections[0].code).toBe('SECTION_1');
    expect(sections[0].stepId).toBeTruthy();
  });

  it('inserts a new step immediately after the chosen step', async () => {
    const user = userEvent.setup();
    renderCommands();
    const before = JSON.parse(screen.getByTestId('steps').textContent || '[]') as {
      id: string;
      name: string;
      code: string;
    }[];

    await user.click(screen.getByRole('button', { name: 'Add next step' }));

    const after = JSON.parse(screen.getByTestId('steps').textContent || '[]') as typeof before;
    expect(after).toHaveLength(before.length + 1);
    expect(after[0]).toEqual(before[0]);
    expect(after[1].id).not.toBe(before[0].id);
    expect(after[1].name).toBe('Step 2');
    expect(after[1].code).toMatch(/^STEP_/);
    expect(after.slice(2).map(({ id }) => id)).toEqual(before.slice(1).map(({ id }) => id));
  });
});
