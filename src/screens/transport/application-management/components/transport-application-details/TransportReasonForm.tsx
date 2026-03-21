'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

interface ITransportReasonFormProps {
  mode: string;
  onClose: (e: any, isSubmit: boolean, reason?: string) => void;
}

const TransportReasonForm: React.FC<ITransportReasonFormProps> = ({ mode, onClose }) => {
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object().shape({
      reason:
        mode === 'Reject' || mode === 'Hold'
          ? Yup.string().required('Reason is required')
          : Yup.string(),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message:
          mode === 'Reject'
            ? 'Application rejected successfully'
            : mode === 'Hold'
              ? 'Application put on hold'
              : 'Application approved successfully',
      });
      onClose(null, true, values.reason);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label={`Reason${mode === 'Reject' || mode === 'Hold' ? ' *' : ''}`}
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
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="soft"
          color={mode === 'Reject' ? 'error' : mode === 'Hold' ? 'info' : 'success'}
          size="small"
          startIcon={
            <Iconify
              icon={
                mode === 'Reject'
                  ? GlobalIcons.reject
                  : mode === 'Hold'
                    ? GlobalIcons.archive
                    : GlobalIcons.tick
              }
            />
          }
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {mode}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default TransportReasonForm;
