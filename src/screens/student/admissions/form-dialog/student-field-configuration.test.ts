import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { newField } from './form-dialog-model';
import { getRegistrationFormTemplate } from './registration-form-template';
import {
  matchesStudentField,
  configureStudentField,
  connectStudentAddressFields,
} from './student-field-configuration';

const metadata = (key: string): AdmissionFormSystemFieldMetadata => ({
  key,
  displayName: key,
  description: '',
  fieldType: 0,
  readOnly: false,
});

describe('new Student field configuration', () => {
  it('finds known fields with common school search wording and Aadhaar spelling', () => {
    expect(
      matchesStudentField(
        { ...metadata('Father.Mobile'), displayName: "Father's mobile" },
        'father phone'
      )
    ).toBe(true);
    expect(
      matchesStudentField(
        { ...metadata('Identity.AadhaarNumber'), displayName: 'Student Aadhaar number' },
        'aadhar'
      )
    ).toBe(true);
    expect(
      matchesStudentField(
        { ...metadata('Mother.Mobile'), displayName: "Mother's mobile" },
        'father phone'
      )
    ).toBe(false);
  });
  it('uses ready-made identity and photo controls while keeping identity questions optional', () => {
    [
      ['Applicant.ProfilePhoto', 'photo'],
      ['Identity.AadhaarNumber', 'aadhaar'],
      ['Identity.PanNumber', 'pan'],
    ].forEach(([key, format]) => {
      const field = configureStudentField(newField('section', 0), metadata(key));
      expect(JSON.parse(field.validationJson!)).toMatchObject({ format });
      expect(field.required).toBe(false);
    });
  });

  it('connects current and permanent address selectors using the actual unique field codes', () => {
    const fields = ['Address', 'PermanentAddress'].flatMap((prefix, index) =>
      ['City', 'State', 'Country'].map((suffix, order) => ({
        ...configureStudentField(newField('section', order), metadata(`${prefix}.${suffix}`)),
        code: `${prefix.toUpperCase()}_${suffix.toUpperCase()}_${index + 2}`,
      }))
    );
    const connected = connectStudentAddressFields(fields);
    expect(JSON.parse(connected[0].validationJson!)).toMatchObject({
      countryField: 'ADDRESS_COUNTRY_2',
      stateField: 'ADDRESS_STATE_2',
    });
    expect(JSON.parse(connected[3].validationJson!)).toMatchObject({
      countryField: 'PERMANENTADDRESS_COUNTRY_3',
      stateField: 'PERMANENTADDRESS_STATE_3',
    });
    expect(JSON.parse(fields[0].validationJson!)).not.toHaveProperty('countryField');
  });

  it('creates registration identity, health, family and academic answers with canonical bindings', () => {
    const fields = getRegistrationFormTemplate().sections.flatMap((section) => section.fields);
    const linked = (code: string) => fields.find((field) => field.code === code)!;
    expect(linked('AADHAAR_NO').bindingKey).toBe('Identity.AadhaarNumber');
    expect(linked('PAN_NO').required).toBe(false);
    expect(linked('NATIONALITY').bindingKey).toBe('Applicant.Nationality');
    expect(linked('FATHER_FULL_NAME').bindingKey).toBe('Father.Name');
    expect(linked('BLOOD_GROUP').bindingKey).toBe('Medical.BloodGroup');
    expect(linked('PREVIOUS_SCHOOL').bindingKey).toBe('PreviousSchool.Name');
    expect(linked('SIBLING_STUDENT')).toMatchObject({
      bindingKey: 'Family.SiblingStudentIds',
      fieldType: 7,
      optionsJson: '{"source":"StudentSiblings"}',
    });
  });
});
