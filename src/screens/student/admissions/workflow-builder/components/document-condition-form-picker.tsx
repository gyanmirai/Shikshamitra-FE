import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getDocumentConditionFields } from './document-condition-fields';
import { AdmissionConditionFormPicker } from './admission-condition-form-picker';

export function DocumentConditionFormPicker(props: {
  forms: AdmissionForm[];
  json?: string | null;
  onChange: (json: string) => void;
}) {
  return (
    <AdmissionConditionFormPicker
      {...props}
      groupLabel="Require this document when"
      getFields={(form) => getDocumentConditionFields(form ? [form] : [])}
    />
  );
}
