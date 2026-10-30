import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

type BoundField = { code: string; bindingKey?: string | null };
export type InquiryConfigurationField = BoundField &
  Pick<AdmissionFormField, 'required' | 'readOnly'> &
  Partial<Pick<AdmissionFormField, 'fieldType' | 'visibilityRuleJson' | 'optionsJson'>>;
type InquiryConfigurationForm = {
  purpose?: number;
  sections: readonly {
    fields: readonly InquiryConfigurationField[];
    visibilityRuleJson?: string | null;
    stepVisibilityRuleJson?: string | null;
    isRepeatable?: boolean;
  }[];
};

const canonicalKeys = [
  'Applicant.Name',
  'Applicant.FirstName',
  'Applicant.MiddleName',
  'Applicant.LastName',
  'Applicant.DateOfBirth',
  'Guardian.FirstName',
  'Guardian.LastName',
  'Guardian.Mobile',
  'Guardian.Email',
  'Father.Name',
  'Father.Mobile',
  'Father.Email',
  'Mother.Name',
  'Mother.Mobile',
  'Mother.Email',
  'Inquiry.ParentRelationship',
  'Inquiry.Source',
  'Inquiry.SourceDetail',
  'Inquiry.PreferredLanguageCode',
] as const;
const normalizedCode = (value: string) => value.replace(/[._\s-]/g, '').toUpperCase();
const aliases: Readonly<Record<string, readonly string[]>> = {
  'Applicant.Name': ['STUDENT_NAME', 'APPLICANT_NAME', 'CHILD_NAME'],
  'Applicant.FirstName': ['STUDENT_FIRST_NAME', 'APPLICANT_FIRST_NAME', 'FIRST_NAME'],
  'Applicant.MiddleName': ['STUDENT_MIDDLE_NAME', 'APPLICANT_MIDDLE_NAME', 'MIDDLE_NAME'],
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
  'Father.Name': ['FATHER_NAME', 'FATHER_FIRST_NAME'],
  'Father.Mobile': ['FATHER_MOBILE', 'FATHER_PHONE'],
  'Father.Email': ['FATHER_EMAIL'],
  'Mother.Name': ['MOTHER_NAME', 'MOTHER_FIRST_NAME'],
  'Mother.Mobile': ['MOTHER_MOBILE', 'MOTHER_PHONE'],
  'Mother.Email': ['MOTHER_EMAIL'],
};
// Ownership guard matching registered keys in the backend binding registry and
// additional Student catalogue. It does not drive the palette or its labels.
// Unknown historic connections remain eligible for the safe code aliases above.
const ownedProfileFields: Readonly<Record<string, readonly string[]>> = {
  Academic: ['JoiningDate', 'LearningSupportNeeds', 'SecondLanguage'],
  Address: [
    'AddressLine1',
    'AddressLine2',
    'AddressLine3',
    'City',
    'Country',
    'DistanceFromSchool',
    'PostalCode',
    'State',
  ],
  Applicant: [
    'Caste',
    'DateOfBirth',
    'DisabilityDetails',
    'Email',
    'FirstName',
    'Gender',
    'HasDisability',
    'LastName',
    'MiddleName',
    'Mobile',
    'MotherTongue',
    'Nationality',
    'PlaceOfBirth',
    'ProfilePhoto',
    'Religion',
    'SocialCategory',
  ],
  Contact: ['SecondaryPhone'],
  Eligibility: [
    'BPLCardNumber',
    'CasteCertificateNumber',
    'IncomeCertificateNumber',
    'IsBPL',
    'RteCategory',
  ],
  Emergency: ['ContactName', 'ContactPhone', 'Relationship'],
  Family: ['IsSingleChild', 'IsSingleParentChild', 'SiblingAtSchool', 'SiblingStudentIds'],
  Father: ['Designation', 'Email', 'Employer', 'Mobile', 'Name', 'Occupation', 'Qualification'],
  Guardian: [
    'AlternateName',
    'Email',
    'FirstName',
    'LastName',
    'Mobile',
    'Occupation',
    'Relationship',
  ],
  Identity: [
    'AadhaarNumber',
    'ApaarId',
    'BirthCertificateIssueDate',
    'BirthCertificateNumber',
    'DocumentName',
    'PanNumber',
    'PenNumber',
    'UdiseStudentCode',
  ],
  Medical: [
    'AccessibilitySupport',
    'Allergies',
    'BloodGroup',
    'CurrentMedication',
    'DietaryRestrictions',
    'DoctorName',
    'DoctorPhone',
    'HearingSupport',
    'HeightCm',
    'ImmunisationSummary',
    'MedicalConditions',
    'VisionSupport',
    'WeightKg',
  ],
  Mother: ['Designation', 'Email', 'Employer', 'Mobile', 'Name', 'Occupation', 'Qualification'],
  PermanentAddress: ['City', 'Country', 'Line1', 'Line2', 'PostalCode', 'SameAsCurrent', 'State'],
  Preference: ['Board', 'Campus', 'Class', 'Medium', 'PickupArea', 'TransportRequired'],
  PreviousSchool: [
    'AcademicYear',
    'Address',
    'Board',
    'DateOfLeaving',
    'IndexNumber',
    'LastClass',
    'Medium',
    'Name',
    'Percentage',
    'ReasonForLeaving',
    'StudentId',
    'TCIssueDate',
    'TCNumber',
  ],
};
const ownedBindings = new Set(
  Object.entries(ownedProfileFields).flatMap(([prefix, suffixes]) =>
    suffixes.map((suffix) => `${prefix}.${suffix}`.toLowerCase())
  )
);

export const inquiryFormConfigurationMessages = {
  studentName: 'Add a required Student name field before publishing.',
  duplicateStudentName: 'Use either Student name or separate student name fields before publishing.',
  parentName: 'Add a required Parent / Guardian name field before publishing.',
  parentMobile: 'Add a required Parent / Guardian mobile field before publishing.',
  missingParentSelector:
    'Add a required Primary parent selector when both Father and Mother contacts are configured.',
  invalidParentSelector:
    'Configure a required Primary parent selector with Father and Mother choices before publishing.',
} as const;

/** Published connections identify meaning; editable display labels never do. */
export function canonicalInquiryBinding(field: BoundField): string | undefined {
  const binding = field.bindingKey?.trim();
  if (binding) {
    const canonical = canonicalKeys.find((key) => key.toLowerCase() === binding.toLowerCase());
    if (canonical) return canonical;
    // An explicit connection to any recognized profile field must not be reinterpreted
    // because its historic question code happens to resemble another person's field.
    if (ownedBindings.has(binding.toLowerCase())) return binding;
  }
  const code = normalizedCode(field.code);
  return Object.entries(aliases).find(([, codes]) =>
    codes.some((alias) => normalizedCode(alias) === code)
  )?.[0];
}

const hasBinding = (fields: readonly BoundField[], binding: string) =>
  fields.some((field) => canonicalInquiryBinding(field) === binding);
const hasContactPair = (fields: readonly BoundField[], prefix: 'Guardian' | 'Father' | 'Mother') =>
  hasBinding(fields, `${prefix}.${prefix === 'Guardian' ? 'FirstName' : 'Name'}`) &&
  hasBinding(fields, `${prefix}.Mobile`);

/** The configured selection/role is evidence; equal contact values are not. */
export function getConfiguredInquiryParentRelationship(
  fields: readonly BoundField[],
  answers: Readonly<Record<string, string>>,
  savedRelationship?: string | null
): 'father' | 'mother' | undefined {
  const selector = fields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  if (selector) {
    const selected = answers[selector.code]?.trim().toLowerCase();
    if (selected !== 'father' && selected !== 'mother') return undefined;
    return hasContactPair(fields, selected === 'father' ? 'Father' : 'Mother') ||
      hasContactPair(fields, 'Guardian')
      ? selected
      : undefined;
  }
  if (hasContactPair(fields, 'Guardian'))
    return savedRelationship === 'father' || savedRelationship === 'mother'
      ? savedRelationship
      : undefined;
  const father = hasContactPair(fields, 'Father');
  const mother = hasContactPair(fields, 'Mother');
  if (father !== mother) return father ? 'father' : 'mother';
  if (father && mother && (savedRelationship === 'father' || savedRelationship === 'mother'))
    return savedRelationship;
  return undefined;
}

const selectorOptionsValid = (field: InquiryConfigurationField) => {
  if (field.fieldType !== 6) return false;
  try {
    const options: unknown = JSON.parse(field.optionsJson || 'null');
    return (
      Array.isArray(options) &&
      options.length === 2 &&
      new Set(
        options.map((option) =>
          typeof option === 'object' && option !== null && 'value' in option
            ? String(option.value)
            : ''
        )
      ).size === 2 &&
      options.every(
        (option) =>
          typeof option === 'object' &&
          option !== null &&
          'value' in option &&
          (option.value === 'father' || option.value === 'mother')
      )
    );
  } catch {
    return false;
  }
};

/** Drafts stay editable; publication catches incomplete identity before staff enter data. */
export function getInquiryFormConfigurationIssues(
  form?: InquiryConfigurationForm | null
): string[] {
  if (form?.purpose !== 0) return [];
  const all = form.sections.flatMap((section) => section.fields);
  const required = form.sections.flatMap((section) =>
    section.visibilityRuleJson?.trim() ||
    section.stepVisibilityRuleJson?.trim() ||
    section.isRepeatable
      ? []
      : section.fields.filter(
          (field) => field.required && !field.readOnly && !field.visibilityRuleJson?.trim()
        )
  );
  const issues: string[] = [];
  if (
    hasBinding(all, 'Applicant.Name') &&
    ['Applicant.FirstName', 'Applicant.MiddleName', 'Applicant.LastName'].some((binding) =>
      hasBinding(all, binding)
    )
  )
    issues.push(inquiryFormConfigurationMessages.duplicateStudentName);
  if (!hasBinding(required, 'Applicant.FirstName') && !hasBinding(required, 'Applicant.Name'))
    issues.push(inquiryFormConfigurationMessages.studentName);
  const generic = hasContactPair(all, 'Guardian');
  const father = hasContactPair(all, 'Father');
  const mother = hasContactPair(all, 'Mother');
  const selector = required.find(
    (field) =>
      canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship' && selectorOptionsValid(field)
  );
  const hasSelector = all.some(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  const selectedPaths = selector
    ? (['Father', 'Mother'] as const).map((prefix) =>
        hasContactPair(all, prefix) ? prefix : generic ? ('Guardian' as const) : prefix
      )
    : generic
      ? (['Guardian'] as const)
      : father && mother
        ? (['Father', 'Mother'] as const)
        : father
          ? (['Father'] as const)
          : mother
            ? (['Mother'] as const)
            : [];
  if (father && mother && !generic && !selector)
    issues.push(inquiryFormConfigurationMessages.missingParentSelector);
  if (
    hasSelector &&
    (!selector || selectedPaths.some((prefix) => !hasContactPair(required, prefix)))
  )
    issues.push(inquiryFormConfigurationMessages.invalidParentSelector);
  const nameAvailable =
    selectedPaths.length > 0 &&
    selectedPaths.every((prefix) =>
      hasBinding(required, `${prefix}.${prefix === 'Guardian' ? 'FirstName' : 'Name'}`)
    );
  const mobileAvailable =
    selectedPaths.length > 0 &&
    selectedPaths.every((prefix) => hasBinding(required, `${prefix}.Mobile`));
  if (!nameAvailable) issues.push(inquiryFormConfigurationMessages.parentName);
  if (!mobileAvailable) issues.push(inquiryFormConfigurationMessages.parentMobile);
  return issues;
}
