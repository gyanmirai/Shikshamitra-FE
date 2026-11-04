import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { isEqual } from 'src/utils/helper';

export const ADMISSION_CORE_FIELD_POLICY_VERSION = 1;
const relationshipOptions = JSON.stringify([
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
]);
type CoreDefinition = Pick<AdmissionFormField, 'bindingKey' | 'label' | 'fieldType' | 'required'> &
  Partial<AdmissionFormField>;
const identityDefaults: CoreDefinition[] = [
  {
    bindingKey: 'Applicant.FirstName',
    label: 'First name',
    fieldType: 0,
    required: true,
    translations: { gu: { label: 'પ્રથમ નામ' }, hi: { label: 'प्रथम नाम' } },
  },
  {
    bindingKey: 'Applicant.LastName',
    label: 'Last name',
    fieldType: 0,
    required: false,
    translations: { gu: { label: 'અટક' }, hi: { label: 'अंतिम नाम' } },
  },
  {
    bindingKey: 'Guardian.FirstName',
    label: 'Parent name',
    fieldType: 0,
    required: true,
    translations: { gu: { label: 'માતા-પિતાનું નામ' }, hi: { label: 'माता-पिता का नाम' } },
  },
  {
    bindingKey: 'Guardian.Mobile',
    label: 'Parent contact number',
    fieldType: 4,
    required: true,
    validationJson: JSON.stringify({ format: 'phone', phone: true, regex: '^[6-9][0-9]{9}$' }),
    translations: {
      gu: { label: 'માતા-પિતાનો સંપર્ક નંબર' },
      hi: { label: 'माता-पिता का संपर्क नंबर' },
    },
  },
  {
    bindingKey: 'Guardian.Email',
    label: 'Parent email',
    fieldType: 3,
    required: true,
    translations: { gu: { label: 'માતા-પિતાનું ઇમેઇલ' }, hi: { label: 'माता-पिता का ईमेल' } },
  },
];
const relationshipDefault: CoreDefinition = {
  bindingKey: 'Inquiry.ParentRelationship',
  label: 'Relationship to student',
  fieldType: 6,
  required: true,
  optionsJson: relationshipOptions,
  translations: { gu: { label: 'વિદ્યાર્થી સાથેનો સંબંધ' }, hi: { label: 'विद्यार्थी से संबंध' } },
};
const registrationDefaults: CoreDefinition[] = [
  { bindingKey: 'Applicant.DateOfBirth', label: 'Date of birth', fieldType: 5, required: true },
  {
    bindingKey: 'Applicant.Gender',
    label: 'Gender',
    fieldType: 6,
    required: true,
    optionsJson: JSON.stringify(
      ['Male', 'Female', 'Other'].map((value) => ({ value, label: value }))
    ),
  },
];
const definitionsFor = (purpose: number | undefined) =>
  purpose === 0
    ? [...identityDefaults, relationshipDefault]
    : [...identityDefaults, ...registrationDefaults];
const definitionFor = (purpose: number | undefined, field: AdmissionFormField) =>
  field.bindingType === 0
    ? definitionsFor(purpose).find(
        (item) => item.bindingKey?.toLowerCase() === field.bindingKey?.toLowerCase()
      )
    : undefined;

export const INQUIRY_FIELD_LOCK_HELP =
  'This core field stays on the form. You can change its label and translations, or move it to another always-visible section.';

/** Versioned form metadata and canonical bindings own locks; labels and codes never do. */
export const isLockedInquiryField = (
  purpose: number | undefined,
  field: AdmissionFormField,
  policyVersion?: number | null
) =>
  policyVersion === ADMISSION_CORE_FIELD_POLICY_VERSION &&
  Boolean(definitionFor(purpose, field)) &&
  !field.inheritedFrom;
export const hasLockedInquiryFields = (
  purpose: number | undefined,
  sections: readonly Pick<AdmissionFormSection, 'fields'>[],
  policyVersion?: number | null
) =>
  sections.some((section) =>
    section.fields.some((field) => isLockedInquiryField(purpose, field, policyVersion))
  );
export const hasOnlyInquiryDefaults = (form: CreateUpdateAdmissionForm) => {
  const fields = form.sections.flatMap((section) => section.fields);
  return (
    fields.length === definitionsFor(form.purpose).length &&
    fields.every((field) => isUneditedDefault(form, field))
  );
};
export const withoutInquiryDefaults = (form: CreateUpdateAdmissionForm) => ({
  ...form,
  sections: form.sections.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => !isUneditedDefault(form, field)),
  })),
});

/** Dirty-draft comparison is independent of permanent structural ownership. */
function isUneditedDefault(form: CreateUpdateAdmissionForm, field: AdmissionFormField) {
  const definition = definitionFor(form.purpose, field);
  return (
    isLockedInquiryField(form.purpose, field, form.coreFieldPolicyVersion) &&
    field.label === definition?.label &&
    isEqual(field.translations ?? {}, definition?.translations ?? {})
  );
}

/** Existing saved forms, including their authored translations, are read without repair. */
export function withInquiryDefaultTranslations(
  form: CreateUpdateAdmissionForm
): CreateUpdateAdmissionForm {
  return form;
}

const createDefault = (
  definition: CoreDefinition,
  sectionId: string,
  displayOrder: number
): AdmissionFormField => ({
  ...definition,
  id: crypto.randomUUID(),
  sectionId,
  displayOrder,
  code: definition.bindingKey!.replaceAll('.', '_').toUpperCase(),
  bindingType: 0,
  readOnly: false,
});

/** Only fresh materialization calls this. Historical definitions and answers are untouched. */
export function ensureNewInquiryDefaults(
  form: CreateUpdateAdmissionForm
): CreateUpdateAdmissionForm {
  const inherited = form.purpose === 1 && form.inheritance?.enabled;
  const definitions = inherited ? registrationDefaults : definitionsFor(form.purpose);
  const hasSplitName = form.sections.some((section) =>
    section.fields.some(
      (field) => field.bindingType === 0 && field.bindingKey === 'Applicant.FirstName'
    )
  );
  const next: CreateUpdateAdmissionForm = {
    ...form,
    coreFieldPolicyVersion: ADMISSION_CORE_FIELD_POLICY_VERSION,
    sections: form.sections.map((section) => ({
      ...section,
      fields: section.fields
        .filter(
          (field) =>
            inherited ||
            field.bindingType !== 0 ||
            !(
              (field.bindingKey === 'Applicant.Name' && hasSplitName) ||
              (form.purpose === 0 && field.bindingKey === 'Guardian.Relationship')
            )
        )
        .map((original) => {
          const field =
            !inherited && original.bindingType === 0 && original.bindingKey === 'Applicant.Name'
              ? { ...original, bindingKey: 'Applicant.FirstName', label: 'First name' }
              : original;
          const definition = definitions.find(
            (item) => field.bindingType === 0 && item.bindingKey === field.bindingKey
          );
          return definition && !field.inheritedFrom
            ? {
                ...field,
                fieldType: definition.fieldType,
                required: definition.required,
                readOnly: false,
                visibilityRuleJson: undefined,
                requiredRuleJson: undefined,
                defaultValue: undefined,
                optionsJson: definition.optionsJson,
                validationJson: definition.validationJson,
                label: form.coreFieldPolicyVersion === 1 ? field.label : definition.label,
                translations: { ...definition.translations, ...field.translations },
              }
            : field;
        }),
    })),
  };
  const fields = next.sections.flatMap((section) => section.fields);
  const missing = definitions.filter(
    (definition) =>
      !fields.some((field) => field.bindingType === 0 && field.bindingKey === definition.bindingKey)
  );
  const safeSection = (section: AdmissionFormSection) =>
    !section.isRepeatable &&
    !section.visibilityRuleJson?.trim() &&
    !section.stepVisibilityRuleJson?.trim();
  const displaced = next.sections
    .filter((section) => !safeSection(section))
    .flatMap((section) =>
      section.fields.filter(
        (field) =>
          !field.inheritedFrom &&
          field.bindingType === 0 &&
          definitions.some((definition) => definition.bindingKey === field.bindingKey)
      )
    );
  if (!missing.length && !displaced.length) return next;
  const displacedIds = new Set(displaced.map((field) => field.id));
  const target = next.sections.find(safeSection);
  const usedSectionCodes = new Set(next.sections.map((section) => section.code));
  let sectionCode = 'CORE_DETAILS';
  for (let suffix = 2; usedSectionCodes.has(sectionCode); suffix += 1)
    sectionCode = `CORE_DETAILS_${suffix}`;
  const section: AdmissionFormSection = target ?? {
    id: crypto.randomUUID(),
    code: sectionCode,
    name: form.purpose === 0 ? 'Inquiry details' : 'Student details',
    displayOrder: next.sections.length,
    fields: [],
  };
  const usedCodes = new Set(fields.map((field) => field.code.toUpperCase()));
  const additions = missing.map((definition, index) => {
    const field = createDefault(
      definition,
      section.id,
      section.fields.length + displaced.length + index
    );
    const baseCode = field.code;
    for (let suffix = 2; usedCodes.has(field.code); suffix += 1)
      field.code = `${baseCode}_${suffix}`;
    usedCodes.add(field.code);
    return field;
  });
  const updated = {
    ...section,
    fields: [
      ...section.fields,
      ...displaced.map((field, index) => ({
        ...field,
        sectionId: section.id,
        displayOrder: section.fields.length + index,
      })),
      ...additions,
    ],
  };
  return {
    ...next,
    sections: [
      ...next.sections.map((item) =>
        item.id === section.id
          ? updated
          : { ...item, fields: item.fields.filter((field) => !displacedIds.has(field.id)) }
      ),
      ...(target ? [] : [updated]),
    ],
  };
}
export const lockNewInquiryStarter = ensureNewInquiryDefaults;
export function changeNewFormInheritance(form: CreateUpdateAdmissionForm, enabled: boolean) {
  const next = { ...form, inheritance: { enabled, sources: form.inheritance?.sources ?? [] } };
  if (form.coreFieldPolicyVersion !== ADMISSION_CORE_FIELD_POLICY_VERSION) return next;
  return ensureNewInquiryDefaults({
    ...next,
    sections: next.sections.map((section) => ({
      ...section,
      fields: enabled
        ? section.fields.filter(
            (field) =>
              field.bindingType !== 0 ||
              !identityDefaults.some((item) => item.bindingKey === field.bindingKey)
          )
        : section.fields,
    })),
  });
}
export function changeNewFormPurpose(
  form: CreateUpdateAdmissionForm,
  purpose: CreateUpdateAdmissionForm['purpose']
) {
  const base = hasOnlyInquiryDefaults(form) ? withoutInquiryDefaults(form) : form;
  const next = {
    ...base,
    purpose,
    sections: base.sections.map((section) => ({
      ...section,
      fields: section.fields.filter(
        (field) =>
          !(purpose === 1 && field.bindingType === 0 && field.bindingKey?.startsWith('Inquiry.'))
      ),
    })),
  };
  return ensureNewInquiryDefaults(next);
}
export function conflictsWithInquiryDefaultName(form: CreateUpdateAdmissionForm, binding?: string) {
  return Boolean(
    binding === 'Applicant.Name' &&
    form.coreFieldPolicyVersion === 1 &&
    form.sections.some((section) =>
      section.fields.some(
        (field) => field.bindingType === 0 && field.bindingKey === 'Applicant.FirstName'
      )
    )
  );
}
