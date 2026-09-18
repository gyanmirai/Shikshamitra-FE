import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import {
  getSystemAdmissionFormTemplate,
  type AdmissionFormTemplateCategory,
  type SystemAdmissionFormTemplateId,
} from './admission-form-template-catalog';

export type AdmissionFormSectionTemplateId =
  | 'student-details'
  | 'parent-guardian'
  | 'home-address'
  | 'document-checklist'
  | 'health-information'
  | 'emergency-contact'
  | 'transport-requirement'
  | 'financial-household'
  | 'consent-declaration'
  | 'feedback-rating';

export type AdmissionFormSectionTemplate = {
  id: AdmissionFormSectionTemplateId;
  title: string;
  description: string;
  category: AdmissionFormTemplateCategory;
  icon: string;
  fieldCount: number;
  sourceTemplateId: SystemAdmissionFormTemplateId;
  sourceSectionCode: string;
};

export type MaterializedSectionTemplate = {
  section: AdmissionFormSection;
  skippedSystemBindings: string[];
};

export const ADMISSION_FORM_SECTION_TEMPLATES: AdmissionFormSectionTemplate[] = [
  {
    id: 'student-details',
    title: 'Student details',
    description: 'Name, date of birth, and gender linked to the applicant record.',
    category: 'Student information',
    icon: 'mdi:account-school-outline',
    fieldCount: 5,
    sourceTemplateId: 'admission-application',
    sourceSectionCode: 'STUDENT_DETAILS',
  },
  {
    id: 'parent-guardian',
    title: 'Parent or guardian',
    description: 'Guardian name, relationship, phone, and email.',
    category: 'Student information',
    icon: 'mdi:account-child-outline',
    fieldCount: 4,
    sourceTemplateId: 'admission-application',
    sourceSectionCode: 'PARENT_GUARDIAN',
  },
  {
    id: 'home-address',
    title: 'Home address',
    description: 'Address lines, city, state, and PIN code.',
    category: 'Student information',
    icon: 'mdi:home-map-marker',
    fieldCount: 5,
    sourceTemplateId: 'admission-application',
    sourceSectionCode: 'HOME_ADDRESS',
  },
  {
    id: 'document-checklist',
    title: 'Document checklist',
    description: 'Common admission-document receipt checks.',
    category: 'Documents and consent',
    icon: 'mdi:folder-check-outline',
    fieldCount: 5,
    sourceTemplateId: 'document-collection',
    sourceSectionCode: 'DOCUMENT_CHECKLIST',
  },
  {
    id: 'health-information',
    title: 'Health information',
    description: 'Blood group, conditions, medication, doctor, and allergies.',
    category: 'Student information',
    icon: 'mdi:medical-bag',
    fieldCount: 6,
    sourceTemplateId: 'medical-information',
    sourceSectionCode: 'HEALTH_INFORMATION',
  },
  {
    id: 'emergency-contact',
    title: 'Emergency contact',
    description: 'Primary and alternate emergency contact details.',
    category: 'Student information',
    icon: 'mdi:phone-alert-outline',
    fieldCount: 4,
    sourceTemplateId: 'medical-information',
    sourceSectionCode: 'EMERGENCY_CONTACT',
  },
  {
    id: 'transport-requirement',
    title: 'Transport requirement',
    description: 'Service direction, route, stop, timing, and start date.',
    category: 'Services',
    icon: 'mdi:bus-school',
    fieldCount: 5,
    sourceTemplateId: 'transport-request',
    sourceSectionCode: 'TRANSPORT_NEED',
  },
  {
    id: 'financial-household',
    title: 'Household and income',
    description: 'Household income and dependant information for support review.',
    category: 'Finance',
    icon: 'mdi:home-account',
    fieldCount: 5,
    sourceTemplateId: 'scholarship-request',
    sourceSectionCode: 'HOUSEHOLD_INFORMATION',
  },
  {
    id: 'consent-declaration',
    title: 'Consent declaration',
    description: 'Confirmation checkbox and guardian name.',
    category: 'Documents and consent',
    icon: 'mdi:file-sign',
    fieldCount: 2,
    sourceTemplateId: 'consent-declaration',
    sourceSectionCode: 'CONSENT_DECLARATION',
  },
  {
    id: 'feedback-rating',
    title: 'Experience rating',
    description: 'Overall, communication, process, and recommendation ratings.',
    category: 'Surveys',
    icon: 'mdi:star-outline',
    fieldCount: 4,
    sourceTemplateId: 'feedback-survey',
    sourceSectionCode: 'RATINGS',
  },
];

function uniqueCode(code: string, usedCodes: Set<string>) {
  const base = code.slice(0, 58);
  let candidate = base;
  let suffix = 2;
  while (usedCodes.has(candidate)) {
    candidate = `${base}_${suffix}`.slice(0, 64);
    suffix += 1;
  }
  usedCodes.add(candidate);
  return candidate;
}

function cloneField(
  source: AdmissionFormField,
  sectionId: string,
  displayOrder: number,
  usedCodes: Set<string>
): AdmissionFormField {
  const code = uniqueCode(source.code, usedCodes);
  return {
    ...source,
    id: crypto.randomUUID(),
    sectionId,
    code,
    bindingKey: source.bindingType === 1 ? code : source.bindingKey,
    displayOrder,
  };
}

export function materializeAdmissionFormSectionTemplate(
  templateId: AdmissionFormSectionTemplateId,
  form: CreateUpdateAdmissionForm,
  targetSectionId?: string | null
): MaterializedSectionTemplate {
  const template = ADMISSION_FORM_SECTION_TEMPLATES.find((item) => item.id === templateId);
  if (!template) throw new Error(`Unknown admission form section template: ${templateId}`);
  const sourceForm = getSystemAdmissionFormTemplate(template.sourceTemplateId);
  const source = sourceForm.sections.find((section) => section.code === template.sourceSectionCode);
  if (!source) throw new Error(`Missing section ${template.sourceSectionCode}`);

  const target =
    form.sections.find((section) => section.id === targetSectionId) ?? form.sections.at(-1);
  const usedSectionCodes = new Set(form.sections.map((section) => section.code));
  const usedFieldCodes = new Set(
    form.sections.flatMap((section) => section.fields.map((field) => field.code))
  );
  const usedBindings = new Set(
    form.sections.flatMap((section) =>
      section.fields
        .filter((field) => field.bindingType === 0 && field.bindingKey)
        .map((field) => field.bindingKey as string)
    )
  );
  const skippedSystemBindings: string[] = [];
  const sectionId = crypto.randomUUID();
  const fields = source.fields
    .filter((field) => {
      if (field.bindingType !== 0 || !field.bindingKey || !usedBindings.has(field.bindingKey)) {
        return true;
      }
      skippedSystemBindings.push(field.bindingKey);
      return false;
    })
    .map((field, fieldIndex) => cloneField(field, sectionId, fieldIndex, usedFieldCodes));

  const hasTargetStep = form.layoutType === 1 && target?.stepId;
  const stepId = hasTargetStep ? target.stepId : form.layoutType === 1 ? crypto.randomUUID() : null;
  const fallbackStepOrder =
    Math.max(-1, ...form.sections.map((section) => section.stepDisplayOrder ?? -1)) + 1;

  return {
    skippedSystemBindings,
    section: {
      ...source,
      id: sectionId,
      code: uniqueCode(source.code, usedSectionCodes),
      displayOrder: form.sections.length,
      stepId,
      stepCode: hasTargetStep ? target?.stepCode : stepId ? `STEP_${fallbackStepOrder + 1}` : null,
      stepName: hasTargetStep ? target?.stepName : stepId ? source.name : null,
      stepDisplayOrder: hasTargetStep
        ? target?.stepDisplayOrder
        : stepId
          ? fallbackStepOrder
          : null,
      fields,
    },
  };
}
