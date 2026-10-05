import type {
  AdmissionForm,
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';

import type { AdmissionFieldPreset } from './form-field-presets';

const admissionFormFieldSchema = Yup.object({
  id: Yup.string().required(),
  sectionId: Yup.string().nullable().optional(),
  code: Yup.string()
    .trim()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .required('Field code is required'),
  label: Yup.string().trim().required('Field label is required'),
  fieldType: Yup.number().integer().min(0).max(12).required(),
  bindingType: Yup.number().oneOf([0, 1]).required(),
  bindingKey: Yup.string().nullable().optional(),
  placeholder: Yup.string().nullable().optional(),
  helpText: Yup.string().nullable().optional(),
  defaultValue: Yup.string().nullable().optional(),
  optionsJson: Yup.string().nullable().optional(),
  required: Yup.boolean().required(),
  readOnly: Yup.boolean().required(),
  displayOrder: Yup.number().integer().min(0).required(),
  validationJson: Yup.string().nullable().optional(),
  visibilityRuleJson: Yup.string().nullable().optional(),
  requiredRuleJson: Yup.string().nullable().optional(),
  translations: Yup.object().optional(),
});

const admissionFormSectionSchema = Yup.object({
  id: Yup.string().required(),
  code: Yup.string()
    .trim()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .required('Section code is required'),
  name: Yup.string().trim().required('Section name is required'),
  displayOrder: Yup.number().integer().min(0).required(),
  stepId: Yup.string().nullable().optional(),
  stepCode: Yup.string().nullable().optional(),
  stepName: Yup.string().nullable().optional(),
  stepDisplayOrder: Yup.number().nullable().optional(),
  stepVisibilityRuleJson: Yup.string().nullable().optional(),
  visibilityRuleJson: Yup.string().nullable().optional(),
  requiredRuleJson: Yup.string().nullable().optional(),
  isRepeatable: Yup.boolean().optional(),
  minEntries: Yup.number().integer().min(0).max(25).optional(),
  maxEntries: Yup.number()
    .integer()
    .min(1)
    .max(25)
    .test('repeat-range', 'Maximum entries must be at least the minimum', function (value) {
      return !this.parent.isRepeatable || Number(value ?? 1) >= Number(this.parent.minEntries ?? 0);
    })
    .optional(),
  entryLabel: Yup.string().nullable().optional(),
  translations: Yup.object().optional(),
  fields: Yup.array().of(admissionFormFieldSchema).min(1, 'Add at least one field'),
});

export const admissionFormSchema = Yup.object({
  name: Yup.string().trim().max(128).required('Form name is required'),
  layoutType: Yup.number().oneOf([0, 1]).required('Choose a form layout'),
  purpose: Yup.number().oneOf([0, 1]).required('Choose a form purpose'),
  fieldsPerRow: Yup.number().oneOf([1, 2, 3, 4]).required('Choose fields per row'),
  defaultLanguage: Yup.string().trim().required('Choose the default language'),
  supportedLanguages: Yup.array()
    .of(Yup.string().trim().required())
    .min(1, 'Choose at least one language')
    .test(
      'includes-default',
      'Supported languages must include the default language',
      function (value) {
        return Boolean(value?.includes(this.parent.defaultLanguage));
      }
    ),
  sections: Yup.array().of(admissionFormSectionSchema).min(1, 'Add at least one section'),
});

export const FIELD_TYPES: [string, AdmissionFormField['fieldType']][] = [
  ['Text', 0],
  ['Textarea', 1],
  ['Number', 2],
  ['Email', 3],
  ['Phone', 4],
  ['Date', 5],
  ['Select', 6],
  ['Multi-select', 7],
  ['Radio', 8],
  ['Checkbox', 9],
  ['File placeholder', 10],
  ['Address group', 11],
  ['Static text', 12],
];

/**
 * File fields are part of the persisted contract for existing forms, but the
 * backend marks them as unavailable at runtime. Keep the type readable while
 * preventing it from being selected for new fields.
 */
export const CREATABLE_FIELD_TYPES = FIELD_TYPES.filter(([, value]) => value !== 10);

export function getConfigurableFieldTypes(fieldType: AdmissionFormField['fieldType']) {
  if (fieldType !== 10) return CREATABLE_FIELD_TYPES;

  return FIELD_TYPES.map(([label, value]) =>
    value === 10
      ? ([`${label} (unavailable)`, value] as (typeof FIELD_TYPES)[number])
      : [label, value]
  );
}

const FIELD_TYPE_ICONS: Record<AdmissionFormField['fieldType'], string> = {
  0: 'mdi:form-textbox',
  1: 'mdi:text-long',
  2: 'mdi:numeric',
  3: 'mdi:email-outline',
  4: 'mdi:phone-outline',
  5: 'mdi:calendar-outline',
  6: 'mdi:form-dropdown',
  7: 'mdi:format-list-checks',
  8: 'mdi:radiobox-marked',
  9: 'mdi:checkbox-marked-outline',
  10: 'mdi:paperclip',
  11: 'mdi:map-marker-outline',
  12: 'mdi:text-box-outline',
};

export const fieldTypeIcon = (fieldType: AdmissionFormField['fieldType']) =>
  FIELD_TYPE_ICONS[fieldType];

export function nextFieldOrder(sections: CreateUpdateAdmissionForm['sections']) {
  const fieldCodes = new Set(
    sections.flatMap((section) => section.fields.map((field) => field.code.toUpperCase()))
  );
  let order = 0;
  while (fieldCodes.has(`FIELD_${order + 1}`)) order += 1;
  return order;
}

export function nextFieldDisplayOrder(sections: CreateUpdateAdmissionForm['sections']) {
  return (
    Math.max(
      -1,
      ...sections.flatMap((section) => section.fields.map((field) => field.displayOrder))
    ) + 1
  );
}

export function hasSystemBinding(
  sections: CreateUpdateAdmissionForm['sections'],
  bindingKey?: string
) {
  if (!bindingKey) return false;
  return sections.some((section) =>
    section.fields.some((field) => field.bindingType === 0 && field.bindingKey === bindingKey)
  );
}

export const newField = (
  sectionId: string,
  order: number,
  fieldType: AdmissionFormField['fieldType'] = 0,
  preset?: AdmissionFieldPreset
): AdmissionFormField => ({
  id: crypto.randomUUID(),
  sectionId,
  code: `FIELD_${order + 1}`,
  label:
    preset?.label ??
    FIELD_TYPES.find(([, value]) => value === fieldType)?.[0] ??
    `Field ${order + 1}`,
  fieldType: preset?.fieldType ?? fieldType,
  bindingType: 1,
  bindingKey: `FIELD_${order + 1}`,
  required: false,
  readOnly: false,
  displayOrder: order,
  placeholder: preset?.placeholder,
  helpText: preset?.description,
  validationJson: preset ? JSON.stringify(preset.validation) : undefined,
});

export function getAdmissionFormInitialValues(
  editing?: AdmissionForm | null,
  purpose: CreateUpdateAdmissionForm['purpose'] = 1
): CreateUpdateAdmissionForm {
  const sectionId = editing?.sections[0]?.id ?? crypto.randomUUID();
  const stepId = editing?.sections[0]?.stepId ?? crypto.randomUUID();
  return {
    name: editing?.name ?? '',
    code: editing?.code ?? '',
    description: editing?.description ?? '',
    concurrencyStamp: editing?.concurrencyStamp,
    layoutType: editing?.layoutType ?? 0,
    purpose: editing?.purpose ?? purpose,
    fieldsPerRow: editing?.fieldsPerRow ?? 1,
    defaultLanguage: editing?.defaultLanguage ?? 'en',
    supportedLanguages: editing?.supportedLanguages?.length ? editing.supportedLanguages : ['en'],
    sections: editing?.sections ?? [
      {
        id: sectionId,
        code: 'SECTION_1',
        name: 'Student Details',
        displayOrder: 0,
        stepId,
        stepCode: 'STEP_1',
        stepName: 'Student details',
        stepDisplayOrder: 0,
        isRepeatable: false,
        minEntries: 1,
        maxEntries: 1,
        fields: [newField(sectionId, 0)],
      },
    ],
  };
}

export function getBlankAdmissionFormInitialValues(
  purpose: CreateUpdateAdmissionForm['purpose'] = 1
): CreateUpdateAdmissionForm {
  const form = getAdmissionFormInitialValues(undefined, purpose);
  return {
    ...form,
    sections: form.sections.map((section) => ({ ...section, fields: [] })),
  };
}
