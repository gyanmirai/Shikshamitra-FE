import { it, expect, describe } from 'vitest';

import { validateAdmissionInquiry } from '../admission-inquiry-model';
import { getDynamicAdmissionValidationErrors } from '../admission-form-validation';
import { getSystemAdmissionFormTemplate } from './admission-form-template-catalog';
import {
  getAdmissionFormInitialValues,
  getBlankAdmissionFormInitialValues,
} from './form-dialog-model';
import {
  changeNewFormPurpose,
  isLockedInquiryField,
  withoutInquiryDefaults,
  ensureNewInquiryDefaults,
} from './inquiry-default-fields';

describe('versioned admission core fields', () => {
  it('creates six canonical Inquiry controls and permanently optional last name', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    expect(form.coreFieldPolicyVersion).toBe(1);
    expect(
      form.sections
        .flatMap((section) => section.fields)
        .map((field) => [field.bindingKey, field.label, field.required])
    ).toEqual([
      ['Applicant.FirstName', 'First name', true],
      ['Applicant.LastName', 'Last name', false],
      ['Guardian.FirstName', 'Parent name', true],
      ['Guardian.Mobile', 'Parent contact number', true],
      ['Guardian.Email', 'Parent email', true],
      ['Inquiry.ParentRelationship', 'Relationship to student', true],
    ]);
    expect(ensureNewInquiryDefaults(form)).toEqual(form);
  });
  it('locks from version and binding even after labels and codes change', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    form.sections[0].fields.forEach((field) => {
      const renamed = { ...field, code: `RENAMED_${field.displayOrder}`, label: 'My label' };
      expect(isLockedInquiryField(0, renamed, 1)).toBe(true);
      expect(isLockedInquiryField(0, renamed, undefined)).toBe(false);
    });
  });
  it('preserves edited core labels and translations through purpose changes and draft replacement checks', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    form.sections[0].fields[0].label = 'Child given name';
    form.sections[0].fields[0].translations = { hi: { label: 'School translation' } };
    expect(withoutInquiryDefaults(form).sections[0].fields[0].label).toBe('Child given name');
    const changed = changeNewFormPurpose(form, 1);
    expect(
      changed.sections[0].fields.find((field) => field.bindingKey === 'Applicant.FirstName')
    ).toMatchObject({
      label: 'Child given name',
      translations: { hi: { label: 'School translation' } },
    });
  });
  it('does not upgrade historical definitions on read', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const historical = {
      ...form,
      coreFieldPolicyVersion: undefined,
      id: 'old',
      version: 1,
      status: 0 as const,
      sectionCount: 1,
      concurrencyStamp: undefined,
    };
    historical.sections[0].fields = historical.sections[0].fields.slice(0, 1);
    historical.sections[0].fields[0].bindingKey = 'Applicant.Name';
    const loaded = getAdmissionFormInitialValues(historical);
    expect(loaded.coreFieldPolicyVersion).toBeUndefined();
    expect(loaded.sections).toEqual(historical.sections);
  });
  it('switches new purposes to lawful Registration defaults', () => {
    const form = changeNewFormPurpose(getBlankAdmissionFormInitialValues(0), 1);
    expect(
      form.sections.flatMap((section) => section.fields).map((field) => field.bindingKey)
    ).toEqual([
      'Applicant.FirstName',
      'Applicant.LastName',
      'Guardian.FirstName',
      'Guardian.Mobile',
      'Guardian.Email',
      'Applicant.DateOfBirth',
      'Applicant.Gender',
    ]);
    expect(changeNewFormPurpose(form, 0).sections[0].fields).toHaveLength(6);
  });
  it('normalizes new Inquiry templates without full-name duplication', () => {
    const form = getSystemAdmissionFormTemplate('admission-inquiry');
    const fields = form.sections.flatMap((section) => section.fields);
    expect(
      fields.filter((field) => isLockedInquiryField(0, field, form.coreFieldPolicyVersion))
    ).toHaveLength(6);
    expect(fields.some((field) => field.bindingKey === 'Applicant.Name')).toBe(false);
    expect(new Set(fields.map((field) => field.bindingKey)).size).toBe(fields.length);
  });
  it('adds only DOB/gender for inherited Registration', () => {
    const form = getBlankAdmissionFormInitialValues(1);
    form.inheritance = {
      enabled: true,
      sources: [
        {
          inquiryFormDefinitionId: 'source',
          requiredFieldIdentities: [],
          fieldMappings: [],
          layouts: [],
        },
      ],
    };
    form.sections[0].fields = [];
    const next = ensureNewInquiryDefaults(form);
    expect(
      next.sections.flatMap((section) => section.fields).map((field) => field.bindingKey)
    ).toEqual(['Applicant.DateOfBirth', 'Applicant.Gender']);
  });
  it('uses editable labels and sentence punctuation in runtime required messages', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const fields = form.sections.flatMap((section) => section.fields);
    const errors = validateAdmissionInquiry(
      {
        boardId: 'b',
        mediumId: 'm',
        standardId: 's',
        offeringId: 'o',
        source: 0,
        sourceDetail: '',
        sendAcknowledgement: false,
        fields: {},
      },
      fields
    );
    expect(errors.fields).toEqual({
      APPLICANT_FIRSTNAME: 'First name is required.',
      GUARDIAN_FIRSTNAME: 'Parent name is required.',
      GUARDIAN_MOBILE: 'Parent contact number is required.',
      GUARDIAN_EMAIL: 'Parent email is required.',
      INQUIRY_PARENTRELATIONSHIP: 'Select a relationship to student.',
    });
    fields[0].label = 'Child given name';
    expect(getDynamicAdmissionValidationErrors(form, {})).toHaveProperty(
      fields[0].code,
      'Child given name is required.'
    );
  });
  it('validates Registration parent phone and email using their editable labels', () => {
    const form = getBlankAdmissionFormInitialValues(1);
    const phone = form.sections[0].fields.find((field) => field.bindingKey === 'Guardian.Mobile')!;
    const email = form.sections[0].fields.find((field) => field.bindingKey === 'Guardian.Email')!;
    phone.label = 'Family phone';
    email.label = 'Family email';
    const errors = getDynamicAdmissionValidationErrors(form, {
      [phone.code]: '1234567890',
      [email.code]: 'invalid',
    });
    expect(errors[phone.code]).toBe('Family phone must be a valid 10-digit Indian mobile number.');
    expect(errors[email.code]).toBe('Family email must be a valid email address.');
  });
  it('materializes core controls in always-visible nonrepeatable sections while preserving extra questions', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    form.sections[0].isRepeatable = true;
    form.sections[0].fields.push({
      ...form.sections[0].fields[0],
      id: 'extra',
      bindingType: 1,
      bindingKey: 'EXTRA',
      label: 'Additional question',
    });
    const next = ensureNewInquiryDefaults(form);
    expect(next.sections[0].fields.map((field) => field.label)).toEqual(['Additional question']);
    expect(next.sections[1].fields).toHaveLength(6);
    expect(next.sections[1].isRepeatable).not.toBe(true);
  });
});
