import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { evaluateAdmissionRule } from './admission-visibility-rules';

type BoundField = { code: string; bindingKey?: string | null };
export type InquiryConfigurationField = BoundField &
  Pick<AdmissionFormField, 'required' | 'readOnly'> &
  Partial<
    Pick<AdmissionFormField, 'bindingType' | 'fieldType' | 'visibilityRuleJson' | 'optionsJson'>
  >;
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
  duplicateStudentName:
    'Use either Student name or separate student name fields before publishing.',
  explicitMapping: 'Connect inquiry fields to their matching Student fields before publishing.',
  parentName: 'Add a required Parent / Guardian name field before publishing.',
  parentMobile: 'Add a required Parent / Guardian mobile field before publishing.',
  missingParentSelector:
    'Add a required Primary contact selector when both Father and Mother contacts are configured.',
  invalidParentSelector:
    'Configure a required Primary contact selector with Father, Mother and Guardian choices before publishing.',
  duplicateIdentity: 'Use one field for each inquiry identity connection before publishing.',
  duplicatePrimaryEmail:
    'Show one primary contact email question for each selected role before publishing. Keep other-parent email questions conditional.',
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
const hasContactPart = (fields: readonly BoundField[], prefix: 'Guardian' | 'Father' | 'Mother') =>
  hasBinding(fields, `${prefix}.${prefix === 'Guardian' ? 'FirstName' : 'Name'}`) ||
  hasBinding(fields, `${prefix}.Mobile`);

/** The configured selection/role is evidence; equal contact values are not. */
export function getConfiguredInquiryParentRelationship(
  fields: readonly BoundField[],
  answers: Readonly<Record<string, string>>,
  savedRelationship?: string | null
): 'father' | 'mother' | 'guardian' | undefined {
  const selector = fields.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  if (selector) {
    const selected = answers[selector.code]?.trim().toLowerCase();
    if (selected === 'guardian') return hasContactPair(fields, 'Guardian') ? selected : undefined;
    if (selected !== 'father' && selected !== 'mother') return undefined;
    return hasContactPart(fields, selected === 'father' ? 'Father' : 'Mother') ||
      hasContactPart(fields, 'Guardian')
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
  // Historical partial definitions still own their entered contact value. Publication
  // independently requires complete pairs; capture must not discard a bound number.
  if (hasContactPart(fields, 'Guardian')) return undefined;
  if (
    (savedRelationship === 'father' || savedRelationship === 'mother') &&
    hasContactPart(fields, savedRelationship === 'father' ? 'Father' : 'Mother')
  )
    return savedRelationship;
  const fatherPart = hasContactPart(fields, 'Father');
  const motherPart = hasContactPart(fields, 'Mother');
  if (fatherPart !== motherPart) return fatherPart ? 'father' : 'mother';
  return undefined;
}

const selectorOptionsValid = (field: InquiryConfigurationField) => {
  if (field.fieldType !== 6) return false;
  try {
    const options: unknown = JSON.parse(field.optionsJson || 'null');
    return (
      Array.isArray(options) &&
      (options.length === 2 || options.length === 3) &&
      new Set(
        options.map((option) =>
          typeof option === 'object' && option !== null && 'value' in option
            ? String(option.value)
            : ''
        )
      ).size === options.length &&
      options.every(
        (option) =>
          typeof option === 'object' &&
          option !== null &&
          'value' in option &&
          (option.value === 'father' || option.value === 'mother' || option.value === 'guardian')
      ) &&
      ['father', 'mother'].every((value) => options.some((option) => option.value === value))
    );
  } catch {
    return false;
  }
};

// Unknown answers can make a condition true; only selector rules can prove
// an optional other-parent question stays separate from the primary adult.
function couldShowForRole(
  ruleJson: string | null | undefined,
  selectorCode: string,
  role: string
): boolean {
  if (!ruleJson?.trim()) return true;
  try {
    const couldMatch = (expression: {
      conditions?: unknown[];
      operator?: string;
      field?: string;
    }): boolean => {
      if (!expression || typeof expression !== 'object') return true;
      if (Array.isArray(expression.conditions)) {
        const matches = expression.conditions.map((condition) =>
          couldMatch(condition as typeof expression)
        );
        return expression.operator?.toUpperCase() === 'ANY'
          ? matches.some(Boolean)
          : matches.every(Boolean);
      }
      return expression.field === selectorCode
        ? evaluateAdmissionRule(expression, { [selectorCode]: role })
        : true;
    };
    return couldMatch(JSON.parse(ruleJson));
  } catch {
    return true;
  }
}

/** Drafts stay editable; publication catches incomplete identity before staff enter data. */
export function getInquiryFormConfigurationIssues(
  form?: InquiryConfigurationForm | null
): string[] {
  if (form?.purpose !== 0) return [];
  // Publication needs an explicit connection. Code aliases are only a runtime
  // compatibility path for definitions that were already published.
  const explicitlyMapped = (field: InquiryConfigurationField) =>
    field.bindingType === 0 &&
    canonicalKeys.some((key) => key.toLowerCase() === field.bindingKey?.trim().toLowerCase());
  const expectedType = (field: InquiryConfigurationField) =>
    field.bindingKey?.trim().toLowerCase().endsWith('.mobile')
      ? 4
      : field.bindingKey?.trim().toLowerCase() === 'inquiry.parentrelationship'
        ? 6
        : 0;
  const authored = form.sections.flatMap((section) => section.fields);
  const all = authored.filter(explicitlyMapped);
  const required = form.sections.flatMap((section) =>
    section.visibilityRuleJson?.trim() ||
    section.stepVisibilityRuleJson?.trim() ||
    section.isRepeatable
      ? []
      : section.fields.filter(
          (field) =>
            explicitlyMapped(field) &&
            field.fieldType === expectedType(field) &&
            field.required &&
            !field.readOnly &&
            !field.visibilityRuleJson?.trim()
        )
  );
  const issues: string[] = [];
  const identityBindings = authored
    .map(canonicalInquiryBinding)
    .filter(
      (binding) => binding && canonicalKeys.includes(binding as (typeof canonicalKeys)[number])
    );
  if (new Set(identityBindings).size !== identityBindings.length)
    issues.push(inquiryFormConfigurationMessages.duplicateIdentity);
  if (
    authored.some(
      (field) =>
        !explicitlyMapped(field) &&
        canonicalKeys.some((key) => key === canonicalInquiryBinding(field))
    )
  )
    issues.push(inquiryFormConfigurationMessages.explicitMapping);
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
  const configuredSelector = all.find(
    (field) => canonicalInquiryBinding(field) === 'Inquiry.ParentRelationship'
  );
  const visibleForRole = (binding: string, role: string) =>
    form.sections.some(
      (section) =>
        couldShowForRole(section.visibilityRuleJson, configuredSelector?.code ?? '', role) &&
        couldShowForRole(section.stepVisibilityRuleJson, configuredSelector?.code ?? '', role) &&
        section.fields.some(
          (field) =>
            canonicalInquiryBinding(field) === binding &&
            couldShowForRole(field.visibilityRuleJson, configuredSelector?.code ?? '', role)
        )
    );
  if (
    (['father', 'mother'] as const).some(
      (role) =>
        visibleForRole('Guardian.Email', role) &&
        visibleForRole(`${role === 'father' ? 'Father' : 'Mother'}.Email`, role)
    )
  )
    issues.push(inquiryFormConfigurationMessages.duplicatePrimaryEmail);
  const selectedPaths = generic
    ? (['Guardian'] as const)
    : selector
      ? (['Father', 'Mother'] as const).map((prefix) =>
          hasContactPart(all, prefix) ? prefix : generic ? ('Guardian' as const) : prefix
        )
      : father && mother
        ? (['Father', 'Mother'] as const)
        : father
          ? (['Father'] as const)
          : mother
            ? (['Mother'] as const)
            : [];
  if (father && mother && !selector)
    issues.push(inquiryFormConfigurationMessages.missingParentSelector);
  if (
    hasSelector &&
    (!selector ||
      selectedPaths.some((prefix) => !hasContactPair(required, prefix)) ||
      (!generic &&
        JSON.parse(selector.optionsJson || '[]').some(
          (option: { value?: string }) => option.value === 'guardian'
        )))
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
