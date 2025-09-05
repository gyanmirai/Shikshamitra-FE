'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import StudentRefundInfo from './StudentRefundInfo';
import { feeRefundProcessvalidationSchema } from './FeeRefundProcessValidation';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IRefundFormProps, IRefundFormValues } from '../type';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

const getInitialPaymentDetails = (method?: string) => {
  if (!method || !(method in paymentMethodsConfig)) return {};
  return paymentMethodsConfig[method as keyof typeof paymentMethodsConfig].reduce(
    (acc, field) => {
      acc[field.name] = ''; // default empty
      return acc;
    },
    {} as Record<string, any>
  );
};

const RefundProcessForm: React.FC<IRefundFormProps> = ({ open, onClose, student }) => {
  const formik = useFormik<IRefundFormValues>({
    initialValues: {
      paidTerm: student?.paidTerm || '',
      applicableAmount: student?.applicableAmount || '',
      refundAmount: student?.refundAmount || null,
      refundMethod: student?.refundMethod || '',
      reason: student?.reason || '',
      remarks: 'Not Appropriate Request',
      paymentDetails: {
        ...getInitialPaymentDetails(student?.refundMethod),
        ...(student?.paymentDetails || {}), // merge if student already has values
      },
    },
    validationSchema: feeRefundProcessvalidationSchema,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Remarks submitted successfully' });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <StudentRefundInfo student={student} />

        {/* Disabled Fields */}
        {/* <Grid container spacing={3}> */}
        {/* Refund Details */}
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Refund Details">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Paid Term"
                  value={formik.values.paidTerm}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Amount Applicable For Refund"
                  value={formik.values.applicableAmount}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Refund Amount"
                  value={formik.values.refundAmount}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Refund Method"
                  value={formik.values.refundMethod}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
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

              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={formik.touched.remarks && Boolean(formik.errors.remarks)}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    name="remarks"
                    size="small"
                    disabled
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
          </SectionCard>
        </Grid>

        {/* Payment Details (if refund method is not cash) */}
        {formik.values.refundMethod !== 'Cash' && (
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Payment Details">
              <Grid container spacing={2}>
                {paymentMethodsConfig[
                  formik.values.refundMethod as keyof typeof paymentMethodsConfig
                ]?.map((field: IPaymentFieldConfig) => (
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    key={`${formik.values.refundMethod}-${field.name}`}
                  >
                    <ShakingTextField
                      error={
                        !!(
                          formik.touched.paymentDetails?.[
                            field.name as keyof typeof formik.touched.paymentDetails
                          ] &&
                          formik.errors.paymentDetails?.[
                            field.name as keyof typeof formik.errors.paymentDetails
                          ]
                        )
                      }
                    >
                      {/* ... keep your field rendering logic here (DatePicker, select, multiline, amount, etc.) */}
                    </ShakingTextField>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          </Grid>
        )}
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
        >
          Cancel
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
          Generate Receipt
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RefundProcessForm;
