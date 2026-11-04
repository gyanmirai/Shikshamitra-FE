import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getPublishedConditionFields } from './admission-condition-fields';

export type DocumentConditionField = { value: string; label: string };

export function getDocumentConditionFields(
  forms: AdmissionForm[]
): DocumentConditionField[] {
  const fields: DocumentConditionField[] = [
    { value: 'application.status', label: 'Application Status' },
    { value: 'application.admissionType', label: 'Admission Type' },
    { value: 'application.class', label: 'Class' },
    { value: 'application.category', label: 'Category' },
    { value: 'application.rteStatus', label: 'RTE Status' },
    { value: 'application.transferAdmission', label: 'Transfer Admission' },
    { value: 'application.scholarship', label: 'Scholarship' },
    { value: 'assessment.outcome', label: 'Assessment Outcome' },
  ];
  getPublishedConditionFields(forms.filter((form) => form.purpose !== 0), 'application', [12], true).forEach((field) => {
    if (!fields.some((item) => item.value === field.value)) fields.push(field);
  });
  return fields;
}
