import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialPaymentTermData } from './PaymentTermInitialValues';
import { paymentTermValidationSchema } from './PayementTermValidationSchema';

import type { IInstallment, IFeeStructureFormProps } from '../type';

const PaymentTermForm: React.FC<IFeeStructureFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues: getInitialPaymentTermData(editData),
    validationSchema: paymentTermValidationSchema(currentYear),
    validateOnChange: true,
    // Handle form submission
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  const [installments, setInstallments] = useState(formik.values.installments || []);

  // Update installments when number changes
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const count = Number(formik.values.totalInstallments || 0);

      // Run full validation to get the latest errors
      const errors = await formik.validateForm();
      const hasError = Boolean(errors.totalInstallments);

      if (count > 0 && !hasError) {
        const updated = Array.from({ length: count }, (_, i) => ({
          index: i,
          id: i + 1,
          installmentName: formik.values.installments?.[i]?.installmentName || '',
          dueDate: formik.values.installments?.[i]?.dueDate || null,
          reminderDate: formik.values.installments?.[i]?.reminderDate || null,
          gracePeriod: formik.values.installments?.[i]?.gracePeriod || null,
          overdueCharges: formik.values.installments?.[i]?.overdueCharges || null,
        }));
        setInstallments(updated);
        formik.setFieldValue('installments', updated);
      } else {
        setInstallments([]);
        formik.setFieldValue('installments', []);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.totalInstallments]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <ShakingTextField
                  error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                >
                  <TextField
                    fullWidth
                    name="paymentTermName"
                    label="Payment Term Name *"
                    value={formik.values.paymentTermName || ''}
                    onChange={(e) => {
                      let value = e.target.value
                        .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/^\d+/, '') // Remove leading numbers
                        .trimStart(); // Remove leading spaces
                      value = value
                        .split(' ')
                        .map((word) =>
                          word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                        )
                        .join(' ');

                      formik.setFieldValue('paymentTermName', value);
                    }}
                    error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                    helperText={formik.touched.paymentTermName && formik.errors.paymentTermName}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ShakingTextField
                  error={!!(formik.touched.totalInstallments && formik.errors.totalInstallments)}
                >
                  <TextField
                    fullWidth
                    name="totalInstallments"
                    label="Total Installments *"
                    type="number"
                    value={formik.values.totalInstallments || ''}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldTouched('totalInstallments', true);
                    }}
                    error={!!(formik.touched.totalInstallments && formik.errors.totalInstallments)}
                    helperText={formik.touched.totalInstallments && formik.errors.totalInstallments}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>

            {/* Installments Table with CustomizableTable */}
            {installments.length > 0 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <strong>Installments</strong>
                  </Grid>
                  <Grid size={12}>
                    <CustomizableTable
                      tableContainerProps={{ sx: { maxHeight: '300px' } }}
                      tableId="installments-table"
                      isSearch={false}
                      isFilter={false}
                      columns={[
                        {
                          id: 'id',
                          label: 'Sr No.',
                          align: 'left',
                          isFilter: false,
                          isSort: false,
                          minWidth: 45,
                          filterType: 'number',
                          render(value, row) {
                            return <span>{row.id}</span>;
                          },
                        },
                        {
                          id: 'installmentName',
                          label: 'Name',
                          align: 'left',
                          minWidth: 170,
                          render(value, row) {
                            return (
                              <ShakingTextField
                                error={
                                  !!(
                                    formik?.touched?.installments?.[row.index]?.installmentName &&
                                    Array.isArray(formik?.errors?.installments) &&
                                    typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                    (
                                      formik.errors.installments[
                                        row.index
                                      ] as FormikErrors<IInstallment>
                                    )?.installmentName
                                  )
                                }
                              >
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Installment Name *"
                                  name={`installments.${row.index}.installmentName`}
                                  value={
                                    formik.values.installments[row.index]?.installmentName || ''
                                  }
                                  onChange={(e) => {
                                    const updated = [...installments];
                                    updated[row.index].installmentName = e.target.value;
                                    setInstallments(updated);
                                    formik.setFieldTouched(
                                      `installments.${row.index}.installmentName`,
                                      false
                                    );
                                  }}
                                  variant="outlined"
                                  sx={{
                                    mb: 2,
                                    width: '100%',
                                    padding: '0',
                                    borderRadius: 1,
                                  }}
                                  FormHelperTextProps={{
                                    sx: {
                                      margin: 0,
                                      position: 'static',
                                      whiteSpace: 'normal',
                                    },
                                  }}
                                  error={
                                    !!(
                                      formik?.touched?.installments?.[row.index]?.installmentName &&
                                      Array.isArray(formik?.errors?.installments) &&
                                      typeof formik?.errors?.installments?.[row.index] ===
                                        'object' &&
                                      (
                                        formik.errors.installments[
                                          row.index
                                        ] as FormikErrors<IInstallment>
                                      )?.installmentName
                                    )
                                  }
                                  helperText={
                                    formik?.touched?.installments?.[row.index]?.installmentName &&
                                    Array.isArray(formik?.errors?.installments) &&
                                    typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                    (
                                      formik.errors.installments[
                                        row.index
                                      ] as FormikErrors<IInstallment>
                                    )?.installmentName
                                      ? (
                                          formik.errors.installments[
                                            row.index
                                          ] as FormikErrors<IInstallment>
                                        )?.installmentName
                                      : ''
                                  }
                                />
                              </ShakingTextField>
                            );
                          },
                        },
                        {
                          id: 'dueDate',
                          label: 'Due Date',
                          align: 'left',
                          filterType: 'date',
                          minWidth: 150,
                          render(value, row) {
                            return (
                              <ShakingTextField
                                error={
                                  !!(
                                    formik?.touched?.installments?.[row.index]?.dueDate &&
                                    Array.isArray(formik?.errors?.installments) &&
                                    typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                    (
                                      formik.errors.installments[
                                        row.index
                                      ] as FormikErrors<IInstallment>
                                    )?.dueDate
                                  )
                                }
                              >
                                <DatePicker
                                  name={`installments.${row.index}.dueDate`}
                                  label="Due Date *"
                                  value={formik.values.installments[row.index]?.dueDate}
                                  onChange={(newValue) => {
                                    const updated = [...installments];
                                    updated[row.index].dueDate = newValue;
                                    setInstallments(updated);
                                    formik.setFieldTouched(
                                      `installments.${row.index}.dueDate`,
                                      false
                                    );
                                  }}
                                  minDate={dayjs(currentYear?.startDate)}
                                  maxDate={dayjs(currentYear?.endDate)}
                                  format="DD/MM/YYYY"
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      size: 'small',
                                      variant: 'outlined',
                                      sx: {
                                        mb: 1.5,
                                        width: '100%',
                                        padding: '0',
                                        borderRadius: 1,
                                      },
                                      FormHelperTextProps: {
                                        sx: {
                                          margin: 0,
                                          position: 'static',
                                          whiteSpace: 'normal',
                                        },
                                      },
                                      error: !!(
                                        formik?.touched?.installments?.[row.index]?.dueDate &&
                                        Array.isArray(formik?.errors?.installments) &&
                                        typeof formik?.errors?.installments?.[row.index] ===
                                          'object' &&
                                        (
                                          formik.errors.installments[
                                            row.index
                                          ] as FormikErrors<IInstallment>
                                        )?.dueDate
                                      ),
                                      helperText:
                                        formik?.touched?.installments?.[row.index]?.dueDate &&
                                        Array.isArray(formik?.errors?.installments) &&
                                        typeof formik?.errors?.installments?.[row.index] ===
                                          'object' &&
                                        (
                                          formik.errors.installments[
                                            row.index
                                          ] as FormikErrors<IInstallment>
                                        )?.dueDate
                                          ? (
                                              formik.errors.installments[
                                                row.index
                                              ] as FormikErrors<IInstallment>
                                            )?.dueDate
                                          : '',
                                    },
                                  }}
                                />
                              </ShakingTextField>
                            );
                          },
                        },
                        {
                          id: 'reminderDate',
                          label: 'Reminder Date',
                          filterType: 'date',
                          align: 'left',
                          minWidth: 170,
                          render(value, row) {
                            const hasError =
                              Boolean(formik.touched.installments?.[row.index]?.reminderDate) &&
                              !!(formik.errors.installments?.[row.index] as any)?.reminderDate;

                            return (
                              <DatePicker
                                name={`installments.${row.index}.reminderDate`}
                                label="Reminder Date *"
                                value={formik.values.installments[row.index]?.reminderDate}
                                minDate={dayjs(currentYear?.startDate)}
                                maxDate={dayjs(currentYear?.endDate)}
                                onChange={(newValue) => {
                                  const updated = [...installments];
                                  updated[row.index].reminderDate = newValue;
                                  setInstallments(updated);
                                  formik.setFieldValue(
                                    `installments.${row.index}.reminderDate`,
                                    newValue
                                  );
                                }}
                                format="DD-MM-YYYY"
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                    variant: 'outlined',
                                    sx: {
                                      width: '100%',
                                      padding: '0',
                                      borderRadius: 1,
                                      mb: 1.5,
                                    },
                                    error: hasError,
                                    helperText: hasError
                                      ? (formik.errors.installments?.[row.index] as any)
                                          ?.reminderDate
                                      : undefined,
                                    FormHelperTextProps: {
                                      sx: {
                                        margin: 0,
                                        position: 'static',
                                        whiteSpace: 'normal',
                                      },
                                    },
                                  },
                                }}
                              />
                            );
                          },
                        },
                        {
                          id: 'gracePeriod',
                          label: 'Grace Period (Days)',
                          filterType: 'number',
                          align: 'left',
                          minWidth: 180,
                          render(value, row) {
                            const hasError =
                              Boolean(formik.touched.installments?.[row.index]?.gracePeriod) &&
                              !!(formik.errors.installments?.[row.index] as any)?.gracePeriod;

                            return (
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Grace Period"
                                name={`installments.${row.index}.gracePeriod`}
                                inputProps={{ min: 0 }}
                                value={formik.values.installments[row.index]?.gracePeriod || ''}
                                onChange={(e) => {
                                  const updated = [...installments];
                                  updated[row.index].gracePeriod = Number(e.target.value);
                                  setInstallments(updated);
                                  formik.setFieldValue(
                                    `installments.${row.index}.gracePeriod`,
                                    e.target.value
                                  );
                                }}
                                variant="outlined"
                                sx={{
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                  mb: 1.5,
                                }}
                                error={hasError}
                                helperText={
                                  hasError
                                    ? (formik.errors.installments?.[row.index] as any)?.gracePeriod
                                    : undefined
                                }
                                FormHelperTextProps={{
                                  sx: {
                                    margin: 0,
                                    position: 'static',
                                    whiteSpace: 'normal',
                                  },
                                }}
                              />
                            );
                          },
                        },
                        {
                          id: 'overdueCharges',
                          label: 'Overdue Charges(Per Day)',
                          filterType: 'number',
                          align: 'left',
                          minWidth: 220,
                          render(value, row) {
                            const hasError =
                              Boolean(
                                formik.touched.installments?.[row.index]?.overdueCharges !==
                                  undefined
                              ) &&
                              !!(formik.errors.installments?.[row.index] as any)?.overdueCharges;

                            return (
                              <NumericFormatCustom
                                size="small"
                                fullWidth
                                label="Overdue Charges"
                                name={`installments.${row.index}.overdueCharges`}
                                value={
                                  formik.values.installments[row.index]?.overdueCharges !==
                                  undefined
                                    ? formik.values.installments[row.index]?.overdueCharges
                                    : ''
                                }
                                onChange={(e) => {
                                  let val = e.target.value;
                                  val = val.replace(/[₹,\s]/g, '');
                                  const numVal = val === '' ? null : Number(val);
                                  const updated = [...installments];
                                  updated[row.index].overdueCharges = numVal;
                                  setInstallments(updated);
                                  formik.setFieldValue(
                                    `installments.${row.index}.overdueCharges`,
                                    numVal
                                  );
                                }}
                                sx={{
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                  mb: 1.5,
                                }}
                                error={hasError}
                                helperText={
                                  hasError
                                    ? (formik.errors.installments?.[row.index] as any)
                                        ?.overdueCharges
                                    : undefined
                                }
                                FormHelperTextProps={{
                                  sx: {
                                    margin: 0,
                                    position: 'static',
                                    whiteSpace: 'normal',
                                  },
                                }}
                                inputProps={{ min: 0 }}
                              />
                            );
                          },
                        },
                      ]}
                      data={installments} // Changed from formik.values.installments to installments
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Academic Year, Board, Medium Selects */}
          </Scrollbar>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
              type="submit"
              size="small"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default PaymentTermForm;
