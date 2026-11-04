import type { AdmissionApplicationForm } from 'src/redux/student/admissions/admission-applications-api';
import type { PublicParentRegistrationContext } from 'src/redux/student/admissions/admission-parent-registration-types';

import { readAdmissionFormValue } from 'src/screens/student/admissions/admission-visibility-rules';
import { isAdmissionSiblingField } from 'src/screens/student/admissions/admission-sibling-runtime-field';
import { normalizeAdmissionFormEmailValues } from 'src/screens/student/admissions/admission-email-values';
import {
  getCorrectionSections,
  getEffectiveCorrectionValues,
} from 'src/screens/student/admissions/application-detail/application-form-correction-visibility';

const safeRuntimeBindings =
  /^(Applicant\.(Name|FirstName|MiddleName|LastName|Gender|ProfilePhoto)|Address\.(AddressLine1|AddressLine2|Country|State|City|PostalCode)|PermanentAddress\.(Line1|Line2|Country|State|City|PostalCode|SameAsCurrent))$/i;

export const parentRegistrationValues = (context: PublicParentRegistrationContext) =>
  Object.fromEntries(
    context.values.map((value) => [value.fieldCode, readAdmissionFormValue(value.valueJson)])
  );

/** Match audited staff correction selection and the existing Registration string serialization. */
export function parentRegistrationDraftValues(
  form: AdmissionApplicationForm,
  initial: Record<string, string>,
  draft: Record<string, string>
) {
  const effective = getEffectiveCorrectionValues(
    form.definition,
    initial,
    normalizeAdmissionFormEmailValues(form.definition, draft)
  );
  const writable = new Set(
    getCorrectionSections(form.definition, effective).flatMap(({ rows }) =>
      rows.flatMap(({ fields }) =>
        fields.filter((field) => !field.readOnly).map((field) => field.code)
      )
    )
  );
  return Object.entries(effective)
    .filter(([code, value]) => writable.has(code) && value !== initial[code])
    .map(([fieldCode, value]) => ({ fieldCode, valueJson: JSON.stringify(value) }));
}

/** Public semantic hints improve rendering only. Editable codes remain the write authority. */
export function parentRegistrationForm(
  context: PublicParentRegistrationContext
): AdmissionApplicationForm {
  const sections = context.definition.sections.map((section) => ({
    ...section,
    fields: section.fields
      .filter((field) => !isAdmissionSiblingField(field))
      .map((field) => ({
        ...field,
        bindingType: 0 as const,
        bindingKey:
          field.runtimeBindingKey && safeRuntimeBindings.test(field.runtimeBindingKey)
            ? field.runtimeBindingKey
            : undefined,
        readOnly: field.readOnly || !context.editableFieldCodes.includes(field.code),
      })),
  }));
  return {
    status: 0,
    formVersion: 1,
    definition: { ...context.definition, sections },
  } as AdmissionApplicationForm;
}

export function readableRegistrationValue(value: string, optionsJson?: string | null) {
  if (/^data:image\//i.test(value)) return 'Photo selected';
  let choices: { value: string; label: string }[] = [];
  try {
    const parsed = JSON.parse(optionsJson || '[]');
    if (Array.isArray(parsed)) choices = parsed;
  } catch {
    /* Plain answers have no option list. */
  }
  const label = (answer: string) => choices.find((item) => item.value === answer)?.label || answer;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((answer) => label(String(answer))).join(', ');
    if (parsed && typeof parsed === 'object')
      return (
        parsed.name ||
        parsed.label ||
        Object.values(parsed)
          .filter((item) => typeof item === 'string')
          .join(', ')
      );
  } catch {
    /* Plain text. */
  }
  return value === 'true' ? 'Yes' : value === 'false' ? 'No' : label(value) || '—';
}
