'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useFormik, type FormikProps } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import { Box, Stack, Button, MenuItem, TextField, Typography, LinearProgress } from '@mui/material';
import {
  useUpdateAdmissionInquiryMutation,
  useGetAdmissionInquiryCaptureContextQuery,
  useGetAdmissionInquiryCaptureCatalogueQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import AdmissionRuntimeField from '../admission-runtime-field';
import { useAdmissionInquiryAge } from '../use-admission-inquiry-age';
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { useInquiryPrimaryContact } from '../use-inquiry-primary-contact';
import { useAdmissionFormLanguage } from '../use-admission-form-language';
import { InquiryFamilyConfirmation } from './inquiry-family-confirmation';
import { canonicalInquiryBinding } from '../admission-inquiry-field-bindings';
import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';
import { AdmissionSectionFields } from '../components/admission-section-fields';
import { getDependentAdmissionFieldCodes } from '../admission-field-dependencies';
import { useAdmissionAddressSync, isAdmissionCopiedAddressField } from '../admission-address-sync';
import { localizeAdmissionSection, getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  readAdmissionInquiryFormValues,
  type AdmissionInquiryFormValues,
  isAdmissionInquiryBirthDateField,
  preserveCompatibleInquiryAnswers,
  getAdmissionInquiryPrimaryContact,
  getAdmissionInquiryVisibleSections,
  buildAdmissionInquiryDuplicateInput,
} from '../admission-inquiry-model';

type InquiryEditorValues = AdmissionInquiryFormValues & { preferredLanguageCode: string };

export function InquiryOverviewForm({
  inquiry,
  readOnly,
  onCancel,
  onDraftChange,
  title = 'Inquiry Form',
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
  const [interestExpanded, setInterestExpanded] = useState(true);
  const [familyOpen, setFamilyOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocusedSubmit = useRef(0);
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
      parentRelationship: current.parentRelationship ?? undefined,
      guardianResponsibilityConfirmed: current.guardianResponsibilityConfirmed ?? false,
      capturedParentRelationship: current.parentRelationship ?? undefined,
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
        familyOpen ||
        readingPhoto ||
        !selectedOffering ||
        !form ||
        loading ||
        (offeringChanged && !runtime.currentData?.availability.canCreateInquiry)
      )
        return;
      if (primaryContact.requestConfirmation()) return;
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
                canonicalInquiryBinding(field) ===
                getAdmissionInquiryPrimaryContact(fields, values).emailBinding
            )
              ? payload.email
              : current.email,
            source: payload.source,
            sourceDetail: payload.sourceDetail,
            preferredLanguageCode: payload.preferredLanguageCode,
            formValues: payload.formValues,
            guardianResponsibilityConfirmed: payload.guardianResponsibilityConfirmed,
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
  const sections = getAdmissionInquiryVisibleSections(
    getAdmissionInquirySections(form, formik.values),
    formik.values
  );
  const fields = getAdmissionInquiryFields(form, formik.values);
  useAdmissionAddressSync(
    form?.sections ?? [],
    formik.values.fields,
    (changes) => {
      formik.setValues((currentValues) => ({
        ...currentValues,
        fields: { ...currentValues.fields, ...changes },
      }));
    },
    readOnly || familyOpen || updateState.isLoading || readingPhoto || runtime.isFetching
  );
  const primaryContact = useInquiryPrimaryContact({
    formik,
    fields,
    contextKey: `${current.id}:${formik.values.offeringId}:${form?.id ?? ''}`,
    busy: readOnly || familyOpen || updateState.isLoading || readingPhoto,
  });
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
  const locked = readOnly || familyOpen || updateState.isLoading || readingPhoto;
  const errors = formik.errors.fields as Record<string, string> | undefined;
  const touched = formik.touched.fields as Record<string, boolean> | undefined;
  const hasInterestErrors = ['boardId', 'mediumId', 'standardId', 'offeringId'].some((key) =>
    Boolean(formik.errors[key as keyof typeof formik.errors])
  );
  useEffect(() => {
    if (formik.submitCount && hasInterestErrors) setInterestExpanded(true);
  }, [formik.submitCount, hasInterestErrors]);
  useEffect(() => {
    if (!formik.submitCount) {
      lastFocusedSubmit.current = 0;
      return;
    }
    if (
      formik.isValidating ||
      !Object.keys(formik.errors).length ||
      lastFocusedSubmit.current === formik.submitCount
    )
      return;
    if (hasInterestErrors && !interestExpanded) return;
    const invalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!invalidField) return;
    lastFocusedSubmit.current = formik.submitCount;
    invalidField.focus();
    invalidField.scrollIntoView({ block: 'center' });
  }, [formik.submitCount, formik.isValidating, formik.errors, hasInterestErrors, interestExpanded]);
  useAdmissionUnsavedChanges(!readOnly, formik.dirty);
  useEffect(() => {
    onDraftChange?.({
      dirty: formik.dirty,
      busy: familyOpen || updateState.isLoading || readingPhoto,
    });
  }, [formik.dirty, onDraftChange, familyOpen, updateState.isLoading, readingPhoto]);

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
        'Applicant.Name': current.applicantName,
        'Applicant.FirstName': current.applicantFirstName,
        'Applicant.LastName': current.applicantLastName,
        'Applicant.DateOfBirth': current.applicantDateOfBirth,
        'Guardian.FirstName': current.guardianFirstName,
        'Guardian.LastName': current.guardianLastName,
        'Guardian.Mobile': current.normalizedPhone,
        'Guardian.Email': current.email,
        'Inquiry.ParentRelationship':
          current.primaryContactRelationship ?? current.parentRelationship,
      };
      if (current.parentRelationship === 'father' || current.parentRelationship === 'mother') {
        const prefix = current.parentRelationship === 'father' ? 'Father' : 'Mother';
        identity[`${prefix}.Name`] = [current.guardianFirstName, current.guardianLastName]
          .filter(Boolean)
          .join(' ');
        identity[`${prefix}.Mobile`] = current.normalizedPhone;
        identity[`${prefix}.Email`] = current.email;
      }
      next[field.code] = identity[canonicalInquiryBinding(field) ?? ''] ?? field.defaultValue ?? '';
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
      ref={formRef}
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
        component={FormFieldSpacing}
        role="region"
        aria-label="Inquiry Form Fields"
        sx={
          fullHeight
            ? { flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }
            : undefined
        }
      >
        <FormBusyRegion
          busy={updateState.isLoading || readingPhoto}
          label={readingPhoto ? 'Reading Photo…' : 'Saving Inquiry…'}
        >
          <Stack spacing={2}>
            {readOnly && (
              <StudentFeedback notificationKey="STU-0420" presentation="inline" severity="info">
                This historical inquiry is read-only.
              </StudentFeedback>
            )}
            {!readOnly && (
              <FormSectionCard
                title={title === 'Admission interest' ? 'Admission Interest' : title}
                icon={GlobalIcons.admissionInterest}
                descriptionTooltip="Select the Academic Context and Admission Offering."
                action={
                  <InquiryFamilyConfirmation
                    inquiry={current}
                    readOnly={readOnly}
                    dirty={formik.dirty}
                    busy={
                      updateState.isLoading ||
                      readingPhoto ||
                      formik.isSubmitting ||
                      loading ||
                      choicesLoading
                    }
                    duplicateInput={
                      selectedOffering && form
                        ? buildAdmissionInquiryDuplicateInput(
                            formik.values,
                            fields,
                            selectedOffering
                          )
                        : undefined
                    }
                    onBusyChange={setFamilyOpen}
                    onTargetRefreshed={(result) => {
                      if (
                        result.id !== current.id ||
                        formik.dirty ||
                        updateState.isLoading ||
                        readingPhoto
                      )
                        return null;
                      setCurrent(result);
                      const refreshedValues = {
                        ...formik.values,
                        admissionCycleId: result.admissionCycleId,
                        offeringId: result.admissionOfferingId ?? '',
                        parentRelationship: result.parentRelationship ?? undefined,
                        capturedParentRelationship: result.parentRelationship ?? undefined,
                        guardianResponsibilityConfirmed:
                          result.guardianResponsibilityConfirmed ?? false,
                        fields: readAdmissionInquiryFormValues(result.formValues),
                      };
                      const refreshedOffering = selectedOffering;
                      const refreshedInput =
                        result.formDefinition &&
                        refreshedOffering &&
                        refreshedOffering.id === result.admissionOfferingId
                          ? buildAdmissionInquiryDuplicateInput(
                              refreshedValues,
                              getAdmissionInquiryFields(result.formDefinition, refreshedValues),
                              refreshedOffering
                            )
                          : undefined;
                      return {
                        ...refreshedInput,
                        admissionCycleId: result.admissionCycleId,
                        guardianPhone: refreshedInput?.guardianPhone || result.normalizedPhone,
                        guardianEmail: refreshedInput?.guardianEmail || result.email || undefined,
                        applicantName: refreshedInput?.applicantName || result.applicantName,
                        applicantDateOfBirth:
                          refreshedInput?.applicantDateOfBirth ||
                          result.applicantDateOfBirth ||
                          undefined,
                      };
                    }}
                    onConfirmed={(result) => {
                      if (result.id === current.id && !formik.dirty) setCurrent(result);
                    }}
                  />
                }
                collapsible
                expanded={interestExpanded}
                onExpandedChange={setInterestExpanded}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2,
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
              </FormSectionCard>
            )}
            {(loading || choicesLoading) && <LinearProgress aria-label="Loading Inquiry Form" />}
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
                    'Admission Is Not Open for the Selected Class.'}
                </StudentFeedback>
              )}
            {form && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  {form.name} · version {form.version}
                </Typography>
                {!loading && !loadError && supportedLanguages.length > 1 && (
                  <CustomSelect
                    size="small"
                    label="Form Language"
                    value={language}
                    options={supportedLanguages.map((code) => ({
                      value: code,
                      label: getAdmissionLanguageLabel(code),
                    }))}
                    onChange={(value) => setLanguage(String(value))}
                    disabled={locked}
                    formControlProps={{ sx: { width: 1, maxWidth: { sm: 220 } } }}
                  />
                )}
              </Stack>
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
            {!loading &&
              !loadError &&
              form &&
              sections
                .map((section) => localizeAdmissionSection(section, language))
                .filter((section) =>
                  isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields)
                )
                .map((section) => (
                  <FormSectionCard
                    key={section.id}
                    title={section.name}
                    icon={GlobalIcons.admissionStudent}
                    descriptionTooltip={`Complete The ${section.name} Fields.`}
                  >
                    <AdmissionSectionFields
                      columns={2}
                      spacing={2}
                      fullWidthFieldTypes={[1, 11, 12]}
                      fields={section.fields.filter((field) =>
                        isAdmissionRuleVisible(field.visibilityRuleJson, formik.values.fields)
                      )}
                      renderField={(field) => (
                        <AdmissionRuntimeField
                          academicYearId={academicYearId}
                          academicMediumId={formik.values.mediumId}
                          onBusyChange={(busy) => onPhotoReading(field.code, busy)}
                          field={ageFeedback.withAgeHelp(field)}
                          value={formik.values.fields[field.code] ?? ''}
                          disabled={
                            locked ||
                            field.readOnly ||
                            isAdmissionCopiedAddressField(
                              field,
                              form?.sections ?? [],
                              formik.values.fields
                            )
                          }
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
                          onChange={(value) => {
                            if (primaryContact.changeField(field, value)) return;
                            formik.setFieldValue(`fields.${field.code}`, value);
                            getDependentAdmissionFieldCodes(fields, field.code).forEach((code) =>
                              formik.setFieldValue(`fields.${code}`, '')
                            );
                          }}
                        />
                      )}
                    />
                  </FormSectionCard>
                ))}
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
          aria-label="Inquiry Form Actions"
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
            <Button size="small" variant="outlined" disabled={locked} onClick={onCancel}>
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
              familyOpen ||
              !formik.dirty ||
              !form ||
              loading ||
              loadError ||
              choicesError ||
              (offeringChanged && !runtime.currentData?.availability.canCreateInquiry)
            }
          >
            Save Changes
          </LoadingButton>
        </Stack>
      )}
      {!readOnly && primaryContact.confirmation}
    </Box>
  );
}
