'use client';

import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  Box,
  Card,
  Link,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { admissionOfferingSchema } from './admission-offering-schema';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';
import { useAdmissionOfferingEditor } from './use-admission-offering-editor';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { AdmissionOfferingHierarchyFields } from './admission-offering-hierarchy-fields';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';
import {
  admissionTrackLabels,
  getOfferingInitialValues,
  admissionEntryModeLabels,
} from './admission-offering-model';

import type { AdmissionOfferingFormValues } from './admission-offering-model';

type Props = {
  open: boolean;
  onClose: () => void;
  cycle: AdmissionCycle;
  offering?: AdmissionOffering | null;
  loadingDetail?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  saving: boolean;
  onSave: (values: AdmissionOfferingWriteInput, admissionCycleId: string) => Promise<void>;
};

const EDIT_STEPS = ['Configure', 'Preview'];

export function AdmissionOfferingEditDrawer(props: Props) {
  const { offering, open, cycle, loadingDetail, onClose, detailError, onRetryDetail } = props;
  if (!offering) {
    return (
      <AdmissionOfferingEditShell open={open} busy={Boolean(loadingDetail)} onClose={onClose}>
        <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Skeleton variant="rounded" height={56} />
          <AdmissionOfferingCycleContext cycle={cycle} showCode={false} />
          {detailError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={onRetryDetail}>
                  Retry
                </Button>
              }
            >
              {detailError}
            </Alert>
          ) : (
            <Box role="status" aria-label="Loading admission offering" aria-busy="true">
              <FormSectionCard icon="mdi:school-outline" title="Class and academic scope">
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={44} />
              </FormSectionCard>
            </Box>
          )}
        </Stack>
      </AdmissionOfferingEditShell>
    );
  }
  return <AdmissionOfferingEditForm {...props} offering={offering} />;
}

function AdmissionOfferingEditShell({
  open,
  busy,
  onClose,
  children,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={busy ? undefined : onClose}
      PaperProps={{
        'aria-labelledby': 'edit-admission-offering-title',
        sx: {
          width: { xs: 1, sm: 840 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Typography
          id="edit-admission-offering-title"
          variant="h6"
          component="h2"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <AdmissionDialogTitle
            title="Edit Admission Offering"
            helpText="Configure the class and offering, then preview your changes before saving. Saving preserves the offering’s active or inactive state."
            helpLabel="Admission offering information"
          />
        </Typography>
        <IconButton
          aria-label="Close admission offering"
          size="small"
          disabled={busy}
          onClick={onClose}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ p: { xs: 1, sm: 2 }, flex: 1, minHeight: 0, display: 'flex' }}>
        <Card
          component="section"
          aria-label="Admission offering editor"
          aria-busy={busy}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </Card>
      </Box>
    </Drawer>
  );
}

function AdmissionOfferingEditForm({
  open,
  onClose,
  cycle,
  offering,
  saving,
  onSave,
}: Omit<Props, 'loadingDetail' | 'detailError' | 'onRetryDetail'> & {
  offering: AdmissionOffering;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const formikRef = useRef<FormikProps<AdmissionOfferingFormValues> | null>(null);
  const editor = useAdmissionOfferingEditor({ open, cycle, offering, onSave });
  useAdmissionUnsavedChanges(open, dirty);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setDirty(false);
      setOptionsFailed(false);
      editor.clearReadiness();
    }
    // The editor is intentionally reset only when a different record opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, offering.id]);

  const requestClose = () => {
    if (saving || editor.validating) return;
    if (dirty && !window.confirm('You have unsaved changes. Do you want to discard them?')) return;
    onClose();
  };

  const handleNext = async (
    _isLastStep: boolean,
    values: AdmissionOfferingFormValues,
    _formik: FormikProps<AdmissionOfferingFormValues>,
    setIsLoading: (value: boolean) => void
  ) => {
    setIsLoading(true);
    try {
      if (activeStep === 0) {
        const validation = await editor.validateForReview(values);
        if (validation) setActiveStep(1);
        return;
      }
      await editor.save(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdmissionOfferingEditShell
      open={open}
      busy={saving || editor.validating}
      onClose={requestClose}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomStepperWithFormik
          key={offering.id}
          steps={EDIT_STEPS}
          activeStep={activeStep}
          initialValues={getOfferingInitialValues(offering)}
          validationSchema={admissionOfferingSchema}
          handleNext={handleNext}
          handleBack={() => setActiveStep((step) => Math.max(0, step - 1))}
          onStepClick={(step) => {
            if (step <= activeStep) setActiveStep(step);
          }}
          isStepClickable={(step) => step <= activeStep}
          completedSteps={activeStep === 1 ? [0] : []}
          validateForwardStepClick
          showSaveButton={false}
          backButtonProps={{ sx: { ml: 'auto', mr: 1 } }}
          nextButtonLabel="Continue"
          finalButtonLabel="Save changes"
          disableSubmit={Boolean(
            activeStep === 1 && formikRef.current?.values.isActive && !editor.readiness?.isValid
          )}
          saveAndNextButtonProps={{
            loading: saving || editor.validating,
            disabled: editor.queryFailed || editor.hierarchyEmpty || optionsFailed,
            // Keep the shared stepper's forward and save icons.
          }}
          renderItem={({ formik }) => {
            formikRef.current = formik;
            return (
              <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                <AdmissionOfferingCycleContext cycle={cycle} showCode={false} />
                <AdmissionOfferingEditStep
                  activeStep={activeStep}
                  formik={formik}
                  editor={editor}
                  offering={offering}
                  onDirtyChange={setDirty}
                  onOptionsFailed={setOptionsFailed}
                />
              </Stack>
            );
          }}
        />
      </Box>
    </AdmissionOfferingEditShell>
  );
}

type OfferingEditor = ReturnType<typeof useAdmissionOfferingEditor>;

function AdmissionOfferingEditStep({
  activeStep,
  formik,
  editor,
  offering,
  onDirtyChange,
  onOptionsFailed,
}: {
  activeStep: number;
  formik: FormikProps<AdmissionOfferingFormValues>;
  editor: OfferingEditor;
  offering: AdmissionOffering;
  onDirtyChange: (dirty: boolean) => void;
  onOptionsFailed: (failed: boolean) => void;
}) {
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !formik.values.mediumId,
  });
  const standards = (standardsQuery.data ?? []) as Standards[];
  const { boards, mediums, stages } = getAdmissionHierarchyOptions(
    editor.hierarchy,
    formik.values.boardId,
    formik.values.mediumId
  );
  useEffect(() => onDirtyChange(formik.dirty), [formik.dirty, onDirtyChange]);
  useEffect(
    () => onOptionsFailed(Boolean(standardsQuery.isError)),
    [onOptionsFailed, standardsQuery.isError]
  );

  return (
    <>
      <Box hidden={activeStep !== 0}>
        <Stack spacing={2}>
          <FormSectionCard
            icon="mdi:school-outline"
            title="Class and academic scope"
            descriptionTooltip={
              offering.canEditIdentity
                ? 'Confirm the board, medium, school level and class attached to this offering.'
                : 'Academic identity is locked because applications already reference this offering. Its operational configuration can still be updated.'
            }
          >
            {(editor.queryFailed || standardsQuery.isError) && (
              <Alert
                severity="error"
                action={
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      if (editor.queryFailed) editor.retryHierarchy();
                      if (standardsQuery.isError) standardsQuery.refetch();
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                Some academic options could not be loaded. Retry before saving.
              </Alert>
            )}
            {editor.hierarchyEmpty && (
              <Alert severity="error">
                No academic hierarchy is configured for this academic year. Configure the board,
                medium, school level, and standards in Institute Setup.{' '}
                <Link href="/setting/academic-setup/" underline="hover">
                  Open Institute Setup
                </Link>
              </Alert>
            )}
            <AdmissionOfferingHierarchyFields
              compact
              showCampus={false}
              formik={formik}
              hierarchy={editor.hierarchy}
              standards={standards}
              hierarchyLoading={editor.hierarchyLoading}
              standardsLoading={standardsQuery.isFetching}
              identityLocked={!offering.canEditIdentity}
            />
          </FormSectionCard>
          <FormSectionCard
            icon="mdi:cog-outline"
            title="Configure offering"
            descriptionTooltip={`Update the offering name, published workflow and inquiry form. The application form comes from the workflow’s Form stage. Intake & assignment is optional; leave it empty for manual assignment.${offering.applicationCount > 0 ? ' Workflow and form changes apply only to future applications; existing applications keep their frozen versions.' : ''}`}
          >
            <AdmissionOfferingConfigurationFields
              compact
              showCode={false}
              twoColumnLayout
              hideConfigurationWarning
              routingLocked={!offering.canEditIdentity}
              formik={formik}
              fetchWorkflows={editor.fetchWorkflows}
              fetchInquiryForms={editor.fetchInquiryForms}
              initialInquiryForm={
                offering.inquiryFormDefinitionId &&
                offering.inquiryFormName &&
                offering.inquiryFormVersion
                  ? {
                      id: offering.inquiryFormDefinitionId,
                      name: offering.inquiryFormName,
                      version: offering.inquiryFormVersion,
                    }
                  : null
              }
              initialWorkflow={
                offering.workflowDefinitionId && offering.workflowName && offering.workflowVersion
                  ? {
                      id: offering.workflowDefinitionId,
                      name: offering.workflowName,
                      version: offering.workflowVersion,
                    }
                  : null
              }
            />
          </FormSectionCard>
        </Stack>
      </Box>
      {activeStep === 1 && (
        <FormSectionCard
          icon="mdi:clipboard-check-outline"
          title="Preview offering"
          descriptionTooltip="Confirm the updated setup before saving. Saving keeps the current active or inactive state; use the table action to activate or deactivate the offering."
        >
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {formik.values.name}
                </Typography>
              </Box>
              <Label color={formik.values.isActive ? 'success' : 'default'}>
                {formik.values.isActive ? 'Active' : 'Inactive'}
              </Label>
            </Stack>
            <Divider />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
              <ReviewValue
                label="Board"
                value={
                  boards.find((item) => item.id === formik.values.boardId)?.name ??
                  offering.boardName ??
                  '—'
                }
              />
              <ReviewValue
                label="Medium"
                value={
                  mediums.find((item) => item.id === formik.values.mediumId)?.name ??
                  offering.mediumName ??
                  '—'
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
              <ReviewValue
                label="School level"
                value={
                  stages.find((item) => item.id === formik.values.stageId)?.name ??
                  offering.stageName ??
                  '—'
                }
              />
              <ReviewValue
                label="Class"
                value={
                  standards.find((item) => item.id === formik.values.standardId)?.name ??
                  offering.standardName ??
                  '—'
                }
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
              <ReviewValue
                label="Admission type"
                value={admissionTrackLabels[formik.values.track]}
              />
              <ReviewValue
                label="Entry mode"
                value={admissionEntryModeLabels[formik.values.entryMode]}
              />
            </Stack>
          </Stack>
          {editor.readiness?.isValid && <Label color="success">Ready</Label>}
          {editor.readiness && !editor.readiness.isValid && (
            <Alert severity="error">
              <Typography variant="subtitle2">Configuration incomplete</Typography>
              {editor.readiness.errors.map((error) => (
                <Typography key={`${error.code}-${error.message}`} variant="body2">
                  {error.message}
                </Typography>
              ))}
            </Alert>
          )}
        </FormSectionCard>
      )}
    </>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
