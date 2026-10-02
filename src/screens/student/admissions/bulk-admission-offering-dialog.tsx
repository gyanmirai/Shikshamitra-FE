'use client';

import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useRef, useMemo, useState } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useGetAdmissionIntakeSetupsQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';
import {
  Box,
  Alert,
  Stack,
  Table,
  Paper,
  Radio,
  Button,
  Drawer,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  RadioGroup,
  Typography,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { BulkAdmissionConfigurationFields } from './bulk-admission-configuration-fields';
import { bulkOfferingSchema, bulkOfferingInitialValues } from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = {
  open: boolean;
  cycle: AdmissionCycle;
  initialIntakeSetupId?: string | null;
  onClose: () => void;
};

// Select classes + Configure are merged into step 0; Preview is step 1
const STEPS = ['Select & Configure', 'Preview'];

export function BulkAdmissionOfferingDialog({ open, cycle, initialIntakeSetupId, onClose }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const formikRef = useRef<FormikProps<BulkOfferingValues> | null>(null);
  const bulk = useBulkAdmissionOffering(cycle, open, onClose);
  const setups = useGetAdmissionIntakeSetupsQuery(undefined, { skip: !initialIntakeSetupId });
  const initialSetup = (setups.data ?? []).find((setup) => setup.id === initialIntakeSetupId);
  const initialValues = useMemo<BulkOfferingValues>(
    () => ({
      ...bulkOfferingInitialValues,
      inquiryIntakeProfileId: initialSetup?.inquiryIntakeProfileId ?? '',
      counsellorAssignmentProfileId: initialSetup?.counsellorAssignmentProfileId ?? '',
    }),
    [initialSetup]
  );
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
                title="Bulk create offerings"
                helpText="Create one admission offering for every selected class."
              />
            </Typography>
          </Stack>
        </Box>
        <IconButton
          aria-label="Close bulk admission offering drawer"
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
          key={`${cycle.id}-${initialSetup?.id ?? 'default'}`}
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
          backButtonProps={{ sx: { ml: 'auto', mr: 1 } }}
          nextButtonLabel="Preview offerings"
          finalButtonLabel={`Create ${selectedCount} offering${selectedCount === 1 ? '' : 's'}`}
          disableSubmit={
            activeStep === 1 &&
            (!bulk.canSaveInactive ||
              Boolean(formikRef.current?.values.isActive && !bulk.canActivate))
          }
          saveAndNextButtonProps={{
            endIcon: activeStep === 0 ? <Iconify icon="mdi:eye-outline" width={18} /> : undefined,
          }}
          renderItem={({ formik }) => {
            formikRef.current = formik;
            return (
              <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                {initialIntakeSetupId && setups.isError && (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={() => setups.refetch()}>
                        Retry
                      </Button>
                    }
                  >
                    The selected admission intake setup could not be loaded.
                  </Alert>
                )}
                {initialSetup && (
                  <Alert severity="success">
                    <strong>{initialSetup.name}</strong> is selected. It will provide inquiry
                    handling and counsellor routing for these Offerings.
                  </Alert>
                )}
                <AdmissionOfferingCycleContext cycle={cycle} />
                <BulkAdmissionOfferingStep
                  activeStep={activeStep}
                  formik={formik}
                  cycle={cycle}
                  bulk={bulk}
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
  activeStep,
  formik,
  cycle,
  bulk,
}: {
  activeStep: number;
  formik: FormikProps<BulkOfferingValues>;
  cycle: AdmissionCycle;
  bulk: BulkState;
}) {
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !formik.values.mediumId,
  });
  const standards = (standardsQuery.data ?? []) as Standards[];
  const change = (field: keyof BulkOfferingValues, value: unknown) => {
    bulk.clearPreview();
    formik.setFieldValue(field, value);
  };

  if (activeStep === 0) {
    return (
      <Stack spacing={2}>
        <FormSectionCard
          icon="mdi:school-outline"
          title="Select classes"
          titleTypographyProps={{
            sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
          }}
        >
          {bulk.hierarchyError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={bulk.retryHierarchy}>
                  Retry
                </Button>
              }
            >
              School class options could not be loaded.
            </Alert>
          )}
          {bulk.hierarchyEmpty && !bulk.optionsLoading && (
            <Alert severity="info">No school classes are configured for this academic year.</Alert>
          )}
          {formik.values.mediumId && standardsQuery.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => standardsQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Classes for this medium could not be loaded.
            </Alert>
          )}
          {formik.values.mediumId &&
            standardsQuery.isSuccess &&
            !standardsQuery.isFetching &&
            !standards.length && (
              <Alert severity="info">No classes are configured for this medium.</Alert>
            )}
          <BulkAdmissionHierarchyFields
            formik={formik}
            hierarchy={bulk.hierarchy}
            standards={standards}
            loading={bulk.optionsLoading || standardsQuery.isFetching}
            change={change}
          />
        </FormSectionCard>

        <FormSectionCard
          icon="mdi:cog-outline"
          title="Configure offerings"
          titleTypographyProps={{
            sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
          }}
        >
          <BulkAdmissionConfigurationFields
            formik={formik}
            cycle={cycle}
            fetchWorkflows={bulk.fetchWorkflows}
            fetchInquiryForms={bulk.fetchInquiryForms}
            fetchRegistrationForms={bulk.fetchRegistrationForms}
            change={change}
          />
        </FormSectionCard>
      </Stack>
    );
  }

  return (
    <BulkAdmissionOfferingPreview
      formik={formik}
      bulk={bulk}
      standardNameById={Object.fromEntries(
        bulk.previewStandards.map((standard) => [standard.id, standard.name])
      )}
    />
  );
}

function BulkAdmissionOfferingPreview({
  formik,
  bulk,
  standardNameById,
}: {
  formik: FormikProps<BulkOfferingValues>;
  bulk: BulkState;
  standardNameById: Record<string, string>;
}) {
  if (!bulk.preview) {
    return <Alert severity="warning">Preview the selected offerings before creating them.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1">Preview offerings</Typography>
        <Typography variant="body2" color="text.secondary">
          Review every generated offering and choose what should happen after creation.
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="Admission offering preview">
          <TableHead>
            <TableRow>
              <TableCell>Standard</TableCell>
              <TableCell>Code</TableCell>
              <TableCell align="right">Readiness</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bulk.preview.items.map((item) => {
              const readiness = item.canActivate
                ? { label: 'Ready', color: 'success' as const }
                : item.canSaveInactive
                  ? { label: 'Inactive only', color: 'warning' as const }
                  : { label: 'Needs changes', color: 'error' as const };
              return (
                <TableRow key={item.standardId}>
                  <TableCell>{standardNameById[item.standardId] ?? item.standardId}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell align="right">
                    <Label color={readiness.color}>{readiness.label}</Label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {bulk.preview.items.some((item) => item.errors.length > 0) && (
        <Alert severity="warning">
          {bulk.preview.items
            .flatMap((item) => item.errors.map((error) => error.message))
            .join(' ')}
        </Alert>
      )}

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          After creation
        </Typography>
        <RadioGroup
          value={formik.values.isActive ? 'active' : 'inactive'}
          onChange={(event) => formik.setFieldValue('isActive', event.target.value === 'active')}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Paper variant="outlined" sx={{ flex: 1, px: 1.5, py: 0.5 }}>
              <FormControlLabel
                value="inactive"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="subtitle2">Create as inactive</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Save the batch for later activation.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
            <Paper variant="outlined" sx={{ flex: 1, px: 1.5, py: 0.5 }}>
              <FormControlLabel
                value="active"
                disabled={!bulk.canActivate}
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="subtitle2">Activate ready offerings</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bulk.canActivate
                        ? `Open all ${bulk.preview.items.length} for admissions now.`
                        : 'Resolve readiness issues before activation.'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Stack>
        </RadioGroup>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Nothing is created until you confirm.
      </Typography>
    </Stack>
  );
}
