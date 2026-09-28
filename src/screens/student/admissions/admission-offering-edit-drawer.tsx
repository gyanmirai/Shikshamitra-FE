'use client';

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
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  Box,
  Link,
  Alert,
  Stack,
  Paper,
  Drawer,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { useAdmissionOfferingEditor } from './use-admission-offering-editor';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { AdmissionOfferingWindowFields } from './admission-offering-window-fields';
import { AdmissionOfferingHierarchyFields } from './admission-offering-hierarchy-fields';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';
import {
  admissionOfferingSchema,
  admissionOfferingIdentitySchema,
} from './admission-offering-schema';
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
  offering: AdmissionOffering;
  saving: boolean;
  onSave: (values: AdmissionOfferingWriteInput, admissionCycleId: string) => Promise<void>;
};

const EDIT_STEPS = ['Class', 'Configure', 'Review'];

export function AdmissionOfferingEditDrawer({
  open,
  onClose,
  cycle,
  offering,
  saving,
  onSave,
}: Props) {
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
    if (activeStep === 0) {
      setActiveStep(1);
      return;
    }

    setIsLoading(true);
    try {
      if (activeStep === 1) {
        const validation = await editor.validateForReview(values);
        if (validation) setActiveStep(2);
        return;
      }
      await editor.save(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={requestClose}
      PaperProps={{
        'aria-labelledby': 'edit-admission-offering-title',
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
          <Typography id="edit-admission-offering-title" variant="h6" component="div">
            <AdmissionDialogTitle
              title="Edit Admission Offering"
              helpText="An offering connects a class and admission track to its entry mode, workflow, and forms."
              helpLabel="Admission offering information"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review the class, update its configuration, then confirm the changes.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close admission offering"
          disabled={saving || editor.validating}
          onClick={requestClose}
          sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <AdmissionOfferingCycleContext cycle={cycle} />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomStepperWithFormik
          key={offering.id}
          steps={EDIT_STEPS}
          activeStep={activeStep}
          initialValues={getOfferingInitialValues(offering)}
          validationSchema={
            activeStep === 0 ? admissionOfferingIdentitySchema : admissionOfferingSchema
          }
          handleNext={handleNext}
          handleBack={() => setActiveStep((step) => Math.max(0, step - 1))}
          onStepClick={(step) => {
            if (step <= activeStep) setActiveStep(step);
          }}
          isStepClickable={(step) => step <= activeStep}
          completedSteps={activeStep === 2 ? [0, 1] : activeStep === 1 ? [0] : []}
          validateForwardStepClick
          showSaveButton={false}
          backButtonProps={{ sx: { minHeight: { xs: 44, sm: 32 } } }}
          nextButtonLabel={activeStep === 0 ? 'Continue' : 'Review changes'}
          finalButtonLabel="Save changes"
          disableSubmit={Boolean(
            activeStep === 2 && formikRef.current?.values.isActive && !editor.readiness?.isValid
          )}
          saveAndNextButtonProps={{
            loading: saving || editor.validating,
            disabled: editor.queryFailed || editor.hierarchyEmpty || optionsFailed,
            sx: { minHeight: { xs: 44, sm: 32 } },
            endIcon: activeStep === 1 ? <Iconify icon="mdi:eye-outline" width={18} /> : undefined,
          }}
          renderItem={({ formik }) => {
            formikRef.current = formik;
            return (
              <AdmissionOfferingEditStep
                activeStep={activeStep}
                formik={formik}
                editor={editor}
                cycle={cycle}
                offering={offering}
                onDirtyChange={setDirty}
                onOptionsFailed={setOptionsFailed}
              />
            );
          }}
        />
      </Box>
    </Drawer>
  );
}

type OfferingEditor = ReturnType<typeof useAdmissionOfferingEditor>;

function AdmissionOfferingEditStep({
  activeStep,
  formik,
  editor,
  cycle,
  offering,
  onDirtyChange,
  onOptionsFailed,
}: {
  activeStep: number;
  formik: FormikProps<AdmissionOfferingFormValues>;
  editor: OfferingEditor;
  cycle: AdmissionCycle;
  offering: AdmissionOffering;
  onDirtyChange: (dirty: boolean) => void;
  onOptionsFailed: (failed: boolean) => void;
}) {
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !formik.values.mediumId,
  });
  const standards = (standardsQuery.data ?? []) as Standards[];

  useEffect(() => onDirtyChange(formik.dirty), [formik.dirty, onDirtyChange]);
  useEffect(
    () => onOptionsFailed(Boolean(standardsQuery.isError)),
    [onOptionsFailed, standardsQuery.isError]
  );

  if (activeStep === 0) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle1">Class and academic scope</Typography>
          <Typography variant="body2" color="text.secondary">
            Confirm the class attached to this admission offering.
          </Typography>
        </Box>
        {(editor.queryFailed || standardsQuery.isError) && (
          <Alert severity="error">
            Some academic options could not be loaded. Retry before saving.
          </Alert>
        )}
        {editor.hierarchyEmpty && (
          <Alert severity="warning">
            No academic hierarchy is configured for this academic year. Configure the board, medium,
            school level, and standards in Institute Setup.{' '}
            <Link href="/setting/academic-setup/" underline="hover">
              Open Institute Setup
            </Link>
          </Alert>
        )}
        {!offering.canEditIdentity && (
          <Alert severity="info">
            Academic identity is locked because applications already reference this offering.
            Operational dates, code, workflow, and forms can still be updated.
          </Alert>
        )}
        <AdmissionOfferingHierarchyFields
          formik={formik}
          hierarchy={editor.hierarchy}
          standards={standards}
          hierarchyLoading={editor.hierarchyLoading}
          standardsLoading={standardsQuery.isFetching}
          identityLocked={!offering.canEditIdentity}
          initialCampus={
            offering.campusId && offering.campusName
              ? { id: offering.campusId, name: offering.campusName, code: '', isActive: true }
              : null
          }
        />
      </Stack>
    );
  }

  if (activeStep === 1) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle1">Configure offering</Typography>
          <Typography variant="body2" color="text.secondary">
            Update its admission window, entry path, published process, and forms.
          </Typography>
        </Box>
        {offering.applicationCount > 0 && (
          <Alert severity="warning" variant="outlined">
            This offering has {offering.applicationCount}{' '}
            {offering.applicationCount === 1 ? 'application' : 'applications'}. Workflow and form
            changes apply only to future applications; existing applications keep their frozen
            versions.
          </Alert>
        )}
        <AdmissionOfferingWindowFields formik={formik} cycle={cycle} />
        <Divider />
        <AdmissionOfferingConfigurationFields
          formik={formik}
          fetchWorkflows={editor.fetchWorkflows}
          fetchInquiryForms={editor.fetchInquiryForms}
          fetchRegistrationForms={editor.fetchRegistrationForms}
          initialWorkflow={
            offering.workflowDefinitionId && offering.workflowName && offering.workflowVersion
              ? {
                  id: offering.workflowDefinitionId,
                  name: offering.workflowName,
                  version: offering.workflowVersion,
                }
              : null
          }
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
          initialApplicationForm={
            offering.applicationFormDefinitionId &&
            offering.applicationFormName &&
            offering.applicationFormVersion
              ? {
                  id: offering.applicationFormDefinitionId,
                  name: offering.applicationFormName,
                  version: offering.applicationFormVersion,
                }
              : null
          }
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box>
        <Typography variant="subtitle1">Review changes</Typography>
        <Typography variant="body2" color="text.secondary">
          Confirm the updated setup before saving this admission offering.
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {formik.values.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formik.values.code}
              </Typography>
            </Box>
            <Label color={formik.values.isActive ? 'success' : 'default'}>
              {formik.values.isActive ? 'Active' : 'Inactive'}
            </Label>
          </Stack>
          <Divider />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
            <ReviewValue
              label="Admission track"
              value={admissionTrackLabels[formik.values.track]}
            />
            <ReviewValue
              label="Entry mode"
              value={admissionEntryModeLabels[formik.values.entryMode]}
            />
            <ReviewValue
              label="Admission window"
              value={formik.values.useCycleDates ? 'Admission Cycle dates' : 'Custom dates'}
            />
          </Stack>
        </Stack>
      </Paper>
      <AdmissionOfferingReadiness result={editor.readiness} />
      <Typography variant="caption" color="text.secondary">
        Saving keeps the current active or inactive state. Use the table action when you need to
        activate or deactivate the offering.
      </Typography>
    </Stack>
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
