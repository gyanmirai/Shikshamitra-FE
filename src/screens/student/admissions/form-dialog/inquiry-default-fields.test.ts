import { it, expect, describe } from 'vitest';

import {
  newField,
  getAdmissionFormInitialValues,
  getBlankAdmissionFormInitialValues,
} from './form-dialog-model';
import {
  changeNewFormPurpose,
  isLockedInquiryField,
  hasOnlyInquiryDefaults,
  withoutInquiryDefaults,
  changeNewFormInheritance,
  ensureNewInquiryDefaults,
  conflictsWithInquiryDefaultName,
} from './inquiry-default-fields';

describe('admission core field lifecycle', () => {
  it('keeps optional last name on the canvas and locks renamed controls after save', () => {
    const form = JSON.parse(JSON.stringify(getBlankAdmissionFormInitialValues(0)));
    expect(form.sections[0].fields).toHaveLength(6);
    expect(
      form.sections[0].fields.find(
        (field: { bindingKey: string }) => field.bindingKey === 'Applicant.LastName'
      ).required
    ).toBe(false);
    form.sections[0].fields.forEach((field: { label: string }) => {
      field.label = 'School label';
    });
    form.sections[0].fields.forEach((field: Parameters<typeof isLockedInquiryField>[1]) =>
      expect(isLockedInquiryField(0, field, form.coreFieldPolicyVersion)).toBe(true)
    );
    expect(ensureNewInquiryDefaults(form)).toEqual(form);
  });
  it('does not upgrade saved historical fields or add translations on read', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const field = {
      ...newField(form.sections[0].id, 0),
      code: 'INQUIRY_PARENT_NAME',
      label: 'My family contact',
      bindingKey: 'Guardian.FirstName',
      bindingType: 0 as const,
      required: false,
    };
    form.sections[0].fields = [field];
    const loaded = getAdmissionFormInitialValues({
      ...form,
      coreFieldPolicyVersion: undefined,
      id: 'saved',
      version: 1,
      status: 0,
      sectionCount: 1,
      concurrencyStamp: undefined,
    });
    expect(loaded.sections).toEqual(form.sections);
    expect(isLockedInquiryField(0, field, loaded.coreFieldPolicyVersion)).toBe(false);
  });
  it('preserves partial draft details and additional questions while changing purpose', () => {
    const form = {
      ...getBlankAdmissionFormInitialValues(0),
      name: 'School draft',
      description: 'Keep these notes',
    };
    const custom = newField(form.sections[0].id, 8);
    form.sections[0].fields.push(custom);
    const registration = changeNewFormPurpose(form, 1);
    expect(registration.name).toBe(form.name);
    expect(registration.description).toBe(form.description);
    expect(registration.sections[0].fields).toContainEqual(custom);
    expect(
      registration.sections[0].fields.some((field) => field.bindingKey?.startsWith('Inquiry.'))
    ).toBe(false);
  });
  it('prevents conflicting full-name addition and allows additional middle name', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.Name')).toBe(true);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.MiddleName')).toBe(false);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.DateOfBirth')).toBe(false);
    expect(hasOnlyInquiryDefaults(form)).toBe(true);
    expect(withoutInquiryDefaults(form).sections[0].fields).toEqual([]);
  });
  it('transfers identity ownership to Inquiry when inheritance is enabled and keeps extra questions', () => {
    const form = getBlankAdmissionFormInitialValues(1);
    const custom = newField(form.sections[0].id, 8);
    form.sections[0].fields.push(custom);
    const inherited = changeNewFormInheritance(form, true);
    expect(inherited.sections[0].fields).toContainEqual(custom);
    expect(
      inherited.sections[0].fields
        .filter((field) => field.bindingType === 0)
        .map((field) => field.bindingKey)
    ).toEqual(['Applicant.DateOfBirth', 'Applicant.Gender']);
    const direct = changeNewFormInheritance(inherited, false);
    expect(direct.sections[0].fields).toHaveLength(8);
    expect(direct.sections[0].fields).toContainEqual(custom);
  });
});
