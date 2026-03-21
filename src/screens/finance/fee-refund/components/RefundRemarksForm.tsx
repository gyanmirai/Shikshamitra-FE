'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/custom-dialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import RefundInfo from './RefundInformationCard';
import StudentRefundInfo from './StudentRefundInfo';

import type { IRefundFormProps, IRefundFormValues } from '../type';

const RefundRemarksForm: React.FC<IRefundFormProps> = ({
  open,
  onClose,
  student,
  onReject,
  onApprove,
}) => {
  const formik = useFormik<IRefundFormValues>({
    initialValues: {
      paidTerms: student?.paidTerms || [],
      totalPaidFees: student?.totalPaidFees || '',
      applicableFeeHeads: student?.applicableFeeHeads || [],
      refundAmount: student?.refundAmount || null,
      refundMethod: student?.refundMethod || '',
      reason: student?.reason || '',
      remarks: '',
    },
    validationSchema: Yup.object().shape({
      remarks: Yup.string().required('Remarks is required'),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Remarks submitted successfully' });
      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <StudentRefundInfo student={student} />
        <RefundInfo refund={student} />
        {/* Disabled Fields */}
        <Grid container spacing={3}>
          <Grid size={6}>
            <NumericFormatCustom
              label="Amount Applicable For Refund"
              value={`₹${formik.values.totalPaidFees}`}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid size={6}>
            <NumericFormatCustom
              label="Refund Amount"
              value={`₹${formik.values.refundAmount}`}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid size={6}>
            <TextField
              label="Refund Method"
              value={formik.values.refundMethod}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Reason of Refund"
              value={formik.values.reason}
              fullWidth
              size="small"
              multiline
              rows={3}
              disabled
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="soft"
          color="error"
          onClick={onReject}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Reject
        </Button>
        <Button
          variant="soft"
          color="success"
          onClick={onApprove}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.tick} />}
        >
          Approve
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RefundRemarksForm;
