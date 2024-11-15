import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceNewBudgetCreateDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  edit: boolean;
}

const incomeCategories = [
  { value: 'income_01', label: 'Tuition Fees' },
  { value: 'income_02', label: 'Donations' },
  { value: 'income_03', label: 'Government Grants' },
];

const expenseCategories = [
  { value: 'expense_01', label: 'Salaries' },
  { value: 'expense_02', label: 'Maintenance' },
  { value: 'expense_03', label: 'Educational Supplies' },
];

const FinanceNewBudgetCreateDialog: React.FC<FinanceNewBudgetCreateDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  edit,
}) => {
  const [categoryListBasedOnType, setCategoryListBasedOnType] = useState<any>([]);

  const formik = useFormik({
    initialValues: {
      startDate: dayjs('24-04-2024', 'DD-MM-YYYY'),
      endDate: dayjs('24-06-2025', 'DD-MM-YYYY'),
      categoryType: edit ? (data.id.includes('expense') ? '345' : '123') : '',
      categoryName: edit ? data.id : '',
      categoryId: edit ? data.id : '',
      categoryTypeId: '',

      fundAllocation: edit
        ? data.id.includes('expense')
          ? data.allocatedAmount
          : data.totalAmountExpected
        : 0,
    },
    onSubmit: (values: any) => {
      console.log('Form Submitted type:', values);
      onSave(values);
    },
  });

  const categoryListHandlerBasedOnCateoryType = (categoryType: any) => {
    if (categoryType === '123') {
      setCategoryListBasedOnType(incomeCategories);
    } else {
      setCategoryListBasedOnType(expenseCategories);
    }
  };

  return (
    <CustomDialog title="Create New Budget" open={dialogValue} handleClose={onClose}>
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
                  <CustomSelect
                    label="Category Type"
                    options={[
                      { value: '123', label: 'Income' },
                      { value: '345', label: 'Expense' },
                    ]}
                    value={formik.values.categoryType}
                    onChange={(value) => {
                      const selectedValue = value;
                      formik.setFieldValue('categoryType', selectedValue);
                      categoryListHandlerBasedOnCateoryType(selectedValue);
                    }}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                    disabled={edit}
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <CustomSelect
                    label="Select Category"
                    options={categoryListBasedOnType}
                    value={formik.values.categoryName}
                    onChange={(value) => formik.setFieldValue('categoryName', value)}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                    disabled={edit}
                  />
                </Grid2>
              </Grid2>

              <Grid2 xl={6}>
                <Box py="8px" display="flex" flexDirection="row" gap={3}>
                  <DatePicker
                    label="Start Date"
                    value={formik.values.startDate}
                    onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                    disabled
                  />
                  <DatePicker
                    label="End Date"
                    value={formik.values.endDate}
                    onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                    disabled
                  />
                </Box>
              </Grid2>

              <Grid2 container>
                <Grid2 sm={6}>
                  <TextField
                    name="fundAllocation"
                    label="Fund Allocation"
                    value={formik.values.fundAllocation}
                    onChange={formik.handleChange}
                    size="small"
                    type="number"
                    fullWidth
                  />
                </Grid2>
              </Grid2>
            </Box>
          </Scrollbar>
        </form>
        <DialogActions>
          <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="small">
            Save
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
};

export default FinanceNewBudgetCreateDialog;
