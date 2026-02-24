import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useRejectConcessionRequestMutation,
  useApproveConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IReasonApprovalFormProps } from '../type';

const ReasonApprovalForm = ({ onClose, mode, selectedConcession }: IReasonApprovalFormProps) => {
  const [rejectConcessionRequest, { isLoading: isRejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });

  const [approveConcessionRequest, { isLoading: isApproveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
  });
  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object().shape({
      reason: mode === 'Reject' ? Yup.string().required('Reason is required') : Yup.string(), // optional in approve
    }),
    onSubmit: async (values) => {
      try {
        if (mode === 'Reject') {
          await rejectConcessionRequest({
            studentConcessionTypeRequestId: selectedConcession?.studentConcessionTypeRequestId,
            body: { message: values.reason },
          }).unwrap();
          shikshaMitraToast.success({ message: 'Concession request rejected successfully' });
        } else {
          await approveConcessionRequest({
            studentConcessionTypeRequestId: selectedConcession?.studentConcessionTypeRequestId,
            body: { message: values.reason },
          }).unwrap();
          shikshaMitraToast.success({ message: 'Concession request approved successfully' });
        }
        onClose(null, true);
      } catch (error) {
        console.error(error);
      }
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
                label={`Reason${mode === 'Reject' ? ' *' : ''}`}
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
          type="submit"
          variant="soft"
          color={mode === 'Reject' ? 'error' : 'success'}
          size="small"
          loading={isRejectLoading || isApproveLoading}
          startIcon={<Iconify icon={mode === 'Reject' ? GlobalIcons.cancel : GlobalIcons.tick} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReasonApprovalForm;
