'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAdjustmentApproveRejectProps } from '../types/adjustment.types';

const AdjustmentApproveRejectForm: React.FC<IAdjustmentApproveRejectProps> = ({
  mode,
  onClose,
  loading = false,
}) => {
  const isReject = mode === 'Reject';

  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object().shape({
      reason: isReject
        ? Yup.string()
            .trim()
            .required('Rejection reason is required')
            .min(5, 'Provide a meaningful reason')
        : Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onClose(null, true, values.reason);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <FormSectionCard
          title={isReject ? 'Rejection Reason' : 'Approval Notes'}
          icon={GlobalIcons.notebook}
          descriptionTooltip={
            isReject
              ? 'Record why this request is being rejected. The reason is retained with the adjustment.'
              : 'Record optional notes for this adjustment review.'
          }
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
                <TextField
                  fullWidth
                  required={isReject}
                  disabled={loading || formik.isSubmitting}
                  label={isReject ? 'Rejection reason' : 'Approval notes'}
                  name="reason"
                  size="small"
                  multiline
                  rows={3}
                  placeholder={
                    isReject ? 'Enter reason for rejection...' : 'Optional remarks for approval...'
                  }
                  value={formik.values.reason}
                  onChange={(e) => {
                    formik.setFieldValue('reason', e.target.value);
                    formik.setFieldTouched('reason', true);
                  }}
                  error={formik.touched.reason && Boolean(formik.errors.reason)}
                  helperText={formik.touched.reason && formik.errors.reason}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </FormSectionCard>
      </DialogScrollContent>

      <DialogActions>
        <Button
          onClick={() => onClose(null, false)}
          variant="outlined"
          color="inherit"
          disabled={loading || formik.isSubmitting}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>

        <LoadingButton
          type="button"
          variant="contained"
          color={isReject ? 'error' : 'success'}
          size="small"
          loading={loading || formik.isSubmitting}
          startIcon={<Iconify icon={isReject ? GlobalIcons.cancel : GlobalIcons.tick} />}
          onClick={() => formik.handleSubmit()}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AdjustmentApproveRejectForm;
