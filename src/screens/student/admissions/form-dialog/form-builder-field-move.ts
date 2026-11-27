import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { isLockedInquiryField } from './inquiry-default-fields';
import { getAdmissionFormStepGroups } from './form-step-groups';

export function getFieldMoveDestinations(
  form: CreateUpdateAdmissionForm,
  effectiveForm: CreateUpdateAdmissionForm,
  fields: AdmissionFormField[]
) {
  const editable = new Map(form.sections.map((section) => [section.id, section]));
  const protectedField = fields.some((field) =>
    isLockedInquiryField(form.purpose, field, form.coreFieldPolicyVersion)
  );
  const systemField = fields.some((field) => field.bindingType === 0);
  const optionFor = (section: AdmissionFormSection, group = '') => {
    const draft = editable.get(section.id);
    if (!draft || fields.every((field) => draft.fields.some((item) => item.id === field.id)))
      return [];
    let reason = '';
    if (draft.isRepeatable && systemField) reason = 'Student fields need a non-repeatable section.';
    else if (
      protectedField &&
      (draft.isRepeatable ||
        draft.visibilityRuleJson?.trim() ||
        draft.stepVisibilityRuleJson?.trim())
    )
      reason = 'Core fields need an always-visible section.';
    return [{ value: draft.id, label: section.name, group, reason }];
  };
  if (effectiveForm.layoutType !== 1) {
    return [...effectiveForm.sections]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .flatMap((section) => optionFor(section));
  }
  return getAdmissionFormStepGroups(effectiveForm.sections).flatMap((step, index) =>
    step.sections.flatMap(({ section }) => optionFor(section, `Step ${index + 1} · ${step.name}`))
  );
}

export function changeBuilderFieldLocations(
  sections: AdmissionFormSection[],
  fields: AdmissionFormField[],
  targetId?: string
) {
  const ids = new Set(fields.map((field) => field.id));
  return sections.map((section) => {
    const isTarget = section.id === targetId;
    if (!isTarget && !section.fields.some((field) => ids.has(field.id))) return section;
    const remaining = section.fields
      .filter((field) => !ids.has(field.id))
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const updated = isTarget ? [...remaining, ...fields] : remaining;
    return {
      ...section,
      fields: updated.map((field, displayOrder) => ({
        ...field,
        displayOrder,
        sectionId: section.id,
      })),
    };
  });
}
