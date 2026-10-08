'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { useSelector } from 'react-redux';
import { useFormik, type FormikProps } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Alert,
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
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { useAdmissionUnsavedChanges } from '../use-admission-unsaved-changes';
import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  admissionInquirySourceOptions,
  readAdmissionInquiryFormValues,
  type AdmissionInquiryFormValues,
  admissionInquiryLanguageOptions,
  preserveCompatibleInquiryAnswers,
} from '../admission-inquiry-model';

type InquiryEditorValues = AdmissionInquiryFormValues & { preferredLanguageCode: string };

export function InquiryOverviewForm({
  inquiry,
  readOnly,
  onCancel,
  onDraftChange,
  title = 'Inquiry form',
}: {
  inquiry: AdmissionInquiry;
  readOnly: boolean;
  onCancel?: () => void;
  onDraftChange?: (state: { dirty: boolean; busy: boolean }) => void;
  title?: string;
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
  const sections = getAdmissionInquirySections(form);
  const fields = getAdmissionInquiryFields(form);
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
    <Stack component="form" noValidate onSubmit={formik.handleSubmit} spacing={1.5}>
      <Typography variant="subtitle1" component="h2">
        {title}
      </Typography>
      {readOnly && <Alert severity="info">This historical inquiry is read-only.</Alert>}
      {!readOnly && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
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
                  ...(selectedOffering && selectedOffering.id === current.admissionOfferingId
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
      )}
      {(loading || choicesLoading) && <LinearProgress aria-label="Loading inquiry form" />}
      {(loadError || choicesError) && (
        <Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
          Inquiry form or academic choices could not be loaded.
        </Alert>
      )}
      {offeringChanged && formik.values.standardId && !choicesLoading && matching.length === 0 && (
        <Alert severity="warning">Selected class has no admission open.</Alert>
      )}
      {offeringChanged &&
        runtime.currentData &&
        !runtime.currentData.availability.canCreateInquiry && (
          <Alert severity="warning">
            {runtime.currentData.availability.reasonMessage ||
              'Admission is not open for the selected class.'}
          </Alert>
        )}
      {form && (
        <Typography variant="body2" color="text.secondary">
          {form.name} · Version {form.version}
        </Typography>
      )}
      {!formId && !loading && (
        <Alert severity="warning">
          The original attached inquiry form is unavailable. Select an open admission offering to
          resolve this historical inquiry.
        </Alert>
      )}
      {!loading &&
        !loadError &&
        form &&
        sections
          .filter((section) =>
            isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields)
          )
          .map((section) => (
            <Stack key={section.id} spacing={1}>
              <Typography variant="subtitle2" component="h3">
                {section.name}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                {section.fields
                  .filter((field) =>
                    isAdmissionRuleVisible(field.visibilityRuleJson, formik.values.fields)
                  )
                  .map((field) => (
                    <Box
                      key={field.code}
                      sx={{
                        minWidth: 0,
                        gridColumn: [1, 11, 12].includes(field.fieldType) ? '1 / -1' : undefined,
                      }}
                    >
                      <AdmissionRuntimeField
                        onBusyChange={(busy) => onPhotoReading(field.code, busy)}
                        field={field}
                        value={formik.values.fields[field.code] ?? ''}
                        disabled={locked || field.readOnly}
                        error={
                          formik.submitCount > 0 || touched?.[field.code]
                            ? errors?.[field.code]
                            : undefined
                        }
                        formValues={formik.values.fields}
                        onBlur={() => formik.setFieldTouched(`fields.${field.code}`, true)}
                        onChange={(value) => formik.setFieldValue(`fields.${field.code}`, value)}
                      />
                    </Box>
                  ))}
              </Box>
            </Stack>
          ))}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
      </Stack>
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
      {requestError && <Alert severity="error">{requestError}</Alert>}
      {formik.submitCount > 0 && formik.errors.offeringId && (
        <Alert severity="error">{formik.errors.offeringId}</Alert>
      )}
      {!readOnly && (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {onCancel && (
            <Button
              size="small"
              variant="outlined"
              disabled={updateState.isLoading}
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
    </Stack>
  );
}
