'use client';

import type { AdmissionWorkflowRuntimeTransition } from 'src/redux/student/admissions/admission-applications-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, MenuItem, TextField, DialogActions } from '@mui/material';

type RuntimeAction = 'skip' | 'override';

type Props = {
  open: boolean;
  action: RuntimeAction;
  transitions: AdmissionWorkflowRuntimeTransition[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (value: { reason: string; transitionDefinitionId?: string }) => Promise<void>;
};

export function AdmissionWorkflowRuntimeActionDialog({
  open,
  action,
  transitions,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const isOverride = action === 'override';
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: '', transitionDefinitionId: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .max(512, 'Use 512 characters or fewer')
        .required('Reason is required for audit history'),
      transitionDefinitionId: isOverride
        ? Yup.string().required('Select the destination stage')
        : Yup.string(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit({
          reason: values.reason.trim(),
          transitionDefinitionId: values.transitionDefinitionId || undefined,
        });
        helpers.resetForm();
        onClose();
      } catch {
        // The parent keeps API problem-detail handling consistent with the screen.
      }
    },
  });

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={isOverride ? 'Override workflow transition' : 'Skip current stage'}
      maxWidth="sm"
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Alert severity="warning" icon={<Iconify icon="mdi:alert-outline" />}>
            {isOverride
              ? 'This privileged action bypasses normal transition conditions and is permanently audited.'
              : 'Skipping is allowed only for stages configured for manual skip and is permanently audited.'}
          </Alert>
          {isOverride && (
            <ShakingTextField
              error={Boolean(
                formik.touched.transitionDefinitionId && formik.errors.transitionDefinitionId
              )}
            >
              <TextField
                select
                fullWidth
                autoFocus
                size="small"
                label="Destination stage *"
                {...formik.getFieldProps('transitionDefinitionId')}
                error={Boolean(
                  formik.touched.transitionDefinitionId && formik.errors.transitionDefinitionId
                )}
                helperText={
                  formik.touched.transitionDefinitionId && formik.errors.transitionDefinitionId
                }
              >
                {transitions.map((transition) => (
                  <MenuItem key={transition.id} value={transition.id}>
                    {transition.toStageName} · Priority {transition.priority}
                    {transition.isDefault ? ' · Default' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          )}
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              fullWidth
              autoFocus={!isOverride}
              multiline
              minRows={3}
              size="small"
              label="Reason *"
              {...formik.getFieldProps('reason')}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:close" />}
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="warning"
          size="small"
          loading={loading}
          startIcon={
            <Iconify icon={isOverride ? 'mdi:shield-alert-outline' : 'mdi:skip-next-outline'} />
          }
          onClick={() => formik.handleSubmit()}
        >
          {isOverride ? 'Override transition' : 'Skip stage'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
