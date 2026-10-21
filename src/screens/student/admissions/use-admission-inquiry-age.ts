import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionInquiryCaptureContext } from 'src/redux/student/admissions/admission-inquiries-api';

import { useRef, useEffect, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useDebounceEffect } from 'src/hooks/use-debounce';

import { getAdmissionInquiryAge } from './admission-inquiry-age';
import { isAdmissionRuleVisible } from './admission-visibility-rules';
import { isAdmissionInquiryBirthDateField } from './admission-inquiry-model';

import type { AdmissionInquiryFormSection } from './admission-inquiry-model';

/** Owns advisory age feedback for inquiry capture/edit; never changes form validation. */
export function useAdmissionInquiryAge({
  sections,
  values,
  context,
  enabled = true,
}: {
  sections: AdmissionInquiryFormSection[];
  values: Record<string, string>;
  context?: AdmissionInquiryCaptureContext;
  enabled?: boolean;
}) {
  const lastWarning = useRef('');
  const birthField = sections
    .filter((section) => isAdmissionRuleVisible(section.visibilityRuleJson, values))
    .flatMap((section) => section.fields)
    .find(
      (field) =>
        isAdmissionInquiryBirthDateField(field) &&
        isAdmissionRuleVisible(field.visibilityRuleJson, values)
    );
  const birthDate = birthField ? values[birthField.code] : '';
  const age = birthField
    ? getAdmissionInquiryAge(birthDate, context?.academicYearStartDate, context?.minimumAgeYears)
    : null;
  const warning = age?.warning ?? '';
  const warningKey = warning ? `${context?.offering.id}:${birthDate}:${warning}` : '';

  useEffect(() => {
    if (enabled && !warningKey) lastWarning.current = '';
  }, [enabled, warningKey]);
  const notify = useCallback(() => {
    if (!enabled || !warningKey || lastWarning.current === warningKey) return;
    lastWarning.current = warningKey;
    shikshaMitraToast.warning({ message: warning });
  }, [enabled, warning, warningKey]);
  useDebounceEffect(notify, 500);

  return {
    notify,
    withAgeHelp: (field: AdmissionFormField): AdmissionFormField =>
      field.code === birthField?.code && age
        ? { ...field, helpText: [field.helpText, age.helpText].filter(Boolean).join(' ') }
        : field,
  };
}
