'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Grid, Button, MenuItem, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import StudentRefundInfo from './StudentRefundInfo';
import { feeRefundProcessvalidationSchema } from './FeeRefundProcessValidation';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IRefundFormValues, IRefundProcessFormProps } from '../type';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

export const getInitialPaymentDetails = (method?: string) => {
  if (!method || !(method in paymentMethodsConfig)) return {};
  return paymentMethodsConfig[method as keyof typeof paymentMethodsConfig].reduce(
    (acc, field) => {
      acc[field.name] = ''; // default empty
      return acc;
    },
    {} as Record<string, any>
  );
};

const RefundProcessForm: React.FC<IRefundProcessFormProps> = ({ open, onClose, student }) => {
  const formik = useFormik<IRefundFormValues>({
    initialValues: {
      paidTerms: student?.paidTerms || [],
      totalPaidFees: student?.totalPaidFees || '',
      refundAmount: student?.refundAmount || null,
      refundMethod: student?.refundMethod || '',
      reason: student?.reason || '',
      remarks: 'Not Appropriate Request',
      paymentDetails: {
        ...getInitialPaymentDetails(student?.refundMethod),
        ...(student?.paymentDetails || {}), // merge if student already has values
      },
    },
    validationSchema: feeRefundProcessvalidationSchema,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Remarks submitted successfully' });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <StudentRefundInfo student={student} />

        {/* Disabled Fields */}
        {/* <Grid container spacing={3}> */}
        <Grid size={12}>
          <SectionCard title="Refund Details">
            <Grid size={6}>
              <CustomSelect
                label="Paid Terms"
                value={formik.values.paidTerms || []}
                options={[
                  { value: 'Term 1', label: 'Term 1' },
                  { value: 'Term 2', label: 'Term 2' },
                  { value: 'Term 3', label: 'Term 3' },
                  { value: 'Term 4', label: 'Term 4' },
                ]}
                onChange={(value) => {
                  formik.setFieldValue('paidTerms', value);
                }}
                multiple
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="Amount Applicable For Refund"
                value={formik.values.refundAmount}
                fullWidth
                size="small"
                disabled
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Refund Amount"
                value={formik.values.refundAmount}
                fullWidth
                size="small"
                disabled
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Refund Method"
                value={formik.values.refundMethod}
                fullWidth
                size="small"
                disabled
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Reason of Refund"
                value={formik.values.reason}
                fullWidth
                size="small"
                multiline
                rows={3}
                disabled
              />
            </Grid>

            <Grid size={6}>
              <ShakingTextField error={formik.touched.remarks && Boolean(formik.errors.remarks)}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  size="small"
                  disabled
                  multiline
                  rows={3}
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                  helperText={formik.touched.remarks && formik.errors.remarks}
                />
              </ShakingTextField>
            </Grid>
            {/* </Grid> */}
          </SectionCard>
        </Grid>
        {formik.values.refundMethod !== 'Cash' && (
          <Grid size={12}>
            <SectionCard title="Payment Details">
              {paymentMethodsConfig[
                formik.values.refundMethod as keyof typeof paymentMethodsConfig
              ]?.map((field: IPaymentFieldConfig) => (
                <Grid size={6} key={`${formik.values.refundMethod}-${field.name}`}>
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
              ))}
            </SectionCard>
          </Grid>
        )}
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          type="submit"
          color="success"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Generate Receipt
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RefundProcessForm;
