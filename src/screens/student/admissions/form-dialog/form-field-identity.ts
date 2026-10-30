import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

export const createAdmissionCustomFieldIdentity = () => `custom:${crypto.randomUUID()}`;

/** Run at materialization boundaries, never while rendering or requesting a preview. */
export function ensureAdmissionCustomFieldIdentities<
  T extends { sections: AdmissionFormSection[] },
>(form: T): T {
  return {
    ...form,
    sections: form.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) =>
        field.bindingType === 1 && field.fieldType !== 12 && !field.fieldIdentity
          ? { ...field, fieldIdentity: createAdmissionCustomFieldIdentity() }
          : field
      ),
    })),
  };
}
