'use client';

import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  Box,
  Alert,
  Stack,
  Table,
  Paper,
  Radio,
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

import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { BulkAdmissionConfigurationFields } from './bulk-admission-configuration-fields';
import {
  bulkOfferingSchema,
  bulkOfferingInitialValues,
  bulkOfferingSelectionSchema,
} from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = { open: boolean; cycle: AdmissionCycle; onClose: () => void };

const STEPS = ['Select classes', 'Configure', 'Preview'];

export function BulkAdmissionOfferingDialog({ open, cycle, onClose }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const formikRef = useRef<FormikProps<BulkOfferingValues> | null>(null);
  const bulk = useBulkAdmissionOffering(cycle, open, onClose);
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
      setActiveStep(1);
      return;
    }

    setIsLoading(true);
    try {
      if (activeStep === 1) {
        const preview = await bulk.previewOfferings(values);
        if (preview) setActiveStep(2);
        return;
      }
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
          <Typography id="bulk-admission-offering-title" variant="h6" component="h2">
            Bulk create offerings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create one admission offering for every selected standard.
          </Typography>
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

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <AdmissionOfferingCycleContext cycle={cycle} />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomStepperWithFormik
          key={cycle.id}
          steps={STEPS}
          activeStep={activeStep}
          initialValues={bulkOfferingInitialValues}
          validationSchema={activeStep === 0 ? bulkOfferingSelectionSchema : bulkOfferingSchema}
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
          nextButtonLabel={activeStep === 0 ? 'Continue' : 'Preview offerings'}
          finalButtonLabel={`Create ${selectedCount} offering${selectedCount === 1 ? '' : 's'}`}
          disableSubmit={
            activeStep === 2 &&
            (!bulk.canSaveInactive ||
              Boolean(formikRef.current?.values.isActive && !bulk.canActivate))
          }
          saveAndNextButtonProps={{
            sx: { minHeight: { xs: 44, sm: 32 } },
            endIcon: activeStep === 1 ? <Iconify icon="mdi:eye-outline" width={18} /> : undefined,
          }}
          renderItem={({ formik }) => {
            formikRef.current = formik;
            return (
              <BulkAdmissionOfferingStep
                activeStep={activeStep}
                formik={formik}
                cycle={cycle}
                bulk={bulk}
              />
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
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle1">Select classes</Typography>
        </Box>
        <BulkAdmissionHierarchyFields
          formik={formik}
          hierarchy={bulk.hierarchy}
          standards={standards}
          loading={bulk.optionsLoading || standardsQuery.isFetching}
          change={change}
        />
        <Typography variant="caption" color="text.secondary">
          One offering will be created for each selected standard.
        </Typography>
      </Stack>
    );
  }

  if (activeStep === 1) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle1">Configure offerings</Typography>
          <Typography variant="body2" color="text.secondary">
            Apply one entry path, published process, and admission window to the selected classes.
          </Typography>
        </Box>
        <BulkAdmissionConfigurationFields
          formik={formik}
          cycle={cycle}
          fetchWorkflows={bulk.fetchWorkflows}
          fetchInquiryForms={bulk.fetchInquiryForms}
          fetchRegistrationForms={bulk.fetchRegistrationForms}
          change={change}
        />
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
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Preview the selected offerings before creating them.</Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
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
