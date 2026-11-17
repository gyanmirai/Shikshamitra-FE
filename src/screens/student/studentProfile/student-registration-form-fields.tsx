import type { ReactNode } from 'react';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';
import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Button, Divider, TextField, Typography } from '@mui/material';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { parseFieldConfiguration } from 'src/screens/student/admissions/form-dialog/form-field-presets';

import { StudentCustomRuntimeField } from './student-custom-runtime-field';
import { StudentRegistrationFormLayout } from './student-registration-form-layout';
import { AdmissionSectionFields } from '../admissions/components/admission-section-fields';
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
  validationAttempt,
  validationPending,
  onValidateStep,
  sectionAction,
  sectionFooter,
  initialSectionId,
}: {
  studentId: string;
  source: RecordRegistrationSource;
  values: Record<string, unknown>;
  editing?: boolean;
  busy?: boolean;
  errors?: Record<string, string | undefined>;
  onChange?: (code: string, value: string) => void;
  onBlur?: (code: string) => void;
  validationAttempt?: number;
  validationPending?: boolean;
  onValidateStep?: (sectionIds: string[]) => Promise<boolean | string>;
  sectionAction?: (section: AdmissionFormSection) => ReactNode;
  sectionFooter?: (section: AdmissionFormSection) => ReactNode;
  initialSectionId?: string;
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
  const schemaSections = (source.definition?.sections ?? [])
    .filter(
      (section) =>
        // Keep the active editor's header/actions reachable if its own condition hides the fields.
        (editing && section.id === initialSectionId) ||
        (isAdmissionRuleVisible(section.stepVisibilityRuleJson, profileRuleValues(values)) &&
          isAdmissionRuleVisible(section.visibilityRuleJson, profileRuleValues(values)))
    )
    .sort(
      (a, b) =>
        (a.stepDisplayOrder ?? 0) - (b.stepDisplayOrder ?? 0) || a.displayOrder - b.displayOrder
    );
  const entries = schemaSections.flatMap((section) => {
    const rows = sections.filter((entry) => entry.section.id === section.id);
    return rows.length ? rows : [{ section, entryIndex: undefined, fields: [] }];
  });

  return (
    <FormFieldSpacing>
      <StudentRegistrationFormLayout
        stepper={source.definition?.layoutType === 1}
        sections={schemaSections}
        busy={busy}
        errors={errors}
        validationAttempt={validationAttempt}
        validationPending={validationPending}
        onValidateStep={onValidateStep}
        initialSectionId={initialSectionId}
      >
        {(activeSectionIds) => {
          const renderedEntries = entries.filter(
            ({ section }) => !activeSectionIds || activeSectionIds.has(section.id)
          );
          const footerSectionId = [
            ...new Map(renderedEntries.map(({ section }) => [section.id, section])).values(),
          ]
            .filter((section) => Boolean(sectionFooter?.(section)))
            .at(-1)?.id;
          return (
            <Stack spacing={2}>
              {renderedEntries.map((entry) => {
                const { section, entryIndex, fields } = entry;
                const renderedRows = renderedEntries.filter(
                  (item) => item.section.id === section.id
                );
                const firstRendered = renderedRows[0] === entry;
                const lastRendered = renderedRows.at(-1) === entry;
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        {firstRendered && sectionAction?.(section)}
                        {removable ? (
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
                        ) : null}
                      </Stack>
                    }
                  >
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    {!fields.length && (
                      <Typography variant="body2" color="text.secondary">
                        {section.isRepeatable
                          ? 'No saved entries.'
                          : 'No visible fields in this section.'}
                      </Typography>
                    )}
                    <AdmissionSectionFields
                      fields={fields.map(({ field }) => field)}
                      columns={section.fieldsPerRow ?? columns}
                      spacing={2}
                      renderField={(field) => {
                        const value = row[field.code];
                        const error =
                          errors[
                            entryIndex != null ? `${field.code}[${entryIndex}]` : field.code
                          ] ?? errors[field.code];
                        return (
                          <>
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
                                displayOnly={
                                  !editing || field.readOnly || !editable.has(field.code)
                                }
                                value={profileRuleValues({ value }).value}
                                formValues={profileRuleValues(row)}
                                disabled={
                                  !editing || busy || field.readOnly || !editable.has(field.code)
                                }
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
                                      source.definition?.sections.flatMap((item) => item.fields) ??
                                        [],
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
                          </>
                        );
                      }}
                    />
                    {lastRendered && section.id === footerSectionId && sectionFooter?.(section)}
                  </FormSectionCard>
                );
              })}
              {editing &&
                repeatable
                  .filter((section) => !activeSectionIds || activeSectionIds.has(section.id))
                  .map((section) => {
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
          );
        }}
      </StudentRegistrationFormLayout>
    </FormFieldSpacing>
  );
}
