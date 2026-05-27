'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Divider, TextField, Typography, DialogActions } from '@mui/material';

import type { IAdjustmentApproveRejectProps } from '../types/adjustment.types';

const AdjustmentApproveRejectForm: React.FC<IAdjustmentApproveRejectProps> = ({
  mode,
  onClose,
}) => {
  const isReject = mode === 'Reject';

  const formik = useFormik({
    initialValues: { notes: '' },
    validationSchema: Yup.object({
      notes: isReject
        ? Yup.string()
            .required('Rejection reason is required')
            .min(5, 'Provide a meaningful reason')
        : Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      onClose(null, true, values.notes);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ px: 0.5, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isReject
            ? 'Please provide a reason for rejecting this adjustment request.'
            : 'Add any notes or remarks before approving this adjustment request.'}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label={isReject ? 'Rejection Reason *' : 'Approval Notes'}
          name="notes"
          placeholder={
            isReject ? 'Enter reason for rejection...' : 'Optional remarks for approval...'
          }
          value={formik.values.notes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.notes && Boolean(formik.errors.notes)}
          helperText={formik.touched.notes ? formik.errors.notes : ''}
        />
      </Box>

      <Divider />

      <DialogActions sx={{ px: 0, pt: 2, justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={(e) => onClose(e, false)}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          color={isReject ? 'error' : 'success'}
          disabled={formik.isSubmitting}
          startIcon={
            <Iconify icon={isReject ? 'mdi:close-circle-outline' : 'mdi:check-circle-outline'} />
          }
        >
          {isReject ? 'Reject' : 'Approve'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default AdjustmentApproveRejectForm;
