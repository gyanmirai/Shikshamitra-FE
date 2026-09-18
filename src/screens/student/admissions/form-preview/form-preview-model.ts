import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

export function getAdmissionFormPreviewInitialValues(form?: AdmissionForm) {
  return Object.fromEntries(
    form?.sections
      .flatMap((section) => section.fields)
      .map((field) => [field.code, field.defaultValue ?? '']) ?? []
  );
}
