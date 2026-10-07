import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type {
  AdmissionForm,
  AdmissionFormField,
  AdmissionFormSection,
} from 'src/redux/student/admissions/admission-forms-api';
import type {
  DuplicateMatch,
  AdmissionInquirySource,
  CreateAdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';

import { getDynamicAdmissionValidationErrors } from './admission-form-validation';

export type AdmissionInquiryFormValues = {
  admissionCycleId?: string;
  boardId: string;
  mediumId: string;
  standardId: string;
  offeringId: string;
  source: AdmissionInquirySource;
  sourceDetail: string;
  sendAcknowledgement: boolean;
  fields: Record<string, string>;
};

export type AdmissionInquiryFormSection = Pick<
  AdmissionFormSection,
  'id' | 'code' | 'name' | 'displayOrder' | 'fields' | 'visibilityRuleJson'
>;

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
  'QR code',
  'School fair',
  'Social media',
];

// Retained for the existing inquiry-management editor. New inquiry capture uses the default.
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
  admissionCycleId: '',
  boardId: '',
  mediumId: '',
  standardId: '',
  offeringId: '',
  source: 0,
  sourceDetail: '',
  sendAcknowledgement: true,
  fields: {},
};

export const admissionInquirySchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardId: Yup.string().required('Class is required'),
  admissionCycleId: Yup.string().required('Admission period is required'),
  offeringId: Yup.string().required('Offering is required'),
  source: Yup.number().integer().min(0).max(12).required('Source is required'),
  sourceDetail: Yup.string().max(128, 'Source details must be 128 characters or fewer'),
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

const guardianPhoneFallback: AdmissionFormField = {
  id: 'inquiry-guardian-phone',
  code: 'guardianPhone',
  label: 'Guardian mobile number',
  fieldType: 4,
  bindingType: 0,
  bindingKey: 'Guardian.Mobile',
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

export const getAdmissionInquirySections = (
  form?: AdmissionForm
): AdmissionInquiryFormSection[] => {
  const sections = [...(form?.sections ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((section) => ({
      id: section.id,
      code: section.code,
      name: section.name,
      displayOrder: section.displayOrder,
      visibilityRuleJson: section.visibilityRuleJson,
      fields: [...section.fields].sort((left, right) => left.displayOrder - right.displayOrder),
    }));
  const fields = sections.flatMap((section) => section.fields);
  const applicantFallbackFields = !hasIdentityField(fields, 'Applicant.FirstName')
    ? [applicantFirstNameFallback]
    : [];
  const guardianFallbackFields = [
    ...(!hasIdentityField(fields, 'Guardian.FirstName') ? [guardianFirstNameFallback] : []),
    ...(!hasIdentityField(fields, 'Guardian.Mobile') ? [guardianPhoneFallback] : []),
  ];

  return [
    ...sections,
    ...(applicantFallbackFields.length
      ? [
          {
            id: 'inquiry-applicant-details',
            code: 'INQUIRY_APPLICANT_DETAILS',
            name: 'Applicant details',
            displayOrder: Number.MAX_SAFE_INTEGER - 1,
            fields: applicantFallbackFields,
          },
        ]
      : []),
    ...(guardianFallbackFields.length
      ? [
          {
            id: 'inquiry-guardian-details',
            code: 'INQUIRY_GUARDIAN_DETAILS',
            name: 'Guardian details',
            displayOrder: Number.MAX_SAFE_INTEGER,
            fields: guardianFallbackFields,
          },
        ]
      : []),
  ];
};

export const getAdmissionInquiryFields = (form?: AdmissionForm): AdmissionFormField[] =>
  getAdmissionInquirySections(form).flatMap((section) => section.fields);

const uniqueOptions = (
  values: Array<{ id: string; name: string }>
): Array<{ id: string; name: string }> =>
  Array.from(new Map(values.map((value) => [value.id, value])).values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );

export function getAdmissionInquiryAcademicOptions(
  offerings: AdmissionOfferingListItem[],
  values: Pick<
    AdmissionInquiryFormValues,
    'admissionCycleId' | 'boardId' | 'mediumId' | 'standardId'
  >
) {
  const periodOfferings = values.admissionCycleId
    ? offerings.filter((offering) => offering.admissionCycleId === values.admissionCycleId)
    : offerings;
  const boardOfferings = values.boardId
    ? periodOfferings.filter((offering) => offering.boardId === values.boardId)
    : periodOfferings;
  const mediumOfferings = values.mediumId
    ? boardOfferings.filter((offering) => offering.mediumId === values.mediumId)
    : boardOfferings;

  return {
    boards: uniqueOptions(
      periodOfferings.map((offering) => ({ id: offering.boardId, name: offering.boardName }))
    ),
    mediums: uniqueOptions(
      boardOfferings.map((offering) => ({ id: offering.mediumId, name: offering.mediumName }))
    ),
    standards: uniqueOptions(
      mediumOfferings.map((offering) => ({ id: offering.standardId, name: offering.standardName }))
    ),
    offerings: periodOfferings.filter(
      (offering) =>
        offering.boardId === values.boardId &&
        offering.mediumId === values.mediumId &&
        offering.standardId === values.standardId
    ),
  };
}

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
  offering: AdmissionOfferingListItem,
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
    admissionCycleId: offering.admissionCycleId,
    admissionOfferingId: offering.id,
    boardId: values.boardId,
    mediumId: values.mediumId,
    standardId: values.standardId,
    existingFamilyId,
    createSeparateFamily,
    duplicateOverrideReason: duplicateOverrideReason?.trim() || null,
    applicantName,
    phone: guardianPhone,
    email: guardianEmail || null,
    preferredLanguageCode: 'en',
    source: values.source,
    sourceDetail: values.sourceDetail.trim() || null,
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
  policy?: AdmissionInquiryPolicy | null,
  offering?: AdmissionOfferingListItem
) {
  const fieldErrors = getDynamicAdmissionValidationErrors(
    { sections: [{ fields }] },
    values.fields
  );
  fields.forEach((field) => {
    if (field.required && !values.fields[field.code]?.trim() && fieldErrors[field.code]) {
      fieldErrors[field.code] = `${field.label} is required`;
    }
  });
  const guardianPhoneField = fields.find(
    (field) =>
      equalsIgnoreCase(field.bindingKey, 'Guardian.Mobile') ||
      legacyIdentityFieldCodes['Guardian.Mobile'].some((code) => equalsIgnoreCase(field.code, code))
  );
  const guardianPhone = boundValue(values, fields, 'Guardian.Mobile', 'guardianPhone');
  if (guardianPhoneField && guardianPhone && !/^[6-9]\d{9}$/.test(guardianPhone)) {
    fieldErrors[guardianPhoneField.code] =
      'Guardian mobile number must be a valid 10-digit Indian mobile number.';
  }
  const preferredClassError = getAdmissionInquiryPreferredClassError(values, fields, offering);
  if (preferredClassError) {
    fieldErrors[preferredClassError.fieldCode] = preferredClassError.message;
  }
  return {
    ...(!values.boardId ? { boardId: 'Board is required' } : {}),
    ...(!values.mediumId ? { mediumId: 'Medium is required' } : {}),
    ...(!values.standardId ? { standardId: 'Class is required' } : {}),
    ...(!values.offeringId ? { offeringId: 'Offering is required' } : {}),
    ...(values.offeringId && !offering ? { offeringId: 'Choose an available offering' } : {}),
    ...(offering &&
    (offering.boardId !== values.boardId ||
      offering.mediumId !== values.mediumId ||
      offering.standardId !== values.standardId)
      ? { offeringId: 'Choose an offering for the selected board, medium, and class' }
      : {}),
    ...(policy?.allowedSources.length && !policy.allowedSources.includes(values.source)
      ? { source: 'Choose a source allowed by this admission workflow' }
      : {}),
    ...(Object.keys(fieldErrors).length ? { fields: fieldErrors } : {}),
  };
}

export function getAdmissionInquiryPreferredClassError(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  offering?: AdmissionOfferingListItem
) {
  if (!offering) return null;
  const field = fields.find(
    (item) =>
      equalsIgnoreCase(item.bindingKey, 'Preference.Class') ||
      /^preferred[\s_-]*class$/i.test(item.code) ||
      /^preferred[\s_-]*class$/i.test(item.label)
  );
  const preferredClass = field ? fieldValue(values, field.code) : '';
  if (!field || !preferredClass) return null;

  const normalizeClass = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/^(class|grade|standard|std)\s*/i, '')
      .replace(/[^a-z0-9]/g, '');
  if (normalizeClass(preferredClass) === normalizeClass(offering.standardName)) return null;

  return {
    fieldCode: field.code,
    message: `Preferred class must match the selected offering (${offering.standardName}). Choose a matching offering or change the preferred class.`,
  };
}

export function buildAdmissionInquiryDuplicateInput(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  offering: AdmissionOfferingListItem
) {
  const payload = buildAdmissionInquiryPayload(values, fields, offering);
  return {
    admissionCycleId: payload.admissionCycleId,
    guardianPhone: payload.guardianPhone,
    guardianEmail: payload.guardianEmail ?? undefined,
    applicantName: payload.applicantName,
    applicantDateOfBirth: payload.applicantDateOfBirth ?? undefined,
  };
}

export function canLinkAdmissionInquiryFamily(match: DuplicateMatch, guardianPhone: string) {
  const enteredPhone = guardianPhone.replace(/\D/g, '');
  const matchedPhone = (match.guardianPhone ?? '').replace(/\D/g, '');
  return (
    /^[6-9]\d{9}$/.test(enteredPhone) &&
    matchedPhone === enteredPhone &&
    match.canLinkFamily !== false
  );
}

// Decode raw answers while retaining structured repeatable and multi-select values.
export function readAdmissionInquiryFormValues(
  values?: { fieldCode: string; valueJson?: string | null }[]
) {
  return Object.fromEntries(
    (values ?? []).map((item) => {
      let value = item.valueJson ?? '';
      try {
        const parsed: unknown = JSON.parse(value);
        value = typeof parsed === 'string' ? parsed : parsed == null ? '' : JSON.stringify(parsed);
      } catch {
        /* Legacy scalar answers remain readable. */
      }
      return [item.fieldCode, value];
    })
  );
}

export function preserveCompatibleInquiryAnswers(
  previousFields: Array<Pick<AdmissionFormField, 'code' | 'fieldType'> & { bindingKey?: string; defaultValue?: string | null }>,
  nextFields: Array<Pick<AdmissionFormField, 'code' | 'fieldType'> & { bindingKey?: string; defaultValue?: string | null }>,
  values: Record<string, string>
) {
  return Object.fromEntries(
    nextFields.map((field) => {
      const previous = previousFields.find(
        (item) =>
          item.fieldType === field.fieldType &&
          (equalsIgnoreCase(item.code, field.code) ||
            Boolean(field.bindingKey && equalsIgnoreCase(item.bindingKey, field.bindingKey)))
      );
      return [
        field.code,
        previous ? (values[previous.code] ?? field.defaultValue ?? '') : (field.defaultValue ?? ''),
      ];
    })
  );
}
