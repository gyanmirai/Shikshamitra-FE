'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import StudentRefundInfo from './StudentRefundInfo';

import type { IRefundFormProps, IRefundFormValues } from '../type';

const RefundRemarksForm: React.FC<IRefundFormProps> = ({ open, onClose, student }) => {
  const formik = useFormik<IRefundFormValues>({
    initialValues: {
      paidTerm: student?.paidTerm || '',
      applicableAmount: student?.applicableAmount || '',
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

        {/* Disabled Fields */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Paid Term"
              value={formik.values.paidTerm}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Amount Applicable For Refund"
              value={formik.values.applicableAmount}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Refund Amount"
              value={formik.values.refundAmount}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Refund Method"
              value={formik.values.refundMethod}
              fullWidth
              size="small"
              disabled
            />
          </Grid>

          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <ShakingTextField error={formik.touched.remarks && Boolean(formik.errors.remarks)}>
              <TextField
                fullWidth
                label="Remarks *"
                name="remarks"
                size="small"
                multiline
                rows={3}
                value={formik.values.remarks}
                onChange={formik.handleChange}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                helperText={formik.touched.remarks && formik.errors.remarks}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="contained"
          color="error"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="success"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Approve
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RefundRemarksForm;
