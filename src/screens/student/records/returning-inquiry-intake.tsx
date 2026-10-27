import type { ReturnInquiryIntake } from 'src/redux/student/records/student-record-transitions-api';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { Grid, Stack, Button, TextField, Typography } from '@mui/material';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';

import AdmissionRuntimeField from '../admissions/admission-runtime-field';
import { isAdmissionRuleVisible } from '../admissions/admission-visibility-rules';
import { admissionInquirySourceOptions } from '../admissions/admission-inquiry-model';
import { getDependentAdmissionFieldCodes } from '../admissions/admission-field-dependencies';
import {
  localizeAdmissionSection,
  getAdmissionLanguageLabel,
} from '../admissions/form-dialog/form-languages';
import {
  readRepeatableValues,
  writeRepeatableValue,
  removeRepeatableEntry,
  getRepeatableEntryCount,
} from '../admissions/form-repeatable-values';

import type { ReturningInquiryValues } from './returning-inquiry-model';

type Props = {
  intake: ReturnInquiryIntake;
  values: ReturningInquiryValues;
  errors?: { source?: string; sourceDetail?: string; fields?: Record<string, string | undefined> };
  disabled: boolean;
  onChange: (values: ReturningInquiryValues) => void;
};

export default function ReturningInquiryIntake({
  intake,
  values,
  errors,
  disabled,
  onChange,
}: Props) {
  const boundCodes = new Set(intake.serverBoundFieldCodes);
  const sections = (intake.form?.sections ?? [])
    .map((section) => localizeAdmissionSection(section, values.preferredLanguageCode))
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const allFields = sections.flatMap((section) => section.fields);
  const updateField = (code: string, value: string) => {
    if (boundCodes.has(code)) return;
    const fields = { ...values.fields, [code]: value };
    getDependentAdmissionFieldCodes(allFields, code)
      .filter((dependent) => !boundCodes.has(dependent))
      .forEach((dependent) => {
        fields[dependent] = '';
      });
    onChange({ ...values, fields });
  };
  return (
    <Stack component={FormFieldSpacing} spacing={2}>
      <FormSectionCard
        icon={GlobalIcons.admissionDetails}
        title="Inquiry Details"
        descriptionTooltip="The approved request follows this school’s inquiry form. Permanent identity and linked guardian details are read-only; changes use Changes & Approvals."
      >
        <CustomSelect
          label="Inquiry source"
          value={values.source}
          options={intake.allowedSources.map((value) => ({
            value,
            label: admissionInquirySourceOptions[value],
          }))}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              ...values,
              source:
                value === ''
                  ? ''
                  : (Number(value) as Exclude<ReturningInquiryValues['source'], ''>),
              sourceDetail: '',
            })
          }
          error={Boolean(errors?.source)}
          helperText={errors?.source}
        />
        <TextField
          label="Source details"
          value={values.sourceDetail}
          disabled={disabled}
          onChange={(event) => onChange({ ...values, sourceDetail: event.target.value })}
          error={Boolean(errors?.sourceDetail)}
          helperText={errors?.sourceDetail}
          slotProps={{ htmlInput: { maxLength: 128 } }}
          fullWidth
          size="small"
        />
        {intake.requireGuardianEmail && (
          <Typography variant="body2" color="text.secondary">
            The school requires a guardian email. Staff will verify the saved contact during review.
          </Typography>
        )}
        {intake.requireApplicantDateOfBirth && (
          <Typography variant="body2" color="text.secondary">
            The school requires the student’s date of birth on the permanent profile.
          </Typography>
        )}
        {(intake.form?.supportedLanguages?.length ?? 0) > 1 && (
          <CustomSelect
            label="Inquiry form language"
            value={values.preferredLanguageCode}
            options={(intake.form?.supportedLanguages ?? []).map((value) => ({
              value,
              label: getAdmissionLanguageLabel(value),
            }))}
            disabled={disabled}
            onChange={(value) => onChange({ ...values, preferredLanguageCode: String(value) })}
          />
        )}
      </FormSectionCard>
      {sections
        .filter((section) => isAdmissionRuleVisible(section.visibilityRuleJson, values.fields))
        .map((section) => {
          const count = section.isRepeatable
            ? getRepeatableEntryCount(
                section.fields.map((field) => values.fields[field.code]),
                section.minEntries
              )
            : 1;
          return (
            <FormSectionCard
              key={section.id}
              icon={GlobalIcons.admissionStudent}
              title={section.name}
              descriptionTooltip={`Complete the ${section.name} fields.`}
            >
              {Array.from({ length: count }, (_, index) => {
                const rowValues = section.isRepeatable
                  ? {
                      ...values.fields,
                      ...Object.fromEntries(
                        section.fields.map((field) => [
                          field.code,
                          readRepeatableValues(values.fields[field.code])[index] ?? '',
                        ])
                      ),
                    }
                  : values.fields;
                return (
                  <Stack key={index} spacing={2}>
                    {section.isRepeatable && (
                      <Typography variant="subtitle2">
                        {section.entryLabel || section.name} {index + 1}
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      {section.fields
                        .filter((field) =>
                          isAdmissionRuleVisible(field.visibilityRuleJson, rowValues)
                        )
                        .sort((left, right) => left.displayOrder - right.displayOrder)
                        .map((field) => (
                          <Grid
                            key={field.code}
                            size={{ xs: 12, sm: [1, 11, 12].includes(field.fieldType) ? 12 : 6 }}
                          >
                            <AdmissionRuntimeField
                              field={field}
                              value={rowValues[field.code] ?? ''}
                              formValues={rowValues}
                              disabled={disabled || field.readOnly || boundCodes.has(field.code)}
                              error={errors?.fields?.[field.code]}
                              onChange={(value) =>
                                updateField(
                                  field.code,
                                  section.isRepeatable
                                    ? writeRepeatableValue(values.fields[field.code], index, value)
                                    : value
                                )
                              }
                            />
                          </Grid>
                        ))}
                    </Grid>
                    {section.isRepeatable && count > Math.max(section.minEntries ?? 0, 1) && (
                      <Button
                        type="button"
                        size="small"
                        disabled={
                          disabled || section.fields.some((field) => boundCodes.has(field.code))
                        }
                        onClick={() =>
                          onChange({
                            ...values,
                            fields: {
                              ...values.fields,
                              ...Object.fromEntries(
                                section.fields.map((field) => [
                                  field.code,
                                  removeRepeatableEntry(values.fields[field.code], index),
                                ])
                              ),
                            },
                          })
                        }
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Remove {section.entryLabel || 'entry'}
                      </Button>
                    )}
                  </Stack>
                );
              })}
              {section.isRepeatable && count < (section.maxEntries ?? 1) && (
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  disabled={disabled || section.fields.some((field) => boundCodes.has(field.code))}
                  onClick={() =>
                    onChange({
                      ...values,
                      fields: {
                        ...values.fields,
                        ...Object.fromEntries(
                          section.fields.map((field) => [
                            field.code,
                            writeRepeatableValue(values.fields[field.code], count, ''),
                          ])
                        ),
                      },
                    })
                  }
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add {section.entryLabel || 'entry'}
                </Button>
              )}
              {section.fields.some((field) => field.fieldType === 10 && field.required) && (
                <StudentFeedback
                  notificationKey="STU-0834"
                  presentation="persistent"
                  severity="warning"
                >
                  This form requires a document. The existing Admissions form does not yet support
                  file upload here; this return cannot complete until its document requirement is
                  resolved.
                </StudentFeedback>
              )}
            </FormSectionCard>
          );
        })}
    </Stack>
  );
}
