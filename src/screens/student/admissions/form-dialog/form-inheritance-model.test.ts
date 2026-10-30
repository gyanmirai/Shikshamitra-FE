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
    const existing = { ...field('Birth date'), id: 'registration-dob', inheritedFrom: undefined };
    const original = { ...draft(), sections: [{ ...draft().sections[0], fields: [existing] }] };
    const view = markInheritedRegistrationFields(original, {
      ...draft(),
      sections: [{ ...draft().sections[0], fields: [field()] }],
    });
    expect(view.sections[0].fields[0].inheritedFrom).toEqual(field().inheritedFrom);
    expect(view.sections[0].fields[0].label).toBe('DOB');
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
