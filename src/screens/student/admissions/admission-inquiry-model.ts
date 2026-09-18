import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import type {
  AdmissionForm,
  AdmissionFormField,
} from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionInquirySource,
  CreateAdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';

export type AdmissionInquiryFormValues = {
  cycleId: string;
  offeringId: string;
  source: AdmissionInquirySource;
  sourceDetail: string;
  preferredLanguageCode: string;
  sendAcknowledgement: boolean;
  fields: Record<string, string>;
};

export const admissionInquirySourceOptions = [
  'Website',
  'Walk-in',
  'Phone',
  'Referral',
  'Campaign',
  'Import',
  'WhatsApp',
  'Existing parent',
  'Manual',
  'Other',
];

export const admissionInquiryLanguageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'ur', label: 'Urdu' },
];

export const initialAdmissionInquiryValues: AdmissionInquiryFormValues = {
  cycleId: '',
  offeringId: '',
  source: 0,
  sourceDetail: '',
  preferredLanguageCode: 'en',
  sendAcknowledgement: true,
  fields: {},
};

export const admissionInquirySchema = Yup.object({
  cycleId: Yup.string().required('Admission cycle is required'),
  offeringId: Yup.string().required('Offering is required'),
  source: Yup.number().integer().min(0).max(9).required('Source is required'),
  sourceDetail: Yup.string().trim().max(128, 'Use 128 characters or fewer'),
  preferredLanguageCode: Yup.string().trim().required('Preferred language is required'),
  sendAcknowledgement: Yup.boolean().required(),
  fields: Yup.object().required(),
});

const applicantFirstNameFallback: AdmissionFormField = {
  id: 'inquiry-applicant-first-name',
  code: 'applicantFirstName',
  label: 'Applicant first name',
  fieldType: 0,
  bindingType: 0,
  bindingKey: 'Applicant.FirstName',
  required: true,
  readOnly: false,
  displayOrder: Number.MAX_SAFE_INTEGER - 1,
};

const guardianFirstNameFallback: AdmissionFormField = {
  id: 'inquiry-guardian-first-name',
  code: 'guardianFirstName',
  label: 'Guardian first name',
  fieldType: 0,
  bindingType: 0,
  bindingKey: 'Guardian.FirstName',
  required: true,
  readOnly: false,
  displayOrder: Number.MAX_SAFE_INTEGER,
};

const legacyIdentityFieldCodes: Record<string, readonly string[]> = {
  'Applicant.Name': ['STUDENT_NAME', 'APPLICANT_NAME', 'CHILD_NAME'],
  'Applicant.FirstName': [
    'STUDENT_FIRST_NAME',
    'APPLICANT_FIRST_NAME',
    'FIRST_NAME',
    'STUDENT_NAME',
    'APPLICANT_NAME',
    'CHILD_NAME',
  ],
  'Applicant.LastName': ['STUDENT_LAST_NAME', 'APPLICANT_LAST_NAME', 'LAST_NAME'],
  'Applicant.DateOfBirth': ['DATE_OF_BIRTH', 'DOB', 'STUDENT_DOB', 'APPLICANT_DOB'],
  'Guardian.FirstName': [
    'GUARDIAN_FIRST_NAME',
    'PARENT_FIRST_NAME',
    'GUARDIAN_NAME',
    'PARENT_NAME',
  ],
  'Guardian.LastName': ['GUARDIAN_LAST_NAME', 'PARENT_LAST_NAME'],
  'Guardian.Mobile': ['GUARDIAN_MOBILE', 'GUARDIAN_PHONE', 'PARENT_MOBILE', 'PARENT_PHONE'],
  'Guardian.Email': ['GUARDIAN_EMAIL', 'PARENT_EMAIL'],
};

const equalsIgnoreCase = (left?: string, right?: string) =>
  left?.localeCompare(right ?? '', undefined, { sensitivity: 'accent' }) === 0;

const hasIdentityField = (fields: AdmissionFormField[], bindingKey: string) => {
  const aliases = legacyIdentityFieldCodes[bindingKey] ?? [];
  return fields.some(
    (field) =>
      equalsIgnoreCase(field.bindingKey, bindingKey) ||
      aliases.some((code) => equalsIgnoreCase(field.code, code))
  );
};

export const getAdmissionInquiryFields = (form?: AdmissionForm): AdmissionFormField[] => {
  if (!form) return [];
  const fields = form.sections.flatMap((section) => section.fields);
  return [
    ...fields,
    ...(!hasIdentityField(fields, 'Applicant.FirstName') ? [applicantFirstNameFallback] : []),
    ...(!hasIdentityField(fields, 'Guardian.FirstName') ? [guardianFirstNameFallback] : []),
  ];
};

const fieldValue = (values: AdmissionInquiryFormValues, code?: string) => {
  if (!code) return '';
  const valueKey = Object.keys(values.fields).find((key) => equalsIgnoreCase(key, code));
  return (valueKey ? values.fields[valueKey] : '').trim();
};

const boundValue = (
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  bindingKey: string,
  fallbackCode: string
) => {
  const canonicalField = fields.find((item) => equalsIgnoreCase(item.bindingKey, bindingKey));
  const canonicalValue = fieldValue(values, canonicalField?.code);
  if (canonicalValue) return canonicalValue;

  const aliasValue = (legacyIdentityFieldCodes[bindingKey] ?? [])
    .map((alias) => fields.find((item) => equalsIgnoreCase(item.code, alias)))
    .map((aliasField) => fieldValue(values, aliasField?.code))
    .find(Boolean);
  if (aliasValue) return aliasValue;

  return fieldValue(values, fallbackCode);
};

const serializeFieldValue = (field: AdmissionFormField, value: string) => {
  if ([7, 9, 11].includes(field.fieldType)) {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value);
};

export function buildAdmissionInquiryPayload(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  existingFamilyId?: string | null,
  createSeparateFamily = false,
  duplicateOverrideReason?: string
): CreateAdmissionInquiry {
  const applicantFirstName = boundValue(
    values,
    fields,
    'Applicant.FirstName',
    'applicantFirstName'
  );
  const applicantLastName = boundValue(values, fields, 'Applicant.LastName', 'applicantLastName');
  const guardianFirstName = boundValue(values, fields, 'Guardian.FirstName', 'guardianFirstName');
  const guardianPhone = boundValue(values, fields, 'Guardian.Mobile', 'guardianPhone');
  const guardianEmail = boundValue(values, fields, 'Guardian.Email', 'guardianEmail');
  const applicantName =
    boundValue(values, fields, 'Applicant.Name', 'applicantName') ||
    [applicantFirstName, applicantLastName].filter(Boolean).join(' ');
  return {
    admissionCycleId: values.cycleId,
    admissionOfferingId: values.offeringId || null,
    existingFamilyId,
    createSeparateFamily,
    duplicateOverrideReason: duplicateOverrideReason?.trim() || null,
    applicantName,
    phone: guardianPhone,
    email: guardianEmail || null,
    preferredLanguageCode: values.preferredLanguageCode,
    source: values.source,
    sourceDetail: values.sourceDetail || null,
    guardianFirstName,
    guardianLastName: boundValue(values, fields, 'Guardian.LastName', 'guardianLastName') || null,
    guardianPhone,
    guardianEmail: guardianEmail || null,
    applicantFirstName,
    applicantLastName: applicantLastName || null,
    applicantDateOfBirth:
      boundValue(values, fields, 'Applicant.DateOfBirth', 'applicantDateOfBirth') || null,
    formValues: fields
      .filter((field) => values.fields[field.code] !== undefined)
      .map((field) => ({
        fieldCode: field.code,
        valueJson: serializeFieldValue(field, values.fields[field.code]),
      })),
  };
}

export function validateAdmissionInquiry(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  policy?: AdmissionInquiryPolicy | null
) {
  const fieldErrors = Object.fromEntries(
    fields
      .filter((field) => field.required && !values.fields[field.code]?.trim())
      .map((field) => [field.code, `${field.label} is required`])
  );
  return {
    ...(!values.cycleId ? { cycleId: 'Admission cycle is required' } : {}),
    ...(!values.offeringId ? { offeringId: 'Offering is required' } : {}),
    ...(policy?.allowedSources.length && !policy.allowedSources.includes(values.source)
      ? { source: 'Choose a source allowed by this admission workflow' }
      : {}),
    ...(policy?.requireSourceDetailFor.includes(values.source) && !values.sourceDetail.trim()
      ? { sourceDetail: 'Source details are required for this source' }
      : {}),
    ...(Object.keys(fieldErrors).length ? { fields: fieldErrors } : {}),
  };
}

export function buildAdmissionInquiryDuplicateInput(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[]
) {
  const payload = buildAdmissionInquiryPayload(values, fields);
  return {
    admissionCycleId: payload.admissionCycleId,
    guardianPhone: payload.guardianPhone,
    guardianEmail: payload.guardianEmail ?? undefined,
    applicantName: payload.applicantName,
    applicantDateOfBirth: payload.applicantDateOfBirth ?? undefined,
  };
}
