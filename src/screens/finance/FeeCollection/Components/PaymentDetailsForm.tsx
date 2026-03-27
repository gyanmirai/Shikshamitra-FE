import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Card, Grid, Divider, MenuItem, TextField, Typography } from '@mui/material';

import FeeTermsComponent from './FeeTermsComponent';
import { paymentMethodsConfig } from './paymentConfigMethods';

import type { IPaymentFormValues, IPaymentFieldConfig, IPaymentDetailsFormProps } from './type';

export const buildInitialValues = (): IPaymentFormValues => {
  const initialValues: IPaymentFormValues = {
    payments: [],
    selectedFeeHeads: [],
    selectedCharges: [],
    totalAmount: '',
    totalPayableAmount: 0,
    receivedAmount: '',
    notes: '',
  };
  return initialValues;
};

export const buildValidationSchema = (currentYear: any) =>
  Yup.object({
    payments: Yup.array()
      .of(
        Yup.object({
          paymentMethod: Yup.string().required('Payment method is required'),
          amount: Yup.number()
            .transform((value, originalValue) => {
              if (typeof originalValue === 'string') {
                const cleaned = originalValue.replace(/[₹,\s,]/g, '');
                const n = Number(cleaned);
                return Number.isNaN(n) ? value : n;
              }
              return value;
            })
            .required('Amount is required')
            .positive('Amount must be positive')
            // eslint-disable-next-line func-names
            .test('not-exceed-total', 'Amount exceeds total payable', function (value) {
              const rootValues = (this as any).from?.[1]?.value;
              const totalPayable = rootValues?.totalPayableAmount || 0;
              if (totalPayable === 0) return true;

              // Individual amount exceeds total
              if (value !== undefined && value !== null && value > totalPayable) {
                return this.createError({
                  message: `Amount (₹${value.toLocaleString()}) cannot exceed total payable amount (₹${totalPayable.toLocaleString()})`,
                });
              }

              // Sum of all payment amounts exceeds total
              const allPayments: any[] = rootValues?.payments || [];
              const sum = allPayments.reduce((acc: number, p: any) => {
                const parsed = Number(String(p.amount || 0).replace(/[₹,\s,]/g, ''));
                return acc + (Number.isNaN(parsed) ? 0 : parsed);
              }, 0);

              if (sum > totalPayable) {
                return this.createError({
                  message: `Total payments (₹${sum.toLocaleString()}) exceed total payable amount (₹${totalPayable.toLocaleString()})`,
                });
              }

              return true;
            }),
          // eslint-disable-next-line func-names
          details: Yup.object().test('details-validation', function (details) {
            const { paymentMethod } = this.parent;
            const fields = paymentMethodsConfig[paymentMethod as keyof typeof paymentMethodsConfig];
            if (!fields) return true;

            const schema = Yup.object(
              Object.fromEntries(
                fields
                  .filter((f) => f.name !== 'amount')
                  .map((field) => [field.name, buildCollectionFieldValidation(field, currentYear)])
              )
            );

            try {
              schema.validateSync(details);
              return true;
            } catch (err: any) {
              return this.createError({ message: err.message, path: this.path });
            }
          }),
        })
      )
      .min(1, 'Select at least one payment method'),
  })
    // Validation to ensure totalAmount from payment methods matches totalPayableAmount
    .test(
      'total-amount-match',
      'Total payment amount must match the total payable amount',
      // eslint-disable-next-line func-names
      function (values: any) {
        if (!values) return true;
        const totalPayable = values.totalPayableAmount || 0;
        const totalFromMethods = Number(String(values.totalAmount).replace(/[₹,\s,]/g, '')) || 0;

        if (totalFromMethods !== totalPayable) {
          return this.createError({
            path: 'totalAmount',
            message: `Total payment (₹${totalFromMethods.toLocaleString()}) must match total payable (₹${totalPayable.toLocaleString()})`,
          });
        }
        return true;
      }
    )
    // Root-level test to ensure sum(amounts for selected methods) matches totalAmount
    .test(
      'sum-of-payment-amounts',
      'Sum of all payment amounts should match Total Amount',
      // eslint-disable-next-line func-names
      function (values: any) {
        if (!values || !Array.isArray(values.payments)) return true;

        // Parse totalAmount robustly
        const totalRaw = values.totalAmount ?? 0;
        const total = Number(String(totalRaw).replace(/[₹,\s,]/g, '')) || 0;

        let sum = 0;
        const methodAmounts: { method: string; amount: number }[] = [];

        values.payments.forEach((payment: any) => {
          const amountRaw = payment.amount;
          if (amountRaw != null && amountRaw !== '') {
            const parsed = Number(String(amountRaw).replace(/[₹,\s,]/g, ''));
            if (!Number.isNaN(parsed)) {
              sum += parsed;
              methodAmounts.push({ method: payment.paymentMethod, amount: parsed });
            }
          }
        });

        if (sum !== total) {
          const methodBreakdown = methodAmounts
            .map(({ method, amount }) => `${method}: ₹${amount.toLocaleString()}`)
            .join(', ');

          return this.createError({
            message: `Sum of payment amounts (₹${sum.toLocaleString()}) must match total amount (₹${total.toLocaleString()}). Breakdown: ${methodBreakdown}`,
          });
        }

        return true;
      }
    );

export const buildCollectionFieldValidation = (field: IPaymentFieldConfig, currentYear: any) => {
  let schema: Yup.Schema<any>;

  if (field.type === 'date') {
    schema = field.required
      ? Yup.mixed()
          .required(`${field.label} is required`)
          .test(
            'is-valid-dayjs',
            `${field.label} must be a valid date`,
            (value) => value && dayjs(value as Dayjs).isValid()
          )
          .test(
            'min-date',
            `${field.label} must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            `${field.label} must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          )
      : Yup.mixed()
          .nullable()
          .test(
            'is-valid-dayjs',
            `${field.label} must be a valid date`,
            (value) => !value || dayjs(value as Dayjs).isValid()
          )
          .test(
            'min-date',
            `${field.label} must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              !value || dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            `${field.label} must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              !value || dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          );
  } else if (field.type === 'amount' || field.type === 'number') {
    schema = Yup.number()
      .typeError(`${field.label} must be a number`)
      .transform((val, orig) => {
        if (typeof orig === 'string') {
          const cleaned = orig.replace(/[₹,\s,]/g, '');
          const n = Number(cleaned);
          return Number.isNaN(n) ? undefined : n;
        }
        return val;
      })
      .min(field.min ?? 0, `${field.label} must be greater than ${field.min ?? 0}`);

    if (field.required) schema = schema.required(`${field.label} is required`);
  } else if (field.type === 'select') {
    schema = Yup.string();

    if (field.required) schema = schema.required(`${field.label} is required`);

    if (field?.options && field.options.length > 0)
      schema = schema.oneOf(field?.options, field.patternMessage || `${field.label} is invalid`);
  } else {
    schema = Yup.string();
    if (field.required) schema = schema.required(`${field.label} is required`);
  }

  if (field.pattern) {
    schema = (schema as Yup.StringSchema).matches(
      new RegExp(field.pattern),
      field.patternMessage || `${field.label} is invalid`
    );
  }

  return schema;
};

export default function PaymentDetailsForm({
  formik,
  feeHeads = [],
  charges = [],
}: IPaymentDetailsFormProps) {
  const theme = useTheme();
  // const { data: feeTermsData } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetFeeTermsQuery,
  // });
  useEffect(() => {
    const { selectedFeeHeads, selectedCharges } = formik.values;

    const totalHeads = selectedFeeHeads.reduce((sum: number, head: any) => sum + head.amount, 0);
    const totalCharges = selectedCharges.reduce(
      (sum: number, charge: any) => sum + charge.amount,
      0
    );
    const calculatedAmount = totalHeads + totalCharges;

    formik.setFieldValue('totalPayableAmount', calculatedAmount);
    formik.setFieldValue('totalAmount', calculatedAmount === 0 ? '' : calculatedAmount.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(formik.values.selectedFeeHeads),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(formik.values.selectedCharges),
  ]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      sx={{ height: '100%', overflow: 'hidden' }}
    >
      <Grid container spacing={1} sx={{ flexGrow: 1, minHeight: 0 }} mb={1}>
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%' }}>
          <FeeTermsComponent
            formik={formik as any}
            feeHeads={feeHeads}
            charges={charges}
            showError={
              formik.touched.totalPayableAmount && Boolean(formik.errors.totalPayableAmount)
            }
            errorMessage={formik.errors.totalPayableAmount as string}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }} sx={{ height: '100%' }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 1,
              borderRadius: 2,
              boxShadow: 'var(--shadows-4)',
              bgcolor: theme.vars.palette.background.paper,
              height: '100%',
              overflow: 'hidden',
              mt: 0.5,
              mr: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Details
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.primary"
                sx={{ fontWeight: 500, lineHeight: 1.5 }}
              >
                Total Amount : <strong>₹ {formatNumber(formik.values.totalAmount)}</strong>
              </Typography>
            </Box>
            <Scrollbar sx={{ flexGrow: 1, p: 1 }}>
              <Grid container spacing={3} pb={1}>
                {/* Terms Selection Section */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <ShakingTextField
                    error={formik.touched.payments && Boolean(formik.errors.payments)}
                  >
                    <CustomSelect
                      options={Object.keys(paymentMethodsConfig).map((method) => ({
                        value: method,
                        label: method.charAt(0).toUpperCase() + method.slice(1),
                      }))}
                      disabled={!formik.values.totalPayableAmount}
                      label="Payment Methods *"
                      value={formik.values.payments?.map((p) => p.paymentMethod) || []}
                      onChange={(selectedMethods: string[] | number[]) => {
                        const methods = selectedMethods as string[];
                        const currentPayments = [...(formik.values.payments || [])];

                        // Add new methods
                        methods.forEach((method) => {
                          if (!currentPayments.some((p) => p.paymentMethod === method)) {
                            const methodConfig =
                              paymentMethodsConfig[method as keyof typeof paymentMethodsConfig] ||
                              [];
                            const details: Record<string, any> = {};
                            methodConfig.forEach((field) => {
                              if (field.name !== 'amount') {
                                details[field.name] = field.type === 'date' ? null : '';
                              }
                            });
                            currentPayments.push({
                              paymentMethod: method,
                              amount: '',
                              details,
                            });
                          }
                        });

                        // Remove unselected methods
                        const filteredPayments = currentPayments.filter((p) =>
                          methods.includes(p.paymentMethod)
                        );

                        formik.setFieldValue('payments', filteredPayments);
                      }}
                      error={
                        formik.touched.payments &&
                        typeof formik.errors.payments === 'string' &&
                        Boolean(formik.errors.payments)
                      }
                      helperText={
                        (formik.touched.payments && typeof formik.errors.payments === 'string'
                          ? formik.errors.payments
                          : '') as string
                      }
                      multiple
                      formControlProps={{ sx: { width: '100%' } }}
                      name="payments"
                    />
                  </ShakingTextField>
                </Grid>

                {formik.values.payments?.map((payment, index) => (
                  <Grid size={{ xs: 12 }} key={payment.paymentMethod}>
                    <motion.div
                      key={payment.paymentMethod}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Box
                        sx={{
                          overflow: 'hidden',
                          mt: -2,
                        }}
                      >
                        <Typography variant="h6" color="primary.main">
                          {payment.paymentMethod}
                        </Typography>
                        <Grid container spacing={3} mt={1}>
                          {paymentMethodsConfig[
                            payment.paymentMethod as keyof typeof paymentMethodsConfig
                          ]?.map((field: IPaymentFieldConfig) => {
                            const isAmountField = field.name === 'amount';
                            const fieldPath = isAmountField
                              ? `payments[${index}].amount`
                              : `payments[${index}].details.${field.name}`;

                            const fieldValue = isAmountField
                              ? payment.amount
                              : payment.details[field.name];

                            const isTouched = isAmountField
                              ? (formik.touched.payments as any)?.[index]?.amount
                              : (formik.touched.payments as any)?.[index]?.details?.[field.name];

                            const errorMsg = isAmountField
                              ? (formik.errors.payments as any)?.[index]?.amount
                              : (formik.errors.payments as any)?.[index]?.details?.[field.name];

                            return (
                              <Grid size={{ xs: 6 }} key={`${payment.paymentMethod}-${field.name}`}>
                                {field.type === 'date' ? (
                                  <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                    <DatePicker
                                      label={`${field.label}${field.required ? ' *' : ''}`}
                                      value={fieldValue ? dayjs(fieldValue) : null}
                                      format="DD/MM/YYYY"
                                      onChange={(date) => formik.setFieldValue(fieldPath, date)}
                                      sx={{ width: '100%' }}
                                      slotProps={{
                                        textField: {
                                          size: 'small',
                                          fullWidth: true,
                                          error: isTouched && Boolean(errorMsg),
                                          helperText: isTouched && errorMsg,
                                        },
                                      }}
                                    />
                                  </ShakingTextField>
                                ) : field.type === 'select' ? (
                                  <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                    <TextField
                                      select
                                      fullWidth
                                      label={`${field.label}${field.required ? ' *' : ''}`}
                                      name={fieldPath}
                                      value={fieldValue}
                                      onChange={formik.handleChange}
                                      size="small"
                                      error={isTouched && Boolean(errorMsg)}
                                      helperText={isTouched && errorMsg}
                                      sx={{ width: '100%' }}
                                    >
                                      {field.options?.map((opt: any) => (
                                        <MenuItem key={opt} value={opt}>
                                          {opt}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </ShakingTextField>
                                ) : field.type === 'multiline' ? (
                                  <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      sx={{ width: '100%' }}
                                      minRows={2}
                                      size="small"
                                      label={`${field.label}${field.required ? ' *' : ''}`}
                                      name={fieldPath}
                                      value={fieldValue}
                                      onChange={formik.handleChange}
                                      error={isTouched && Boolean(errorMsg)}
                                      helperText={isTouched && errorMsg}
                                    />
                                  </ShakingTextField>
                                ) : field.type === 'amount' ? (
                                  <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                    <NumericFormatCustom
                                      size="small"
                                      fullWidth
                                      label={`${field.label}${field.required ? ' *' : ''}`}
                                      name={fieldPath}
                                      value={fieldValue}
                                      onChange={formik.handleChange}
                                      error={isTouched && Boolean(errorMsg)}
                                      helperText={isTouched && errorMsg}
                                    />
                                  </ShakingTextField>
                                ) : (
                                  <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                    <TextField
                                      fullWidth
                                      type={field.type}
                                      label={`${field.label}${field.required ? ' *' : ''}`}
                                      size="small"
                                      name={fieldPath}
                                      value={fieldValue}
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
                                      error={isTouched && Boolean(errorMsg)}
                                      helperText={isTouched && errorMsg}
                                      inputProps={
                                        field.type === 'number'
                                          ? { min: field.min, max: field.max }
                                          : {}
                                      }
                                    />
                                  </ShakingTextField>
                                )}
                              </Grid>
                            );
                          })}
                        </Grid>
                        <Divider
                          sx={{
                            mt: 2,
                            borderWidth: 1,
                          }}
                        />
                      </Box>
                    </motion.div>
                  </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
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
