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
import type {
  AdmissionParentRelationship,
  AdmissionSiblingParentSelection,
} from 'src/redux/student/admissions/admission-parent-family-types';

import * as Yup from 'yup';
import { normalizeEmail } from 'src/utils/input-format';

import { isAdmissionRuleVisible } from './admission-visibility-rules';
import { normalizeAdmissionEmailValue } from './admission-email-values';
import { getDynamicAdmissionValidationErrors } from './admission-form-validation';
import {
  canonicalInquiryBinding,
  getConfiguredInquiryParentRelationship,
} from './admission-inquiry-field-bindings';
import {
  buildAdmissionFamilyContacts,
  admissionFamilyContactsSchema,
  initialAdmissionFamilyContacts,
  getAdmissionSiblingParentReviewError,
  type AdmissionFamilyContactsFormValues,
} from './admission-family-contacts-model';

export type AdmissionInquiryFormValues = {
  admissionCycleId?: string;
  boardId: string;
  mediumId: string;
  standardId: string;
  offeringId: string;
  source: AdmissionInquirySource;
  sourceDetail: string;
  sendAcknowledgement: boolean;
  parentRelationship?: '' | AdmissionParentRelationship;
  /** Provenance from the saved inquiry, used only while editing legacy partial forms. */
  capturedParentRelationship?: AdmissionParentRelationship;
  guardianResponsibilityConfirmed?: boolean;
  preferredLanguageCode?: string;
  familyContacts?: AdmissionFamilyContactsFormValues;
  fields: Record<string, string>;
};

export type AdmissionInquiryFormSection = Pick<
  AdmissionFormSection,
  | 'id'
  | 'code'
  | 'name'
  | 'displayOrder'
  | 'fields'
  | 'visibilityRuleJson'
  | 'stepVisibilityRuleJson'
  | 'translations'
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
  parentRelationship: '',
  familyContacts: initialAdmissionFamilyContacts,
  fields: {},
};

export const admissionInquirySchema = Yup.object({
  familyContacts: admissionFamilyContactsSchema,
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardId: Yup.string().required('Class is required'),
  admissionCycleId: Yup.string().required('Admission period is required'),
  offeringId: Yup.string().required('Offering is required'),
  source: Yup.number().integer().min(0).max(12).required('Source is required'),
  sourceDetail: Yup.string().max(128, 'Source details must be 128 characters or fewer'),
  sendAcknowledgement: Yup.boolean().required(),
  parentRelationship: Yup.string()
    .oneOf(['', 'father', 'mother'], 'Select Father or Mother.')
    .optional(),
  fields: Yup.object().required(),
});

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
  'Father.Email': ['FATHER_EMAIL'],
  'Father.Mobile': ['FATHER_MOBILE', 'FATHER_PHONE'],
  'Mother.Email': ['MOTHER_EMAIL'],
  'Mother.Mobile': ['MOTHER_MOBILE', 'MOTHER_PHONE'],
};

const equalsIgnoreCase = (left?: string, right?: string) =>
  left?.localeCompare(right ?? '', undefined, { sensitivity: 'accent' }) === 0;

export const isAdmissionInquiryBirthDateField = (
  field: Pick<AdmissionFormField, 'code' | 'bindingKey'>
) => {
  if (equalsIgnoreCase(field.bindingKey, 'Applicant.DateOfBirth')) return true;
  const aliases = ['applicantDateOfBirth', ...legacyIdentityFieldCodes['Applicant.DateOfBirth']];
  return (
    aliases.some((code) => equalsIgnoreCase(field.code, code)) &&
    (!field.bindingKey || aliases.some((code) => equalsIgnoreCase(field.bindingKey, code)))
  );
};

const hasIdentityField = (fields: AdmissionFormField[], bindingKey: string) =>
  fields.some((field) => equalsIgnoreCase(canonicalInquiryBinding(field), bindingKey));

type InquiryMobileContext = Pick<
  AdmissionInquiryFormValues,
  'parentRelationship' | 'capturedParentRelationship' | 'fields'
>;
type InquiryRuntimeField = AdmissionFormField & {
  inquirySectionRuleJson?: string | null;
  inquiryStepRuleJson?: string | null;
};

const isInquiryFieldVisible = (field: AdmissionFormField, values: InquiryMobileContext) =>
  isAdmissionRuleVisible((field as InquiryRuntimeField).inquiryStepRuleJson, values.fields) &&
  isAdmissionRuleVisible((field as InquiryRuntimeField).inquirySectionRuleJson, values.fields) &&
  isAdmissionRuleVisible(field.visibilityRuleJson, values.fields);

/** Keep the published definition authoritative; context never inserts or rewrites questions. */
export const getAdmissionInquirySections = (
  form?: AdmissionForm,
  _values?: InquiryMobileContext
): AdmissionInquiryFormSection[] =>
  [...(form?.sections ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((section) => ({
      ...section,
      fields: [...section.fields]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((field): InquiryRuntimeField => ({
          ...field,
          inquirySectionRuleJson: section.visibilityRuleJson,
          inquiryStepRuleJson: section.stepVisibilityRuleJson,
        })),
    }))
    .filter((section) => section.fields.length > 0);

export const getAdmissionInquiryFields = (
  form?: AdmissionForm,
  values?: InquiryMobileContext
): AdmissionFormField[] =>
  getAdmissionInquirySections(form, values).flatMap((section) => section.fields);

export function getAdmissionInquiryVisibleSections(
  sections: AdmissionInquiryFormSection[],
  values: InquiryMobileContext
) {
  return sections.filter(
    (section) =>
      isAdmissionRuleVisible(section.visibilityRuleJson, values.fields) &&
      isAdmissionRuleVisible(section.stepVisibilityRuleJson, values.fields)
  );
}

export const getAdmissionInquiryPrimaryContact = (
  fields: AdmissionFormField[],
  values: InquiryMobileContext
) => {
  const visible = fields.filter((field) => isInquiryFieldVisible(field, values));
  const configuredRelationship = getConfiguredInquiryParentRelationship(
    visible,
    values.fields,
    values.parentRelationship
  );
  const generic =
    hasIdentityField(visible, 'Guardian.FirstName') && hasIdentityField(visible, 'Guardian.Mobile');
  const genericPart =
    hasIdentityField(visible, 'Guardian.FirstName') || hasIdentityField(visible, 'Guardian.Mobile');
  const lockedGeneric = visible.some(
    (field) => canonicalInquiryBinding(field) === 'Guardian.Mobile' && field.readOnly
  );
  const selector = visible.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  const selected = selector ? fieldValue(values, selector.code) : '';
  const captured = values.capturedParentRelationship;
  const capturedPrefix = captured === 'father' ? 'Father' : 'Mother';
  const legacyContact =
    !selector &&
    captured &&
    hasIdentityField(visible, 'Guardian.FirstName') &&
    hasIdentityField(visible, `${capturedPrefix}.Mobile`);
  const relationship = !selector && captured ? captured : configuredRelationship;
  const structuredPrefix = relationship === 'father' ? 'Father' : 'Mother';
  const structured =
    (hasIdentityField(visible, `${structuredPrefix}.Name`) &&
      hasIdentityField(visible, `${structuredPrefix}.Mobile`)) ||
    ((!genericPart || Boolean(selected)) &&
      (hasIdentityField(visible, `${structuredPrefix}.Name`) ||
        hasIdentityField(visible, `${structuredPrefix}.Mobile`)));
  const requiredGeneric = ['Guardian.FirstName', 'Guardian.Mobile'].every((binding) =>
    visible.some((field) => canonicalInquiryBinding(field) === binding && field.required)
  );
  const requiredStructured = [`${structuredPrefix}.Name`, `${structuredPrefix}.Mobile`].every(
    (binding) =>
      visible.some((field) => canonicalInquiryBinding(field) === binding && field.required)
  );
  const genericPrimary = generic && (requiredGeneric || !requiredStructured);
  const prefix =
    !genericPrimary &&
    !lockedGeneric &&
    relationship &&
    relationship !== 'guardian' &&
    (structured || legacyContact) &&
    (selected || !genericPrimary)
      ? structuredPrefix
      : 'Guardian';
  const emailBinding =
    relationship &&
    relationship !== 'guardian' &&
    hasIdentityField(visible, `${structuredPrefix}.Email`)
      ? `${structuredPrefix}.Email`
      : hasIdentityField(visible, `${prefix}.Email`)
        ? `${prefix}.Email`
        : 'Guardian.Email';
  return {
    relationship,
    prefix,
    emailBinding,
    legacyContact: Boolean(legacyContact && !lockedGeneric),
  };
};

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

const fieldValue = (values: Pick<AdmissionInquiryFormValues, 'fields'>, code?: string) => {
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
  const canonicalField = fields.find(
    (item) =>
      isInquiryFieldVisible(item, values) &&
      equalsIgnoreCase(canonicalInquiryBinding(item), bindingKey)
  );
  const fallbackField = fields.find(
    (item) =>
      isInquiryFieldVisible(item, values) &&
      equalsIgnoreCase(item.code, fallbackCode) &&
      equalsIgnoreCase(canonicalInquiryBinding(item), bindingKey)
  );
  return fieldValue(values, canonicalField?.code ?? fallbackField?.code);
};

const serializeFieldValue = (field: AdmissionFormField, value: string) => {
  const normalized = normalizeAdmissionEmailValue(field, value, value.trim().startsWith('['));
  if ([7, 9, 11].includes(field.fieldType)) {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(normalized);
};

const selectedParentAnswer = (
  field: AdmissionFormField,
  parent?: AdmissionSiblingParentSelection
) => {
  if (!parent) return undefined;
  const role = parent.relationship === 'father' ? 'Father' : 'Mother';
  const answers: Record<string, string> = {
    FirstName: parent.firstName,
    LastName: parent.lastName || '',
    Name: parent.name,
    FullName: parent.name,
    Mobile: parent.mobile || '',
    Phone: parent.mobile || '',
    Email: parent.email || '',
  };
  return Object.entries(answers).find(([suffix]) => {
    const generic = `Guardian.${suffix}`;
    const aliases = legacyIdentityFieldCodes[generic] ?? [];
    const legacyAlias =
      (!field.bindingKey || equalsIgnoreCase(field.bindingKey, field.code)) &&
      (aliases.some((alias) => equalsIgnoreCase(alias, field.code)) ||
        field.code.replace(/[._\s-]/g, '').toLowerCase() === `${role}${suffix}`.toLowerCase());
    return (
      equalsIgnoreCase(field.bindingKey, `${role}.${suffix}`) ||
      equalsIgnoreCase(field.bindingKey, generic) ||
      legacyAlias
    );
  })?.[1];
};

export function buildAdmissionInquiryPayload(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  offering: AdmissionOfferingListItem,
  existingFamilyId?: string | null,
  createSeparateFamily = false,
  duplicateOverrideReason?: string,
  parentSelection?: AdmissionSiblingParentSelection
): CreateAdmissionInquiry {
  const contact = getAdmissionInquiryPrimaryContact(fields, values);
  const configuredRelationship = getConfiguredInquiryParentRelationship(
    fields.filter((field) => isInquiryFieldVisible(field, values)),
    values.fields
  );
  if (
    parentSelection &&
    configuredRelationship &&
    parentSelection.relationship !== configuredRelationship
  )
    throw new Error('Choose the saved parent matching the parent selected in this inquiry form.');
  const parentReviewError =
    parentSelection &&
    getAdmissionSiblingParentReviewError(
      values.familyContacts,
      contact.relationship === 'guardian' ? undefined : contact.relationship,
      parentSelection.relationship
    );
  if (parentReviewError) throw new Error(parentReviewError);
  const fullName = boundValue(values, fields, 'Applicant.Name', 'applicantName');
  const configuredFirstName = boundValue(
    values,
    fields,
    'Applicant.FirstName',
    'applicantFirstName'
  );
  const usesSplitName = Boolean(configuredFirstName);
  const applicantFirstName = configuredFirstName || fullName;
  const applicantMiddleName = boundValue(
    values,
    fields,
    'Applicant.MiddleName',
    'applicantMiddleName'
  );
  const applicantLastName =
    !usesSplitName && fullName
      ? ''
      : boundValue(values, fields, 'Applicant.LastName', 'applicantLastName');
  const parentNameBinding =
    contact.prefix === 'Guardian' ? 'Guardian.FirstName' : `${contact.prefix}.Name`;
  const guardianFirstName =
    boundValue(values, fields, parentNameBinding, 'guardianFirstName') ||
    (contact.legacyContact
      ? boundValue(values, fields, 'Guardian.FirstName', 'guardianFirstName')
      : '');
  const guardianPhone = boundValue(values, fields, `${contact.prefix}.Mobile`, 'guardianPhone');
  const guardianEmail = normalizeEmail(
    boundValue(values, fields, contact.emailBinding, 'guardianEmail')
  );
  const applicantName = usesSplitName
    ? [applicantFirstName, applicantMiddleName, applicantLastName].filter(Boolean).join(' ')
    : fullName;
  const relationship = parentSelection?.relationship || contact.relationship;
  const sourceAnswer = boundValue(values, fields, 'Inquiry.Source', 'source');
  const source = sourceAnswer ? (Number(sourceAnswer) as AdmissionInquirySource) : values.source;
  const sourceDetailField = fields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.SourceDetail'
  );
  const sourceDetail = sourceDetailField
    ? fieldValue(values, sourceDetailField.code)
    : values.sourceDetail;
  const language =
    boundValue(values, fields, 'Inquiry.PreferredLanguageCode', 'preferredLanguageCode') ||
    values.preferredLanguageCode ||
    'en';
  return {
    admissionCycleId: offering.admissionCycleId,
    admissionOfferingId: offering.id,
    boardId: values.boardId,
    mediumId: values.mediumId,
    standardId: values.standardId,
    existingFamilyId,
    existingParentApplicantId: parentSelection?.sourceApplicantId,
    parentRelationship: relationship === 'guardian' ? undefined : relationship,
    guardianResponsibilityConfirmed:
      relationship === 'guardian' && values.guardianResponsibilityConfirmed === true,
    ...(relationship && relationship !== 'guardian'
      ? {
          familyContacts: buildAdmissionFamilyContacts(
            values.familyContacts,
            relationship as AdmissionParentRelationship
          ),
        }
      : {}),
    createSeparateFamily,
    duplicateOverrideReason: duplicateOverrideReason?.trim() || null,
    applicantName,
    phone: parentSelection?.mobile || guardianPhone,
    email: parentSelection ? parentSelection.email || null : guardianEmail || null,
    preferredLanguageCode: language,
    source,
    sourceDetail: sourceDetail.trim() || null,
    guardianFirstName: parentSelection?.firstName ?? guardianFirstName,
    guardianLastName: parentSelection
      ? parentSelection.lastName || null
      : boundValue(values, fields, `${contact.prefix}.LastName`, 'guardianLastName') || null,
    guardianPhone: parentSelection?.mobile || guardianPhone,
    guardianEmail: parentSelection ? parentSelection.email || null : guardianEmail || null,
    applicantFirstName,
    applicantLastName: applicantLastName || null,
    applicantDateOfBirth:
      boundValue(values, fields, 'Applicant.DateOfBirth', 'applicantDateOfBirth') || null,
    formValues: fields
      .filter(
        (field) =>
          values.fields[field.code] !== undefined ||
          selectedParentAnswer(field, parentSelection) !== undefined
      )
      .map((field) => ({
        fieldCode: field.code,
        valueJson: serializeFieldValue(
          field,
          selectedParentAnswer(field, parentSelection) ?? values.fields[field.code] ?? ''
        ),
      })),
  };
}

/** Validate resolved values at submit, independently of publication/required flags. */
export function getAdmissionInquiryIdentityErrors(
  payload: Pick<
    CreateAdmissionInquiry,
    'applicantFirstName' | 'guardianFirstName' | 'guardianPhone'
  >,
  fields: AdmissionFormField[],
  values: InquiryMobileContext
) {
  const active = fields.filter((field) => !field.readOnly && isInquiryFieldVisible(field, values));
  const contact = getAdmissionInquiryPrimaryContact(fields, values);
  const parentName =
    contact.prefix === 'Guardian' || contact.legacyContact
      ? 'Guardian.FirstName'
      : `${contact.prefix}.Name`;
  const entries = [
    {
      value: payload.applicantFirstName,
      keys: ['Applicant.FirstName', 'Applicant.Name'],
      label: 'Student name',
    },
    { value: payload.guardianFirstName, keys: [parentName], label: 'Parent / Guardian name' },
    {
      value: payload.guardianPhone,
      keys: [`${contact.prefix}.Mobile`],
      label: 'Parent / Guardian mobile',
    },
  ];
  const fieldErrors: Record<string, string> = {};
  const missingMappings: string[] = [];
  entries.forEach(({ value, keys, label }) => {
    if (value?.trim()) return;
    const field = active.find((item) => keys.includes(canonicalInquiryBinding(item) ?? ''));
    if (field) fieldErrors[field.code] = `${field.label} is required to create an inquiry.`;
    else missingMappings.push(label);
  });
  return {
    fieldErrors,
    message: missingMappings.length
      ? `This inquiry form is missing linked fields: ${missingMappings.join(', ')}. Update its field mappings in Admissions Settings.`
      : '',
  };
}

export function validateAdmissionInquiry(
  values: AdmissionInquiryFormValues,
  fields: AdmissionFormField[],
  policy?: AdmissionInquiryPolicy | null,
  offering?: AdmissionOfferingListItem
) {
  const activeFields = fields.filter((field) => isInquiryFieldVisible(field, values));
  const fieldErrors = getDynamicAdmissionValidationErrors(
    { sections: [{ fields: activeFields }] },
    values.fields
  );
  activeFields.forEach((field) => {
    if (field.required && !fieldValue(values, field.code) && fieldErrors[field.code])
      fieldErrors[field.code] = `${field.label} is required`;
  });
  const { prefix } = getAdmissionInquiryPrimaryContact(fields, values);
  const guardianPhoneField = activeFields.find(
    (field) => canonicalInquiryBinding(field) === `${prefix}.Mobile`
  );
  const guardianPhone = guardianPhoneField ? fieldValue(values, guardianPhoneField.code) : '';
  if (guardianPhoneField && guardianPhone && !/^[6-9]\d{9}$/.test(guardianPhone))
    fieldErrors[guardianPhoneField.code] =
      'Parent mobile number must be a valid 10-digit Indian mobile number.';
  const sourceField = activeFields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.Source'
  );
  const selectorField = activeFields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  const selectedRole = selectorField ? fieldValue(values, selectorField.code) : '';
  if (
    selectorField &&
    selectedRole &&
    !['father', 'mother', 'guardian'].includes(selectedRole.toLowerCase())
  )
    fieldErrors[selectorField.code] = 'Select Father, Mother or Guardian.';
  const sourceAnswer = sourceField ? fieldValue(values, sourceField.code) : '';
  const source = sourceAnswer ? Number(sourceAnswer) : values.source;
  if (sourceField && sourceAnswer && (!Number.isInteger(source) || source < 0 || source > 12))
    fieldErrors[sourceField.code] = 'Choose an available inquiry source.';
  const detailField = activeFields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.SourceDetail'
  );
  if (detailField && fieldValue(values, detailField.code).length > 128)
    fieldErrors[detailField.code] = 'Source details must be 128 characters or fewer';
  const languageField = activeFields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.PreferredLanguageCode'
  );
  const language = languageField ? fieldValue(values, languageField.code) : '';
  if (
    languageField &&
    language &&
    (language.length > 16 || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(language))
  )
    fieldErrors[languageField.code] = 'Enter a valid language code of 2 to 16 characters.';
  if (
    sourceField &&
    policy?.allowedSources.length &&
    !policy.allowedSources.includes(source as AdmissionInquirySource)
  )
    fieldErrors[sourceField.code] = 'Choose a source allowed by this admission workflow';
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
    ...(!sourceField &&
    policy?.allowedSources.length &&
    !policy.allowedSources.includes(source as AdmissionInquirySource)
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
  const parentContacts = (['father', 'mother'] as const)
    .map((relationship) => {
      if (relationship === payload.parentRelationship)
        return {
          relationship,
          email: payload.guardianEmail || undefined,
          mobile: payload.guardianPhone || undefined,
        };
      const prefix = relationship === 'father' ? 'Father' : 'Mother';
      const email = normalizeEmail(
        boundValue(values, fields, `${prefix}.Email`, `${relationship}Email`)
      );
      const mobile = boundValue(values, fields, `${prefix}.Mobile`, `${relationship}Mobile`);
      return { relationship, email: email || undefined, mobile: mobile || undefined };
    })
    .filter((parent) => parent.email || parent.mobile);
  if (
    payload.parentRelationship &&
    !parentContacts.some((parent) => parent.relationship === payload.parentRelationship)
  ) {
    parentContacts.push({
      relationship: payload.parentRelationship,
      email: payload.guardianEmail || undefined,
      mobile: payload.guardianPhone || undefined,
    });
  }
  return {
    admissionCycleId: payload.admissionCycleId,
    guardianPhone: payload.guardianPhone,
    guardianEmail: payload.guardianEmail ?? undefined,
    parentContacts,
    applicantName: payload.applicantName,
    applicantDateOfBirth: payload.applicantDateOfBirth ?? undefined,
  };
}

export function canLinkAdmissionInquiryFamily(
  match: DuplicateMatch,
  guardianPhone: string,
  guardianEmail = ''
) {
  const enteredPhone = guardianPhone.replace(/\D/g, '');
  const matchedPhone = (match.guardianPhone ?? '').replace(/\D/g, '');
  return (
    ((/^[6-9]\d{9}$/.test(enteredPhone) && matchedPhone === enteredPhone) ||
      Boolean(
        normalizeEmail(guardianEmail) &&
        normalizeEmail(guardianEmail) === normalizeEmail(match.guardianEmail || '')
      ) ||
      match.matchByEmail === true ||
      match.matchByMobile === true) &&
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
  previousFields: Array<
    Pick<AdmissionFormField, 'code' | 'fieldType'> & {
      bindingKey?: string;
      defaultValue?: string | null;
    }
  >,
  nextFields: Array<
    Pick<AdmissionFormField, 'code' | 'fieldType'> & {
      bindingKey?: string;
      defaultValue?: string | null;
    }
  >,
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
