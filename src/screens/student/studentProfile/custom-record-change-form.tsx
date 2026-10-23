import type { RootState } from 'src/redux/store';
import type { RecordSnapshot } from 'src/redux/student/records/student-record-changes-api';
import type {
  CustomRecordPayload,
  StudentRecordDetails,
} from 'src/redux/student/records/student-record-details-api';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { useUpdateStudentRecordFormMutation } from 'src/redux/student/records/student-record-details-api';
import { useCreateStudentRecordChangeMutation } from 'src/redux/student/records/student-record-changes-api';
import {
  Box,
  Grid,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { StudentCustomRuntimeField } from './student-custom-runtime-field';
import { StudentRegistrationFormFields } from './student-registration-form-fields';
import {
  profileRuleValues,
  decodeProfileValue,
  serializeProfileField,
  typedRepeatableValues,
  profileSectionRowValues,
  updateTypedRepeatableValue,
  removeTypedRepeatableValue,
  visibleRegistrationSections,
  customProfileValidationErrors,
} from './student-record-profile-model';

const fieldKey = (instance: string, code: string) => `${instance}::${code}`;

export function CustomRecordChangeForm({
  studentId,
  snapshot: loadedSnapshot,
  details: loadedDetails,
  correctsChangeId,
  onSubmitted,
  onDirtyChange,
  onBusyChange,
  onReady,
  formId,
  hideSubmit = false,
  onCanSubmitChange,
  direct = false,
}: {
  studentId: string;
  snapshot: RecordSnapshot;
  details: StudentRecordDetails;
  correctsChangeId?: string;
  onSubmitted: (id: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onReady?: () => void;
  formId?: string;
  hideSubmit?: boolean;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  direct?: boolean;
}) {
  // Keep the values, source schema and concurrency token from the same read for this draft.
  const [snapshot] = useState(loadedSnapshot);
  const [details] = useState(loadedDetails);
  const [clientKey] = useState(() => crypto.randomUUID());
  const [failure, setFailure] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submit, state] = useCreateStudentRecordChangeMutation();
  const [saveForm, saveState] = useUpdateStudentRecordFormMutation();
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const payload = snapshot.data as CustomRecordPayload;
  const canCreate =
    (direct
      ? details.registrationSources.some((source) => source.editableFieldCodes.length > 0)
      : loadedDetails.customDetailsEditable) &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
  const sourceValues = (
    values: Record<string, string>,
    source: StudentRecordDetails['registrationSources'][number]
  ) => ({
    ...(direct
      ? (payload.sources.find((item) => item.formInstanceId === source.formInstanceId)?.values ??
        {})
      : source.currentValues),
    ...Object.fromEntries(
      source.editableFieldCodes.map((code) => [
        code,
        values[fieldKey(source.formInstanceId, code)] ?? '',
      ])
    ),
  });
  const initialValues = Object.fromEntries(
    payload.sources.flatMap((item) => {
      const source = details.registrationSources.find(
        (candidate) => candidate.formInstanceId === item.formInstanceId
      );
      return (source?.editableFieldCodes ?? []).map((code) => [
        fieldKey(item.formInstanceId, code),
        profileRuleValues({ value: item.values[code] }).value,
      ]);
    })
  );
  const form = useFormik<Record<string, string>>({
    initialValues,
    validate: (values) => {
      const errors: Record<string, string> = {};
      details.registrationSources.forEach((source) => {
        if (!source.definition) return;
        const sourceErrors = customProfileValidationErrors(
          source,
          sourceValues(initialValues, source),
          sourceValues(values, source)
        );
        Object.entries(sourceErrors).forEach(([code, message]) => {
          errors[fieldKey(source.formInstanceId, code)] = message;
        });
      });
      return errors;
    },
    onSubmit: async (values) => {
      if (!canCreate || reason.trim().length < 3 || state.isLoading || saveState.isLoading) return;
      setFailure(null);
      const nextPayload: CustomRecordPayload = {
        sources: payload.sources.map((item) => {
          const source = details.registrationSources.find(
            (candidate) => candidate.formInstanceId === item.formInstanceId
          );
          const next = { ...item.values };
          source?.editableFieldCodes.forEach((code) => {
            const key = fieldKey(item.formInstanceId, code);
            if (values[key] === initialValues[key]) return;
            const section = source.definition?.sections.find((candidate) =>
              candidate.fields.some((field) => field.code === code)
            );
            const field = section?.fields.find((candidate) => candidate.code === code);
            if (field)
              next[code] = section?.isRepeatable
                ? typedRepeatableValues(values[key])
                : serializeProfileField(field, values[key]);
          });
          return { ...item, values: next };
        }),
      };
      try {
        const input = {
          studentId,
          clientKey,
          reason: reason.trim(),
          expectedSnapshot: snapshot.snapshot,
          payload: nextPayload,
        };
        const change = direct
          ? await saveForm(input).unwrap()
          : await submit({
              ...input,
              section: 'custom-details',
              correctsChangeId,
            }).unwrap();
        shikshaMitraToast.success({
          message:
            change.status === 'Applied'
              ? 'Student details updated.'
              : 'Change request submitted for review.',
        });
        onDirtyChange?.(false);
        onSubmitted(change.id);
      } catch {
        setFailure(
          direct
            ? 'The student form could not be saved. Your draft has been kept. Check the values and retry; if the record changed, cancel and reopen Edit details.'
            : 'The change could not be submitted. Your draft has been kept. Check the field values; if the record changed, reopen the request with the latest details.'
        );
      }
    },
  });
  const busy = state.isLoading || saveState.isLoading || form.isSubmitting;
  useEffect(() => {
    onCanSubmitChange?.(form.dirty && canCreate && !busy);
  }, [form.dirty, canCreate, busy, onCanSubmitChange]);
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  useEffect(() => {
    onDirtyChange?.(form.dirty || Boolean(reason));
  }, [form.dirty, reason, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(
    () => () => {
      onBusyChange?.(false);
    },
    [onBusyChange]
  );
  if (!canCreate || (!direct && loadedDetails.customDetailsMasked))
    return (
      <StudentFeedback notificationKey="STU-0734" presentation="inline" severity="info">
        You do not have access to change these school details.
      </StudentFeedback>
    );
  return (
    <Box id={formId} component="form" onSubmit={form.handleSubmit} noValidate aria-busy={busy}>
      <FormBusyRegion
        busy={busy}
        label={direct ? 'Saving student form…' : 'Submitting student details change…'}
      >
        <Stack spacing={2}>
          {failure && (
            <StudentFeedback notificationKey="STU-0735" presentation="persistent" severity="error">
              {failure}
            </StudentFeedback>
          )}
          {form.submitCount > 0 && Object.keys(form.errors).length > 0 && (
            <StudentFeedback notificationKey="STU-0736" presentation="inline" severity="error">
              Review the highlighted fields before submitting. {Object.values(form.errors)[0]}
            </StudentFeedback>
          )}
          {loadedSnapshot.snapshot !== snapshot.snapshot && (
            <StudentFeedback
              notificationKey="STU-0737"
              presentation="persistent"
              severity="warning"
            >
              The student record changed while this draft was open. Your draft is preserved; reopen
              the latest details before submitting.
            </StudentFeedback>
          )}
          {details.registrationSources
            .filter(
              (source) => source.definition && (direct || source.editableFieldCodes.length > 0)
            )
            .map((source) => {
              const values = sourceValues(form.values, source);
              if (direct)
                return (
                  <Box key={source.formInstanceId}>
                    <FormSectionHeader
                      icon="mdi:form-select"
                      title={source.formName}
                      description={`Version ${source.formVersion}`}
                    />
                    <Divider sx={{ my: 2 }} />
                    {source.differences
                      .filter(
                        (difference) =>
                          difference.canReview &&
                          source.editableFieldCodes.includes(difference.fieldCode)
                      )
                      .map((difference) => (
                        <StudentFeedback
                          notificationKey="STU-0738"
                          presentation="inline"
                          key={difference.fieldCode}
                          severity="info"
                          sx={{ mb: 1.5 }}
                          action={
                            <Button
                              disabled={busy}
                              onClick={() =>
                                form.setFieldValue(
                                  fieldKey(source.formInstanceId, difference.fieldCode),
                                  profileRuleValues({ value: difference.submittedValue }).value
                                )
                              }
                            >
                              Use submitted value
                            </Button>
                          }
                        >
                          New admission answer available for {difference.label}.
                        </StudentFeedback>
                      ))}
                    <StudentRegistrationFormFields
                      studentId={studentId}
                      source={source}
                      values={values}
                      editing
                      busy={busy}
                      errors={Object.fromEntries(
                        Object.entries(form.errors)
                          .filter(
                            ([key]) =>
                              key.startsWith(`${source.formInstanceId}::`) &&
                              (form.touched[key.split('[')[0]] || form.submitCount > 0)
                          )
                          .map(([key, message]) => [
                            key.slice(source.formInstanceId.length + 2),
                            message,
                          ])
                      )}
                      onChange={(code, value) =>
                        form.setFieldValue(fieldKey(source.formInstanceId, code), value)
                      }
                      onBlur={(code) =>
                        form.setFieldTouched(fieldKey(source.formInstanceId, code), true)
                      }
                    />
                  </Box>
                );
              const display = { ...source, currentValues: values };
              const sections = visibleRegistrationSections(display, false, true, true);
              return (
                <FormSectionCard
                  key={source.formInstanceId}
                  icon="mdi:form-select"
                  title={`${source.formName} · Version ${source.formVersion}`}
                >
                  {source.differences
                    .filter(
                      (difference) =>
                        difference.canReview &&
                        source.editableFieldCodes.includes(difference.fieldCode)
                    )
                    .map((difference) => (
                      <StudentFeedback
                        notificationKey="STU-0739"
                        presentation="inline"
                        key={difference.fieldCode}
                        severity="info"
                        action={
                          <Button
                            disabled={busy}
                            onClick={() =>
                              form.setFieldValue(
                                fieldKey(source.formInstanceId, difference.fieldCode),
                                profileRuleValues({ value: difference.submittedValue }).value
                              )
                            }
                          >
                            Use submitted value
                          </Button>
                        }
                      >
                        New admission answer available for {difference.label}.
                      </StudentFeedback>
                    ))}
                  {sections.map(({ section, entryIndex }) => {
                    const row = profileSectionRowValues(section, values, entryIndex);
                    return (
                      <Stack key={`${section.id}-${entryIndex ?? 'single'}`} spacing={1}>
                        <Typography variant="subtitle2">
                          {section.name}
                          {entryIndex != null ? ` ${entryIndex + 1}` : ''}
                        </Typography>
                        <Grid container spacing={1.5}>
                          {section.fields
                            .filter(
                              (field) =>
                                source.editableFieldCodes.includes(field.code) &&
                                isAdmissionRuleVisible(
                                  field.visibilityRuleJson,
                                  profileRuleValues(row)
                                )
                            )
                            .map((field) => {
                              const key = fieldKey(source.formInstanceId, field.code);
                              const errorKey = entryIndex != null ? `${key}[${entryIndex}]` : key;
                              return (
                                <Grid
                                  key={field.code}
                                  size={{ xs: 12, sm: field.fieldType === 11 ? 12 : 6 }}
                                >
                                  <StudentCustomRuntimeField
                                    studentId={studentId}
                                    source={source}
                                    entryIndex={entryIndex}
                                    field={field}
                                    value={profileRuleValues({ value: row[field.code] }).value}
                                    formValues={profileRuleValues(row)}
                                    disabled={busy || field.readOnly}
                                    error={
                                      form.touched[key] || form.submitCount > 0
                                        ? (form.errors[errorKey] ?? form.errors[key])
                                        : undefined
                                    }
                                    onBlur={() => form.setFieldTouched(key, true)}
                                    onChange={(value) =>
                                      form.setFieldValue(
                                        key,
                                        entryIndex != null
                                          ? updateTypedRepeatableValue(
                                              form.values[key],
                                              entryIndex,
                                              serializeProfileField(field, value)
                                            )
                                          : value
                                      )
                                    }
                                  />
                                </Grid>
                              );
                            })}
                        </Grid>
                        {section.isRepeatable &&
                          section.fields.every(
                            (field) =>
                              field.fieldType === 12 ||
                              source.editableFieldCodes.includes(field.code)
                          ) &&
                          entryIndex != null &&
                          entryIndex ===
                            Math.max(
                              0,
                              ...section.fields.map(
                                (field) => typedRepeatableValues(values[field.code]).length
                              )
                            ) -
                              1 &&
                          entryIndex >= (section.minEntries ?? 0) && (
                            <Button
                              disabled={busy}
                              onClick={() =>
                                section.fields
                                  .filter((field) => source.editableFieldCodes.includes(field.code))
                                  .forEach((field) => {
                                    const key = fieldKey(source.formInstanceId, field.code);
                                    form.setFieldValue(
                                      key,
                                      removeTypedRepeatableValue(form.values[key], entryIndex)
                                    );
                                  })
                              }
                            >
                              Remove entry
                            </Button>
                          )}
                      </Stack>
                    );
                  })}
                  {source.definition?.sections
                    .filter(
                      (section) =>
                        section.isRepeatable &&
                        section.fields.every(
                          (field) =>
                            field.fieldType === 12 || source.editableFieldCodes.includes(field.code)
                        ) &&
                        isAdmissionRuleVisible(
                          section.stepVisibilityRuleJson,
                          profileRuleValues(values)
                        ) &&
                        isAdmissionRuleVisible(
                          section.visibilityRuleJson,
                          profileRuleValues(values)
                        )
                    )
                    .map((section) => {
                      const fields = section.fields.filter((field) =>
                        source.editableFieldCodes.includes(field.code)
                      );
                      const count = Math.max(
                        0,
                        ...fields.map((field) => {
                          const value = decodeProfileValue(values[field.code]);
                          return Array.isArray(value) ? value.length : 0;
                        })
                      );
                      return fields.length > 0 && count < (section.maxEntries ?? 1) ? (
                        <Button
                          key={section.id}
                          disabled={busy}
                          onClick={() =>
                            fields.forEach((field) => {
                              const key = fieldKey(source.formInstanceId, field.code);
                              form.setFieldValue(
                                key,
                                updateTypedRepeatableValue(
                                  form.values[key],
                                  count,
                                  field.fieldType === 11 ? {} : field.fieldType === 7 ? [] : ''
                                )
                              );
                            })
                          }
                        >
                          Add {section.entryLabel || 'entry'}
                        </Button>
                      ) : null;
                    })}
                </FormSectionCard>
              );
            })}
          <TextField
            size="small"
            fullWidth
            label="Reason for change"
            required
            multiline
            minRows={2}
            value={reason}
            disabled={busy}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{ maxLength: 2000 }}
            error={form.submitCount > 0 && reason.trim().length < 3}
            helperText={
              form.submitCount > 0 && reason.trim().length < 3
                ? 'Explain the requested change using at least 3 characters.'
                : undefined
            }
          />
          {busy && (
            <LinearProgress
              aria-label={direct ? 'Saving student form' : 'Submitting student details change'}
            />
          )}
          {!hideSubmit && (
            <Button type="submit" variant="contained" disabled={busy || !form.dirty}>
              {busy ? (direct ? 'Saving…' : 'Submitting…') : direct ? 'Save' : 'Submit'}
            </Button>
          )}
        </Stack>
      </FormBusyRegion>
    </Box>
  );
}
