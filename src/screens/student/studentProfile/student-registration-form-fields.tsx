import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Grid, Stack, Button, TextField, Typography } from '@mui/material';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { parseFieldConfiguration } from 'src/screens/student/admissions/form-dialog/form-field-presets';

import { StudentCustomRuntimeField } from './student-custom-runtime-field';
import { dependentAdmissionFieldValues } from '../admissions/admission-field-dependencies';
import {
  profileRuleValues,
  profileFieldValue,
  profileFieldOptions,
  serializeProfileField,
  typedRepeatableValues,
  profileSectionRowValues,
  updateTypedRepeatableValue,
  removeTypedRepeatableValue,
  visibleRegistrationSections,
} from './student-record-profile-model';

export function StudentRegistrationFormFields({
  studentId,
  source,
  values,
  editing = false,
  busy = false,
  errors = {},
  onChange,
  onBlur,
}: {
  studentId: string;
  source: RecordRegistrationSource;
  values: Record<string, unknown>;
  editing?: boolean;
  busy?: boolean;
  errors?: Record<string, string | undefined>;
  onChange?: (code: string, value: string) => void;
  onBlur?: (code: string) => void;
}) {
  const editable = new Set(source.formEditableFieldCodes ?? []);
  const masked = new Set(source.formMaskedFieldCodes ?? []);
  const columns = source.definition?.fieldsPerRow ?? 2;
  const sections = visibleRegistrationSections(
    { ...source, currentValues: values },
    false,
    false,
    true,
    true
  );
  const repeatable =
    source.definition?.sections.filter(
      (section) =>
        section.isRepeatable &&
        section.fields.every((field) => field.fieldType === 12 || editable.has(field.code)) &&
        isAdmissionRuleVisible(section.stepVisibilityRuleJson, profileRuleValues(values)) &&
        isAdmissionRuleVisible(section.visibilityRuleJson, profileRuleValues(values))
    ) ?? [];

  return (
    <FormFieldSpacing>
      <Stack spacing={2}>
        {sections.map(({ section, entryIndex, fields }) => {
          const row = profileSectionRowValues(section, values, entryIndex);
          const count = Math.max(
            0,
            ...section.fields.map((field) => typedRepeatableValues(values[field.code]).length)
          );
          const removable =
            editing &&
            repeatable.includes(section) &&
            entryIndex != null &&
            entryIndex === count - 1 &&
            count > (section.minEntries ?? 0);
          return (
            <FormSectionCard
              key={`${section.id}-${entryIndex ?? 'single'}`}
              icon={GlobalIcons.admissionDetails}
              title={`${section.name}${entryIndex != null ? ` ${entryIndex + 1}` : ''}`}
              descriptionTooltip={`Details retained from ${section.name} on the registration form.`}
              action={
                removable ? (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      section.fields
                        .filter((field) => editable.has(field.code))
                        .forEach((field) =>
                          onChange?.(
                            field.code,
                            removeTypedRepeatableValue(values[field.code], entryIndex!)
                          )
                        )
                    }
                  >
                    Remove entry
                  </Button>
                ) : undefined
              }
            >
              <Grid container spacing={2}>
                {fields.map(({ field, value }) => {
                  const fullWidth = [10, 11, 12].includes(field.fieldType);
                  const error =
                    errors[entryIndex != null ? `${field.code}[${entryIndex}]` : field.code] ??
                    errors[field.code];
                  return (
                    <Grid
                      key={field.code}
                      size={{
                        xs: 12,
                        sm: fullWidth || columns === 1 ? 12 : 6,
                        md: fullWidth ? 12 : 12 / columns,
                      }}
                    >
                      {masked.has(field.code) ? (
                        <TextField
                          fullWidth
                          size="small"
                          label={field.label}
                          value="Restricted"
                          disabled
                        />
                      ) : field.fieldType === 10 ||
                        parseFieldConfiguration(field.validationJson).format === 'photo' ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {field.label}
                          </Typography>
                          <Typography variant="body2">
                            {profileFieldValue(
                              field,
                              value,
                              profileFieldOptions(source, field.code, entryIndex)
                            )}
                          </Typography>
                        </Stack>
                      ) : (
                        <StudentCustomRuntimeField
                          studentId={studentId}
                          source={source}
                          entryIndex={entryIndex}
                          field={field}
                          displayOnly={!editing || field.readOnly || !editable.has(field.code)}
                          value={profileRuleValues({ value }).value}
                          formValues={profileRuleValues(row)}
                          disabled={!editing || busy || field.readOnly || !editable.has(field.code)}
                          error={error}
                          onBlur={() => onBlur?.(field.code)}
                          onChange={(next) => {
                            onChange?.(
                              field.code,
                              entryIndex != null
                                ? updateTypedRepeatableValue(
                                    values[field.code],
                                    entryIndex,
                                    serializeProfileField(field, next)
                                  )
                                : next
                            );
                            Object.entries(
                              dependentAdmissionFieldValues(
                                source.definition?.sections.flatMap((item) => item.fields) ?? [],
                                field.code,
                                profileRuleValues(values),
                                entryIndex,
                                section.fields.map((item) => item.code)
                              )
                            )
                              .filter(([code]) => editable.has(code))
                              .forEach(([code, nextValue]) => onChange?.(code, nextValue));
                          }}
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </FormSectionCard>
          );
        })}
        {editing &&
          repeatable.map((section) => {
            const fields = section.fields.filter((field) => editable.has(field.code));
            const count = Math.max(
              0,
              ...fields.map((field) => typedRepeatableValues(values[field.code]).length)
            );
            return fields.length > 0 && count < (section.maxEntries ?? 1) ? (
              <Box key={section.id}>
                <Button
                  disabled={busy}
                  variant="outlined"
                  onClick={() =>
                    fields.forEach((field) =>
                      onChange?.(
                        field.code,
                        updateTypedRepeatableValue(values[field.code], count, null)
                      )
                    )
                  }
                >
                  Add {section.entryLabel || section.name} entry
                </Button>
              </Box>
            ) : null;
          })}
      </Stack>
    </FormFieldSpacing>
  );
}
