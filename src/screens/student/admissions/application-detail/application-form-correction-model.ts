import type {
  AdmissionApplication,
  AdmissionApplicationForm,
  CorrectAdmissionApplicationFormInput,
} from 'src/redux/student/admissions/admission-applications-api';

import { normalizeAdmissionFormEmailValues } from '../admission-email-values';
import {
  getCorrectionSections,
  getEffectiveCorrectionValues,
} from './application-form-correction-visibility';

export function canCorrectApplicationForm(
  application: Pick<AdmissionApplication, 'status'>,
  form: Pick<AdmissionApplicationForm, 'canCorrectForm'>
) {
  return form.canCorrectForm === true && [1, 4, 5, 6, 7, 8].includes(application.status);
}

export function buildFormCorrection(
  application: Pick<AdmissionApplication, 'id' | 'concurrencyStamp'>,
  form: AdmissionApplicationForm,
  initialValues: Record<string, string>,
  values: Record<string, string>,
  reason: string,
  idempotencyKey: string
): CorrectAdmissionApplicationFormInput {
  const normalized = getEffectiveCorrectionValues(
    form.definition,
    initialValues,
    normalizeAdmissionFormEmailValues(form.definition, values)
  );
  const editableCodes = new Set(
    getCorrectionSections(form.definition, normalized).flatMap(({ rows }) =>
      rows.flatMap(({ fields }) =>
        fields.filter((field) => !field.readOnly).map((field) => field.code)
      )
    )
  );
  return {
    id: application.id,
    concurrencyStamp: application.concurrencyStamp!,
    reason: reason.trim(),
    idempotencyKey,
    values: Object.entries(normalized)
      .filter(([code, value]) => editableCodes.has(code) && value !== initialValues[code])
      .map(([fieldCode, value]) => ({ fieldCode, valueJson: JSON.stringify(value) })),
  };
}

export function isUnconfirmedCorrection(error: unknown) {
  const status = (error as { status?: number | string } | undefined)?.status;
  return typeof status !== 'number' || status >= 500;
}

export function correctionFieldErrors(error: unknown): Record<string, string> {
  const data = (error as { data?: { data?: { FieldErrors?: unknown } } })?.data?.data;
  const errors = data?.FieldErrors;
  return errors && typeof errors === 'object' && !Array.isArray(errors)
    ? Object.fromEntries(
        Object.entries(errors).filter(
          (pair): pair is [string, string] => typeof pair[1] === 'string'
        )
      )
    : {};
}
