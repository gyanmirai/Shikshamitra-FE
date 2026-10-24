import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

/** Extended props that also pass the entered notes/reason back on close. */
interface IFeeRefundApprovalFormProps {
  onClose: (e: any, isSubmit: boolean, notes?: string) => void;
  mode: string;
  loading?: boolean;
}

const FeeRefundReasonApprovalForm = ({ onClose, mode, loading }: IFeeRefundApprovalFormProps) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object().shape({
      reason:
        mode === 'Reject' || mode === 'Cancel'
          ? Yup.string().trim().required('Reason is required')
          : Yup.string(),
    }),
    onSubmit: (values) => {
      onClose(null, true, values.reason || undefined);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label={`Reason${mode === 'Reject' || mode === 'Cancel' ? ' *' : ''}`}
                name="reason"
                size="small"
                multiline
                rows={3}
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
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={() => {
            onClose(null, false);
          }}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>

        <LoadingButton
          size="small"
          variant="contained"
          color={mode === 'Reject' || mode === 'Cancel' ? 'error' : 'success'}
          startIcon={<Iconify icon={mode === 'Reject' ? GlobalIcons.cancel : GlobalIcons.tick} />}
          loading={loading}
          onClick={(e: any) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeRefundReasonApprovalForm;
