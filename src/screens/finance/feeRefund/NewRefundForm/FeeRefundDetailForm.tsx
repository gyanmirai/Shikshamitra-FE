// FeeRefundDetailsForm.tsx
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetRefundEligibilityQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import {
  Box,
  Grid,
  Radio,
  Stack,
  MenuItem,
  FormLabel,
  TextField,
  Typography,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import FeeHeadRefundTable from './FeeHeadRefundTable';
import { RefundDetailsSkeleton } from './RefundFormSkeleton';
import { isAllowedRefundMethod, getAllowedRefundMethodOptions } from './refundPayoutMethods';
import {
  isRefundRequestField,
  refundPaymentMethodsConfig,
  getInitialRefundPaymentDetails,
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [hasPaymentRecords, setHasPaymentRecords] = useState(false);
  const {
    currentData: eligibility,
    isFetching: eligibilityFetching,
    isError: eligibilityError,
  } = useGetRefundEligibilityQuery(
    { studentId: formik.values.studentId, academicYearId: currentYear?.id ?? '' },
    { skip: !formik.values.studentId || !currentYear?.id }
  );
  const methods = allowedPayoutMethods ?? eligibility?.allowedPayoutMethods;
  const methodsReady =
    allowedPayoutMethods !== undefined ||
    Boolean(eligibility && !eligibilityFetching && !eligibilityError);
  const canConfigureRefund =
    allowedPayoutMethods !== undefined ||
    Boolean(
      eligibility &&
      !eligibilityFetching &&
      !eligibilityError &&
      eligibility.totalRefundable > 0 &&
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
  useEffect(() => {
    if (
      eligibility &&
      !eligibilityFetching &&
      !eligibilityError &&
      !eligibility.allowPartialRefund &&
      formik.values.refundType === 'partial'
    ) {
      setFieldValue('refundType', 'full', false);
    }
  }, [eligibility, eligibilityFetching, eligibilityError, formik.values.refundType, setFieldValue]);
  if (formik.values.studentId && eligibilityFetching) return <RefundDetailsSkeleton />;

  return (
    <Box display="flex" flexDirection="column" gap={1} mt={0}>
      <FormSectionCard
        descriptionTooltip="Select paid fee months from one receipt. Full refund uses the available policy limit; partial refund lets you enter an amount when the linked policy permits it. The server checks deductions and limits on submission."
        title="Refund details"
        icon="solar:bill-list-bold-duotone"
      >
        {formik.values.studentId && canConfigureRefund && (
          <FormControl>
            <FormLabel id="refund-type-label">Refund type</FormLabel>
            <RadioGroup
              row
              aria-labelledby="refund-type-label"
              name="refundType"
              value={formik.values.refundType || 'full'}
              onChange={(e) => {
                const newType = e.target.value;
                formik.setFieldValue('refundType', newType);
              }}
            >
              <FormControlLabel value="full" control={<Radio size="small" />} label="Full refund" />
              <FormControlLabel
                value="partial"
                control={<Radio size="small" />}
                label="Partial refund"
                disabled={eligibility != null && !eligibility.allowPartialRefund}
              />
            </RadioGroup>
          </FormControl>
        )}

        {canConfigureRefund && eligibility?.refundPolicyName && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              Policy: <strong>{eligibility.refundPolicyName}</strong>
            </Typography>
            <Typography variant="body2">
              Maximum refundable:{' '}
              <strong>{formatNumber(eligibility.totalRefundable, 'INR')}</strong>
            </Typography>
          </Stack>
        )}

        {/* ── Fee Head-wise Refund Accordion Table ── */}
        <FeeHeadRefundTable
          compact
          formik={formik}
          showError={formik.submitCount > 0 && typeof formik.errors.feeHeadRefunds === 'string'}
          errorMessage={
            typeof formik.errors.feeHeadRefunds === 'string'
              ? (formik.errors.feeHeadRefunds as string)
              : undefined
          }
          onHasRecords={setHasPaymentRecords}
        />
      </FormSectionCard>

      {/* ── Refund Payment Details Card ── */}
      {formik.values.studentId && hasPaymentRecords && canConfigureRefund && (
        <FormSectionCard
          descriptionTooltip="Choose a payment method allowed by the refund policy linked to the student's fee structure and enter the recipient details. Payment is recorded separately after approval."
          title="Refund payment details"
          icon="solar:wallet-bold-duotone"
        >
          <Grid container spacing={1}>
            {/* Refund Method */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.refundMethod && formik.errors.refundMethod)}
              >
                <CustomSelect
                  options={methodOptions}
                  disabled={!methodsReady || methodOptions.length === 0}
                  label="Refund method *"
                  value={
                    methodsReady && isAllowedRefundMethod(refundMethod, methods) ? refundMethod : ''
                  }
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
                  onBlur={() => formik.setFieldTouched('refundMethod', true)}
                  multiple={false}
                  error={formik.touched.refundMethod && Boolean(formik.errors.refundMethod)}
                  helperText={
                    (eligibilityError && allowedPayoutMethods === undefined
                      ? 'Unable to load refund policy payment methods. Retry before submitting.'
                      : !methodsReady
                        ? 'Loading refund policy payment methods…'
                        : methodOptions.length === 0
                          ? 'No payment methods are available under this refund policy.'
                          : ((formik.touched.refundMethod &&
                              formik.errors.refundMethod) as string)) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Dynamic payment fields */}
            {methodsReady &&
              isAllowedRefundMethod(refundMethod, methods) &&
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
                      size={{ xs: 12, md: field.type === 'multiline' ? 12 : 6 }}
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
                            error={Boolean(touched && error)}
                            helperText={
                              (touched && typeof error === 'string' ? error : undefined) ||
                              undefined
                            }
                          >
                            {field.options?.map((opt: any) => (
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
                            helperText={
                              (touched && typeof error === 'string' ? error : undefined) ||
                              undefined
                            }
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
                            helperText={
                              (touched && typeof error === 'string' ? error : undefined) ||
                              undefined
                            }
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
                label="Refund reason"
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
                error={Boolean(formik.touched.notes && formik.errors.notes)}
                helperText={(formik.touched.notes && formik.errors.notes) || undefined}
              />
            </Grid>
          </Grid>
        </FormSectionCard>
      )}
    </Box>
  );
}
