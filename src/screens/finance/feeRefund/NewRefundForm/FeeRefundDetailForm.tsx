// FeeRefundDetailsForm.tsx
import dayjs from 'dayjs';
import React from 'react';
import { getIn } from 'formik';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';

import FeeHeadRefundTable from './FeeHeadRefundTable';
import { getInitialPaymentDetails } from '../Components/RefundProcessForm';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { RefundFormik } from './types';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

export default function FeeRefundDetailsForm({
  formik,
}: {
  formik: RefundFormik;
}): React.ReactElement {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" gap={1} mt={0}>
      {/* ── Fee Head-wise Refund Accordion Table ── */}
      <FeeHeadRefundTable
        formik={formik}
        showError={
          !!(formik.touched.feeHeadRefunds && formik.errors.feeHeadRefunds) &&
          typeof formik.errors.feeHeadRefunds === 'string'
        }
        errorMessage={
          typeof formik.errors.feeHeadRefunds === 'string'
            ? (formik.errors.feeHeadRefunds as string)
            : undefined
        }
      />

      {/* ── Refund Payment Details Card ── */}
      {formik.values.studentId && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Card header */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Refund Payment Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Choose the refund method and fill in the required payment information
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {/* Refund Method */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                    formik.setFieldTouched('refundMethod', false);
                    formik.setFieldValue(
                      'paymentDetails',
                      getInitialPaymentDetails(value as string)
                    );
                    formik.validateForm();
                  }}
                  name="refundMethod"
                  multiple={false}
                  error={formik.touched.refundMethod && Boolean(formik.errors.refundMethod)}
                  helperText={(formik.touched.refundMethod && formik.errors.refundMethod) as string}
                />
              </ShakingTextField>
            </Grid>

            {/* Dynamic payment fields */}
            {formik.values.refundMethod &&
              paymentMethodsConfig[formik.values.refundMethod as keyof typeof paymentMethodsConfig]
                ?.filter((field: IPaymentFieldConfig) => field.name !== 'amount')
                .map((field: IPaymentFieldConfig) => {
                  const fieldPath = `paymentDetails.${field.name}`;
                  const value = getIn(formik.values, fieldPath);
                  const error = getIn(formik.errors, fieldPath);
                  const touched = getIn(formik.touched, fieldPath);

                  return (
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      key={`${formik.values.refundMethod}-${field.name}`}
                    >
                      <ShakingTextField error={Boolean(touched && error)}>
                        {field.type === 'date' ? (
                          <DatePicker
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            format="DD/MM/YYYY"
                            value={value ? dayjs(value) : null}
                            onChange={(date) => formik.setFieldValue(fieldPath, date)}
                            disablePast
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
                            label={`${field.label}${field.required ? ' *' : ''}`}
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
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            name={fieldPath}
                            value={value || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            type={field.type}
                            size="small"
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            name={fieldPath}
                            value={value || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (field.pattern) {
                                if (newValue === '') {
                                  formik.setFieldValue(fieldPath, newValue);
                                  return;
                                }
                                const allowedChars = 'a-zA-Z0-9 ';
                                const typingRegex = new RegExp(`^[${allowedChars}]*$`);
                                if (!typingRegex.test(newValue)) return;
                              }
                              formik.setFieldValue(fieldPath, newValue);
                            }}
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
                size="small"
                label="Notes (Optional)"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                placeholder="Add any additional notes or context about this refund request..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
