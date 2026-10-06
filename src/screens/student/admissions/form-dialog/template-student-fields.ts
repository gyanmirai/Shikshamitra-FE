import type { AdmissionFormFieldType } from 'src/redux/student/admissions/admission-forms-api';

// Canonical bindings for newly materialized templates. Saved forms keep their original bindings.
const bindings: Record<string, string> = {
  AADHAAR_NO: 'Identity.AadhaarNumber',
  PAN_NO: 'Identity.PanNumber',
  APPAR_ID: 'Identity.ApaarId',
  PEN_NO: 'Identity.PenNumber',
  NATIONALITY: 'Applicant.Nationality',
  BIRTH_PLACE: 'Applicant.PlaceOfBirth',
  MOTHER_TONGUE: 'Applicant.MotherTongue',
  RELIGION: 'Applicant.Religion',
  FAMILY_CASTE: 'Applicant.Caste',
  CASTE_CATEGORY: 'Applicant.SocialCategory',
  SECONDARY_CONTACT_NO: 'Contact.SecondaryPhone',
  GUARDIAN_RELATION: 'Guardian.Relationship',
  ADDRESS_LINE_1: 'Address.AddressLine1',
  ADDRESS_LINE_2: 'Address.AddressLine2',
  COUNTRY: 'Address.Country',
  STATE: 'Address.State',
  CITY: 'Address.City',
  PIN_CODE: 'Address.PostalCode',
  SINGLE_PARENT_CHILD: 'Family.IsSingleParentChild',
  SINGLE_CHILD: 'Family.IsSingleChild',
  SIBLING_STUDENT: 'Family.SiblingStudentIds',
  BLOOD_GROUP: 'Medical.BloodGroup',
  ALLERGIES: 'Medical.Allergies',
  MEDICAL_CONDITIONS: 'Medical.MedicalConditions',
  CURRENT_MEDICATION: 'Medical.CurrentMedication',
  DOCTOR_NAME: 'Medical.DoctorName',
  DOCTOR_PHONE: 'Medical.DoctorPhone',
  EMERGENCY_NAME: 'Emergency.ContactName',
  EMERGENCY_RELATIVE_NAME: 'Emergency.ContactName',
  EMERGENCY_CONTACT: 'Emergency.ContactName',
  EMERGENCY_PHONE: 'Emergency.ContactPhone',
  EMERGENCY_CONTACT_NO: 'Emergency.ContactPhone',
  EMERGENCY_RELATION: 'Emergency.Relationship',
  PREVIOUS_SCHOOL: 'PreviousSchool.Name',
  LAST_CLASS_PASSED: 'PreviousSchool.LastClass',
  LAST_CLASS_COMPLETED: 'PreviousSchool.LastClass',
  PREVIOUS_SCHOOL_ADDRESS: 'PreviousSchool.Address',
  TRANSFER_CERTIFICATE_NO: 'PreviousSchool.TCNumber',
  SECOND_LANGUAGE: 'Academic.SecondLanguage',
};

export function templateStudentBinding(
  code: string
): { bindingKey: string; fieldType?: AdmissionFormFieldType; optionsJson?: string } | undefined {
  const family =
    /^(FATHER|MOTHER|PRIMARY_GUARDIAN)_(FULL_NAME|OCCUPATION|EMAIL|QUALIFICATION|CONTACT_NO|DESIGNATION|ORGANIZATION)$/.exec(
      code
    );
  const familyProperties: Record<string, string> = {
    FULL_NAME: 'Name',
    OCCUPATION: 'Occupation',
    EMAIL: 'Email',
    QUALIFICATION: 'Qualification',
    CONTACT_NO: 'Mobile',
    DESIGNATION: 'Designation',
    ORGANIZATION: 'Employer',
  };
  const familyPrefix =
    family?.[1] === 'FATHER' ? 'Father' : family?.[1] === 'MOTHER' ? 'Mother' : 'Guardian';
  // Guardian has split name fields; do not pretend that a full-name question maps to either one.
  const bindingKey =
    bindings[code] ??
    (family &&
    !(
      familyPrefix === 'Guardian' &&
      ['FULL_NAME', 'QUALIFICATION', 'DESIGNATION', 'ORGANIZATION'].includes(family[2])
    )
      ? `${familyPrefix}.${familyProperties[family[2]]}`
      : undefined);
  if (!bindingKey) return undefined;
  if (bindingKey === 'Family.SiblingStudentIds')
    return { bindingKey, fieldType: 7, optionsJson: '{"source":"StudentSiblings"}' };
  if (bindingKey === 'Family.IsSingleChild' || bindingKey === 'Family.IsSingleParentChild')
    return { bindingKey, fieldType: 9 };
  // Catalogue text fields must remain compatible with their canonical backend type.
  if (
    [
      'Applicant.Religion',
      'Applicant.SocialCategory',
      'Applicant.MotherTongue',
      'PreviousSchool.LastClass',
    ].includes(bindingKey)
  )
    return { bindingKey, fieldType: 0 };
  return { bindingKey };
}
