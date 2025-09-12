// FeeRefundDetailsForm.tsx
import dayjs from 'dayjs';
import { getIn } from 'formik';
import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetRefundTermsQuery } from 'src/redux/finance/feeRefundTerms';
import { Box, Grid, Card, MenuItem, TextField, Typography } from '@mui/material';

import TermsToRefund from './TermsToRefund';
import { getInitialPaymentDetails } from '../Components/RefundProcessForm';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { ITerm, IFeeHead, IPaymentFieldConfig } from '../../FeeCollection/Components/type';

export default function FeeRefundDetailsForm({ formik }: any) {
  const theme = useTheme();
  const { data: feeTermsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundTermsQuery,
  });

  // update totalAmount when selections change
  // useEffect(() => {
  //   let total = 0;

  //   if (!feeTermsData) return;

  //   formik.values.selectedTerms.forEach((termId: string) => {
  //     const term = feeTermsData.find((t: any) => t.id === termId);
  //     if (term) {
  //       total += term.paid || 0;
  //     }
  //   });

  //   // Heads/Charges only if parent term is NOT selected
  //   feeTermsData.forEach((term: any) => {
  //     if (!formik.values.selectedTerms.includes(term.id)) {
  //       // Fee heads
  //       formik.values.selectedFeeHeads.forEach((key: string) => {
  //         const [termId, headName] = key.split('-');
  //         if (term.id === termId) {
  //           const head = term.feeHeads.find((h: any) => h.name === headName);
  //           if (head) total += head.paid || 0;
  //         }
  //       });

  //       // Charges
  //       formik.values.selectedCharges.forEach((key: string) => {
  //         const [termId, chargeId] = key.split('-');
  //         if (term.id === termId) {
  //           const charge = term.charges.find((c: any) => c.id === chargeId);
  //           if (charge) total += charge.paid || 0;
  //         }
  //       });
  //     }
  //   });

  //   formik.setFieldValue('totalAmount', total === 0 ? '' : total.toString());
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   formik.values.selectedTerms,
  //   formik.values.selectedFeeHeads,
  //   formik.values.selectedCharges,
  //   feeTermsData,
  // ]);

  useEffect(() => {
    if (formik.values.selectedTerms.length === 0) {
      formik.setFieldValue('totalAmount', '');
    } else {
      const amount = formik.values.selectedTerms.reduce(
        (pre: number, items: any) => pre + (items.total - items.paid),
        0
      );
      formik.setFieldValue('totalAmount', amount === 0 ? '' : amount.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.selectedTerms]);

  return (
    <Box display="flex" flexDirection="column">
      <Grid container spacing={3}>
        <Grid size={6} mt={2} mb={2}>
          <TermsToRefund
            terms={feeTermsData}
            selectedTerms={formik.values.selectedTerms}
            onTermSelect={(selectedTerms: (ITerm | IFeeHead)[]) =>
              formik.setFieldValue('selectedTerms', selectedTerms)
            }
            selectedFeeHeads={formik.values.selectedFeeHeads}
            onFeeHeadSelect={(updated: string[]) =>
              formik.setFieldValue('selectedFeeHeads', updated)
            }
            selectedCharges={formik.values.selectedCharges}
            onChargeSelect={(updated: string[]) => formik.setFieldValue('selectedCharges', updated)}
            showError={formik.touched.selectedTerms && Boolean(formik.errors.selectedTerms)}
            errorMessage={formik.errors.selectedTerms as string}
          />
        </Grid>

        <Grid size={6} mt={2} mb={2}>
          <Card
            sx={{ p: 2, borderRadius: 2, boxShadow: 2, bgcolor: theme.palette.background.paper }}
          >
            <Scrollbar sx={{ maxHeight: 'calc(100vh - 300px)', pr: 1 }}>
              <Typography variant="h6" color="primary.main" fontWeight={600} mb={2}>
                Refund Details
              </Typography>

              <Grid container spacing={2}>
                {/* Total Refundable */}
                <Grid size={6}>
                  <NumericFormatCustom
                    fullWidth
                    label="Total Refundable Amount"
                    value={`₹${formik.values.totalAmount}`}
                    disabled
                    size="small"
                  />
                </Grid>
                {/* Refund Method */}
                <Grid size={6}>
                  <ShakingTextField
                    error={!!(formik.touched.refundMethod && formik.errors.refundMethod)}
                  >
                    <CustomSelect
                      options={Object.keys(paymentMethodsConfig).map((method) => ({
                        value: method,
                        label: method.charAt(0).toUpperCase() + method.slice(1),
                      }))}
                      label="Refund Method *"
                      value={formik.values.refundMethod}
                      onChange={(value) => {
                        formik.setFieldValue('refundMethod', value);
                        formik.setFieldTouched('refundMethod', true, false);
                        formik.setFieldValue(
                          'paymentDetails',
                          getInitialPaymentDetails(value as string)
                        );
                        formik.validateForm();
                      }}
                      name="refundMethod"
                      multiple={false}
                      error={formik.touched.refundMethod && Boolean(formik.errors.refundMethod)}
                      helperText={
                        (formik.touched.refundMethod && formik.errors.refundMethod) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
                {/* Dynamic payment fields */}
                {formik.values.refundMethod &&
                  paymentMethodsConfig[
                    formik.values.refundMethod as keyof typeof paymentMethodsConfig
                  ]?.map((field: IPaymentFieldConfig) => {
                    const fieldPath = `paymentDetails.${field.name}`;
                    const value = getIn(formik.values, fieldPath);
                    const error = getIn(formik.errors, fieldPath);
                    const touched = getIn(formik.touched, fieldPath);

                    return (
                      <Grid size={6} key={`${formik.values.refundMethod}-${field.name}`}>
                        <ShakingTextField error={Boolean(touched && error)}>
                          {field.type === 'date' ? (
                            <DatePicker
                              label={field.label}
                              format="DD/MM/YYYY"
                              value={value ? dayjs(value) : null}
                              onChange={(date) => formik.setFieldValue(fieldPath, date)}
                              // onBlur={() => formik.setFieldTouched(fieldPath, true)}
                              sx={{ width: '100%' }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error: Boolean(touched && error),
                                  helperText: touched && typeof error === 'string' ? error : '',
                                },
                              }}
                            />
                          ) : field.type === 'select' ? (
                            <TextField
                              select
                              fullWidth
                              label={field.label}
                              name={fieldPath}
                              value={value || ''}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              size="small"
                              error={Boolean(touched && error)}
                              helperText={touched && typeof error === 'string' ? error : ''}
                            >
                              {field.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : field.type === 'multiline' ? (
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              size="small"
                              label={field.label}
                              name={fieldPath}
                              value={value || ''}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(touched && error)}
                              helperText={touched && typeof error === 'string' ? error : ''}
                            />
                          ) : field.type === 'amount' ? (
                            <NumericFormatCustom
                              fullWidth
                              size="small"
                              label={field.label}
                              name={fieldPath}
                              value={value || ''}
                              onChange={formik.handleChange}
                              onBlur={() => formik.setFieldTouched(fieldPath, true)} // ✅ needed for custom inputs
                              error={Boolean(touched && error)}
                              helperText={touched && typeof error === 'string' ? error : ''}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              type={field.type}
                              size="small"
                              label={field.label}
                              name={fieldPath}
                              value={value || ''}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(touched && error)}
                              helperText={touched && typeof error === 'string' ? error : ''}
                              inputProps={
                                field.type === 'number' ? { min: field.min, max: field.max } : {}
                              }
                            />
                          )}
                        </ShakingTextField>
                      </Grid>
                    );
                  })}
                {/* Notes */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Notes"
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </Scrollbar>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
