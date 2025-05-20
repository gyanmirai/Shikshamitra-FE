import React from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';

import { Box, Switch, TextField, Typography, FormControl, FormHelperText } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { editFeeStructureValidationSchema } from '../validationSchema';

import type { IEditableFeeStructureTableProps } from '../fee-structure-interface';

const EditableFeeStructureTable: React.FC<IEditableFeeStructureTableProps> = ({ data }) => {
  const chargesTypeList = [
    { value: 'none', label: 'None' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'perDay', label: 'Per Day' },
    { value: 'perMonth', label: 'Per Month' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'online', label: 'Online' },
  ];

  const formik = useFormik({
    initialValues: {
      fees: data.map((fee) => ({
        ...fee,
        payableFee: fee.grossFee - fee.generalDiscount, // Auto calculate on load
      })),
    },
    validationSchema: editFeeStructureValidationSchema,
    onSubmit: (values) => {
      console.log('Updated Values:', values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box
          display="flex"
          flexDirection="column"
          sx={{ flex: 1, justifyContent: 'space-between' }}
        >
          <Box sx={{ flexGrow: 1, mb: 5 }}>
            <FieldArray
              name="fees"
              render={() => (
                <CustomizableTable
                  tableId="editableFeeTable"
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  isShowedDense={false}
                  rowProps={(row, index) => ({
                    sx: { margin: '12px' },
                  })}
                  columns={[
                    {
                      id: 'feeHead',
                      label: 'Fee Head',
                      minWidth: '100px',
                      isFilter: false,
                      isSort: false,
                    },
                    {
                      id: 'grossFee',
                      label: 'Gross Fee',
                      isFilter: false,
                      isSort: false,
                      minWidth: '170px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={formik.values.fees[index].grossFee}
                              onChange={(e) => {
                                const updatedValue = Number(e.target.value);
                                formik.setFieldValue(`fees[${index}].grossFee`, updatedValue);
                                formik.setFieldValue(
                                  `fees[${index}].payableFee`,
                                  updatedValue - formik.values.fees[index].generalDiscount
                                );
                              }}
                              error={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.grossFee &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                Boolean(formik.errors.fees?.[index]?.grossFee)
                              }
                              helperText={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.grossFee &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                (formik.errors.fees?.[index]?.grossFee as string)
                              }
                              FormHelperTextProps={{ sx: { mb: -2 } }}
                            />
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'generalDiscount',
                      label: 'General Discount',
                      isFilter: false,
                      isSort: false,
                      minWidth: '170px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={formik.values.fees[index].generalDiscount}
                              onChange={(e) => {
                                const updatedValue = Number(e.target.value);
                                formik.setFieldValue(
                                  `fees[${index}].generalDiscount`,
                                  updatedValue
                                );
                                formik.setFieldValue(
                                  `fees[${index}].payableFee`,
                                  formik.values.fees[index].grossFee - updatedValue
                                );
                              }}
                              error={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.generalDiscount &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                Boolean(formik.errors.fees?.[index]?.generalDiscount)
                              }
                              helperText={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.generalDiscount &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                (formik.errors.fees?.[index]?.generalDiscount as string)
                              }
                              FormHelperTextProps={{ sx: { mb: -2 } }}
                            />
                          </Box>
                        );
                      },
                    },

                    {
                      id: 'payableFee',
                      label: 'Payable Fee',
                      isFilter: false,
                      isSort: false,
                      minWidth: '100px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <Typography fontSize="12px" paddingTop="25px" paddingBottom="25px">
                              {formatNumber(formik.values.fees[index].payableFee, 'INR')}
                            </Typography>
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'paymentMethod',
                      label: 'Payment Method',
                      isFilter: false,
                      isSort: false,
                      minWidth: '200px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <FormControl sx={{ minWidth: 195, flex: 1 }}>
                              <CustomSelect
                                multiple
                                label="Payment Method"
                                options={paymentMethods}
                                value={formik.values.fees[index].paymentMethod}
                                onChange={(e) =>
                                  formik.setFieldValue(`fees[${index}].paymentMethod`, e)
                                }
                                error={
                                  Array.isArray(formik.touched.fees) &&
                                  formik.touched.fees[index]?.paymentMethod &&
                                  Array.isArray(formik.errors.fees) &&
                                  typeof formik.errors.fees[index] === 'object' &&
                                  Boolean(formik.errors.fees?.[index]?.paymentMethod)
                                }
                              />
                              {Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.paymentMethod &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' && (
                                  <FormHelperText sx={{ mb: -2, color: 'error.main' }}>
                                    {(formik.errors.fees[index] as any).paymentMethod}
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'lateFeeChargesAmount',
                      label: 'Late Fee Charges Amount',
                      isFilter: false,
                      isSort: false,
                      minWidth: '200px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <NumericFormatCustom
                              size="small"
                              label="Late Fee Charges Amount"
                              name={`fees[${index}].lateFeeChargesAmount`}
                              value={formik.values.fees[index].lateFeeChargesAmount}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `fees[${index}].lateFeeChargesAmount`,
                                  e.target.value
                                )
                              }
                              fullWidth
                              error={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.lateFeeChargesAmount &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                Boolean((formik.errors.fees[index] as any).lateFeeChargesAmount)
                              }
                              helperText={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.lateFeeChargesAmount &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                (formik.errors.fees[index] as any).lateFeeChargesAmount
                              }
                              FormHelperTextProps={{ sx: { mb: -2 } }}
                            />
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'lateFeeChargesType',
                      label: 'Late Fee Charges Type',
                      isFilter: false,
                      isSort: false,
                      minWidth: '200px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Box sx={{ mb: 2 }}>
                            <FormControl
                              sx={{ minWidth: 195, flex: 1 }}
                              error={
                                Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.lateFeeChargesType &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' &&
                                Boolean((formik.errors.fees[index] as any).lateFeeChargesType)
                              }
                            >
                              <CustomSelect
                                label="Late Fee Charges Type"
                                options={chargesTypeList}
                                value={formik.values.fees[index].lateFeeChargesType}
                                onChange={(e) =>
                                  formik.setFieldValue(`fees[${index}].lateFeeChargesType`, e)
                                }
                              />
                              {Array.isArray(formik.touched.fees) &&
                                formik.touched.fees[index]?.lateFeeChargesType &&
                                Array.isArray(formik.errors.fees) &&
                                typeof formik.errors.fees[index] === 'object' && (
                                  <FormHelperText sx={{ mb: -2, color: 'error.main' }}>
                                    {(formik.errors.fees[index] as any).lateFeeChargesType}
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Box>
                        );
                      },
                    },
                    {
                      id: 'discountReason',
                      label: 'Discount Reason',
                      isFilter: false,
                      isSort: false,
                      minWidth: '500px',
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.discountReason === row.discountReason
                        );
                        return (
                          <TextField
                            multiline
                            rows={3}
                            value={formik.values.fees[index].discountReason}
                            onChange={(e) =>
                              formik.setFieldValue(`fees[${index}].discountReason`, e)
                            }
                            sx={{ width: '500px' }}
                            fullWidth
                          />
                        );
                      },
                    },
                    {
                      id: 'active',
                      label: 'Active',
                      isFilter: false,
                      isSort: false,
                      sticky: true,
                      render: (value, row) => {
                        const index = formik.values.fees.findIndex(
                          (item) => item.feeHead === row.feeHead
                        );
                        return (
                          <Switch
                            checked={formik.values.fees[index].isActive}
                            onChange={(e) =>
                              formik.setFieldValue(`fees[${index}].active`, e.target.checked)
                            }
                          />
                        );
                      },
                    },
                  ]}
                  data={formik.values.fees}
                />
              )}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" sx={{ mt: '50px' }}>
            <SubmitButton onClick={() => {}} />
          </Box>
        </Box>
      </form>
    </FormikProvider>
  );
};

export default EditableFeeStructureTable;
