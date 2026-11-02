import type { AdmissionApplicationForm } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';

import { getCorrectionSections } from './application-form-correction-visibility';
import { getDynamicAdmissionValidationErrors } from '../admission-form-validation';

export function getCorrectionValidationErrors(
  definition: AdmissionApplicationForm['definition'],
  values: Record<string, string>,
  sectionId?: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  getCorrectionSections(definition, values, sectionId).forEach(({ section, count, rows }) => {
    if (section.isRepeatable) {
      const anchor = rows[0].fields[0].code;
      const minimum = section.minEntries ?? 0;
      const maximum = section.maxEntries ?? 1;
      if (count < minimum) errors[anchor] = `Add at least ${minimum} entries.`;
      else if (count > maximum) errors[anchor] = `Add no more than ${maximum} entries.`;
      // Empty repeats have a virtual row only to evaluate their visibility.
      if (count === 0) return;
    }
    rows.forEach((row) => {
      const rowErrors = getDynamicAdmissionValidationErrors(
        { sections: [{ fields: row.fields }] },
        row.values
      );
      Object.entries(rowErrors).forEach(([code, message]) => {
        if (typeof message === 'string')
          errors[section.isRepeatable ? `${code}[${row.index}]` : code] = message;
      });
    });
  });
  return errors;
}

export function buildCorrectionYupSchema(definition: AdmissionApplicationForm['definition']) {
  return Yup.object().test('correction-visible-answers', (values) => {
    const errors = getCorrectionValidationErrors(definition, values as Record<string, string>);
    const fieldErrors = Object.entries(errors).map(
      ([path, message]) => new Yup.ValidationError(message, undefined, path)
    );
    if (fieldErrors.length) throw new Yup.ValidationError(fieldErrors);
    return true;
  });
}
