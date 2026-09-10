import type {
  AdmissionForm,
  AdmissionFormField,
} from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionInquirySource,
  CreateAdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

export type AdmissionInquiryFormValues = {
  cycleId: string;
  offeringId: string;
  source: AdmissionInquirySource;
  sourceDetail: string;
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

export const initialAdmissionInquiryValues: AdmissionInquiryFormValues = {
  cycleId: '',
  offeringId: '',
  source: 0,
  sourceDetail: '',
  fields: {},
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

export const getAdmissionInquiryFields = (form?: AdmissionForm): AdmissionFormField[] => {
  if (!form) return [];
  const fields = form.sections.flatMap((section) => section.fields);
  return fields.some((field) => field.bindingKey === 'Guardian.FirstName')
    ? fields
    : [...fields, guardianFirstNameFallback];
};

const boundValue = (
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  bindingKey: string,
  fallbackCode: string
) => {
  const field = fields.find((item) => item.bindingKey === bindingKey);
  return values.fields[field?.code ?? fallbackCode] ?? '';
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
  createSeparateFamily = false
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
  return {
    admissionCycleId: values.cycleId,
    admissionOfferingId: values.offeringId || null,
    existingFamilyId,
    createSeparateFamily,
    applicantName: [applicantFirstName, applicantLastName].filter(Boolean).join(' '),
    phone: guardianPhone,
    email: guardianEmail || null,
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
  fields: AdmissionFormField[]
) {
  const fieldErrors = Object.fromEntries(
    fields
      .filter((field) => field.required && !values.fields[field.code]?.trim())
      .map((field) => [field.code, `${field.label} is required`])
  );
  return {
    ...(!values.cycleId ? { cycleId: 'Admission cycle is required' } : {}),
    ...(!values.offeringId ? { offeringId: 'Offering is required' } : {}),
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
