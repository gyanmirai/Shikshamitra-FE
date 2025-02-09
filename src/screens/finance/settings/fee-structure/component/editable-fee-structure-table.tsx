import React from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';

import { Box, Button, Switch, TextField, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface EditableFeeStructureTableProps {
  data: any[];
}

const EditableFeeStructureTable: React.FC<EditableFeeStructureTableProps> = ({ data }) => {
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
    onSubmit: (values) => {
      console.log('Updated Values:', values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <FieldArray
          name="fees"
          render={() => (
            <CustomizableTable
              tableId="editableFeeTable"
              isSearch={false}
              isFilter={false}
              isPagination={false}
              isShowedDense={false}
              columns={[
                { id: 'feeHead', label: 'Fee Head' },
                {
                  id: 'grossFee',
                  label: 'Gross Fee',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
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
                      />
                    );
                  },
                },
                {
                  id: 'generalDiscount',
                  label: 'General Discount',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
                      <TextField
                        fullWidth
                        size="small"
                        value={formik.values.fees[index].generalDiscount}
                        onChange={(e) => {
                          const updatedValue = Number(e.target.value);
                          formik.setFieldValue(`fees[${index}].generalDiscount`, updatedValue);
                          formik.setFieldValue(
                            `fees[${index}].payableFee`,
                            formik.values.fees[index].grossFee - updatedValue
                          );
                        }}
                      />
                    );
                  },
                },
                {
                  id: 'payableFee',
                  label: 'Payable Fee',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
                      <Typography fontSize="12px">
                        {formatNumber(formik.values.fees[index].payableFee, 'INR')}
                      </Typography>
                    );
                  },
                },
                {
                  id: 'paymentMethod',
                  label: 'Payment Method',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
                      <CustomSelect
                        multiple
                        label="Payment Method"
                        options={paymentMethods}
                        value={formik.values.fees[index].paymentMethod}
                        onChange={(e) => formik.setFieldValue(`fees[${index}].paymentMethod`, e)}
                        formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                      />
                    );
                  },
                },
                {
                  id: 'lateFeeChargesType',
                  label: 'Late Fee Charges Type',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
                      <CustomSelect
                        label="Late Fee Charges Type"
                        options={chargesTypeList}
                        value={formik.values.fees[index].lateFeeChargesType}
                        onChange={(e) =>
                          formik.setFieldValue(`fees[${index}].lateFeeChargesType`, e)
                        }
                        formControlProps={{ sx: { flex: 1 } }}
                        fullWidth
                      />
                    );
                  },
                },
                {
                  id: 'lateFeeChargesAmount',
                  label: 'Late Fee Charges Amount',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
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
                      />
                    );
                  },
                },
                {
                  id: 'active',
                  label: 'Active/In Active',
                  render: (value, row) => {
                    const index = formik.values.fees.findIndex(
                      (item) => item.feeHead === row.feeHead
                    );
                    return (
                      <Switch
                        name={`fees[${index}].active`}
                        checked={formik.values.fees[index].active ?? true}
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

        <Box pt="140px" display="flex" justifyContent="flex-end">
          <Button
            fullWidth={false}
            color="primary"
            size="small"
            type="submit"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </FormikProvider>
  );
};

export default EditableFeeStructureTable;
