import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';
import type {
  ReturnInquiry,
  ReturnInquiryIntake,
} from 'src/redux/student/records/student-record-transitions-api';

import { getDynamicAdmissionValidationErrors } from '../admissions/admission-form-validation';

export type ReturningInquiryValues = {
  source: '' | AdmissionInquirySource;
  sourceDetail: string;
  preferredLanguageCode: string;
  fields: Record<string, string>;
};

export const emptyReturningInquiry = (): ReturningInquiryValues => ({
  source: '',
  sourceDetail: '',
  preferredLanguageCode: 'en',
  fields: {},
});

export function returningInquiryDefaults(intake: ReturnInquiryIntake): ReturningInquiryValues {
  const fields = Object.fromEntries(
    (intake.form?.sections ?? [])
      .flatMap((section) => section.fields)
      .map((field) => [field.code, field.defaultValue ?? ''])
  );
  intake.boundValues.forEach(({ fieldCode, valueJson }) => {
    if (!valueJson) {
      fields[fieldCode] = '';
      return;
    }
    try {
      const value = JSON.parse(valueJson);
      fields[fieldCode] =
        value == null ? '' : typeof value === 'object' ? valueJson : String(value);
    } catch {
      fields[fieldCode] = '';
    }
  });
  return {
    ...emptyReturningInquiry(),
    preferredLanguageCode: intake.form?.defaultLanguage || 'en',
    fields,
  };
}

export function validateReturningInquiry(
  values: ReturningInquiryValues,
  intake?: ReturnInquiryIntake | null
) {
  if (!intake) return { source: 'Load the school inquiry requirements before submitting.' };
  const boundCodes = new Set(intake.serverBoundFieldCodes);
  const fields = intake.form
    ? getDynamicAdmissionValidationErrors(
        {
          sections: intake.form.sections.map((section) => ({
            ...section,
            fields: section.fields.filter((field) => !boundCodes.has(field.code)),
          })),
        },
        values.fields
      )
    : {};
  return {
    ...(values.source === '' || !intake.allowedSources.includes(values.source)
      ? { source: 'Choose a source allowed by this offering.' }
      : {}),
    ...(values.sourceDetail.length > 128
      ? { sourceDetail: 'Source details must be 128 characters or fewer.' }
      : {}),
    ...(values.source !== '' &&
    (intake.requireSourceDetailFor.includes(values.source) ||
      values.source === 10 ||
      values.source === 11) &&
    !values.sourceDetail.trim()
      ? { sourceDetail: 'Enter the required source details.' }
      : {}),
    ...(Object.keys(fields).length ? { fields } : {}),
  };
}

export function buildReturningInquiry(
  values: ReturningInquiryValues,
  intake: ReturnInquiryIntake
): ReturnInquiry {
  if (values.source === '' || !intake.allowedSources.includes(values.source))
    throw new Error('Choose an allowed inquiry source.');
  const boundCodes = new Set(intake.serverBoundFieldCodes);
  return {
    source: values.source,
    sourceDetail: values.sourceDetail.trim() || undefined,
    preferredLanguageCode: values.preferredLanguageCode,
    formValues: (intake.form?.sections ?? [])
      .flatMap((section) => section.fields)
      .filter((field) => !boundCodes.has(field.code) && values.fields[field.code] !== undefined)
      .map((field) => {
        const value = values.fields[field.code];
        if ([7, 9, 11].includes(field.fieldType)) {
          try {
            JSON.parse(value);
            return { fieldCode: field.code, valueJson: value };
          } catch {
            /* Plain values use the canonical JSON string representation. */
          }
        }
        return { fieldCode: field.code, valueJson: JSON.stringify(value) };
      }),
  };
}
