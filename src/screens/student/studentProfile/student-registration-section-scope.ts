import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { getDependentAdmissionFieldCodes } from '../admissions/admission-field-dependencies';

export function studentRegistrationSectionScope(
  source: RecordRegistrationSource,
  sectionId?: string
) {
  const sections = source.definition?.sections ?? [];
  const fields = sections.flatMap((section) => section.fields);
  const permitted = new Set(source.formEditableFieldCodes ?? []);
  const selected =
    sections
      .find((section) => section.id === sectionId)
      ?.fields.filter((field) => !field.readOnly && permitted.has(field.code)) ?? [];
  const codes = [
    ...new Set(
      selected.flatMap((field) => [
        field.code,
        ...getDependentAdmissionFieldCodes(fields, field.code),
      ])
    ),
  ].filter((code) => permitted.has(code) && !fields.find((field) => field.code === code)?.readOnly);
  return {
    codes,
    sectionIds: sections
      .filter((section) => section.fields.some((field) => codes.includes(field.code)))
      .map((section) => section.id),
  };
}
