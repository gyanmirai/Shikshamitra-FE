import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';

type LanguageForm = Pick<
  AdmissionForm,
  'id' | 'version' | 'defaultLanguage' | 'supportedLanguages'
>;

export function useAdmissionFormLanguage(form: LanguageForm | undefined, scope: string) {
  const [selection, setSelection] = useState<{ key: string; language: string } | null>(null);
  const key = JSON.stringify([scope, form?.id, form?.version]);
  const supportedLanguages = form?.supportedLanguages?.length
    ? form.supportedLanguages
    : [form?.defaultLanguage || 'en'];
  const defaultLanguage = supportedLanguages.includes(form?.defaultLanguage || 'en')
    ? form?.defaultLanguage || 'en'
    : supportedLanguages[0];
  const language =
    selection?.key === key && supportedLanguages.includes(selection.language)
      ? selection.language
      : defaultLanguage;

  return {
    language,
    supportedLanguages,
    setLanguage: (next: string) => setSelection({ key, language: next }),
  };
}
