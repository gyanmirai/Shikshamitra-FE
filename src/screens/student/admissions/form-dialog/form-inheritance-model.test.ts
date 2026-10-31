import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionWizardSchema } from './form-wizard-model';
import { getSystemAdmissionFormTemplate } from './admission-form-template-catalog';
import {
  newField,
  admissionFormSchema,
  getAdmissionFormInitialValues,
  getBlankAdmissionFormInitialValues,
} from './form-dialog-model';
import {
  getInheritedFields,
  approveInquirySource,
  setInheritedFieldLayout,
  setInheritedFieldMapping,
  setInheritedFieldRequired,
  getInheritancePreviewValues,
  getInheritanceBuilderValues,
  findExistingStudentFieldAlias,
  resetInheritedSourceOverrides,
  markInheritedRegistrationFields,
} from './form-inheritance-model';

const field = (label = 'DOB'): AdmissionFormField => ({
  id: 'source-dob',
  code: 'DOB',
  label,
  fieldType: 5,
  bindingType: 0,
  bindingKey: 'Applicant.DateOfBirth',
  required: false,
  readOnly: false,
  displayOrder: 0,
  inheritedFrom: {
    inquiryFormDefinitionId: 'inquiry-b',
    sourceFieldCode: 'BIRTH_DATE',
    fieldIdentity: 'system:applicant.dateofbirth',
  },
});
const draft = (): CreateUpdateAdmissionForm => ({
  ...getBlankAdmissionFormInitialValues(1),
  name: 'Registration',
  sections: [{ id: 'section', code: 'DETAILS', name: 'Details', displayOrder: 0, fields: [] }],
});

describe('Registration source Inquiry inheritance model', () => {
  it('keeps current base edits and new sections visible while retaining exact source sections during a preview refresh', () => {
    const original = draft();
    const question = { ...newField('section', 0), label: 'Before edit' };
    original.sections[0].fields = [question];
    const source = {
      id: 'source-section',
      code: 'INQ_SOURCE',
      name: 'Published source section',
      displayOrder: 1,
      stepId: 'source-step',
      stepName: 'Source step',
      fields: [field()],
    };
    const effective = { ...original, sections: [...original.sections, source] };
    const current = {
      ...original,
      sections: [
        {
          ...original.sections[0],
          name: 'Current heading',
          fields: [{ ...question, label: 'After edit' }],
        },
        { id: 'new-section', code: 'NEW', name: 'New section', displayOrder: 2, fields: [] },
      ],
    };
    const view = getInheritanceBuilderValues(current, effective, ['section']);
    expect(view.sections[0]).toMatchObject({ ...source, displayOrder: 0 });
    expect(view.sections[1].name).toBe('Current heading');
    expect(view.sections[1].fields[0].label).toBe('After edit');
    expect(view.sections[2].id).toBe('new-section');
    expect(
      current.sections.flatMap((section) => section.fields).some((item) => item.inheritedFrom)
    ).toBe(false);
  });
  it('does not resurrect deleted snapshot-base sections or mistake their old inherited matches for source-owned sections', () => {
    const original = draft();
    const deleted = { ...original.sections[0], code: 'INQ_USER_SECTION', fields: [field()] };
    const source = { ...deleted, id: 'published-source', code: 'INQ_SOURCE', name: 'Source' };
    const view = getInheritanceBuilderValues(
      { ...original, sections: [] },
      { sections: [deleted, source] },
      ['section']
    );
    expect(view.sections).toEqual([source]);
  });
  it('uses immutable effective definitions and placement for matched questions without adding a duplicate base field', () => {
    const baseField = {
      ...field('Editable old label'),
      id: 'base-dob',
      inheritedFrom: undefined,
      fieldType: 0 as const,
    };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [baseField] }] };
    const inherited = field('Published DOB');
    const effective = { sections: [{ ...original.sections[0], fields: [inherited] }] };
    const view = getInheritanceBuilderValues(original, effective, ['section']);
    expect(view.sections[0].fields).toEqual([inherited]);
    expect(view.sections[0].fields[0].fieldType).toBe(5);
    expect(original.sections[0].fields).toEqual([baseField]);
  });
  it('keeps the composed Inquiry stepper and source section grid without changing the Registration draft', () => {
    const original = { ...draft(), layoutType: 0 as const, fieldsPerRow: 4 as const };
    const effective = {
      ...original,
      layoutType: 1 as const,
      fieldsPerRow: 1 as const,
      sections: [{ ...original.sections[0], fieldsPerRow: 1 as const, fields: [field()] }],
    };
    const values = getInheritancePreviewValues(original, effective);
    expect(values.layoutType).toBe(1);
    expect(values.fieldsPerRow).toBe(4);
    expect(values.sections).toBe(effective.sections);
    expect(values.inheritance).toBe(original.inheritance);
    expect(original.sections[0].fields).toEqual([]);
    expect(getInheritanceBuilderValues(original, effective).layoutType).toBe(1);
  });
  it('retains Inquiry languages without saving the composed presentation into the Registration', () => {
    const original = draft();
    const effective = { ...original, supportedLanguages: ['en', 'hi', 'gu'] };
    expect(getInheritancePreviewValues(original, effective).supportedLanguages).toEqual([
      'en',
      'hi',
      'gu',
    ]);
    expect(getInheritanceBuilderValues(original, effective).supportedLanguages).toEqual([
      'en',
      'hi',
      'gu',
    ]);
    expect(original.supportedLanguages).toEqual(['en']);
  });
  it('keeps a single-page Registration grouped and places new steps after Inquiry while a response is pending', () => {
    const original = { ...draft(), layoutType: 0 as const };
    const source = {
      id: 'source',
      code: 'INQ',
      name: 'Inquiry',
      displayOrder: 1,
      stepId: 'inquiry-step',
      stepName: 'Inquiry step',
      stepDisplayOrder: 1,
      fields: [field()],
    };
    const effective = {
      ...original,
      layoutType: 1 as const,
      sections: [
        {
          ...original.sections[0],
          stepId: 'base-page',
          stepName: 'Registration',
          stepDisplayOrder: 0,
        },
        source,
      ],
    };
    const singlePage = getInheritanceBuilderValues(original, effective);
    expect(singlePage.sections[0].stepId).toBe('inquiry-step');
    expect(singlePage.sections[1].stepId).toBe('base-page');
    const current = {
      ...original,
      layoutType: 1 as const,
      sections: [
        {
          ...original.sections[0],
          stepId: 'new-first-step',
          stepName: 'Step 1',
          stepDisplayOrder: 0,
        },
        {
          ...original.sections[0],
          id: 'added',
          code: 'ADDED',
          stepId: 'new-step',
          stepName: 'Step 2',
          stepDisplayOrder: 1,
        },
      ],
    };
    const view = getInheritanceBuilderValues(current, effective, ['section']);
    expect(view.sections.find((section) => section.id === 'source')?.stepDisplayOrder).toBe(0);
    expect(view.sections.find((section) => section.id === 'added')?.stepDisplayOrder).toBe(2);
    expect(view.sections.find((section) => section.id === 'section')?.stepId).toBe(
      'new-first-step'
    );
    expect(current.sections).toHaveLength(2);
  });
  it('does not restore recommended-template duplicates or emptied base sections after matching moves fields to Inquiry', () => {
    const dob = { ...field(), id: 'base-dob', inheritedFrom: undefined };
    const guardian = {
      ...newField('family', 0),
      id: 'base-parent',
      code: 'GUARDIAN_NAME',
      label: 'Parent or guardian name',
    };
    const extra = { ...newField('extra', 0), id: 'extra-question', label: 'Declaration' };
    const original = {
      ...draft(),
      layoutType: 1 as const,
      sections: [
        { ...draft().sections[0], fields: [dob], stepId: 'student', stepDisplayOrder: 0 },
        {
          id: 'family',
          code: 'FAMILY',
          name: 'Family',
          displayOrder: 1,
          stepId: 'family',
          stepDisplayOrder: 1,
          fields: [guardian],
        },
        {
          id: 'extra',
          code: 'EXTRA',
          name: 'Extra',
          displayOrder: 2,
          stepId: 'extra',
          stepDisplayOrder: 2,
          fields: [extra],
        },
      ],
    };
    const source = {
      id: 'inquiry-section',
      code: 'INQ_DETAILS',
      name: 'Inquiry details',
      displayOrder: 0,
      stepId: 'inquiry-step',
      stepName: 'Inquiry',
      stepDisplayOrder: 0,
      fieldsPerRow: 2 as const,
      fields: [
        { ...field(), id: dob.id },
        {
          ...guardian,
          bindingType: 0 as const,
          bindingKey: 'Guardian.FirstName',
          inheritedFrom: {
            inquiryFormDefinitionId: 'inquiry-b',
            sourceFieldCode: 'PARENT',
            fieldIdentity: 'system:guardian.firstname',
          },
        },
      ],
    };
    const effective = {
      ...original,
      sections: [source, { ...original.sections[2], displayOrder: 1, stepDisplayOrder: 1 }],
    };
    const view = getInheritanceBuilderValues(original, effective);
    expect(view.sections.map((section) => section.id)).toEqual(['inquiry-section', 'extra']);
    expect(
      view.sections
        .flatMap((section) => section.fields)
        .filter((question) => question.id === guardian.id)
    ).toHaveLength(1);
    expect(view.sections[0].fieldsPerRow).toBe(2);
    const current = {
      ...original,
      sections: original.sections.map((section) =>
        section.id === 'family'
          ? {
              ...section,
              fields: [...section.fields, { ...extra, id: 'new-parent-note', label: 'Notes' }],
            }
          : section
      ),
    };
    const pending = getInheritanceBuilderValues(
      current,
      effective,
      original.sections.map((section) => section.id)
    );
    expect(pending.sections.map((section) => section.id)).toEqual([
      'inquiry-section',
      'family',
      'extra',
    ]);
    expect(pending.sections[1].fields.map((question) => question.id)).toEqual(['new-parent-note']);
    expect(original.sections[1].fields).toEqual([guardian]);
  });
  it('uses only the selected source composition when source versions change', () => {
    const dob = { ...field(), id: 'base-dob', inheritedFrom: undefined };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [dob] }] };
    const first = {
      id: 'source-a',
      code: 'SOURCE_A',
      name: 'Inquiry A',
      displayOrder: 0,
      fields: [{ ...field(), id: dob.id }],
    };
    const second = {
      id: 'source-b',
      code: 'SOURCE_B',
      name: 'Inquiry B',
      displayOrder: 0,
      fields: [
        {
          ...newField('source-b', 0),
          label: 'Additional interest',
          inheritedFrom: {
            inquiryFormDefinitionId: 'inquiry-a',
            sourceFieldCode: 'INTEREST',
            fieldIdentity: 'custom:interest',
          },
        },
      ],
    };
    expect(
      getInheritanceBuilderValues(original, { sections: [first] }).sections.map(
        (section) => section.id
      )
    ).toEqual(['source-a']);
    const changed = getInheritanceBuilderValues(original, {
      sections: [second, original.sections[0]],
    });
    expect(changed.sections.map((section) => section.id)).toEqual(['source-b', 'section']);
    expect(changed.sections[1].fields).toEqual([dob]);
  });
  it('repairs only selected-source overrides while preserving source approval and all other draft data', () => {
    let original = approveInquirySource(approveInquirySource(draft(), 'inquiry-a'), 'inquiry-b');
    original = setInheritedFieldRequired(original, 'inquiry-a', 'other-source-field', true);
    original = setInheritedFieldRequired(original, 'inquiry-b', 'invalid-override-field', true);
    original = setInheritedFieldLayout(original, 'inquiry-b', 'invalid-override-field', {
      displayOrder: 2,
    });
    const repaired = resetInheritedSourceOverrides(original, 'inquiry-b');
    expect(repaired.sections).toBe(original.sections);
    expect(repaired.inheritance?.sources[0]).toEqual(original.inheritance?.sources[0]);
    expect(repaired.inheritance?.sources[1]).toEqual({
      inquiryFormDefinitionId: 'inquiry-b',
      requiredFieldIdentities: [],
      fieldMappings: [],
      layouts: [],
    });
    expect(repaired.inheritance?.enabled).toBe(true);
  });
  it('assigns stable custom identities before preview and preserves them through wizard reload and templates', () => {
    const created = newField('section', 0);
    expect(created.fieldIdentity).toMatch(/^custom:[0-9a-f-]{36}$/);
    const values = { ...draft(), sections: [{ ...draft().sections[0], fields: [created] }] };
    const reload = getAdmissionFormInitialValues({
      ...values,
      id: 'saved',
      concurrencyStamp: undefined,
      sectionCount: 1,
      status: 0,
      version: 1,
    });
    expect(reload.sections[0].fields[0].fieldIdentity).toBe(created.fieldIdentity);
    const template = getSystemAdmissionFormTemplate('student-registration');
    expect(
      template.sections
        .flatMap((section) => section.fields)
        .filter((question) => question.bindingType === 1 && question.fieldType !== 12)
        .every((question) => question.fieldIdentity?.startsWith('custom:'))
    ).toBe(true);
  });
  it('migrates source-specific requiredness and placement when mapping and unmapping a custom question', () => {
    const target = { ...newField('section', 0), code: 'REG_QUESTION', label: 'Visit day' };
    let values = approveInquirySource(
      { ...draft(), sections: [{ ...draft().sections[0], fields: [target] }] },
      'inquiry-b'
    );
    values = setInheritedFieldRequired(values, 'inquiry-b', 'custom:source-question', true);
    values = setInheritedFieldLayout(values, 'inquiry-b', 'custom:source-question', {
      displayOrder: 3,
    });
    const mapped = setInheritedFieldMapping(
      values,
      'inquiry-b',
      'SOURCE_QUESTION',
      'REG_QUESTION',
      'custom:source-question'
    );
    expect(mapped.inheritance?.sources[0].requiredFieldIdentities).toEqual([target.fieldIdentity]);
    expect(mapped.inheritance?.sources[0].layouts[0].fieldIdentity).toBe(target.fieldIdentity);
    const unmapped = setInheritedFieldMapping(
      mapped,
      'inquiry-b',
      'SOURCE_QUESTION',
      undefined,
      'custom:source-question'
    );
    expect(unmapped.inheritance?.sources[0].requiredFieldIdentities).toEqual([
      'custom:source-question',
    ]);
    expect(unmapped.inheritance?.sources[0].layouts[0]).toEqual({
      fieldIdentity: 'custom:source-question',
      displayOrder: 3,
    });
  });
  it('allows inherited-only Registration without inventing a base field while retaining legacy validation', async () => {
    const inherited = approveInquirySource(draft(), 'inquiry-a');
    await expect(admissionFormSchema.validate(inherited)).resolves.toBeTruthy();
    await expect(getAdmissionWizardSchema(1).validate(inherited)).resolves.toBeTruthy();
    await expect(
      admissionFormSchema.validate({ ...inherited, sections: [] })
    ).resolves.toBeTruthy();
    await expect(admissionFormSchema.validate(draft())).rejects.toThrow('Add at least one field');
  });
  it('approves one exact source without replacing another source or base questions', () => {
    const first = approveInquirySource(draft(), 'inquiry-a');
    const next = approveInquirySource(first, 'inquiry-b');
    expect(next.inheritance?.sources.map((source) => source.inquiryFormDefinitionId)).toEqual([
      'inquiry-a',
      'inquiry-b',
    ]);
    expect(approveInquirySource(next, 'inquiry-b')).toEqual(next);
    expect(next.sections).toEqual(draft().sections);
  });
  it('stores Registration requiredness only for the selected source and identity', () => {
    const original = approveInquirySource(approveInquirySource(draft(), 'inquiry-a'), 'inquiry-b');
    const next = setInheritedFieldRequired(
      original,
      'inquiry-b',
      'system:applicant.dateofbirth',
      true
    );
    expect(next.inheritance?.sources[0].requiredFieldIdentities).toEqual([]);
    expect(next.inheritance?.sources[1].requiredFieldIdentities).toEqual([
      'system:applicant.dateofbirth',
    ]);
    expect(
      setInheritedFieldRequired(next, 'inquiry-b', 'system:applicant.dateofbirth', false)
        .inheritance?.sources[1].requiredFieldIdentities
    ).toEqual([]);
    expect(next.sections).toEqual(original.sections);
  });
  it('records layout without persisting an inherited field into the Registration draft', () => {
    const original = approveInquirySource(draft(), 'inquiry-b');
    const next = setInheritedFieldLayout(original, 'inquiry-b', 'system:applicant.dateofbirth', {
      targetSectionCode: 'DETAILS',
      displayOrder: 2,
    });
    expect(next.inheritance?.sources[0].layouts).toEqual([
      {
        fieldIdentity: 'system:applicant.dateofbirth',
        targetSectionCode: 'DETAILS',
        displayOrder: 2,
      },
    ]);
    expect(next.sections[0].fields).toEqual([]);
  });
  it('records an explicit custom question mapping only for its selected source', () => {
    const original = approveInquirySource(approveInquirySource(draft(), 'inquiry-a'), 'inquiry-b');
    const next = setInheritedFieldMapping(original, 'inquiry-b', 'TOUR_DAY', 'VISIT_DAY');
    expect(next.inheritance?.sources[0].fieldMappings).toEqual([]);
    expect(next.inheritance?.sources[1].fieldMappings).toEqual([
      { sourceFieldCode: 'TOUR_DAY', registrationFieldCode: 'VISIT_DAY' },
    ]);
    expect(
      setInheritedFieldMapping(next, 'inquiry-b', 'TOUR_DAY').inheritance?.sources[1].fieldMappings
    ).toEqual([]);
    expect(next.sections).toEqual(original.sections);
  });
  it('uses only the effective preview labels and never mutates the base draft', () => {
    const original = draft();
    const effective = { ...original, sections: [{ ...original.sections[0], fields: [field()] }] };
    const values = getInheritancePreviewValues(original, effective);
    expect(values.sections[0].fields[0].label).toBe('DOB');
    expect(original.sections[0].fields).toEqual([]);
    expect(getInheritedFields(effective)).toEqual([field()]);
  });
  it('locks an existing Registration slot by Student identity while preserving its stored label', () => {
    const existing = {
      ...field('Birth date'),
      id: 'registration-dob',
      inheritedFrom: undefined,
      required: true,
    };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [existing] }] };
    const view = markInheritedRegistrationFields(original, {
      ...draft(),
      sections: [{ ...draft().sections[0], fields: [field()] }],
    });
    expect(view.sections[0].fields[0].inheritedFrom).toEqual(field().inheritedFrom);
    expect(view.sections[0].fields[0].label).toBe('DOB');
    expect(view.sections[0].fields[0].required).toBe(false);
    expect(original.sections[0].fields[0].required).toBe(true);
    expect(original.sections[0].fields[0].label).toBe('Birth date');
    expect(original.sections[0].fields[0].inheritedFrom).toBeUndefined();
  });
  it('does not lock an unrelated custom question with the same visible label', () => {
    const custom = {
      ...field(),
      id: 'custom',
      bindingType: 1 as const,
      bindingKey: 'MY_DOB',
      inheritedFrom: undefined,
    };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [custom] }] };
    const view = markInheritedRegistrationFields(original, {
      ...draft(),
      sections: [{ ...draft().sections[0], fields: [field()] }],
    });
    expect(view.sections[0].fields[0].inheritedFrom).toBeUndefined();
  });
  it('locks a matched custom starter slot by its retained target ID after canonical binding normalization', () => {
    const custom = {
      ...newField('section', 0),
      id: 'matched-parent',
      code: 'GUARDIAN_NAME',
      label: 'Parent or guardian name',
    };
    const source = {
      ...field('Parent/Guardian name'),
      id: custom.id,
      bindingKey: 'Guardian.FirstName',
      fieldType: 0 as const,
    };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [custom] }] };
    const view = markInheritedRegistrationFields(original, {
      sections: [{ ...draft().sections[0], fields: [source] }],
    });
    expect(view.sections[0].fields[0].inheritedFrom).toEqual(source.inheritedFrom);
    expect(view.sections[0].fields[0].label).toBe('Parent/Guardian name');
    expect(original.sections[0].fields[0]).toEqual(custom);
  });
  it('recognizes explicit name aliases without treating Father first name as Student first name', () => {
    const fields = [
      {
        key: 'Applicant.FirstName',
        displayName: 'First name',
        fieldType: 0 as const,
        readOnly: false,
        description: '',
      },
      {
        key: 'Father.FirstName',
        displayName: 'Father first name',
        fieldType: 0 as const,
        readOnly: false,
        description: '',
      },
    ];
    expect(findExistingStudentFieldAlias('fname', fields)?.key).toBe('Applicant.FirstName');
    expect(findExistingStudentFieldAlias('father fname', fields)).toBeUndefined();
    expect(findExistingStudentFieldAlias('Favourite name', fields)).toBeUndefined();
  });
});
