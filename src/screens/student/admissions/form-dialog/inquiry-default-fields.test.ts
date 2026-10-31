import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getSystemAdmissionFormTemplate } from './admission-form-template-catalog';
import { getInquiryFormConfigurationIssues } from '../admission-inquiry-field-bindings';
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
  ensureNewInquiryDefaults,
  conflictsWithInquiryDefaultName,
} from './inquiry-default-fields';

describe('generated Inquiry identity', () => {
  it('starts publication-ready, keeps applicant entry editable, and retains locks after a saved round trip', () => {
    const form: CreateUpdateAdmissionForm = JSON.parse(
      JSON.stringify(getBlankAdmissionFormInitialValues(0))
    );
    expect(getInquiryFormConfigurationIssues(form)).toEqual([]);
    expect(form.sections[0].fields).toHaveLength(4);
    form.sections[0].fields.forEach((field) => {
      expect(isLockedInquiryField(0, field)).toBe(true);
      expect(field.required).toBe(true);
      expect(field.readOnly).toBe(false);
    });
    expect(ensureNewInquiryDefaults(form)).toEqual(form);
  });

  it('locks the generated Inquiry identity and primary contact fields without duplicating their bindings', () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    const fields = form.sections.flatMap((section) => section.fields);
    expect(fields.filter((field) => isLockedInquiryField(0, field))).toHaveLength(4);
    expect(new Set(fields.map((field) => field.bindingKey)).size).toBe(fields.length);
    expect(getInquiryFormConfigurationIssues(form)).toEqual([]);
    expect(hasOnlyInquiryDefaults(form)).toBe(false);
  });

  it('does not rewrite or lock an existing authored Inquiry field', () => {
    const form = getBlankAdmissionFormInitialValues(1);
    const field = {
      ...newField(form.sections[0].id, 0),
      code: 'CUSTOM_PARENT',
      bindingKey: 'Guardian.FirstName',
      bindingType: 0 as const,
      required: false,
    };
    form.purpose = 0;
    form.sections[0].fields = [field];
    const existing = {
      ...form,
      id: 'saved',
      version: 1,
      status: 0 as const,
      sectionCount: 1,
      concurrencyStamp: form.concurrencyStamp ?? undefined,
    };
    const loaded = getAdmissionFormInitialValues(existing);
    expect(loaded.sections[0].fields).toEqual([field]);
    expect(isLockedInquiryField(0, field)).toBe(false);
  });

  it('switches a pristine canvas between empty Registration and default Inquiry without losing details', () => {
    const form = {
      ...getBlankAdmissionFormInitialValues(0),
      name: 'My form',
      description: 'Keep my notes',
    };
    const registration = changeNewFormPurpose(form, 1);
    expect(registration.sections[0].fields).toEqual([]);
    expect(registration.name).toBe(form.name);
    expect(registration.description).toBe(form.description);
    const inquiry = changeNewFormPurpose(registration, 0);
    expect(inquiry.sections[0].fields).toHaveLength(4);
    expect(getInquiryFormConfigurationIssues(inquiry)).toEqual([]);
  });

  it('preserves populated draft codes, rules and identity representation when switching type', () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    const registration = changeNewFormPurpose(form, 1);
    expect(registration.sections).toEqual(form.sections);
    expect(
      registration.sections
        .flatMap((section) => section.fields)
        .every((field) => !isLockedInquiryField(1, field))
    ).toBe(true);
    const split = getBlankAdmissionFormInitialValues(1);
    const field = {
      ...newField(split.sections[0].id, 0),
      code: 'MY_FIRST_NAME',
      bindingType: 0 as const,
      bindingKey: 'Applicant.FirstName',
      required: true,
    };
    split.sections[0].fields = [field];
    const inquiry = changeNewFormPurpose(split, 0);
    expect(inquiry.sections[0].fields[0]).toEqual(field);
    expect(inquiry.sections[0].fields.some((item) => item.bindingKey === 'Applicant.Name')).toBe(
      false
    );
    expect(getInquiryFormConfigurationIssues(inquiry)).toEqual([]);
  });

  it('prevents the generated full-name field from conflicting with added split-name fields', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.FirstName')).toBe(true);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.MiddleName')).toBe(true);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.LastName')).toBe(true);
    expect(conflictsWithInquiryDefaultName(form, 'Applicant.DateOfBirth')).toBe(false);
    expect(conflictsWithInquiryDefaultName({ ...form, purpose: 1 }, 'Applicant.FirstName')).toBe(
      false
    );
  });

  it('restores system translations when a saved generated form enables another language later', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    form.sections[0].fields.forEach((field) => {
      field.translations = {};
    });
    const loaded = getAdmissionFormInitialValues({
      ...form,
      id: 'saved-defaults',
      version: 1,
      status: 0,
      sectionCount: 1,
      concurrencyStamp: form.concurrencyStamp ?? undefined,
    });
    expect(loaded.sections[0].fields[0].translations?.gu?.label).toBe('વિદ્યાર્થીનું નામ');
    expect(loaded.sections[0].fields[0].translations?.hi?.label).toBe('विद्यार्थी का नाम');
    expect(form.sections[0].fields[0].translations).toEqual({});
  });

  it('adds a locked first name instead of a conflicting full name when a draft already has split names', () => {
    const form = getBlankAdmissionFormInitialValues(1);
    form.sections[0].fields = [
      {
        ...newField(form.sections[0].id, 0),
        code: 'MIDDLE',
        bindingType: 0,
        bindingKey: 'Applicant.MiddleName',
      },
    ];
    const next = changeNewFormPurpose(form, 0);
    const fields = next.sections.flatMap((section) => section.fields);
    expect(fields.some((field) => field.bindingKey === 'Applicant.Name')).toBe(false);
    const first = fields.find((field) => field.bindingKey === 'Applicant.FirstName')!;
    expect(first).toBeDefined();
    expect(isLockedInquiryField(0, first)).toBe(true);
    expect(conflictsWithInquiryDefaultName(next, 'Applicant.Name')).toBe(true);
    expect(getInquiryFormConfigurationIssues(next)).toEqual([]);
    expect(next.sections[0].fields[0]).toEqual(form.sections[0].fields[0]);
  });

  it('preserves authored Registration changes to previously generated fields in both switch directions', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    form.sections[0].fields.push(newField(form.sections[0].id, 3));
    const registration = changeNewFormPurpose(form, 1);
    registration.sections[0].fields = registration.sections[0].fields.slice(0, 4).map((field) =>
      field.bindingKey === 'Guardian.FirstName'
        ? {
            ...field,
            label: 'My family contact',
            required: false,
            visibilityRuleJson: '{"field":"INQUIRY_STUDENT_NAME","operator":"isNotEmpty"}',
          }
        : field
    );
    const before = structuredClone(registration.sections);
    expect(
      withoutInquiryDefaults(registration).sections[0].fields.map((field) => field.label)
    ).toContain('My family contact');
    const inquiry = changeNewFormPurpose(registration, 0);
    expect(inquiry.sections).toEqual(before);
    expect(isLockedInquiryField(0, inquiry.sections[0].fields[1])).toBe(false);
    expect(hasOnlyInquiryDefaults(inquiry)).toBe(false);
    expect(changeNewFormPurpose(inquiry, 1).sections).toEqual(before);
  });
});
