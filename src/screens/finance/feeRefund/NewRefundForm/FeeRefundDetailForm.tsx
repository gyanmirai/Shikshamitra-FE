// FeeRefundDetailsForm.tsx
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useGetBankAccountQuery } from 'src/redux/finance/BankAccountManage/bankAccountApi';

import FeeHeadRefundTable from './FeeHeadRefundTable';
import {
  refundPaymentMethodsConfig,
  getInitialRefundPaymentDetails,
} from './refundPaymentDetailsConfig';

import type { RefundFormik } from './types';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

const formatBankAccountOption = (account: any): string => {
  const bankName = typeof account?.bankName === 'string' ? account.bankName.trim() : '';
  const ifscCode = typeof account?.ifscCode === 'string' ? account.ifscCode.trim() : '';
  const accountNumber =
    typeof account?.accountNumber === 'string' ? account.accountNumber.trim() : '';

  if (bankName && ifscCode) return `${bankName} (${ifscCode})`;
  if (bankName && accountNumber) return `${bankName} (${accountNumber})`;
  return bankName || ifscCode || accountNumber;
};

export default function FeeRefundDetailsForm({
  formik,
}: {
  formik: RefundFormik;
}): React.ReactElement {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [hasPaymentRecords, setHasPaymentRecords] = useState(false);
  const {
    data: bankAccountsData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankAccountQuery,
    params: { academicYearId: currentYear?.id ?? '' },
    options: { skip: !currentYear?.id },
  });

  const bankAccountOptions = useMemo(
    () =>
      bankAccountsData?.items.map(
        (account: { bankName: string; accountNumber: string; id: string }) => ({
          name: `${account.bankName} - ${account.accountNumber}`,
          id: account.id,
        })
      ) ?? [],
    [bankAccountsData]
  );

  const isBankAccountsBusy = bankAccountsLoading || bankAccountsFetching;

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
        onHasRecords={setHasPaymentRecords}
      />

      {/* ── Refund Payment Details Card ── */}
      {formik.values.studentId && hasPaymentRecords && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
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
                  options={Object.keys(refundPaymentMethodsConfig).map((method) => ({
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
                      getInitialRefundPaymentDetails(value as string)
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
              refundPaymentMethodsConfig[
                formik.values.refundMethod as keyof typeof refundPaymentMethodsConfig
              ]
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
                            disabled={field.name === 'sourceBankAccount' && isBankAccountsBusy}
                            error={Boolean(touched && error)}
                            helperText={
                              touched && typeof error === 'string'
                                ? error
                                : field.name === 'sourceBankAccount' && isBankAccountsBusy
                                  ? 'Loading bank accounts...'
                                  : ''
                            }
                          >
                            {(field.name === 'sourceBankAccount' && bankAccountOptions.length > 0
                              ? bankAccountOptions
                              : field.options
                            )?.map((opt: any) => (
                              <MenuItem key={opt.id} value={opt.id}>
                                {opt.name}
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
                            type={
                              field.type === 'text' ||
                              field.type === 'numbers' ||
                              field.type === 'last4digits'
                                ? 'text'
                                : field.type
                            }
                            size="small"
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            name={fieldPath}
                            value={value || ''}
                            onChange={(e) => {
                              let newValue = e.target.value;

                              // Handle text-only fields (letters and spaces only)
                              if (field.type === 'text') {
                                newValue = newValue.replace(/[^a-zA-Z\s]/g, '');
                              }

                              // Handle numbers-only fields (digits only)
                              if (field.type === 'numbers') {
                                newValue = newValue.replace(/\D/g, '');
                              }

                              // Handle last 4 digits field (4 digits max)
                              if (field.type === 'last4digits') {
                                newValue = newValue.replace(/\D/g, '');
                                if (newValue.length > 4) {
                                  newValue = newValue.slice(0, 4);
                                }
                              }

                              // Apply maxLength if specified
                              if (
                                (field as any).maxLength &&
                                newValue.length > (field as any).maxLength
                              ) {
                                newValue = newValue.slice(0, (field as any).maxLength);
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
