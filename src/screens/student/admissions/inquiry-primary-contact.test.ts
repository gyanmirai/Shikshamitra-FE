import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { describe, expect, it } from 'vitest';

import { getBlankAdmissionFormInitialValues } from './form-dialog/form-dialog-model';
import { getInquiryFormConfigurationIssues } from './admission-inquiry-field-bindings';
import {
  buildAdmissionInquiryPayload,
  buildAdmissionInquiryDuplicateInput,
  initialAdmissionInquiryValues,
} from './admission-inquiry-model';

const field = (bindingKey: string, fieldType = 0): AdmissionFormField => ({
  id: bindingKey,
  code: bindingKey,
  bindingKey,
  label: bindingKey,
  bindingType: 0,
  required: false,
  readOnly: false,
  fieldType: fieldType as AdmissionFormField['fieldType'],
  displayOrder: 0,
});
const fields = [
  field('Applicant.Name'),
  field('Guardian.FirstName'),
  field('Guardian.Mobile', 4),
  field('Guardian.Email', 3),
  field('Inquiry.ParentRelationship', 6),
  field('Father.Mobile', 4),
  field('Mother.Email', 3),
];
const values = (role: string) => ({
  ...initialAdmissionInquiryValues,
  fields: {
    'Applicant.Name': 'Riya Shah',
    'Guardian.FirstName': 'Meera Shah',
    'Guardian.Mobile': '9876543210',
    'Guardian.Email': 'meera@example.com',
    'Inquiry.ParentRelationship': role,
    'Father.Mobile': '9123456780',
    'Mother.Email': 'other@example.com',
  },
});
const offering = { id: 'offering', admissionCycleId: 'cycle' } as AdmissionOfferingListItem;

describe('configured primary contact', () => {
  it('creates the three identity slots and the configured required contact selector', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const configured = form.sections.flatMap((section) => section.fields);
    expect(configured).toHaveLength(4);
    const selector = configured.find((item) => item.bindingKey === 'Inquiry.ParentRelationship')!;
    expect(selector).toMatchObject({ label: 'Primary contact', required: true, fieldType: 6 });
    expect(JSON.parse(selector.optionsJson!)).toEqual([
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
      { value: 'guardian', label: 'Guardian' },
    ]);
    expect(getInquiryFormConfigurationIssues(form)).toEqual([]);
  });
  it.each(['father', 'mother', 'guardian'])(
    'keeps generic primary slots authoritative for %s',
    (role) => {
      const payload = buildAdmissionInquiryPayload(values(role), fields, offering);
      expect(payload).toMatchObject({
        guardianFirstName: 'Meera Shah',
        guardianPhone: '9876543210',
        guardianEmail: role === 'mother' ? 'other@example.com' : 'meera@example.com',
      });
      expect(payload.parentRelationship).toBe(role === 'guardian' ? undefined : role);
    }
  );
  it('serializes staff guardian responsibility only after explicit confirmation', () => {
    expect(
      buildAdmissionInquiryPayload(
        { ...values('guardian'), guardianResponsibilityConfirmed: true },
        fields,
        offering
      )
    ).toMatchObject({ guardianResponsibilityConfirmed: true });
    expect(
      buildAdmissionInquiryPayload(values('guardian'), fields, offering)
        .guardianResponsibilityConfirmed
    ).toBe(false);
  });
  it('preserves the required structured owner in legacy optional-generic forms without a selector', () => {
    const legacyFields = fields
      .filter((item) => item.bindingKey !== 'Inquiry.ParentRelationship')
      .map((item) => (item.bindingKey === 'Father.Mobile' ? { ...item, required: true } : item));
    legacyFields.push({ ...field('Father.Name'), required: true });
    const legacyValues = {
      ...values('father'),
      parentRelationship: 'father' as const,
      fields: { ...values('father').fields, 'Father.Name': 'Raj Shah' },
    };
    expect(buildAdmissionInquiryPayload(legacyValues, legacyFields, offering)).toMatchObject({
      guardianFirstName: 'Raj Shah',
      guardianPhone: '9123456780',
    });
  });
  it('checks the chosen primary adult without allowing another configured number to replace it', () => {
    expect(
      buildAdmissionInquiryDuplicateInput(values('father'), fields, offering).parentContacts
    ).toContainEqual({ relationship: 'father', email: 'meera@example.com', mobile: '9876543210' });
  });
  it('rejects duplicate primary identity bindings at publication', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const mobile = form.sections[0].fields.find((item) => item.bindingKey === 'Guardian.Mobile')!;
    form.sections[0].fields.push({ ...mobile, id: 'duplicate', code: 'duplicate' });
    expect(getInquiryFormConfigurationIssues(form)).toContain(
      'Use one field for each inquiry identity connection before publishing.'
    );
  });
  it('never resolves hidden legacy-code contact answers into primary identity', () => {
    const hiddenPhone = {
      ...field('Guardian.Mobile', 4),
      code: 'guardianPhone',
      visibilityRuleJson: JSON.stringify({ field: 'SHOW', operator: 'equals', value: 'yes' }),
    };
    expect(
      buildAdmissionInquiryPayload(
        {
          ...values('guardian'),
          fields: { ...values('guardian').fields, guardianPhone: '9123456780' },
        },
        [field('Applicant.Name'), field('Guardian.FirstName'), hiddenPhone],
        offering
      ).guardianPhone
    ).toBe('');
  });
  it('requires duplicate role-specific email questions to stay conditional', () => {
    const form = getBlankAdmissionFormInitialValues(0);
    const selector = form.sections[0].fields.find(
      (item) => item.bindingKey === 'Inquiry.ParentRelationship'
    )!;
    form.sections[0].fields.push(field('Guardian.Email', 3), field('Father.Email', 3));
    expect(getInquiryFormConfigurationIssues(form)).toContain(
      'Show one primary contact email question for each selected role before publishing. Keep other-parent email questions conditional.'
    );
    form.sections[0].fields.at(-1)!.visibilityRuleJson = JSON.stringify({
      field: selector.code,
      operator: 'notEquals',
      value: 'father',
    });
    expect(getInquiryFormConfigurationIssues(form)).toEqual([]);
  });
});
