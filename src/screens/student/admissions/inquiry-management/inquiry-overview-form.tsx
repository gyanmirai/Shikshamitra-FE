'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useSelector } from 'react-redux';
import { useFormik, type FormikProps } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useUpdateAdmissionInquiryMutation,
  useGetAdmissionInquiryCaptureContextQuery,
  useGetAdmissionInquiryCaptureCatalogueQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import AdmissionRuntimeField from '../admission-runtime-field';
import { useAdmissionInquiryAge } from '../use-admission-inquiry-age';
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { useAdmissionFormLanguage } from '../use-admission-form-language';
import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';
import { AdmissionSectionFields } from '../components/admission-section-fields';
import { localizeAdmissionSection, getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  admissionInquirySourceOptions,
  readAdmissionInquiryFormValues,
  type AdmissionInquiryFormValues,
  admissionInquiryLanguageOptions,
  isAdmissionInquiryBirthDateField,
  preserveCompatibleInquiryAnswers,
} from '../admission-inquiry-model';

type InquiryEditorValues = AdmissionInquiryFormValues & { preferredLanguageCode: string };

export function InquiryOverviewForm({
  inquiry,
  readOnly,
  onCancel,
  onDraftChange,
  title = 'Inquiry form',
  fullHeight = false,
}: {
  inquiry: AdmissionInquiry;
  readOnly: boolean;
  onCancel?: () => void;
  onDraftChange?: (state: { dirty: boolean; busy: boolean }) => void;
  title?: string;
  fullHeight?: boolean;
}) {
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
  const [current, setCurrent] = useState(inquiry);
  const previousForm = useRef<{
    id: string;
    fields: ReturnType<typeof getAdmissionInquiryFields>;
  } | null>(null);
  const [requestError, setRequestError] = useState('');
  const [update, updateState] = useUpdateAdmissionInquiryMutation();
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const catalogue = useGetAdmissionInquiryCaptureCatalogueQuery(
    { academicYearId },
    { skip: readOnly, refetchOnMountOrArgChange: true }
  );
  const choices = catalogue.currentData?.offerings ?? [];
  const choicesLoading = catalogue.isFetching;
  const choicesError = catalogue.isError;
  const initial = useMemo(
    () => ({
      admissionCycleId: current.admissionCycleId,
      offeringId: current.admissionOfferingId ?? '',
      boardId: current.boardId ?? '',
      mediumId: current.mediumId ?? '',
      standardId: current.standardId ?? '',
      source: current.source,
      sourceDetail: current.sourceDetail ?? '',
      preferredLanguageCode: current.preferredLanguageCode || 'en',
      sendAcknowledgement: false,
      fields: readAdmissionInquiryFormValues(current.formValues),
    }),
    [current]
  );
  const formik: FormikProps<InquiryEditorValues> = useFormik<InquiryEditorValues>({
    initialValues: initial,
    enableReinitialize: true,
    validate: (values) => {
      if (!form) return { offeringId: 'The original inquiry form could not be loaded.' };
      return validateAdmissionInquiry(values, fields, null, selectedOffering);
    },
    onSubmit: async (values) => {
      if (
        readOnly ||
        readingPhoto ||
        !selectedOffering ||
        !form ||
        loading ||
        (offeringChanged && !runtime.currentData?.availability.canCreateInquiry)
      )
        return;
      setRequestError('');
      ageFeedback.notify();
      const payload = buildAdmissionInquiryPayload(values, fields, selectedOffering);
      try {
        const result = await update({
          id: current.id,
          body: {
            admissionOfferingId: selectedOffering.id,
            boardId: values.boardId,
            mediumId: values.mediumId,
            standardId: values.standardId,
            applicantName: payload.applicantName || current.applicantName,
            phone: payload.phone || current.normalizedPhone,
            email: fields.some(
              (field) =>
                field.bindingKey === 'Guardian.Email' ||
                ['GUARDIAN_EMAIL', 'PARENT_EMAIL'].includes(field.code.toUpperCase())
            )
              ? payload.email
              : current.email,
            source: values.source,
            sourceDetail: values.sourceDetail.trim() || null,
            preferredLanguageCode: values.preferredLanguageCode,
            formValues: payload.formValues,
            concurrencyStamp: current.concurrencyStamp,
          },
        }).unwrap();
        setCurrent(result);
        shikshaMitraToast.success({ message: 'Inquiry details updated.' });
      } catch (error) {
        const message = parseApiProblemDetail(error).detail || 'Unable to update inquiry details.';
        setRequestError(message);
        shikshaMitraToast.error({ message });
      }
    },
  });
  const offeringChanged = formik.values.offeringId !== current.admissionOfferingId;
  const runtime = useGetAdmissionInquiryCaptureContextQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId || readOnly,
    refetchOnMountOrArgChange: true,
  });
  const form = !offeringChanged
    ? (current.formDefinition ?? undefined)
    : (runtime.currentData?.form ?? undefined);
  const formId = form?.id;
  const { language, supportedLanguages, setLanguage } = useAdmissionFormLanguage(
    form,
    `${current.id}:${formik.values.offeringId}`
  );
  const sections = getAdmissionInquirySections(form);
  const fields = getAdmissionInquiryFields(form);
  const ageFeedback = useAdmissionInquiryAge({
    sections,
    values: formik.values.fields,
    context: runtime.currentData,
    enabled: !readOnly && !runtime.isFetching && !runtime.isError,
  });
  const selectedOffering = runtime.currentData?.offering;
  const academicOptions = catalogue.currentData?.academicOptions ?? [];
  const academic = {
    boards: Array.from(
      new Map(
        academicOptions.map((item) => [item.boardId, { id: item.boardId, name: item.boardName }])
      ).values()
    ),
    mediums: Array.from(
      new Map(
        academicOptions
          .filter((item) => item.boardId === formik.values.boardId)
          .map((item) => [item.mediumId, { id: item.mediumId, name: item.mediumName }])
      ).values()
    ),
  };
  const standards = Array.from(
    new Map(
      academicOptions
        .filter(
          (item) =>
            item.boardId === formik.values.boardId && item.mediumId === formik.values.mediumId
        )
        .map((item) => [item.standardId, { id: item.standardId, name: item.standardName }])
    ).values()
  );
  const matching = choices.filter(
    (item) =>
      item.admissionCycleId === current.admissionCycleId &&
      item.boardId === formik.values.boardId &&
      item.mediumId === formik.values.mediumId &&
      item.standardId === formik.values.standardId &&
      item.entryMode !== 1 &&
      item.availabilityStatus === 2 &&
      item.configurationStatus === 1
  );
  const loading = runtime.isFetching;
  const loadError = runtime.isError;
  const locked = readOnly || updateState.isLoading || readingPhoto;
  const errors = formik.errors.fields as Record<string, string> | undefined;
  const touched = formik.touched.fields as Record<string, boolean> | undefined;
  useAdmissionUnsavedChanges(!readOnly, formik.dirty);
  useEffect(() => {
    onDraftChange?.({ dirty: formik.dirty, busy: updateState.isLoading || readingPhoto });
  }, [formik.dirty, onDraftChange, updateState.isLoading, readingPhoto]);

  useEffect(() => {
    if (!formik.dirty) {
      setCurrent(inquiry);
      return;
    }
    // A status or follow-up save updates concurrency without discarding this form draft.
    const unchangedDetails =
      JSON.stringify(current.formValues) === JSON.stringify(inquiry.formValues) &&
      current.admissionOfferingId === inquiry.admissionOfferingId &&
      current.applicantName === inquiry.applicantName &&
      current.normalizedPhone === inquiry.normalizedPhone &&
      current.email === inquiry.email &&
      current.source === inquiry.source &&
      current.sourceDetail === inquiry.sourceDetail;
    if (unchangedDetails)
      setCurrent((previous) => ({ ...previous, concurrencyStamp: inquiry.concurrencyStamp }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry]);
  useEffect(() => {
    if (matching.length === 1 && formik.values.standardId && !formik.values.offeringId)
      formik.setFieldValue('offeringId', matching[0].id, false);
  }, [formik, matching]);
  useEffect(() => {
    if (!form) return;
    const previous = previousForm.current;
    if (previous && previous.id !== form.id && offeringChanged) {
      formik.setFieldValue(
        'fields',
        preserveCompatibleInquiryAnswers(previous.fields, fields, formik.values.fields),
        false
      );
    }
    previousForm.current = { id: form.id, fields };
  }, [form, fields, formik, offeringChanged]);
  // Older snapshots may omit raw identity fallbacks; use the persisted identity without changing the saved form.
  useEffect(() => {
    if (!form || formik.dirty) return;
    const next = { ...formik.values.fields };
    fields.forEach((field) => {
      if (next[field.code] !== undefined) return;
      const identity: Record<string, string | null | undefined> = {
        'Applicant.FirstName': current.applicantFirstName,
        'Applicant.LastName': current.applicantLastName,
        'Applicant.DateOfBirth': current.applicantDateOfBirth,
        'Guardian.FirstName': current.guardianFirstName,
        'Guardian.LastName': current.guardianLastName,
        'Guardian.Mobile': current.normalizedPhone,
        'Guardian.Email': current.email,
      };
      next[field.code] = identity[field.bindingKey ?? ''] ?? field.defaultValue ?? '';
    });
    const hydrated = {
      ...formik.values,
      boardId: formik.values.boardId || selectedOffering?.boardId || current.boardId || '',
      mediumId: formik.values.mediumId || selectedOffering?.mediumId || current.mediumId || '',
      standardId:
        formik.values.standardId || selectedOffering?.standardId || current.standardId || '',
      fields: next,
    };
    if (JSON.stringify(hydrated) !== JSON.stringify(formik.values))
      formik.resetForm({ values: hydrated });
  }, [current, fields, form, formik, selectedOffering]);

  const changeContext = (key: 'boardId' | 'mediumId' | 'standardId', value: string) => {
    formik.setValues((previous) => ({
      ...previous,
      [key]: value,
      offeringId: '',
      ...(key === 'boardId'
        ? { mediumId: '', standardId: '' }
        : key === 'mediumId'
          ? { standardId: '' }
          : {}),
    }));
  };
  const retry = () => {
    if (runtime.isError) runtime.refetch();
    if (catalogue.isError) catalogue.refetch();
  };
  return (
    <Box
      component="form"
      noValidate
      onSubmit={formik.handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...(fullHeight && { flex: 1, height: 1, minHeight: 0, overflow: 'hidden' }),
      }}
    >
      <Box
        role="region"
        aria-label="Inquiry form fields"
        sx={
          fullHeight
            ? { flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }
            : undefined
        }
      >
        <FormBusyRegion
          busy={updateState.isLoading || readingPhoto}
          label={readingPhoto ? 'Reading photo…' : 'Saving inquiry…'}
        >
          <Stack spacing={1}>
            {readOnly && (
              <StudentFeedback notificationKey="STU-0420" presentation="inline" severity="info">
                This historical inquiry is read-only.
              </StudentFeedback>
            )}
            {!readOnly && (
              <SectionCard title={title}>
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                      gap: 3,
                    }}
                  >
                    <TextField
                      select
                      required
                      fullWidth
                      size="small"
                      label="Board"
                      value={formik.values.boardId}
                      disabled={locked || choicesLoading}
                      onChange={(event) => changeContext('boardId', event.target.value)}
                    >
                      {academic.boards.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      required
                      fullWidth
                      size="small"
                      label="Medium"
                      value={formik.values.mediumId}
                      disabled={locked || !formik.values.boardId}
                      onChange={(event) => changeContext('mediumId', event.target.value)}
                    >
                      {academic.mediums.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      required
                      fullWidth
                      size="small"
                      label="Class"
                      value={formik.values.standardId}
                      disabled={locked || !formik.values.mediumId || choicesLoading}
                      onChange={(event) => changeContext('standardId', event.target.value)}
                    >
                      {standards.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      required
                      fullWidth
                      size="small"
                      label="Offering"
                      value={formik.values.offeringId}
                      disabled={locked || choicesLoading || !formik.values.standardId}
                      onChange={(event) => formik.setFieldValue('offeringId', event.target.value)}
                    >
                      {Array.from(
                        new Map(
                          [
                            ...matching,
                            ...(selectedOffering &&
                            selectedOffering.id === current.admissionOfferingId
                              ? [selectedOffering]
                              : []),
                          ].map((item) => [item.id, item])
                        ).values()
                      ).map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name || item.code}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>
              </SectionCard>
            )}
            {(loading || choicesLoading) && <LinearProgress aria-label="Loading inquiry form" />}
            {(loadError || choicesError) && (
              <StudentFeedback
                notificationKey="STU-0421"
                presentation="toast"
                severity="error"
                action={<Button onClick={retry}>Retry</Button>}
              >
                Inquiry form or academic choices could not be loaded.
              </StudentFeedback>
            )}
            {offeringChanged &&
              formik.values.standardId &&
              !choicesLoading &&
              matching.length === 0 && (
                <StudentFeedback
                  notificationKey="STU-0422"
                  presentation="persistent"
                  severity="warning"
                >
                  Selected class has no admission open.
                </StudentFeedback>
              )}
            {offeringChanged &&
              runtime.currentData &&
              !runtime.currentData.availability.canCreateInquiry && (
                <StudentFeedback
                  notificationKey="STU-0423"
                  presentation="persistent"
                  severity="warning"
                >
                  {runtime.currentData.availability.reasonMessage ||
                    'Admission is not open for the selected class.'}
                </StudentFeedback>
              )}
            {form && (
              <Typography variant="body2" color="text.secondary">
                {form.name} · Version {form.version}
              </Typography>
            )}
            {!formId && !loading && (
              <StudentFeedback
                notificationKey="STU-0424"
                presentation="persistent"
                severity="warning"
              >
                The original attached inquiry form is unavailable. Select an open admission offering
                to resolve this historical inquiry.
              </StudentFeedback>
            )}
            {form && !loading && !loadError && supportedLanguages.length > 1 && (
              <Stack direction="row" justifyContent="flex-end">
                <CustomSelect
                  size="small"
                  label="Form language"
                  value={language}
                  options={supportedLanguages.map((code) => ({
                    value: code,
                    label: getAdmissionLanguageLabel(code),
                  }))}
                  onChange={(value) => setLanguage(String(value))}
                  disabled={updateState.isLoading || readingPhoto}
                  formControlProps={{ sx: { width: { xs: 1, sm: 220 } } }}
                />
              </Stack>
            )}
            {!loading &&
              !loadError &&
              form &&
              sections
                .map((section) => localizeAdmissionSection(section, language))
                .filter((section) =>
                  isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields)
                )
                .map((section) => (
                  <SectionCard key={section.id} title={section.name}>
                    <AdmissionSectionFields
                      columns={2}
                      spacing={3}
                      fullWidthFieldTypes={[1, 11, 12]}
                      fields={section.fields.filter((field) =>
                        isAdmissionRuleVisible(field.visibilityRuleJson, formik.values.fields)
                      )}
                      renderField={(field) => (
                        <AdmissionRuntimeField
                          onBusyChange={(busy) => onPhotoReading(field.code, busy)}
                          field={ageFeedback.withAgeHelp(field)}
                          value={formik.values.fields[field.code] ?? ''}
                          disabled={locked || field.readOnly}
                          error={
                            formik.submitCount > 0 || touched?.[field.code]
                              ? errors?.[field.code] &&
                                (field.translations?.[language]?.validationMessage ||
                                  errors[field.code])
                              : undefined
                          }
                          formValues={formik.values.fields}
                          onBlur={() => {
                            if (isAdmissionInquiryBirthDateField(field)) ageFeedback.notify();
                            formik.setFieldTouched(`fields.${field.code}`, true);
                          }}
                          onChange={(value) => formik.setFieldValue(`fields.${field.code}`, value)}
                        />
                      )}
                    />
                  </SectionCard>
                ))}
            <SectionCard title="Inquiry details">
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Source"
                  value={formik.values.source}
                  disabled={locked}
                  onChange={(event) => formik.setFieldValue('source', Number(event.target.value))}
                >
                  {admissionInquirySourceOptions.map((label, value) => (
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Communication language"
                  value={formik.values.preferredLanguageCode}
                  disabled={locked}
                  onChange={formik.handleChange}
                  name="preferredLanguageCode"
                >
                  {admissionInquiryLanguageOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Source details"
                  name="sourceDetail"
                  value={formik.values.sourceDetail}
                  disabled={locked}
                  onChange={formik.handleChange}
                  slotProps={{ htmlInput: { maxLength: 128 } }}
                />
              </Grid>
            </SectionCard>
            {requestError && (
              <StudentFeedback notificationKey="STU-0425" presentation="inline" severity="error">
                {requestError}
              </StudentFeedback>
            )}
            {formik.submitCount > 0 && formik.errors.offeringId && (
              <StudentFeedback notificationKey="STU-0426" presentation="inline" severity="error">
                {formik.errors.offeringId}
              </StudentFeedback>
            )}
          </Stack>
        </FormBusyRegion>
      </Box>
      {!readOnly && (
        <Stack
          component="footer"
          aria-label="Inquiry form actions"
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{
            flexShrink: 0,
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            ...(!fullHeight && { position: 'sticky', bottom: 0, zIndex: 1 }),
          }}
        >
          {onCancel && (
            <Button
              size="small"
              variant="outlined"
              disabled={updateState.isLoading || readingPhoto}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            loading={updateState.isLoading}
            disabled={
              readingPhoto ||
              !formik.dirty ||
              !form ||
              loading ||
              loadError ||
              choicesError ||
              (offeringChanged && !runtime.currentData?.availability.canCreateInquiry)
            }
          >
            Save changes
          </LoadingButton>
        </Stack>
      )}
    </Box>
  );
}
