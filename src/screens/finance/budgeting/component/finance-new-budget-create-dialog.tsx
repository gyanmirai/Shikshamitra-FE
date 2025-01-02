import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
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
      startDate: dayjs(edit ? data.startDate : '2024-04-24', 'YYYY-MM-DD'),
      endDate: dayjs(edit ? data.endDate : '2025-06-24', 'YYYY-MM-DD'),
      categoryType: edit ? (data.id.includes('expense') ? '345' : '123') : '',
      categoryName: edit ? data.id : '',
      categoryId: edit ? data.id : '',
      fundAllocation: edit
        ? data.id.includes('expense')
          ? data.allocatedAmount
          : data.totalAmountExpected
        : 0,
    },
    onSubmit: (values: any) => {
      console.log('Form Submitted:', values);
      onSave(values);
    },
  });

  // Update category list dynamically based on selected category type
  useEffect(() => {
    if (formik.values.categoryType === '123') {
      setCategoryListBasedOnType(incomeCategories);
    } else if (formik.values.categoryType === '345') {
      setCategoryListBasedOnType(expenseCategories);
    } else {
      setCategoryListBasedOnType([]);
    }
  }, [formik.values.categoryType]);

  return (
    <CustomDialog title="Create New Budget" open={dialogValue} handleClose={onClose}>
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
                  onChange={(value) => formik.setFieldValue('categoryType', value)}
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

            <Grid2 container spacing={2}>
              <Grid2 xs={6}>
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
        <DialogActions>
          <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default FinanceNewBudgetCreateDialog;
