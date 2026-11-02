import type {
  AdmissionFormSection,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { readRepeatableValues } from '../form-repeatable-values';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';

export type CorrectionSection = {
  section: AdmissionFormSection;
  count: number;
  rows: { index: number; values: Record<string, string>; fields: AdmissionFormSection['fields'] }[];
};

export function getEffectiveCorrectionValues(
  definition: AdmissionApplicationForm['definition'],
  initial: Record<string, string>,
  draft: Record<string, string>
): Record<string, string> {
  const effective = { ...draft };
  const candidates = new Set(
    definition.sections.flatMap(({ fields }) =>
      fields.filter(({ code }) => draft[code] !== initial[code]).map(({ code }) => code)
    )
  );
  // Removed candidates never return, so even cyclic conditions finish within the field count.
  while (candidates.size) {
    const writable = new Set(
      getCorrectionSections(definition, effective).flatMap(({ rows }) =>
        rows.flatMap(({ fields }) =>
          fields.filter(({ readOnly }) => !readOnly).map(({ code }) => code)
        )
      )
    );
    const omitted = [...candidates].filter((code) => !writable.has(code));
    if (!omitted.length) break;
    omitted.forEach((code) => {
      if (Object.prototype.hasOwnProperty.call(initial, code)) effective[code] = initial[code];
      else delete effective[code];
      candidates.delete(code);
    });
  }
  return effective;
}

/** Shares the rendered row context across correction visibility, validation and changed-value selection. */
export function getCorrectionSections(
  definition: AdmissionApplicationForm['definition'],
  values: Record<string, string>,
  sectionId?: string,
  includeMinimumRows = false
): CorrectionSection[] {
  return getAdmissionFormStepGroups(definition.sections).flatMap((step) =>
    step.sections.flatMap(({ section }) => {
      if (sectionId && section.id !== sectionId) return [];
      const arrays = Object.fromEntries(
        section.fields.map((field) => [field.code, readRepeatableValues(values[field.code])])
      );
      const count = section.isRepeatable
        ? Math.max(0, ...Object.values(arrays).map((entries) => entries.length))
        : 1;
      const rows = Array.from(
        { length: Math.max(1, count, includeMinimumRows ? (section.minEntries ?? 0) : 0) },
        (_, index) => {
          const rowValues = section.isRepeatable
            ? {
                ...values,
                ...Object.fromEntries(
                  section.fields.map((field) => [field.code, arrays[field.code][index] ?? ''])
                ),
              }
            : values;
          const visible =
            isAdmissionRuleVisible(step.visibilityRuleJson, rowValues) &&
            isAdmissionRuleVisible(section.visibilityRuleJson, rowValues);
          return {
            index,
            values: rowValues,
            fields: visible
              ? section.fields.filter((field) =>
                  isAdmissionRuleVisible(field.visibilityRuleJson, rowValues)
                )
              : [],
          };
        }
      ).filter((row) => row.fields.length > 0);
      return rows.length ? [{ section, count, rows }] : [];
    })
  );
}
