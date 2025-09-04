'use client';

import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import StudentRefundInfo from './StudentRefundInfo';
import { refundValidation } from './ConcessionRefundValidation';

import type { IRefundFormProps, IRefundFormValues } from '../type';

export const termOptions = [
  { name: 'Quarter 1', amount: 5000 },
  { name: 'Quarter 2', amount: 5000 },
  { name: 'Quarter 3', amount: 5000 },
  { name: 'Quarter 4', amount: 5000 },
];

const RefundRequestForm: React.FC<IRefundFormProps> = ({ open, onClose, student }) => {
  const formik = useFormik<IRefundFormValues>({
    initialValues: {
      paidTerm: '',
      applicableAmount: '',
      refundAmount: null,
      refundMethod: '',
      reason: '',
    },
    validationSchema: refundValidation,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Refund request submitted successfully' });
      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <StudentRefundInfo student={student} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ShakingTextField error={formik.touched.paidTerm && Boolean(formik.errors.paidTerm)}>
              <CustomSelect
                label="Paid Term *"
                options={termOptions}
                value={formik.values.paidTerm}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  const selectedTerm = termOptions.find((term) => term.name === val);
                  formik.setFieldValue('paidTerm', val);
                  formik.setFieldValue('applicableAmount', selectedTerm?.amount || '');
                }}
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset' },
                }}
                error={!!(formik.touched.paidTerm && formik.errors.paidTerm)}
                helperText={(formik.touched.paidTerm && formik.errors.paidTerm) || ''}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <ShakingTextField
              error={formik.touched.applicableAmount && Boolean(formik.errors.applicableAmount)}
            >
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Amount Applicable For Refund *"
                name="applicableAmount"
                disabled
                value={formik.values.applicableAmount}
                onChange={(e) => {
                  formik.setFieldValue('applicableAmount', Number(e.target.value));
                }}
                error={formik.touched.applicableAmount && Boolean(formik.errors.applicableAmount)}
                helperText={formik.touched.applicableAmount && formik.errors.applicableAmount}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <ShakingTextField
              error={formik.touched.refundAmount && Boolean(formik.errors.refundAmount)}
            >
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Refund Amount *"
                name="refundAmount"
                value={formik.values.refundAmount}
                onChange={(e) => {
                  let val = e.target.value;
                  // remove ₹, commas, spaces
                  val = val.replace(/[₹,\s]/g, '');
                  formik.setFieldValue('refundAmount', val ? Number(val) : '');
                }}
                error={formik.touched.refundAmount && Boolean(formik.errors.refundAmount)}
                helperText={formik.touched.refundAmount && formik.errors.refundAmount}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <ShakingTextField
              error={formik.touched.refundMethod && Boolean(formik.errors.refundMethod)}
            >
              <CustomSelect
                label="Refund Method *"
                options={[
                  { name: 'Bank Transfer', value: 'Bank Transfer' },
                  { name: 'Cash', value: 'Cash' },
                  { name: 'Cheque', value: 'Cheque' },
                ]}
                value={formik.values.refundMethod}
                labelKey="name"
                valueKey="value"
                onChange={(val) => formik.setFieldValue('refundMethod', val)}
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset' },
                }}
                error={!!(formik.touched.refundMethod && formik.errors.refundMethod)}
                helperText={(formik.touched.refundMethod && formik.errors.refundMethod) || ''}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12}>
            <ShakingTextField error={formik.touched.reason && Boolean(formik.errors.reason)}>
              <TextField
                fullWidth
                label="Reason of Refund *"
                name="reason"
                size="small"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={formik.handleChange}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      {/* 🔹 Actions */}
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
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RefundRequestForm;
