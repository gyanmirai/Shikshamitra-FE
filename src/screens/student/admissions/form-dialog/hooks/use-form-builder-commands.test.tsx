import type { FormikProps } from 'formik';
import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { getAdmissionFormStepGroups } from '../form-step-groups';
import { useFormBuilderCommands } from './use-form-builder-commands';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { getSystemAdmissionFormTemplate } from '../admission-form-template-catalog';

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({
    data: [
      { key: 'Applicant.DateOfBirth', displayName: 'Date of Birth', fieldType: 5, readOnly: false },
    ],
  }),
}));

function Commands({
  formik,
  selectedSectionId,
  inheritedFields = [],
  onSelectInherited,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedSectionId: string | null;
  inheritedFields?: AdmissionFormField[];
  onSelectInherited?: (field: AdmissionFormField) => void;
}) {
  const commands = useFormBuilderCommands(
    formik,
    selectedSectionId,
    () => undefined,
    inheritedFields,
    onSelectInherited
  );
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  return (
    <>
      <button type="button" onClick={() => commands.addField(0)}>
        Add custom field
      </button>
      <button
        type="button"
        onClick={() =>
          commands.addField(0, undefined, {
            label: 'Interested Class',
            fieldType: 0,
            description: '',
            icon: '',
            validation: {},
          })
        }
      >
        Add class interest
      </button>
      <button type="button" onClick={() => commands.addField(5, 'Applicant.DateOfBirth')}>
        Add birth date
      </button>
      <button type="button" onClick={() => commands.addField(0, 'Applicant.FirstName')}>
        Add separate name
      </button>
      <button
        type="button"
        onClick={() =>
          commands.addGroupSection('Student profile', [
            ...['FirstName', 'MiddleName', 'LastName'].map((suffix) => ({
              key: `Applicant.${suffix}`,
              displayName: suffix,
              description: '',
              fieldType: 0 as const,
              readOnly: false,
            })),
            {
              key: 'Applicant.DateOfBirth',
              displayName: 'Date of birth',
              description: '',
              fieldType: 5,
              readOnly: false,
            },
          ])
        }
      >
        Add names pack
      </button>
      <button type="button" onClick={commands.addSection}>
        Add section
      </button>
      <button
        type="button"
        onClick={() =>
          commands.addGroupSection(
            'Current address',
            ['Country', 'State', 'City'].map((suffix) => ({
              key: `Address.${suffix}`,
              displayName: suffix,
              description: '',
              fieldType: 0 as const,
              readOnly: false,
            }))
          )
        }
      >
        Add address pack
      </button>
      <button type="button" onClick={() => commands.addStep(steps[0]?.id)}>
        Add next step
      </button>
      <button
        type="button"
        onClick={() =>
          commands.addGroupSection('Student profile', [
            {
              key: 'Applicant.TestProfileOne',
              displayName: 'Test profile one',
              description: 'First test field',
              fieldType: 0,
              readOnly: false,
            },
            {
              key: 'Applicant.TestProfileTwo',
              displayName: 'Test profile two',
              description: 'Second test field',
              fieldType: 0,
              readOnly: false,
            },
          ])
        }
      >
        Add profile section
      </button>
      <output data-testid="sections">
        {JSON.stringify(
          formik.values.sections.map(({ code, name, stepId, fields }) => ({
            code,
            name,
            stepId,
            bindings: fields.map((field) => field.bindingKey),
          }))
        )}
      </output>
      <output data-testid="steps">
        {JSON.stringify(steps.map(({ id, name, code }) => ({ id, name, code })))}
      </output>
      <output data-testid="fields">
        {JSON.stringify(formik.values.sections.flatMap((section) => section.fields))}
      </output>
      <output data-testid="draft">{JSON.stringify(formik.values)}</output>
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
  it('reuses the starter class question instead of adding the custom alias', async () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    render(
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => <Commands formik={formik} selectedSectionId={form.sections[0].id} />}
      </Formik>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add class interest' }));
    const fields = JSON.parse(screen.getByTestId('fields').textContent!);
    expect(
      fields.filter((field: AdmissionFormField) =>
        /Class interested in|Interested Class/.test(field.label)
      )
    ).toHaveLength(1);
  });

  it('does not add a class-interest alias already supplied by Inquiry', async () => {
    const form = getBlankAdmissionFormInitialValues(1);
    const source = getSystemAdmissionFormTemplate('admission-inquiry').sections[0].fields.find(
      (field) => field.code === 'CLASS_INTERESTED'
    )!;
    const onSelectInherited = vi.fn();
    render(
      <Formik initialValues={form} onSubmit={() => undefined}>
        {(formik) => (
          <Commands
            formik={formik}
            selectedSectionId={form.sections[0].id}
            inheritedFields={[source]}
            onSelectInherited={onSelectInherited}
          />
        )}
      </Formik>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add class interest' }));
    expect(JSON.parse(screen.getByTestId('fields').textContent!)).toHaveLength(0);
    expect(onSelectInherited).toHaveBeenCalledWith(source);
  });
  it('does not add an Inquiry question twice through individual and whole-pack actions', async () => {
    const initialValues = getBlankAdmissionFormInitialValues(1);
    const field: AdmissionFormField = {
      ...getSystemAdmissionFormTemplate('admission-application').sections[0].fields[3],
      inheritedFrom: {
        inquiryFormDefinitionId: 'inquiry',
        sourceFieldCode: 'DOB',
        fieldIdentity: 'system:APPLICANT.DATEOFBIRTH',
      },
    };
    const selectInherited = vi.fn();
    const user = userEvent.setup();
    render(
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => (
          <Commands
            formik={formik}
            selectedSectionId={initialValues.sections[0].id}
            inheritedFields={[field]}
            onSelectInherited={selectInherited}
          />
        )}
      </Formik>
    );
    await user.click(screen.getByRole('button', { name: 'Add birth date' }));
    expect(selectInherited).toHaveBeenCalledWith(field);
    expect(JSON.parse(screen.getByTestId('fields').textContent!)).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Add names pack' }));
    const fields = JSON.parse(screen.getByTestId('fields').textContent!) as AdmissionFormField[];
    expect(fields.map((item) => item.bindingKey)).toEqual([
      'Applicant.FirstName',
      'Applicant.MiddleName',
      'Applicant.LastName',
    ]);
    expect(fields.some((item) => item.bindingKey === 'Applicant.DateOfBirth')).toBe(false);
  });

  it('converts a single-page Registration to steps without losing its existing sections or fields', async () => {
    const initialValues = getBlankAdmissionFormInitialValues(1);
    initialValues.layoutType = 0;
    initialValues.sections.push({
      ...initialValues.sections[0],
      id: 'second',
      code: 'SECOND',
      name: 'More details',
    });
    const user = userEvent.setup();
    render(
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => <Commands formik={formik} selectedSectionId={initialValues.sections[0].id} />}
      </Formik>
    );
    await user.click(screen.getByRole('button', { name: 'Add next step' }));
    const saved = JSON.parse(screen.getByTestId('draft').textContent!) as CreateUpdateAdmissionForm;
    expect(saved.layoutType).toBe(1);
    expect(saved.sections).toHaveLength(3);
    expect(getAdmissionFormStepGroups(saved.sections)).toHaveLength(2);
    initialValues.sections.forEach((section, index) => {
      const { stepId, stepCode, stepName, stepDisplayOrder, ...content } = section;
      expect(saved.sections[index]).toMatchObject(content);
      expect(saved.sections[index].stepId).toBe(saved.sections[0].stepId);
    });
    expect(saved.sections[2].stepId).not.toBe(saved.sections[0].stepId);
  });
  it('keeps the generated Student name when adding individual or packed profile fields', async () => {
    const user = userEvent.setup();
    const initialValues = getBlankAdmissionFormInitialValues(0);
    render(
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {(formik) => <Commands formik={formik} selectedSectionId={initialValues.sections[0].id} />}
      </Formik>
    );
    await user.click(screen.getByRole('button', { name: 'Add separate name' }));
    expect(JSON.parse(screen.getByTestId('fields').textContent!)).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Add names pack' }));
    const fields = JSON.parse(screen.getByTestId('fields').textContent!) as {
      bindingKey: string;
    }[];
    expect(fields).toHaveLength(5);
    expect(
      fields.filter((field) =>
        ['Applicant.FirstName', 'Applicant.MiddleName', 'Applicant.LastName'].includes(
          field.bindingKey
        )
      )
    ).toEqual([]);
    expect(fields.some((field) => field.bindingKey === 'Applicant.DateOfBirth')).toBe(true);
    expect(
      fields.filter((field) => field.bindingKey === 'Inquiry.ParentRelationship')
    ).toHaveLength(1);
  });
  it('fills the selected empty section with a pack and preserves its saved rules and identity', async () => {
    const user = userEvent.setup();
    const template = getSystemAdmissionFormTemplate('admission-application');
    const emptySection = {
      ...template.sections[0],
      fields: [],
      visibilityRuleJson: '{"field":"CHECK","equals":true}',
      isRepeatable: true,
      minEntries: 0,
      maxEntries: 3,
    };
    render(
      <Formik<CreateUpdateAdmissionForm>
        initialValues={{ ...template, sections: [emptySection] }}
        onSubmit={() => undefined}
      >
        {(formik) => (
          <>
            <Commands formik={formik} selectedSectionId={emptySection.id} />
            <output data-testid="pack-section">{JSON.stringify(formik.values.sections[0])}</output>
          </>
        )}
      </Formik>
    );
    await user.click(screen.getByRole('button', { name: 'Add profile section' }));
    const sections = JSON.parse(screen.getByTestId('sections').textContent || '[]');
    expect(sections).toHaveLength(1);
    expect(JSON.parse(screen.getByTestId('pack-section').textContent || '{}')).toMatchObject({
      id: emptySection.id,
      code: emptySection.code,
      name: 'Student profile',
      stepId: emptySection.stepId,
      visibilityRuleJson: emptySection.visibilityRuleJson,
      isRepeatable: true,
      minEntries: 0,
      maxEntries: 3,
    });
    expect(sections[0].bindings).toEqual(['Applicant.TestProfileOne', 'Applicant.TestProfileTwo']);
  });
  it('connects an address pack to an already-added country instead of duplicating it', async () => {
    const user = userEvent.setup();
    const template = getSystemAdmissionFormTemplate('admission-application');
    const country = template.sections
      .flatMap((section) => section.fields)
      .find((field) => field.bindingKey === 'Address.Country')!;
    const firstSection = {
      ...template.sections[0],
      fields: [{ ...country, code: 'CURRENT_COUNTRY' }],
    };
    render(
      <Formik initialValues={{ ...template, sections: [firstSection] }} onSubmit={() => undefined}>
        {(formik) => <Commands formik={formik} selectedSectionId={firstSection.id} />}
      </Formik>
    );
    await user.click(screen.getByRole('button', { name: 'Add address pack' }));
    const fields = JSON.parse(screen.getByTestId('fields').textContent || '[]') as {
      bindingKey: string;
      validationJson: string;
    }[];
    expect(fields.filter((field) => field.bindingKey === 'Address.Country')).toHaveLength(1);
    expect(
      JSON.parse(fields.find((field) => field.bindingKey === 'Address.State')!.validationJson)
    ).toMatchObject({ countryField: 'CURRENT_COUNTRY' });
    expect(
      JSON.parse(fields.find((field) => field.bindingKey === 'Address.City')!.validationJson)
    ).toMatchObject({ countryField: 'CURRENT_COUNTRY', stateField: 'ADDRESS_STATE' });
  });
  it('retains creation order after custom and student fields are sorted on reload', async () => {
    const user = userEvent.setup();
    renderCommands(true);

    await user.click(screen.getByRole('button', { name: 'Add custom field' }));
    await user.click(screen.getByRole('button', { name: 'Add birth date' }));
    await user.click(screen.getByRole('button', { name: 'Add custom field' }));

    const fields = JSON.parse(screen.getByTestId('fields').textContent || '[]') as {
      code: string;
      displayOrder: number;
      bindingKey: string;
    }[];
    expect(fields.map((field) => field.code)).toEqual([
      'FIELD_1',
      'APPLICANT_DATEOFBIRTH',
      'FIELD_2',
    ]);
    expect(fields.map((field) => field.displayOrder)).toEqual([0, 1, 2]);
    expect([...fields].sort((a, b) => a.displayOrder - b.displayOrder)).toEqual(fields);
    expect(fields[1].bindingKey).toBe('Applicant.DateOfBirth');
  });

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

  it('adds a student field group as a section in the selected step without duplicate bindings', async () => {
    const user = userEvent.setup();
    const { bank } = renderCommands();

    await user.click(screen.getByRole('button', { name: 'Add profile section' }));
    const sections = JSON.parse(screen.getByTestId('sections').textContent || '[]') as {
      name: string;
      stepId: string;
      bindings: string[];
    }[];
    expect(sections.at(-1)).toMatchObject({
      name: 'Student profile',
      stepId: bank.stepId,
      bindings: ['Applicant.TestProfileOne', 'Applicant.TestProfileTwo'],
    });

    await user.click(screen.getByRole('button', { name: 'Add profile section' }));
    const afterDuplicate = JSON.parse(
      screen.getByTestId('sections').textContent || '[]'
    ) as typeof sections;
    expect(afterDuplicate).toHaveLength(sections.length);
  });
});
