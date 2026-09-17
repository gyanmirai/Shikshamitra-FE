import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useRef } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useRejectConcessionRequestMutation } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IReasonApprovalFormProps } from '../type';

const ReasonApprovalForm = ({ onClose, selectedConcession }: IReasonApprovalFormProps) => {
  const commandKey = useRef('');
  const [rejectConcessionRequest, { isLoading: isRejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });

  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object().shape({
      reason: Yup.string()
        .trim()
        .min(10, 'Reason must be at least 10 characters')
        .max(2000, 'Reason cannot exceed 2000 characters')
        .required('Reason is required'),
    }),
    onSubmit: async (values) => {
      const requestId =
        selectedConcession?.studentConcessionTypeRequestId ||
        selectedConcession?.concessionRequestId ||
        selectedConcession?.id;
      if (!requestId) return;
      try {
        await rejectConcessionRequest({
          studentConcessionTypeRequestId: requestId,
          body: {
            message: values.reason.trim(),
            requestConcurrencyStamp: selectedConcession?.concurrencyStamp ?? '',
            idempotencyKey: (commandKey.current ||= window.crypto.randomUUID()),
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession request rejected successfully' });
        commandKey.current = '';
        onClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label="Reason *"
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

      <DialogActions>
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
          type="button"
          variant="soft"
          color="error"
          size="small"
          loading={isRejectLoading}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => formik.handleSubmit()}
        >
          Reject
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReasonApprovalForm;
