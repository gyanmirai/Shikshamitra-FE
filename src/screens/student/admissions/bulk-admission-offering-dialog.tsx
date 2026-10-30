'use client';

import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Box, Stack, Button, Drawer, Divider, IconButton, Typography } from '@mui/material';
import { useLazyGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingClassIdentitiesQuery } from 'src/redux/student/admissions/admission-offerings-api';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';
import { BulkAdmissionOfferingPreview } from './bulk-admission-offering-preview';
import { getBulkOfferingFieldIssues } from './bulk-admission-offering-validation';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { AdmissionOfferingRoutingFields } from './admission-offering-routing-fields';
import { BulkAdmissionConfigurationFields } from './bulk-admission-configuration-fields';
import {
  bulkOfferingSchema,
  getConfiguredBulkClassIds,
  bulkOfferingInitialValues,
} from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = {
  open: boolean;
  cycle: AdmissionCycle;
  onClose: () => void;
  onCreated?: (values: BulkOfferingValues) => void;
  onCycleChange?: (cycle: AdmissionCycle) => void;
};

// Select classes + Configure are merged into step 0; Preview is step 1
const STEPS = ['Select & Configure', 'Preview'];
const NO_STANDARDS: Standards[] = [];
const cycleLabel = (cycle: AdmissionCycle) =>
  `${cycle.name} · ${cycle.academicYearName} · ${formatDateOnly(cycle.startDate, 'DD MMM YYYY')} – ${formatDateOnly(cycle.endDate, 'DD MMM YYYY')}`;

export function BulkAdmissionOfferingDialog({
  open,
  cycle,
  onClose,
  onCreated,
  onCycleChange,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [classesReady, setClassesReady] = useState(true);
  const formikRef = useRef<FormikProps<BulkOfferingValues> | null>(null);
  const bulk = useBulkAdmissionOffering(cycle, open, onCreated ?? onClose);
  const [loadCycles, cyclesQuery] = useLazyGetAdmissionCyclesQuery();
  const [cycleOptionsRevision, setCycleOptionsRevision] = useState(0);
  const fetchCycles = useCallback(
    async (search: string, page: number) => {
      const skipCount = (page - 1) * 25;
      // The shared selector sends its display label on reset; do not search the API for that label.
      const selectedCycle = formikRef.current?.values.admissionCycle;
      const query = selectedCycle && search === cycleLabel(selectedCycle) ? '' : search;
      const result = await loadCycles({
        academicYearId: cycle.academicYearId,
        status: 1,
        windowStatus: 1,
        search: query || undefined,
        skipCount,
        maxResultCount: 25,
      }).unwrap();
      return {
        data: result.items.filter(
          (item) =>
            item.academicYearId === cycle.academicYearId &&
            item.status === 1 &&
            item.windowStatus === 1
        ),
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [loadCycles, cycle.academicYearId]
  );
  const [initialValues] = useState(() => ({ ...bulkOfferingInitialValues, admissionCycle: cycle }));
  const selectedCount = bulk.preview?.items.length ?? 0;

  const requestClose = () => {
    if (bulk.loading) return;
    if (
      formikRef.current?.dirty &&
      !window.confirm('You have unsaved changes. Do you want to discard them?')
    )
      return;
    onClose();
  };

  const handleNext = async (
    _isLastStep: boolean,
    values: BulkOfferingValues,
    _formik: FormikProps<BulkOfferingValues>,
    setIsLoading: (value: boolean) => void
  ) => {
    if (activeStep === 0) {
      if (!classesReady) return;
      setIsLoading(true);
      try {
        const preview = await bulk.previewOfferings(values);
        if (preview) setActiveStep(1);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    try {
      await bulk.createOfferings(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={bulk.loading ? undefined : requestClose}
      PaperProps={{
        'aria-labelledby': 'bulk-admission-offering-title',
        sx: {
          width: { xs: 1, sm: 840 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
          '& .MuiInputBase-root': { minHeight: { xs: 44, sm: 'auto' } },
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography id="bulk-admission-offering-title" variant="h6" component="h2">
              <AdmissionDialogTitle
                title="Bulk Create Offerings"
                helpText="Create one admission offering for every selected class."
              />
            </Typography>
          </Stack>
        </Box>
        <IconButton
          aria-label="Close bulk admission offering drawer"
          size="small"
          disabled={bulk.loading}
          onClick={requestClose}
          sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomStepperWithFormik
          steps={STEPS}
          activeStep={activeStep}
          initialValues={initialValues}
          validationSchema={bulkOfferingSchema}
          handleNext={handleNext}
          handleBack={() => setActiveStep((step) => Math.max(0, step - 1))}
          onStepClick={(step) => {
            if (step <= activeStep) setActiveStep(step);
          }}
          isStepClickable={(step) => step <= activeStep}
          completedSteps={activeStep === 1 ? [0] : []}
          validateForwardStepClick
          showSaveButton={false}
          backButtonProps={{ sx: { ml: 'auto', '& + .MuiBox-root': { ml: 0 } } }}
          nextButtonLabel="Preview offerings"
          finalButtonLabel={`Create ${selectedCount} offering${selectedCount === 1 ? '' : 's'}`}
          disableSubmit={activeStep === 1 && !bulk.canSaveInactive}
          saveAndNextButtonProps={{
            disabled: activeStep === 0 && !classesReady,
            endIcon: activeStep === 0 ? <Iconify icon="mdi:eye-outline" width={18} /> : undefined,
          }}
          renderItem={({ formik }) => {
            formikRef.current = formik;
            return (
              <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                {formik.values.admissionCycle && (
                  <AdmissionOfferingCycleContext
                    cycle={formik.values.admissionCycle}
                    showCode={false}
                  />
                )}
                <BulkAdmissionOfferingStep
                  open={open}
                  activeStep={activeStep}
                  formik={formik}
                  scopeCycle={cycle}
                  onCycleChange={onCycleChange}
                  fetchCycles={fetchCycles}
                  cycleOptionsRevision={cycleOptionsRevision}
                  cycleOptionsError={cyclesQuery.isError}
                  retryCycles={() => setCycleOptionsRevision((revision) => revision + 1)}
                  bulk={bulk}
                  onClassesReadyChange={setClassesReady}
                  onEdit={() => {
                    if (!bulk.loading) setActiveStep(0);
                  }}
                />
              </Stack>
            );
          }}
        />
      </Box>
    </Drawer>
  );
}

type BulkState = ReturnType<typeof useBulkAdmissionOffering>;

function BulkAdmissionOfferingStep({
  open,
  activeStep,
  formik,
  scopeCycle,
  onCycleChange,
  fetchCycles,
  cycleOptionsRevision,
  cycleOptionsError,
  retryCycles,
  bulk,
  onClassesReadyChange,
  onEdit,
}: {
  open: boolean;
  activeStep: number;
  formik: FormikProps<BulkOfferingValues>;
  scopeCycle: AdmissionCycle;
  onCycleChange?: (cycle: AdmissionCycle) => void;
  fetchCycles: (
    search: string,
    page: number
  ) => Promise<{ data: AdmissionCycle[]; hasMore: boolean }>;
  cycleOptionsRevision: number;
  cycleOptionsError: boolean;
  retryCycles: () => void;
  bulk: BulkState;
  onClassesReadyChange: (ready: boolean) => void;
  onEdit: () => void;
}) {
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !formik.values.mediumId,
  });
  const standards = (standardsQuery.currentData ?? NO_STANDARDS) as Standards[];
  const canCheckClasses = Boolean(
    open && formik.values.admissionCycle && formik.values.boardId && formik.values.mediumId
  );
  const configuredClassesQuery = useGetAdmissionOfferingClassIdentitiesQuery(
    {
      admissionCycleId: formik.values.admissionCycle?.id ?? '',
      boardId: formik.values.boardId,
      mediumId: formik.values.mediumId,
      campusId: formik.values.campusId,
      track: formik.values.track,
    },
    { skip: !canCheckClasses, refetchOnMountOrArgChange: true }
  );
  const classesReady =
    !canCheckClasses ||
    (configuredClassesQuery.isSuccess &&
      !configuredClassesQuery.isFetching &&
      configuredClassesQuery.currentData !== undefined &&
      standardsQuery.isSuccess &&
      !standardsQuery.isFetching &&
      !standardsQuery.isError);
  const configuredClassIds = useMemo(
    () => getConfiguredBulkClassIds(standards, configuredClassesQuery.currentData ?? []),
    [standards, configuredClassesQuery.currentData]
  );
  const { standardIds } = formik.values;
  const { setValues } = formik;
  const { clearPreview } = bulk;

  useEffect(() => {
    onClassesReadyChange(classesReady);
  }, [classesReady, onClassesReadyChange]);

  useEffect(() => {
    if (activeStep !== 0 || !canCheckClasses || !classesReady) return;
    const remaining = standardIds.filter(
      (id) => standards.some((standard) => standard.id === id) && !configuredClassIds.includes(id)
    );
    if (remaining.length === standardIds.length) return;
    clearPreview();
    setValues(
      (current) => ({
        ...current,
        standardIds: current.standardIds.filter((id) => remaining.includes(id)),
      }),
      true
    );
  }, [
    activeStep,
    canCheckClasses,
    classesReady,
    configuredClassIds,
    standards,
    standardIds,
    setValues,
    clearPreview,
  ]);
  const standardNameById = Object.fromEntries(
    bulk.previewStandards.map((standard) => [standard.id, standard.name])
  );
  const fieldIssues = getBulkOfferingFieldIssues(bulk.preview, standardNameById);
  const change = (updates: Partial<BulkOfferingValues>) => {
    bulk.clearPreview();
    formik.setValues({ ...formik.values, ...updates }, true);
  };

  return (
    <>
      {/* Preserve remote-select labels as well as Formik values when returning from Preview. */}
      <Box hidden={activeStep !== 0}>
        <Stack spacing={2}>
          <FormSectionCard
            icon="mdi:school-outline"
            title="Select classes"
            titleTypographyProps={{
              sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
            }}
          >
            <ShakingTextField
              error={Boolean(
                (formik.touched.admissionCycle && formik.errors.admissionCycle) ||
                fieldIssues.admissionCycle?.blocking
              )}
              sx={{ mb: 1 }}
            >
              <PaginatedSearchSelect<AdmissionCycle, false, true>
                key={cycleOptionsRevision}
                fullWidth
                size="small"
                label="Admission cycle *"
                disableClearable
                name="admissionCycle"
                value={formik.values.admissionCycle ?? undefined}
                fetchOptions={fetchCycles}
                minChars={0}
                getOptionLabel={cycleLabel}
                filterOptions={(options) => options}
                getOptionKey={(item) => item.id}
                isOptionEqualToValue={(item, selected) => item.id === selected.id}
                onChange={(_, selected) => {
                  if (!selected || selected.id === formik.values.admissionCycle?.id) return;
                  bulk.clearPreview();
                  formik.setValues(
                    {
                      ...formik.values,
                      admissionCycle: selected,
                      useCycleDates: true,
                      openDate: null,
                      closeDate: null,
                    },
                    true
                  );
                  formik.setFieldTouched('admissionCycle', true, false);
                  onCycleChange?.(selected);
                }}
                onBlur={() => formik.setFieldTouched('admissionCycle', true)}
                error={Boolean(
                  (formik.touched.admissionCycle && formik.errors.admissionCycle) ||
                  fieldIssues.admissionCycle?.blocking
                )}
                helperText={
                  formik.touched.admissionCycle && formik.errors.admissionCycle
                    ? String(formik.errors.admissionCycle)
                    : (fieldIssues.admissionCycle?.message ?? '')
                }
                noOptionsText={
                  cycleOptionsError
                    ? 'Admission cycles could not be loaded. Use Retry.'
                    : 'No published and open admission cycles found for this academic year'
                }
              />
            </ShakingTextField>
            <Box sx={{ mb: 1 }}>
              <AdmissionOfferingRoutingFields
                values={formik.values}
                onChange={({ track, entryMode }) =>
                  change({
                    track,
                    entryMode,
                    standardIds: [],
                    workflowDefinitionId: '',
                    inquiryFormDefinitionId: '',
                    inquiryIntakeProfileId: '',
                  })
                }
                onBlur={(field) => formik.setFieldTouched(field, true)}
                feedback={Object.fromEntries(
                  (['track', 'entryMode'] as const).map((field) => [
                    field,
                    {
                      error: Boolean(
                        (formik.touched[field] && formik.errors[field]) ||
                        fieldIssues[field]?.blocking
                      ),
                      helperText:
                        formik.touched[field] && formik.errors[field]
                          ? String(formik.errors[field])
                          : fieldIssues[field]?.message,
                    },
                  ])
                )}
              />
            </Box>
            {cycleOptionsError && (
              <StudentFeedback
                notificationKey="STU-0297"
                presentation="toast"
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={retryCycles}>
                    Retry
                  </Button>
                }
              >
                Admission cycles could not be loaded.
              </StudentFeedback>
            )}
            {bulk.hierarchyError && (
              <StudentFeedback
                notificationKey="STU-0298"
                presentation="toast"
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={bulk.retryHierarchy}>
                    Retry
                  </Button>
                }
              >
                School class options could not be loaded.
              </StudentFeedback>
            )}
            {bulk.hierarchyEmpty && !bulk.optionsLoading && (
              <StudentFeedback notificationKey="STU-0299" presentation="inline" severity="info">
                No school classes are configured for this academic year.
              </StudentFeedback>
            )}
            {formik.values.mediumId && standardsQuery.isError && (
              <StudentFeedback
                notificationKey="STU-0300"
                presentation="toast"
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => standardsQuery.refetch()}>
                    Retry
                  </Button>
                }
              >
                Classes for this medium could not be loaded.
              </StudentFeedback>
            )}
            {formik.values.mediumId &&
              standardsQuery.isSuccess &&
              !standardsQuery.isFetching &&
              !standards.length && (
                <StudentFeedback notificationKey="STU-0301" presentation="inline" severity="info">
                  No classes are configured for this medium.
                </StudentFeedback>
              )}
            <BulkAdmissionHierarchyFields
              formik={formik}
              hierarchy={bulk.hierarchy}
              standards={standards}
              loading={bulk.optionsLoading || standardsQuery.isFetching}
              change={change}
              fieldIssues={fieldIssues}
              configuredClassIds={configuredClassIds}
              configuredOfferings={configuredClassesQuery.currentData}
              classesDisabled={!canCheckClasses}
              classesLoading={canCheckClasses && !classesReady && !configuredClassesQuery.isError}
              classesError={canCheckClasses && configuredClassesQuery.isError}
              retryClasses={() => configuredClassesQuery.refetch()}
            />
          </FormSectionCard>

          <FormSectionCard
            icon="mdi:cog-outline"
            title="Configure offerings"
            descriptionTooltip={
              formik.values.track === 1
                ? 'RTE starts with Registration. Choose a published workflow that starts with a Registration Form and has no Inquiry or Entrance Assessment stage.'
                : formik.values.entryMode === 1
                  ? 'Choose a published workflow that starts with a Registration Form and has no Inquiry stage.'
                  : 'Workflow and Inquiry form are required before activation. Inactive preparation is allowed without them.'
            }
            titleTypographyProps={{
              sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
            }}
          >
            <Box hidden={!formik.values.admissionCycle}>
              <BulkAdmissionConfigurationFields
                formik={formik}
                fetchWorkflows={bulk.fetchWorkflows}
                fetchInquiryForms={bulk.fetchInquiryForms}
                change={change}
                fieldIssues={fieldIssues}
              />
            </Box>
            {!formik.values.admissionCycle && (
              <Typography variant="body2" color="text.secondary">
                Select an admission cycle to configure the workflow and forms.
              </Typography>
            )}
          </FormSectionCard>
        </Stack>
      </Box>
      {activeStep === 1 && (
        <BulkAdmissionOfferingPreview
          preview={bulk.preview}
          canCreate={bulk.canSaveInactive}
          standardNameById={standardNameById}
          onEdit={onEdit}
          busy={bulk.loading}
          track={formik.values.track}
          entryMode={formik.values.entryMode}
        />
      )}
    </>
  );
}
