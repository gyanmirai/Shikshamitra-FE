import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeTermsQuery } from 'src/redux/feeCollection/feeTerms';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Card, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

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
      <Grid container spacing={3}>
        <Grid size={{ xs: 6 }} mt={2} mb={2}>
          <FeeTermsComponent
            terms={feeTermsData}
            selectedTerms={formik.values.selectedTerms}
            onTermSelect={(selectedTerms) => formik.setFieldValue('selectedTerms', selectedTerms)}
            showError={formik.touched.selectedTerms && Boolean(formik.errors.selectedTerms)}
            errorMessage={formik.errors.selectedTerms as string}
          />
        </Grid>

        <Grid size={{ xs: 6 }} mt={2} mb={2}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: 2,
              bgcolor: theme.palette.background.paper,
              height: '100%',
            }}
          >
            <Scrollbar
              sx={{
                maxHeight: 'calc(100vh - 300px)', // adjust offset according to your header/footer
                minHeight: 'auto',
                pr: 1,
              }}
            >
              <Typography variant="h6" color="primary.main" fontWeight={600} mb={2}>
                Payment Details
              </Typography>

              <Grid container spacing={2}>
                {/* Terms Selection Section */}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <NumericFormatCustom
                    fullWidth
                    label="Total Payable Amount"
                    value={`₹${formik.values.totalAmount}`}
                    disabled
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.receivedAmount && formik.errors.receivedAmount)}
                  >
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
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.selectedMethods && Boolean(formik.errors.selectedMethods)}
                  >
                    <CustomSelect
                      options={Object.keys(paymentMethodsConfig).map((method) => ({
                        value: method,
                        label: method.charAt(0).toUpperCase() + method.slice(1),
                      }))}
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
                      formControlProps={{
                        sx: { width: '100%' },
                      }}
                      name="selectedMethods"
                    />
                  </ShakingTextField>
                </Grid>

                {formik.values.selectedMethods.map((method: string) => (
                  <Grid size={{ xs: 12 }} key={method}>
                    <SectionCard key={method} title={method}>
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
                    </SectionCard>
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
