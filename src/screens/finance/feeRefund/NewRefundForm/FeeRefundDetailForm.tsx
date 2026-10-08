// FeeRefundDetailsForm.tsx
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBankAccountQuery } from 'src/redux/finance/BankAccountManage/bankAccountApi';
import { useGetRefundEligibilityQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import {
  Box,
  Grid,
  Alert,
  Radio,
  Paper,
  MenuItem,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

import FeeHeadRefundTable from './FeeHeadRefundTable';
import { isAllowedRefundMethod, getAllowedRefundMethodOptions } from './refundPayoutMethods';
import {
  refundPaymentMethodsConfig,
  getInitialRefundPaymentDetails,
  isRefundRequestField,
} from './refundPaymentDetailsConfig';

import type { RefundFormik } from './types';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

export default function FeeRefundDetailsForm({
  formik,
  allowedPayoutMethods,
}: {
  formik: RefundFormik;
  allowedPayoutMethods?: string[];
}): React.ReactElement {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [hasPaymentRecords, setHasPaymentRecords] = useState(false);
  const { currentData: eligibility, isFetching: eligibilityFetching, isError: eligibilityError } = useGetRefundEligibilityQuery(
    { studentId: formik.values.studentId, academicYearId: currentYear?.id ?? '' },
    { skip: !formik.values.studentId || !currentYear?.id }
  );
  const methods = allowedPayoutMethods ?? eligibility?.allowedPayoutMethods;
  const methodsReady = allowedPayoutMethods !== undefined || Boolean(eligibility && !eligibilityFetching && !eligibilityError);
  const canConfigureRefund = allowedPayoutMethods !== undefined || Boolean(
    eligibility && !eligibilityFetching && !eligibilityError && eligibility.totalRefundable > 0 &&
    eligibility.feeHeads.some((head) => head.months.some((month) => month.refundable > 0))
  );
  const methodOptions = getAllowedRefundMethodOptions(methodsReady ? methods : undefined);
  const { refundMethod } = formik.values;
  const { setFieldValue, setFieldTouched } = formik;
  useEffect(() => {
    if (methodsReady && refundMethod && !isAllowedRefundMethod(refundMethod, methods)) {
      setFieldValue('refundMethod', '', false);
      setFieldValue('paymentDetails', {}, false);
      setFieldTouched('refundMethod', false, false);
    }
  }, [methodsReady, methods, refundMethod, setFieldValue, setFieldTouched]);
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
      {/* ── Refund Type Selection ── */}
      {formik.values.studentId && canConfigureRefund && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 1,
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Refund Type
          </Typography>
          <RadioGroup
            row
            name="refundType"
            value={formik.values.refundType || 'full'}
            onChange={(e) => {
              const newType = e.target.value;
              formik.setFieldValue('refundType', newType);
              // If switched to 'full', we need to reset amounts to max refundable, but we don't have feeHeads here.
              // We will let FeeHeadRefundTable handle the reset if we can, or we do it inside FeeHeadRefundTable via an effect.
            }}
          >
            <FormControlLabel value="full" control={<Radio size="small" />} label="Full Refund" />
            <FormControlLabel
              value="partial"
              control={<Radio size="small" />}
              label="Partial Refund"
              disabled={eligibility != null && !eligibility.allowPartialRefund}
            />
          </RadioGroup>
        </Paper>
      )}

      {canConfigureRefund && eligibility?.refundPolicyName && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Policy: <strong>{eligibility.refundPolicyName}</strong> · Maximum currently refundable: ₹
          {eligibility.totalRefundable.toLocaleString('en-IN')}
          {eligibility.processingTargetDays != null
            ? ` · Target processing time: ${eligibility.processingTargetDays} day(s)`
            : ''}
        </Alert>
      )}

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
      {formik.values.studentId && hasPaymentRecords && canConfigureRefund && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Card header */}
          <Box display="flex" alignItems="center" gap={1} mb={2.5}>
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
                  options={methodOptions}
                  disabled={!methodsReady || methodOptions.length === 0}
                  label="Refund Method *"
                  value={methodsReady && isAllowedRefundMethod(refundMethod, methods) ? refundMethod : ''}
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
                  helperText={eligibilityError && allowedPayoutMethods === undefined
                    ? 'Unable to load refund policy payment methods. Retry before submitting.'
                    : !methodsReady ? 'Loading refund policy payment methods…'
                      : methodOptions.length === 0 ? 'No payment methods are available under this refund policy.'
                        : (formik.touched.refundMethod && formik.errors.refundMethod) as string}
                />
              </ShakingTextField>
            </Grid>

            {/* Dynamic payment fields */}
            {methodsReady && isAllowedRefundMethod(refundMethod, methods) &&
              refundPaymentMethodsConfig[
                formik.values.refundMethod as keyof typeof refundPaymentMethodsConfig
              ]
                ?.filter((field: IPaymentFieldConfig) => isRefundRequestField(field.name))
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
                            disableFuture
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
                            onChange={(e) => {
                              let val = e.target.value.replace(/[<>]/g, '');
                              if (
                                (field as any).maxLength &&
                                val.length > (field as any).maxLength
                              ) {
                                val = val.slice(0, (field as any).maxLength);
                              }
                              formik.setFieldValue(fieldPath, val);
                            }}
                            onBlur={(e) => {
                              const val = e.target.value;
                              const trimmed = val.trim().replace(/\s+/g, ' ');
                              if (trimmed !== val) {
                                formik.setFieldValue(fieldPath, trimmed);
                              }
                              formik.handleBlur(e);
                            }}
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            type={
                              field.type === 'text' ||
                              field.type === 'numbers' ||
                              field.type === 'last4digits' ||
                              field.type === 'uppercase' ||
                              field.type === 'anytext'
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

                              if (field.type === 'uppercase') {
                                newValue = newValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (typeof val === 'string') {
                                const trimmed = val.trim().replace(/\s+/g, ' ');
                                if (trimmed !== val) {
                                  formik.setFieldValue(fieldPath, trimmed);
                                }
                              }
                              formik.handleBlur(e);
                            }}
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
                onChange={(e) => {
                  let val = e.target.value.replace(/[<>]/g, '');
                  if (val.length > 500) val = val.slice(0, 500);
                  formik.setFieldValue('notes', val);
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  const trimmed = val.trim().replace(/\s+/g, ' ');
                  if (trimmed !== val) {
                    formik.setFieldValue('notes', trimmed);
                  }
                  formik.handleBlur(e);
                }}
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
