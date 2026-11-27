import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormStepGroups } from './form-step-groups';

export function placeLinkedFormFields(
  form: CreateUpdateAdmissionForm,
  fallback: AdmissionFormSection,
  fields: AdmissionFormField[]
) {
  const ids = new Set(fields.map((field) => field.id));
  const orderedSections =
    form.layoutType === 1
      ? getAdmissionFormStepGroups(form.sections).flatMap((step) =>
          step.sections.map(({ section }) => section)
        )
      : [...form.sections].sort((a, b) => a.displayOrder - b.displayOrder);
  const existing = orderedSections.flatMap((section) =>
    [...section.fields]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter((field) => ids.has(field.id))
  );
  // Keep existing placements where possible. Missing parents go before the next field in the group.
  const existingIds = new Set(existing.map((field) => field.id));
  const slots = fields.filter((field) => existingIds.has(field.id));
  const replacements = new Map<string, AdmissionFormField[]>();
  let slotIndex = 0;
  fields.forEach((field) => {
    const slot = existing[Math.min(slotIndex, existing.length - 1)];
    if (!slot) return;
    replacements.set(slot.id, [...(replacements.get(slot.id) ?? []), field]);
    if (field.id === slots[slotIndex]?.id) slotIndex += 1;
  });
  const sections =
    existing.length || form.sections.some((section) => section.id === fallback.id)
      ? form.sections
      : [...form.sections, fallback];
  return sections.map((section) => {
    const newlyPlaced = !existing.length && section.id === fallback.id;
    if (!newlyPlaced && !section.fields.some((field) => replacements.has(field.id))) return section;
    const updated = [...section.fields]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .flatMap((field) => replacements.get(field.id) ?? [field]);
    if (newlyPlaced) updated.push(...fields);
    return {
      ...section,
      fields: updated.map((field, displayOrder) => ({
        ...field,
        sectionId: section.id,
        displayOrder,
      })),
    };
  });
}
