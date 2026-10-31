import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { isEqual } from 'src/utils/helper';

import { canonicalInquiryBinding } from '../admission-inquiry-field-bindings';

const defaults = [
  {
    code: 'INQUIRY_STUDENT_NAME',
    label: 'Student name',
    bindingKey: 'Applicant.Name',
    fieldType: 0,
    translations: { gu: { label: 'વિદ્યાર્થીનું નામ' }, hi: { label: 'विद्यार्थी का नाम' } },
  },
  {
    code: 'INQUIRY_PARENT_NAME',
    label: 'Parent/Guardian name',
    bindingKey: 'Guardian.FirstName',
    fieldType: 0,
    translations: {
      gu: { label: 'માતા-પિતા/વાલીનું નામ' },
      hi: { label: 'माता-पिता/अभिभावक का नाम' },
    },
  },
  {
    code: 'INQUIRY_PARENT_MOBILE',
    label: 'Parent/Guardian mobile',
    bindingKey: 'Guardian.Mobile',
    fieldType: 4,
    translations: {
      gu: { label: 'માતા-પિતા/વાલીનો મોબાઇલ નંબર' },
      hi: { label: 'माता-पिता/अभिभावक का मोबाइल नंबर' },
    },
  },
  {
    code: 'INQUIRY_PRIMARY_CONTACT',
    label: 'Primary contact',
    bindingKey: 'Inquiry.ParentRelationship',
    fieldType: 6,
    optionsJson: JSON.stringify([
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
      { value: 'guardian', label: 'Guardian' },
    ]),
    translations: {
      gu: { label: 'મુખ્ય સંપર્ક' },
      hi: { label: 'मुख्य संपर्क' },
    },
  },
] as const;

const splitStudentDefault = {
  code: 'INQUIRY_STUDENT_FIRST_NAME',
  label: 'Student first name',
  bindingKey: 'Applicant.FirstName',
  fieldType: 0,
  translations: {
    gu: { label: 'વિદ્યાર્થીનું પ્રથમ નામ' },
    hi: { label: 'विद्यार्थी का प्रथम नाम' },
  },
} as const;
type DefaultDefinition = (typeof defaults)[number] | typeof splitStudentDefault;

const definitionFor = (field: AdmissionFormField) =>
  field.bindingType === 0
    ? [...defaults, splitStudentDefault].find(
        (definition) => definition.code === field.code && definition.bindingKey === field.bindingKey
      )
    : undefined;

export const INQUIRY_FIELD_LOCK_HELP =
  'Required for every inquiry. This field cannot be edited or removed from the form. Applicants can enter their details.';

/** Reserved codes identify generated controls; authored Registration edits must stay editable. */
function isPristineDefault(field: AdmissionFormField) {
  const definition = definitionFor(field);
  if (
    !definition ||
    field.label !== definition.label ||
    field.fieldType !== definition.fieldType ||
    !field.required ||
    field.readOnly ||
    field.inheritedFrom ||
    [
      field.placeholder,
      field.helpText,
      field.defaultValue,
      field.visibilityRuleJson,
      field.requiredRuleJson,
    ].some((value) => value?.trim())
  )
    return false;
  if ((field.optionsJson || '') !== ('optionsJson' in definition ? definition.optionsJson : ''))
    return false;
  try {
    if (
      !isEqual(
        JSON.parse(field.validationJson || '{}'),
        definition.fieldType === 4 ? { format: 'phone', phone: true } : {}
      )
    )
      return false;
  } catch {
    return false;
  }
  return Object.entries(field.translations ?? {}).every(([language, translation]) =>
    Object.entries(translation ?? {})
      .filter(
        ([, value]) =>
          value != null &&
          value !== '' &&
          !(typeof value === 'object' && Object.keys(value).length === 0)
      )
      .every(
        ([key, value]) =>
          key === 'label' && value === definition.translations[language as 'gu' | 'hi']?.label
      )
  );
}

export const isLockedInquiryField = (purpose: number | undefined, field: AdmissionFormField) =>
  purpose === 0 && isPristineDefault(field);

export const hasLockedInquiryFields = (
  purpose: number | undefined,
  sections: readonly Pick<AdmissionFormSection, 'fields'>[]
) =>
  sections.some((section) => section.fields.some((field) => isLockedInquiryField(purpose, field)));

export const hasOnlyInquiryDefaults = (form: CreateUpdateAdmissionForm) => {
  const fields = form.sections.flatMap((section) => section.fields);
  return (fields.length === 3 || fields.length === 4) && fields.every(isPristineDefault);
};

export const withoutInquiryDefaults = (form: CreateUpdateAdmissionForm) => ({
  ...form,
  sections: form.sections.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => !isPristineDefault(field)),
  })),
});

/** System-owned controls keep language switching available even though their settings are locked. */
export function withInquiryDefaultTranslations(
  form: CreateUpdateAdmissionForm
): CreateUpdateAdmissionForm {
  if (form.purpose !== 0) return form;
  return {
    ...form,
    sections: form.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const definition = definitionFor(field);
        return definition
          ? { ...field, translations: { ...definition.translations, ...field.translations } }
          : field;
      }),
    })),
  };
}

const createDefault = (
  definition: DefaultDefinition,
  sectionId: string,
  displayOrder: number
): AdmissionFormField => ({
  ...definition,
  id: crypto.randomUUID(),
  sectionId,
  displayOrder,
  bindingType: 0,
  required: true,
  readOnly: false,
  ...(definition.fieldType === 4
    ? { validationJson: JSON.stringify({ format: 'phone', phone: true }) }
    : {}),
});

/** Only new-form materialization calls this; saved definitions are never repaired on read. */
export function ensureNewInquiryDefaults(
  form: CreateUpdateAdmissionForm
): CreateUpdateAdmissionForm {
  if (form.purpose !== 0) return form;
  const fields = form.sections.flatMap((section) => section.fields);
  const bindings = new Set(fields.map(canonicalInquiryBinding));
  const hasParentPair = ['Father', 'Mother'].some(
    (prefix) => bindings.has(`${prefix}.Name`) && bindings.has(`${prefix}.Mobile`)
  );
  const missing = defaults.filter((definition) => {
    if (definition.bindingKey === 'Applicant.Name')
      return !bindings.has('Applicant.Name') && !bindings.has('Applicant.FirstName');
    if (hasParentPair && !bindings.has('Guardian.FirstName') && !bindings.has('Guardian.Mobile'))
      return false;
    return !bindings.has(definition.bindingKey);
  });
  if (!missing.length) return form;
  const target = form.sections.find(
    (section) =>
      !section.isRepeatable &&
      !section.visibilityRuleJson?.trim() &&
      !section.stepVisibilityRuleJson?.trim()
  );
  const section: AdmissionFormSection = target ?? {
    id: crypto.randomUUID(),
    code: 'INQUIRY_IDENTITY',
    name: 'Inquiry details',
    displayOrder: form.sections.length,
    fields: [],
  };
  const start = Math.max(-1, ...fields.map((field) => field.displayOrder)) + 1;
  const next = {
    ...section,
    fields: [
      ...section.fields,
      ...missing.map((definition, index) =>
        createDefault(
          definition.bindingKey === 'Applicant.Name' &&
            (bindings.has('Applicant.MiddleName') || bindings.has('Applicant.LastName'))
            ? splitStudentDefault
            : definition,
          section.id,
          start + index
        )
      ),
    ],
  };
  return {
    ...form,
    sections: target
      ? form.sections.map((item) => (item.id === target.id ? next : item))
      : [...form.sections, next],
  };
}

/** Starter fields are new, so their fixed identity controls can receive the reserved codes. */
export function lockNewInquiryStarter(form: CreateUpdateAdmissionForm): CreateUpdateAdmissionForm {
  if (form.purpose !== 0) return form;
  return ensureNewInquiryDefaults({
    ...form,
    sections: form.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const definition = defaults.find(
          (item) => item.bindingKey === canonicalInquiryBinding(field)
        );
        return definition
          ? { ...field, ...createDefault(definition, section.id, field.displayOrder), id: field.id }
          : field;
      }),
    })),
  });
}

export function changeNewFormPurpose(
  form: CreateUpdateAdmissionForm,
  purpose: CreateUpdateAdmissionForm['purpose']
) {
  const next = {
    ...(form.purpose === 0 && purpose === 1 && hasOnlyInquiryDefaults(form)
      ? withoutInquiryDefaults(form)
      : form),
    purpose,
  };
  return ensureNewInquiryDefaults(next);
}

export function conflictsWithInquiryDefaultName(form: CreateUpdateAdmissionForm, binding?: string) {
  return Boolean(
    binding &&
    form.sections.some((section) =>
      section.fields.some(
        (field) =>
          isLockedInquiryField(form.purpose, field) &&
          (field.bindingKey === 'Applicant.Name'
            ? ['Applicant.FirstName', 'Applicant.MiddleName', 'Applicant.LastName'].includes(
                binding
              )
            : field.bindingKey === 'Applicant.FirstName' && binding === 'Applicant.Name')
      )
    )
  );
}
