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
  useRejectChargeMutation,
  useApproveChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';

import type { IChargeData } from './type';

export interface IReasonApprovalFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  mode: string;
  selectedCharge?: IChargeData | null;
}

const ChargeReasonApprovalForm = ({ onClose, mode, selectedCharge }: IReasonApprovalFormProps) => {
  const [approveCharge, { isLoading: approveChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveChargeMutation,
  });

  const [rejectCharge, { isLoading: rejectChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectChargeMutation,
  });

  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object().shape({
      reason: mode === 'Reject' ? Yup.string().required('Reason is required') : Yup.string(), // optional in approve
    }),
    onSubmit: async (values) => {
      if (mode === 'Approve') {
        const result: any = await approveCharge({
          id: selectedCharge?.chargeId,
          body: { approvalNotes: values.reason },
        });
        if (result?.error) return;
        shikshaMitraToast.success({
          message: `Charge approved successfully for ${selectedCharge?.categoryName} and assigned to ${selectedCharge?.studentName}`,
        });
      } else {
        const result: any = await rejectCharge({
          id: selectedCharge?.chargeId,
          body: { rejectionReason: values.reason },
        });
        if (result?.error) return;
        shikshaMitraToast.success({
          message: `Charge rejected for ${selectedCharge?.categoryName} and assigned to ${selectedCharge?.studentName}`,
        });
      }
      onClose(null, true);
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
          startIcon={<Iconify icon={mode === 'Reject' ? GlobalIcons.cancel : GlobalIcons.tick} />}
          size="small"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          loading={approveChargeLoading || rejectChargeLoading}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChargeReasonApprovalForm;
