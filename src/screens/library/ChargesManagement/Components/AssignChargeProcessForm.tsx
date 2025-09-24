'use client';

import type { IPaymentFieldConfig } from 'src/screens/finance/FeeCollection/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Grid, Button, MenuItem, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { getInitialPaymentDetails } from 'src/screens/finance/feeRefund/Components/RefundProcessForm';
import { paymentMethodsConfig } from 'src/screens/finance/FeeCollection/Components/paymentConfigMethods';

import { collectChargeValidationSchema } from './AssignValidationCharges';

import type { ICollectChargesProps, ICollectChargesFormValues } from './type';

const CollectChargesForm: React.FC<ICollectChargesProps> = ({ open, onClose, charge }) => {
  const formik = useFormik<ICollectChargesFormValues>({
    initialValues: {
      role: charge?.role || '',
      class: charge?.classNo || '',
      division: charge?.division || '',
      memberName: charge?.memberName || '',
      bookTitle: charge?.bookTitle || '',
      chargeCategory: charge?.chargeCategory || '',
      fineAmount: charge?.fineAmount || 0,
      dueDate: charge?.dueDate || '',
      reason: charge?.reason || '',
      paymentDetails: {
        paymentMethod: charge?.paymentDetails?.paymentMethod || '',
        paymentAmount: charge?.paymentDetails?.paymentAmount || null,
        notes: charge?.paymentDetails?.notes || '',
        ...getInitialPaymentDetails(charge?.paymentDetails?.paymentMethod),
        ...(charge?.paymentDetails || {}),
      },
    },
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: collectChargeValidationSchema,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Charge collected successfully' });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Assigned Charge Details */}
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Charge Details">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Role"
                  value={formik.values.role}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Class"
                  value={formik.values.class}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Division"
                  value={formik.values.division}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Student"
                  value={formik.values.memberName}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Book Title"
                  value={formik.values.bookTitle}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Charge Category"
                  value={formik.values.chargeCategory}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Amount"
                  value={formik.values.fineAmount}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Due Date"
                  value={formik.values.dueDate ? dayjs(formik.values.dueDate, 'DD/MM/YYYY') : null}
                  disabled
                  sx={{ width: '100%' }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Reason of Charge"
                  value={formik.values.reason}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  disabled
                />
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* Payment Section */}
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Payment Details">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={
                    formik.touched.paymentDetails?.paymentMethod &&
                    Boolean(formik.errors.paymentDetails?.paymentMethod)
                  }
                >
                  <CustomSelect
                    options={Object.keys(paymentMethodsConfig).map((method) => ({
                      value: method,
                      label: method.charAt(0).toUpperCase() + method.slice(1),
                    }))}
                    label="Payment Method *"
                    value={formik.values.paymentDetails.paymentMethod} // should be a single value
                    onChange={(value) => {
                      // Update payment method
                      formik.setFieldValue('paymentDetails.paymentMethod', value);

                      // Reset other payment details according to selected method
                      const newPaymentDetails = {
                        ...formik.values.paymentDetails,
                        ...getInitialPaymentDetails(value as string), // inject initial details for method
                        paymentMethod: value,
                      };

                      formik.setFieldValue('paymentDetails', newPaymentDetails);
                      formik.validateForm();
                    }}
                    error={
                      formik?.touched?.paymentDetails?.paymentMethod &&
                      Boolean(formik?.errors?.paymentDetails?.paymentMethod)
                    }
                    helperText={
                      (formik.touched.paymentDetails?.paymentMethod &&
                        formik.errors.paymentDetails?.paymentMethod) as string
                    }
                    formControlProps={{ sx: { width: '100%' } }}
                    name="paymentMethod"
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={
                    formik.touched.paymentDetails?.paymentAmount &&
                    Boolean(formik.errors.paymentDetails?.paymentAmount)
                  }
                >
                  <NumericFormatCustom
                    fullWidth
                    label="Amount *"
                    name="paymentDetails.paymentAmount"
                    size="small"
                    value={formik.values.paymentDetails.paymentAmount ?? ''}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.paymentDetails?.paymentAmount &&
                      Boolean(formik.errors.paymentDetails?.paymentAmount)
                    }
                    helperText={
                      formik.touched.paymentDetails?.paymentAmount &&
                      formik.errors.paymentDetails?.paymentAmount
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Notes"
                  name="paymentDetails.notes"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={formik.values.paymentDetails.notes}
                  onChange={formik.handleChange}
                />
              </Grid>

              {formik.values.paymentDetails.paymentMethod !== 'Cash' &&
                paymentMethodsConfig[
                  formik.values.paymentDetails.paymentMethod as keyof typeof paymentMethodsConfig
                ]?.map((field: IPaymentFieldConfig) => {
                  console.log('field----', field);
                  return (
                    <Grid
                      size={6}
                      key={`${formik.values.paymentDetails.paymentMethod}-${field.name}`}
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
                        {field.type === 'date' ? (
                          <DatePicker
                            label={field.label}
                            value={
                              formik.values.paymentDetails?.[
                                field.name as keyof typeof formik.values.paymentDetails
                              ]
                                ? dayjs(
                                    formik.values.paymentDetails[
                                      field.name as keyof typeof formik.values.paymentDetails
                                    ]
                                  )
                                : null
                            }
                            onChange={(date) =>
                              formik.setFieldValue(`paymentDetails.${field.name}`, date)
                            }
                            sx={{ width: '100%' }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                error:
                                  formik.touched.paymentDetails &&
                                  formik.touched.paymentDetails[
                                    field.name as keyof typeof formik.touched.paymentDetails
                                  ] &&
                                  Boolean(
                                    formik.errors.paymentDetails?.[
                                      field.name as keyof typeof formik.errors.paymentDetails
                                    ]
                                  ),
                                helperText:
                                  formik.touched.paymentDetails?.[
                                    field.name as keyof typeof formik.touched.paymentDetails
                                  ] &&
                                  typeof formik.errors.paymentDetails?.[
                                    field.name as keyof typeof formik.errors.paymentDetails
                                  ] === 'string'
                                    ? (formik.errors.paymentDetails?.[
                                        field.name as keyof typeof formik.errors.paymentDetails
                                      ] as string)
                                    : undefined,
                              },
                            }}
                          />
                        ) : field.type === 'select' ? (
                          <TextField
                            select
                            fullWidth
                            label={field.label}
                            name={`paymentDetails.${field.name}`}
                            value={
                              formik.values.paymentDetails?.[
                                field.name as keyof typeof formik.values.paymentDetails
                              ] || ''
                            }
                            onChange={formik.handleChange}
                            size="small"
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
                            helperText={
                              formik.touched.paymentDetails?.[
                                field.name as keyof typeof formik.touched.paymentDetails
                              ] &&
                              typeof formik.errors.paymentDetails?.[
                                field.name as keyof typeof formik.errors.paymentDetails
                              ] === 'string'
                                ? (formik.errors.paymentDetails?.[
                                    field.name as keyof typeof formik.errors.paymentDetails
                                  ] as string)
                                : undefined
                            }
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
                            sx={{ width: '100%' }}
                            minRows={2}
                            size="small"
                            label={field.label}
                            name={`paymentDetails.${field.name}`}
                            value={
                              formik.values.paymentDetails?.[
                                field.name as keyof typeof formik.values.paymentDetails
                              ] || ''
                            }
                            onChange={formik.handleChange}
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
                            helperText={
                              formik.touched.paymentDetails?.[
                                field.name as keyof typeof formik.touched.paymentDetails
                              ] &&
                              typeof formik.errors.paymentDetails?.[
                                field.name as keyof typeof formik.errors.paymentDetails
                              ] === 'string'
                                ? (formik.errors.paymentDetails?.[
                                    field.name as keyof typeof formik.errors.paymentDetails
                                  ] as string)
                                : undefined
                            }
                          />
                        ) : field.type === 'amount' ? (
                          <NumericFormatCustom
                            size="small"
                            fullWidth
                            label={field.label}
                            name={`paymentDetails.${field.name}`}
                            value={
                              formik.values.paymentDetails?.[
                                field.name as keyof typeof formik.values.paymentDetails
                              ] || ''
                            }
                            onChange={formik.handleChange}
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
                            helperText={
                              formik.touched.paymentDetails?.[
                                field.name as keyof typeof formik.touched.paymentDetails
                              ] &&
                              typeof formik.errors.paymentDetails?.[
                                field.name as keyof typeof formik.errors.paymentDetails
                              ] === 'string'
                                ? (formik.errors.paymentDetails?.[
                                    field.name as keyof typeof formik.errors.paymentDetails
                                  ] as string)
                                : undefined
                            }
                          />
                        ) : (
                          <TextField
                            fullWidth
                            type={field.type}
                            label={field.label}
                            size="small"
                            name={`paymentDetails.${field.name}`}
                            value={
                              formik.values.paymentDetails?.[
                                field.name as keyof typeof formik.values.paymentDetails
                              ] || ''
                            }
                            onChange={formik.handleChange}
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
                            helperText={
                              formik.touched.paymentDetails?.[
                                field.name as keyof typeof formik.touched.paymentDetails
                              ] &&
                              typeof formik.errors.paymentDetails?.[
                                field.name as keyof typeof formik.errors.paymentDetails
                              ] === 'string'
                                ? (formik.errors.paymentDetails?.[
                                    field.name as keyof typeof formik.errors.paymentDetails
                                  ] as string)
                                : undefined
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
            </Grid>
          </SectionCard>
        </Grid>
      </DialogScrollContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          onClick={(e: any) => formik.handleSubmit(e)}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default CollectChargesForm;
