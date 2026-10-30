import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-applications-api';

import { Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import AdmissionRuntimeField from '../admission-runtime-field';
import { localizeAdmissionSection } from '../form-dialog/form-languages';
import { AdmissionSectionFields } from '../components/admission-section-fields';
import { isAdmissionRuleVisible, readAdmissionFormValue } from '../admission-visibility-rules';

type Props = {
  sections: AdmissionFormSection[];
  values: { fieldCode: string; valueJson?: string | null }[];
  language: string;
};

/** Inquiry-owned context never participates in editable Registration values or validation. */
export function ApplicationInquiryContext({ sections, values, language }: Props) {
  const answers = Object.fromEntries(
    values.map((value) => [value.fieldCode, readAdmissionFormValue(value.valueJson)])
  );
  const visible = sections
    .map((section) => localizeAdmissionSection(section, language))
    .filter(
      (section) =>
        isAdmissionRuleVisible(section.visibilityRuleJson, answers) &&
        isAdmissionRuleVisible(section.stepVisibilityRuleJson, answers)
    )
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) =>
        isAdmissionRuleVisible(field.visibilityRuleJson, answers)
      ),
    }))
    .filter((section) => section.fields.length);
  if (!visible.length) return null;
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {visible.map((section) => (
        <FormSectionCard
          key={section.id}
          title={section.name}
          icon="mdi:link-variant"
          descriptionTooltip="These details belong to the source Inquiry and are shown read-only. Registration does not change them."
        >
          <AdmissionSectionFields
            fields={section.fields}
            columns={2}
            renderField={(field) => (
              <AdmissionRuntimeField
                field={field}
                value={answers[field.code] ?? ''}
                disabled
                formValues={answers}
                onChange={() => undefined}
              />
            )}
          />
        </FormSectionCard>
      ))}
    </Stack>
  );
}
