import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getPublishedConditionFields } from './admission-condition-fields';

export type DocumentConditionField = { value: string; label: string };

export function getDocumentConditionFields(
  forms: AdmissionForm[],
  source: 'application' | 'inquiry' = 'application'
): DocumentConditionField[] {
  const fields: DocumentConditionField[] = [
    { value: 'application.status', label: 'Application status' },
    { value: 'inquiry.status', label: 'Inquiry status' },
    { value: 'inquiry.source', label: 'Inquiry source' },
  ];
  getPublishedConditionFields(forms, source, [12], true).forEach((field) => {
    if (!fields.some((item) => item.value === field.value)) fields.push(field);
  });
  return fields;
}
