'use client';

import type { ReactNode, FormEvent } from 'react';
import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';

import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Switch,
  Skeleton,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import AdmissionRuntimeField from './admission-runtime-field';
import { isAdmissionRuleVisible } from './admission-visibility-rules';
import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';
import {
  admissionInquirySourceOptions,
  getAdmissionInquiryPreferredClassError,
} from './admission-inquiry-model';

export default function AdmissionInquiryFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.toString()
    ? `${studentPaths.enrollment.inquiries}?${searchParams.toString()}`
    : studentPaths.enrollment.inquiries;
  const controller = useAdmissionInquiryDialog(() => router.replace(returnUrl));
  const { formik } = controller;
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocusedSubmit = useRef(0);
  const lastPreferredClassToast = useRef('');
  const [dismissedCapacityOfferingId, setDismissedCapacityOfferingId] = useState('');
  const handleCancel = () => {
    if (controller.busy) return;
    if (formik.dirty && !window.confirm('Discard this unfinished inquiry?')) return;
    router.push(returnUrl);
  };
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;
  const validationMessages = collectValidationMessages(formik.errors);
  const preferredClassError = getAdmissionInquiryPreferredClassError(
    formik.values,
    controller.fields,
    controller.selectedOffering
  );
  const notifyPreferredClassError = () => {
    if (!preferredClassError) return;
    const key = `${formik.values.offeringId}:${formik.values.fields[preferredClassError.fieldCode]}`;
    if (lastPreferredClassToast.current === key) return;
    lastPreferredClassToast.current = key;
    shikshaMitraToast.warning({ message: preferredClassError.message });
  };
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    notifyPreferredClassError();
    formik.handleSubmit(event);
  };
  useEffect(() => {
    if (
      !formik.submitCount ||
      !validationMessages.length ||
      lastFocusedSubmit.current === formik.submitCount
    )
      return;
    const invalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!invalidField) return;
    lastFocusedSubmit.current = formik.submitCount;
    invalidField.focus();
    invalidField.scrollIntoView({ block: 'center' });
  }, [formik.submitCount, validationMessages]);
  const hierarchySelected = Boolean(
    formik.values.boardId && formik.values.mediumId && formik.values.standardId
  );

  const changeHierarchy = (field: 'boardId' | 'mediumId' | 'standardId', value: string) => {
    formik.setFieldValue(field, value);
    formik.setFieldValue('offeringId', '');
    formik.setFieldValue('fields', {});
    if (field === 'boardId') {
      formik.setFieldValue('mediumId', '');
      formik.setFieldValue('standardId', '');
    }
    if (field === 'mediumId') formik.setFieldValue('standardId', '');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="New inquiry"
        description="Choose an offering and capture the family's details to create an inquiry."
        isBack
        onBack={handleCancel}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Inquiries', href: studentPaths.enrollment.inquiries },
          { name: 'New inquiry' },
        ]}
      />
      <Paper
        ref={formRef}
        component="form"
        variant="outlined"
        noValidate
        onSubmit={handleFormSubmit}
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {controller.offeringsLoading && <LinearProgress />}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}>
          <Stack spacing={2}>
            {controller.offeringsError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<Iconify icon="mdi:refresh" />}
                    onClick={controller.retryOfferings}
                  >
                    Retry
                  </Button>
                }
              >
                Open admission offerings could not be loaded.
              </Alert>
            )}
            {!controller.offeringsLoading &&
              !controller.offeringsError &&
              controller.boards.length === 0 && (
                <Alert severity="warning">
                  No open, ready admission offering is available. Configure and activate an offering
                  in Admission Offering settings before creating an inquiry.
                </Alert>
              )}

            {controller.academicError && (
              <Alert
                severity="error"
                action={<Button onClick={controller.retryAcademic}>Retry</Button>}
              >
                Academic choices could not be loaded.
              </Alert>
            )}
            <InquiryFormSection title="Admission interest">
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Admission period"
                value={formik.values.admissionCycleId ?? ''}
                disabled={controller.busy || controller.academicLoading}
                error={Boolean(formik.touched.admissionCycleId && formik.errors.admissionCycleId)}
                helperText={formik.touched.admissionCycleId && formik.errors.admissionCycleId}
                onChange={(event) =>
                  formik.setValues((current) => ({
                    ...current,
                    admissionCycleId: event.target.value,
                    boardId: '',
                    mediumId: '',
                    standardId: '',
                    offeringId: '',
                    fields: {},
                  }))
                }
              >
                {controller.periods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.name}
                  </MenuItem>
                ))}
              </TextField>
              <ShakingTextField error={Boolean(formik.touched.boardId && formik.errors.boardId)}>
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Board"
                  name="boardId"
                  value={formik.values.boardId}
                  disabled={
                    !formik.values.admissionCycleId ||
                    controller.busy ||
                    controller.offeringsLoading ||
                    controller.academicLoading ||
                    controller.academicError ||
                    controller.offeringsError
                  }
                  error={Boolean(formik.touched.boardId && formik.errors.boardId)}
                  helperText={formik.touched.boardId && formik.errors.boardId}
                  onBlur={formik.handleBlur}
                  onChange={(event) => changeHierarchy('boardId', event.target.value)}
                >
                  {controller.boards.map((board) => (
                    <MenuItem key={board.id} value={board.id}>
                      {board.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>

              <ShakingTextField error={Boolean(formik.touched.mediumId && formik.errors.mediumId)}>
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Medium"
                  name="mediumId"
                  value={formik.values.mediumId}
                  disabled={
                    !formik.values.boardId ||
                    controller.busy ||
                    controller.offeringsLoading ||
                    controller.academicLoading
                  }
                  error={Boolean(formik.touched.mediumId && formik.errors.mediumId)}
                  helperText={formik.touched.mediumId && formik.errors.mediumId}
                  onBlur={formik.handleBlur}
                  onChange={(event) => changeHierarchy('mediumId', event.target.value)}
                >
                  {controller.mediums.map((medium) => (
                    <MenuItem key={medium.id} value={medium.id}>
                      {medium.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>

              <ShakingTextField
                error={Boolean(formik.touched.standardId && formik.errors.standardId)}
              >
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Class"
                  name="standardId"
                  value={formik.values.standardId}
                  disabled={
                    !formik.values.mediumId ||
                    controller.busy ||
                    controller.offeringsLoading ||
                    controller.academicLoading
                  }
                  error={Boolean(formik.touched.standardId && formik.errors.standardId)}
                  helperText={formik.touched.standardId && formik.errors.standardId}
                  onBlur={formik.handleBlur}
                  onChange={(event) => changeHierarchy('standardId', event.target.value)}
                >
                  {controller.standards.map((standard) => (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.name}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>

              {hierarchySelected && (
                <ShakingTextField
                  error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
                >
                  <TextField
                    select
                    fullWidth
                    required
                    size="small"
                    label="Offering"
                    name="offeringId"
                    value={formik.values.offeringId}
                    disabled={controller.busy || controller.offerings.length === 0}
                    error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
                    helperText={
                      controller.offerings.length === 0
                        ? 'Selected class has no admission open.'
                        : formik.touched.offeringId && formik.errors.offeringId
                    }
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue('offeringId', event.target.value);
                      formik.setFieldValue('fields', {});
                      setDismissedCapacityOfferingId('');
                    }}
                  >
                    {controller.offerings.map((offering) => (
                      <MenuItem key={offering.id} value={offering.id}>
                        {[
                          offering.name || offering.code,
                          offering.code,
                          offering.campusName,
                          offering.admissionCycleName,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </MenuItem>
                    ))}
                  </TextField>
                </ShakingTextField>
              )}
              {hierarchySelected &&
                !controller.offeringsLoading &&
                !controller.offeringsError &&
                controller.offerings.length === 0 && (
                  <Alert severity="warning" sx={{ gridColumn: '1 / -1' }}>
                    Selected class has no admission open.
                  </Alert>
                )}
              {formik.values.offeringId &&
                !controller.runtimeLoading &&
                !controller.runtimeError &&
                !controller.canCreateInquiry && (
                  <Alert severity="warning" sx={{ gridColumn: '1 / -1' }}>
                    {controller.unavailableReason ||
                      'Admission is not open for the selected class.'}
                  </Alert>
                )}
              {controller.classCapacity &&
                formik.values.offeringId &&
                dismissedCapacityOfferingId !== formik.values.offeringId && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Alert
                      severity={controller.classCapacity.isFull ? 'warning' : 'info'}
                      onClose={() => setDismissedCapacityOfferingId(formik.values.offeringId)}
                    >
                      {controller.classCapacity.capacity == null
                        ? 'Admission room capacity is not set. Division seats are checked during onboarding. You can continue this inquiry.'
                        : `${controller.classCapacity.remainingSeats} of ${controller.classCapacity.capacity} admission room seats available.`}
                      {controller.classCapacity.isFull &&
                        (controller.canCreateInquiry
                          ? ` ${controller.unavailableReason || 'The configured admission capacity rules allow this inquiry. Division allocation is checked during onboarding.'}`
                          : ' Capacity is full and this offering does not accept further inquiries.')}
                    </Alert>
                  </Box>
                )}
            </InquiryFormSection>

            {controller.runtimeLoading && (
              <InquiryFormSection
                title="Inquiry form"
                description="Loading fields for the selected offering."
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" height={48} />
                ))}
              </InquiryFormSection>
            )}
            {controller.runtimeError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={controller.retryRuntime}>
                    Retry
                  </Button>
                }
              >
                The inquiry form for this offering could not be loaded. Try again.
              </Alert>
            )}
            {controller.sections
              .filter((section) =>
                isAdmissionRuleVisible(section.visibilityRuleJson, formik.values.fields)
              )
              .map((section) => (
                <InquiryFormSection key={section.id} title={section.name}>
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
                          onBusyChange={(busy) => controller.onPhotoReading(field.code, busy)}
                      field={field}
                          value={formik.values.fields[field.code] ?? ''}
                          disabled={controller.busy || controller.formLoading || field.readOnly}
                          error={
                            formik.submitCount > 0 || touchedFields?.[field.code]
                              ? fieldErrors?.[field.code]
                              : undefined
                          }
                          formValues={formik.values.fields}
                          onBlur={() => {
                            formik.setTouched({
                              ...formik.touched,
                              fields: { ...touchedFields, [field.code]: true },
                            });
                            if (preferredClassError?.fieldCode === field.code) {
                              notifyPreferredClassError();
                            }
                          }}
                          onChange={(value) => {
                            if (preferredClassError?.fieldCode === field.code) {
                              lastPreferredClassToast.current = '';
                            }
                            formik.setValues((current) => ({
                              ...current,
                              fields: { ...current.fields, [field.code]: value },
                            }));
                          }}
                        />
                      </Box>
                    ))}
                </InquiryFormSection>
              ))}

            {controller.canCreateInquiry &&
              !controller.runtimeLoading &&
              !controller.runtimeError && (
                <InquiryFormSection title="Inquiry details">
                  <ShakingTextField error={Boolean(formik.touched.source && formik.errors.source)}>
                    <TextField
                      select
                      fullWidth
                      required
                      size="small"
                      name="source"
                      label="Source"
                      value={formik.values.source}
                      disabled={
                        controller.busy || controller.runtimeLoading || controller.runtimeError
                      }
                      error={Boolean(formik.touched.source && formik.errors.source)}
                      helperText={formik.touched.source && formik.errors.source}
                      onBlur={formik.handleBlur}
                      onChange={(event) => {
                        formik.setFieldValue(
                          'source',
                          Number(event.target.value) as AdmissionInquirySource
                        );
                        formik.setFieldValue('sourceDetail', '');
                      }}
                    >
                      {admissionInquirySourceOptions.map((label, index) =>
                        controller.allowedSources.includes(index) ? (
                          <MenuItem key={label} value={index}>
                            {label}
                          </MenuItem>
                        ) : null
                      )}
                    </TextField>
                  </ShakingTextField>
                  <ShakingTextField
                    error={Boolean(formik.touched.sourceDetail && formik.errors.sourceDetail)}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      name="sourceDetail"
                      label="Source details"
                      value={formik.values.sourceDetail}
                      disabled={controller.runtimeLoading || controller.runtimeError}
                      inputProps={{ maxLength: 128 }}
                      error={Boolean(formik.touched.sourceDetail && formik.errors.sourceDetail)}
                      helperText={
                        (formik.touched.sourceDetail || formik.submitCount > 0) &&
                        formik.errors.sourceDetail
                          ? formik.errors.sourceDetail
                          : 'Optional context to help staff trace this inquiry.'
                      }
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                  </ShakingTextField>
                  {controller.canAutoAcknowledge && (
                    <FormControlLabel
                      label="Send acknowledgement automatically after saving"
                      control={
                        <Switch
                          disabled={controller.busy}
                          checked={formik.values.sendAcknowledgement}
                          onChange={(_, checked) =>
                            formik.setFieldValue('sendAcknowledgement', checked)
                          }
                        />
                      }
                    />
                  )}
                </InquiryFormSection>
              )}

            <AdmissionInquiryDuplicateMatches
              matches={controller.matches}
              guardianPhone={controller.currentGuardianPhone}
              busy={controller.busy}
              onUseExisting={controller.useExistingFamily}
              onOpenExisting={(inquiryId) => {
                if (formik.dirty && !window.confirm('Discard this unfinished inquiry?')) return;
                const next = new URLSearchParams(searchParams.toString());
                next.set('inquiryId', inquiryId);
                router.push(`${studentPaths.enrollment.inquiries}?${next.toString()}`);
              }}
              onCreateSeparate={controller.createSeparateFamily}
              overrideReason={controller.duplicateOverrideReason}
              onOverrideReasonChange={controller.setDuplicateOverrideReason}
            />
            {controller.requestError && <Alert severity="error">{controller.requestError}</Alert>}
            {formik.submitCount > 0 && validationMessages.length > 0 && (
              <Alert severity="error">
                {validationMessages.map((message) => (
                  <div key={message}>{message}</div>
                ))}
              </Alert>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Button
            size="small"
            variant="outlined"
            disabled={controller.busy}
            startIcon={<Iconify icon="mdi:close" />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            disabled={
              controller.busy ||
              !controller.canCreateInquiry ||
              controller.academicError ||
              controller.formLoading ||
              controller.workflowLoading ||
              controller.runtimeLoading ||
              controller.runtimeError ||
              controller.offeringsLoading ||
              controller.offeringsError
            }
            loading={controller.busy}
            startIcon={<Iconify icon="mdi:account-plus-outline" />}
          >
            Create inquiry
          </LoadingButton>
        </Stack>
      </Paper>
    </Box>
  );
}

function InquiryFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: { xs: 1.5, sm: 2 } }}
    >
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle1" component="h2">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {children}
        </Box>
      </Stack>
    </Box>
  );
}

function collectValidationMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return [...new Set(Object.values(value).flatMap(collectValidationMessages))];
}
