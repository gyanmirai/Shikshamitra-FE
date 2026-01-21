import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeTermsQuery } from 'src/redux/feeCollection/feeTerms';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Card, Grid, Divider, MenuItem, TextField, Typography } from '@mui/material';

import FeeTermsComponent from './FeeTermsComponent';
import { paymentMethodsConfig } from './paymentConfigMethods';

import type { IPaymentFieldConfig, IPaymentDetailsFormProps } from './type';

export const buildInitialValues = () => {
  const initialValues: Record<string, any> = {
    selectedMethods: [],
    selectedTerms: [],
    includeCharges: true,
    totalAmount: '',
    receivedAmount: '',
    notes: '',
  };

  Object.keys(paymentMethodsConfig).forEach((method) => {
    initialValues[method] = {};
    const methodConfig = paymentMethodsConfig[method as keyof typeof paymentMethodsConfig];
    methodConfig.forEach((field) => {
      initialValues[method][field.name] = field.type === 'date' ? null : '';
    });
  });
  return initialValues;
};

export const buildValidationSchema = (currentYear: any) =>
  Yup.object({
    selectedMethods: Yup.array().min(1, 'Select at least one payment method'),
    selectedTerms: Yup.array().min(1, 'Select at least one term to collect'),
    totalAmount: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s,]/g, '');
          const n = Number(cleaned);
          return Number.isNaN(n) ? value : n;
        }
        return value;
      })
      .required('Total amount is required')
      .positive('Amount must be positive'),
    notes: Yup.string(),

    // per-method schemas generated from config (each will validate required, pattern, date etc.)
    ...Object.fromEntries(
      Object.entries(paymentMethodsConfig).map(([method, fields]) => [
        method,
        Yup.object(
          Object.fromEntries(
            fields.map((field) => [field.name, buildCollectionFieldValidation(field, currentYear)])
          )
        ),
      ])
    ),
  })
    // Individual amount validation - each payment method amount should not exceed totalAmount
    .test(
      'individual-payment-amounts',
      'Individual payment amount cannot exceed total amount',
      // eslint-disable-next-line func-names
      function (values: any) {
        if (!values) return true;

        // Parse totalAmount robustly
        const totalRaw = values.totalAmount ?? 0;
        const total = Number(String(totalRaw).replace(/[₹,\s,]/g, '')) || 0;

        if (Array.isArray(values.selectedMethods)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const method of values.selectedMethods) {
            const methodData = values[method];
            // eslint-disable-next-line no-continue
            if (!methodData) continue;

            const amountRaw = methodData.amount;
            // eslint-disable-next-line no-continue
            if (amountRaw == null || amountRaw === '') continue;

            const parsed = Number(String(amountRaw).replace(/[₹,\s,]/g, ''));
            if (!Number.isNaN(parsed) && parsed > total) {
              return this.createError({
                path: `${method}.amount`,
                message: `${method} amount (₹${parsed.toLocaleString()}) cannot be greater than total amount (₹${total.toLocaleString()})`,
              });
            }
          }
        }

        return true;
      }
    )
    // Root-level test to ensure sum(amounts for selected methods) <= totalAmount
    .test(
      'sum-of-payment-amounts',
      'Sum of all payment amounts should not be greater than Total Amount',
      // eslint-disable-next-line func-names
      function (values: any) {
        if (!values) return true;

        // Parse totalAmount robustly
        const totalRaw = values.totalAmount ?? 0;
        const total = Number(String(totalRaw).replace(/[₹,\s,]/g, '')) || 0;

        let sum = 0;
        const methodAmounts: { method: string; amount: number }[] = [];

        if (Array.isArray(values.selectedMethods)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const method of values.selectedMethods) {
            const methodData = values[method];
            // eslint-disable-next-line no-continue
            if (!methodData) continue;

            const amountRaw = methodData.amount;
            // eslint-disable-next-line no-continue
            if (amountRaw == null || amountRaw === '') continue;

            const parsed = Number(String(amountRaw).replace(/[₹,\s,]/g, ''));
            if (!Number.isNaN(parsed)) {
              sum += parsed;
              methodAmounts.push({ method, amount: parsed });
            }
          }
        }

        if (sum > total) {
          const methodBreakdown = methodAmounts
            .map(({ method, amount }) => `${method}: ₹${amount.toLocaleString()}`)
            .join(', ');

          return this.createError({
            message: `Sum of payment amounts (₹${sum.toLocaleString()}) exceeds total amount (₹${total.toLocaleString()}). Breakdown: ${methodBreakdown}`,
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

export default function PaymentDetailsForm({ formik }: IPaymentDetailsFormProps) {
  const theme = useTheme();
  const { data: feeTermsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeTermsQuery,
  });

  useEffect(() => {
    const { selectedTerms, includeCharges } = formik.values;

    if (selectedTerms.length === 0) {
      formik.setFieldValue('totalAmount', '');
      return;
    }

    const amount = selectedTerms.reduce((pre: number, term: any) => {
      if (includeCharges) {
        return pre + (term.total - (term.paid || 0));
      }
      // Only feeHeads when charges excluded
      const feeHeadsTotal = term.feeHeads?.reduce(
        (s: number, fh: any) => s + (fh.total - (fh.paid || 0)),
        0
      );
      return pre + feeHeadsTotal;
    }, 0);

    formik.setFieldValue('totalAmount', amount === 0 ? '' : amount.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formik.values.selectedTerms), formik.values.includeCharges]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      sx={{ height: '100%', overflow: 'hidden' }}
    >
      <Box mt={1} mb={2}>
        <Divider />
      </Box>
      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%' }}>
          <FeeTermsComponent
            formik={formik}
            terms={feeTermsData}
            selectedTerms={formik.values.selectedTerms}
            onTermSelect={(selectedTerms) => formik.setFieldValue('selectedTerms', selectedTerms)}
            showError={formik.touched.selectedTerms && Boolean(formik.errors.selectedTerms)}
            errorMessage={formik.errors.selectedTerms as string}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }} sx={{ height: '100%' }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              borderRadius: 1,
              boxShadow: 'var(--shadows-4)',
              bgcolor: theme.vars.palette.background.paper,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Payment Details
            </Typography>
            <Scrollbar sx={{ flexGrow: 1, p: 1, height: '100%' }}>
              <Grid container spacing={3} pt={1}>
                {/* Terms Selection Section */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontWeight: 500, lineHeight: 1.5 }}
                  >
                    Total Amount : <strong>₹ {formatNumber(formik.values.totalAmount)}</strong>
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <ShakingTextField
                    error={formik.touched.selectedMethods && Boolean(formik.errors.selectedMethods)}
                  >
                    <CustomSelect
                      options={Object.keys(paymentMethodsConfig).map((method) => ({
                        value: method,
                        label: method.charAt(0).toUpperCase() + method.slice(1),
                      }))}
                      // disabled={!formik.values.totalAmount}
                      label="Payment Methods *"
                      value={formik.values.selectedMethods}
                      onChange={(value) => formik.setFieldValue('selectedMethods', value)}
                      error={
                        formik.touched.selectedMethods && Boolean(formik.errors.selectedMethods)
                      }
                      helperText={
                        (formik.touched.selectedMethods && formik.errors.selectedMethods) as string
                      }
                      multiple
                      formControlProps={{ sx: { width: '100%' } }}
                      name="selectedMethods"
                    />
                  </ShakingTextField>
                </Grid>

                {formik.values.selectedMethods.map((method: string) => (
                  <Grid size={{ xs: 12 }} key={method}>
                    <Box
                      key={method}
                      sx={{
                        overflow: 'hidden',
                        mt: -2,
                      }}
                    >
                      <Typography variant="h6" color="primary.main">
                        {method}
                      </Typography>
                      <Grid container spacing={3} mt={1}>
                        {paymentMethodsConfig[method as keyof typeof paymentMethodsConfig]?.map(
                          (field: IPaymentFieldConfig) => (
                            <Grid size={{ xs: 6 }} key={`${method}-${field.name}`}>
                              {/* your field rendering logic stays the same */}

                              {field.type === 'date' ? (
                                <ShakingTextField
                                  error={
                                    (formik.touched as any)[method]?.[field.name] &&
                                    Boolean((formik.errors as any)[method]?.[field.name])
                                  }
                                >
                                  <DatePicker
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    value={
                                      formik.values[method][field.name]
                                        ? dayjs(formik.values[method][field.name])
                                        : null
                                    }
                                    format="DD/MM/YYYY"
                                    onChange={(date) =>
                                      formik.setFieldValue(`${method}.${field.name}`, date)
                                    }
                                    sx={{ width: '100%' }}
                                    slotProps={{
                                      textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error:
                                          (formik.touched as any)[method]?.[field.name] &&
                                          Boolean((formik.errors as any)[method]?.[field.name]),
                                        helperText:
                                          (formik.touched as any)[method]?.[field.name] &&
                                          (formik.errors as any)[method]?.[field.name],
                                      },
                                    }}
                                  />
                                </ShakingTextField>
                              ) : field.type === 'select' ? (
                                <ShakingTextField
                                  error={
                                    (formik.touched as any)[method]?.[field.name] &&
                                    Boolean((formik.errors as any)[method]?.[field.name])
                                  }
                                >
                                  <TextField
                                    select
                                    fullWidth
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    name={`${method}.${field.name}`}
                                    value={formik.values[method][field.name]}
                                    onChange={formik.handleChange}
                                    size="small"
                                    error={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      Boolean((formik.errors as any)[method]?.[field.name])
                                    }
                                    helperText={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      (formik.errors as any)[method]?.[field.name]
                                    }
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
                                <ShakingTextField
                                  error={
                                    (formik.touched as any)[method]?.[field.name] &&
                                    Boolean((formik.errors as any)[method]?.[field.name])
                                  }
                                >
                                  <TextField
                                    fullWidth
                                    multiline
                                    sx={{ width: '100%' }}
                                    minRows={2}
                                    size="small"
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    name={`${method}.${field.name}`}
                                    value={formik.values[method][field.name]}
                                    onChange={formik.handleChange}
                                    error={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      Boolean((formik.errors as any)[method]?.[field.name])
                                    }
                                    helperText={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      (formik.errors as any)[method]?.[field.name]
                                    }
                                  />
                                </ShakingTextField>
                              ) : field.type === 'amount' ? (
                                <ShakingTextField
                                  error={
                                    (formik.touched as any)[method]?.[field.name] &&
                                    Boolean((formik.errors as any)[method]?.[field.name])
                                  }
                                >
                                  <NumericFormatCustom
                                    size="small"
                                    fullWidth
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    name={`${method}.${field.name}`}
                                    value={formik.values[method][field.name]}
                                    onChange={formik.handleChange}
                                    error={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      Boolean((formik.errors as any)[method]?.[field.name])
                                    }
                                    helperText={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      (formik.errors as any)[method]?.[field.name]
                                    }
                                  />
                                </ShakingTextField>
                              ) : (
                                <ShakingTextField
                                  error={
                                    (formik.touched as any)[method]?.[field.name] &&
                                    Boolean((formik.errors as any)[method]?.[field.name])
                                  }
                                >
                                  <TextField
                                    fullWidth
                                    type={field.type}
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    size="small"
                                    name={`${method}.${field.name}`}
                                    value={formik.values[method][field.name]}
                                    onChange={(e) => {
                                      const newValue = e.target.value;

                                      if (field.pattern) {
                                        if (newValue === '') {
                                          formik.setFieldValue(`${method}.${field.name}`, newValue);
                                          return;
                                        }

                                        // Define allowed chars manually
                                        const allowedChars = 'a-zA-Z0-9 ';
                                        const typingRegex = new RegExp(`^[${allowedChars}]*$`);

                                        if (!typingRegex.test(newValue)) return; // block invalid chars
                                      }
                                      formik.setFieldValue(`${method}.${field.name}`, newValue);
                                    }}
                                    error={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      Boolean((formik.errors as any)[method]?.[field.name])
                                    }
                                    helperText={
                                      (formik.touched as any)[method]?.[field.name] &&
                                      (formik.errors as any)[method]?.[field.name]
                                    }
                                    inputProps={
                                      field.type === 'number'
                                        ? { min: field.min, max: field.max }
                                        : {}
                                    }
                                  />
                                </ShakingTextField>
                              )}
                            </Grid>
                          )
                        )}
                      </Grid>
                      <Divider
                        sx={{
                          mt: 2,
                          borderWidth: 1,
                        }}
                      />
                    </Box>
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
