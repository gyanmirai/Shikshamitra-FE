import type { FormikProps } from 'formik';
import type { Over, Active } from '@dnd-kit/core';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

export function reorderFormBuilder(
  { active, over }: { active: Pick<Active, 'id'>; over: Pick<Over, 'id'> | null },
  formik: Pick<FormikProps<CreateUpdateAdmissionForm>, 'values' | 'setFieldValue'>,
  selectField: (sectionId: string, fieldId: string) => void
) {
  if (!over || active.id === over.id) return;
  const activeId = String(active.id);
  const overId = String(over.id);
  if (activeId.startsWith('section:') && overId.startsWith('section:')) {
    const from = formik.values.sections.findIndex(
      (section) => `section:${section.id}` === activeId
    );
    const to = formik.values.sections.findIndex((section) => `section:${section.id}` === overId);
    if (from < 0 || to < 0) return;
    const sections = [...formik.values.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    formik.setFieldValue(
      'sections',
      sections.map((section, index) => ({ ...section, displayOrder: index }))
    );
    return;
  }
  if (!activeId.startsWith('field:') || !overId.startsWith('field:')) return;
  const [, activeSectionId, activeFieldId] = activeId.split(':');
  const [, overSectionId, overFieldId] = overId.split(':');
  const sourceIndex = formik.values.sections.findIndex((section) => section.id === activeSectionId);
  const targetIndex = formik.values.sections.findIndex((section) => section.id === overSectionId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const sourceFields = [...formik.values.sections[sourceIndex].fields];
  const fieldIndex = sourceFields.findIndex((field) => field.id === activeFieldId);
  if (fieldIndex < 0) return;
  // Use the original target position so a downward move lands after the target field.
  const targetFieldIndex = formik.values.sections[targetIndex].fields.findIndex(
    (field) => field.id === overFieldId
  );
  const [moved] = sourceFields.splice(fieldIndex, 1);
  const targetFields =
    sourceIndex === targetIndex ? sourceFields : [...formik.values.sections[targetIndex].fields];
  targetFields.splice(targetFieldIndex < 0 ? targetFields.length : targetFieldIndex, 0, {
    ...moved,
    sectionId: formik.values.sections[targetIndex].id,
  });
  const sections = formik.values.sections.map((section, index) => ({
    ...section,
    fields: (index === sourceIndex
      ? sourceFields
      : index === targetIndex
        ? targetFields
        : section.fields
    ).map((field, order) => ({ ...field, displayOrder: order })),
  }));
  formik.setFieldValue('sections', sections);
  selectField(formik.values.sections[targetIndex].id, moved.id);
}
