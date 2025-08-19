import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import React, { useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Grid, MenuItem, useTheme, TextField, Typography } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeTermsQuery } from 'src/redux/feeCollection/feeTerms';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import FeeTermsComponent from './FeeTermsComponent';
import { paymentMethodsConfig } from './paymentConfigMethods';

import type { ITerm, IPaymentFieldConfig, IPaymentDetailsFormProps } from './type';

export const buildInitialValues = () => {
  const initialValues: Record<string, any> = {
    selectedMethods: [],
    selectedTerms: [],
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
export const buildValidationSchema = () =>
  Yup.object({
    selectedMethods: Yup.array().min(1, 'Select at least one payment method'),
    selectedTerms: Yup.array().min(1, 'Select at least one term to collect'),
    receivedAmount: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return Number(cleaned);
        }
        return value;
      })
      .required('Received amount is required')
      .positive('Amount must be positive'),
    totalAmount: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return Number(cleaned);
        }
        return value;
      })
      .required('Total amount is required')
      .positive('Amount must be positive'),
    notes: Yup.string(),
    ...Object.fromEntries(
      Object.entries(paymentMethodsConfig).map(([method, fields]) => [
        method,
        Yup.object(
          Object.fromEntries(
            fields.map((field) => [
              field.name,
              field.required
                ? field.type === 'date'
                  ? Yup.mixed()
                      .required(`${field.label} is required`)
                      .test(
                        'is-valid-dayjs',
                        `${field.label} must be a valid date`,
                        (value) => value && dayjs(value as Dayjs).isValid()
                      )
                  : Yup.string().required(`${field.label} is required`)
                : field.type === 'date'
                  ? Yup.mixed()
                      .nullable()
                      .test(
                        'is-valid-dayjs',
                        `${field.label} must be a valid date`,
                        (value) => !value || dayjs(value as Dayjs).isValid()
                      )
                  : Yup.string(),
            ])
          )
        ),
      ])
    ),
  });

export default function PaymentDetailsForm({ formik }: IPaymentDetailsFormProps) {
  const theme = useTheme();
  const { data: feeTermsData, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeTermsQuery,
  });
  // Calculate total payable amount based on selected terms
  const selectedTermsData =
    feeTermsData?.filter((term: ITerm) => formik.values.selectedTerms.includes(term.id)) || [];
  // Update totalAmount in formik when selectedTerms change
  useEffect(() => {
    const amount = selectedTermsData.reduce(
      (sum: number, term: ITerm) => sum + (term.total - term.paid),
      0
    );
    formik.setFieldValue('totalAmount', amount === 0 ? '' : amount.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.selectedTerms]);

  return (
    <Box display="flex" flexDirection="column">
      <Grid item xs={12}>
        <FeeTermsComponent
          terms={feeTermsData}
          selectedTerms={formik.values.selectedTerms}
          onTermSelect={(selectedTerms) => formik.setFieldValue('selectedTerms', selectedTerms)}
          showError={formik.touched.selectedTerms && Boolean(formik.errors.selectedTerms)}
          errorMessage={formik.errors.selectedTerms as string}
        />
      </Grid>
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Payment Details
        </Typography>
        <DialogScrollContent>
          <Scrollbar sx={{ pt: 2, height: '250px' }}>
            <Grid container spacing={2}>
              {/* Terms Selection Section */}

              <Grid item xs={12} sm={4}>
                <NumericFormatCustom
                  fullWidth
                  label="Total Payable Amount"
                  value={`₹${formik.values.totalAmount}`}
                  disabled
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <NumericFormatCustom
                  fullWidth
                  label="Received Amount *"
                  size="small"
                  name="receivedAmount"
                  value={formik.values.receivedAmount}
                  onChange={formik.handleChange}
                  error={formik.touched.receivedAmount && Boolean(formik.errors.receivedAmount)}
                  helperText={
                    (formik.touched.receivedAmount && formik.errors.receivedAmount) as string
                  }
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <CustomSelect
                  options={Object.keys(paymentMethodsConfig).map((method) => ({
                    value: method,
                    label: method.charAt(0).toUpperCase() + method.slice(1),
                  }))}
                  label="Payment Methods *"
                  value={formik.values.selectedMethods}
                  onChange={(value) => formik.setFieldValue('selectedMethods', value)}
                  error={formik.touched.selectedMethods && Boolean(formik.errors.selectedMethods)}
                  helperText={
                    (formik.touched.selectedMethods && formik.errors.selectedMethods) as string
                  }
                  multiple
                  formControlProps={{
                    sx: { width: '100%' },
                  }}
                  name="selectedMethods"
                />
              </Grid>

              {formik.values.selectedMethods.map((method: string) => (
                <Grid item xs={12} key={method}>
                  <SectionCard key={method} title={method}>
                    {paymentMethodsConfig[method as keyof typeof paymentMethodsConfig]?.map(
                      (field: IPaymentFieldConfig) => (
                        <Grid item xs={12} key={`${method}-${field.name}`} sm={4}>
                          {field.type === 'date' ? (
                            <DatePicker
                              label={field.label}
                              value={
                                formik.values[method][field.name]
                                  ? dayjs(formik.values[method][field.name])
                                  : null
                              }
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
                          ) : field.type === 'select' ? (
                            <TextField
                              select
                              fullWidth
                              label={field.label}
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
                          ) : field.type === 'multiline' ? (
                            <TextField
                              fullWidth
                              multiline
                              sx={{ width: '100%' }}
                              minRows={2}
                              size="small"
                              label={field.label}
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
                          ) : field.type === 'amount' ? (
                            <NumericFormatCustom
                              size="small"
                              fullWidth
                              label={field.label}
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
                          ) : (
                            <TextField
                              fullWidth
                              type={field.type}
                              label={field.label}
                              size="small"
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
                              inputProps={
                                field.type === 'number' ? { min: field.min, max: field.max } : {}
                              }
                            />
                          )}
                        </Grid>
                      )
                    )}
                  </SectionCard>
                </Grid>
              ))}

              <Grid item xs={12}>
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
        </DialogScrollContent>
      </Card>
    </Box>
  );
}
