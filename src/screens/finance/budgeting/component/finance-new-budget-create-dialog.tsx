import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Button, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

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
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const initialValues = useMemo(
    () => ({
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    []
  );

  const formik = useFormik({
    initialValues,
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

  const dispatch = useDispatch();
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);
  // Close dialog handler
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        <CustomBreadcrumbs
          heading="Budgeting"
          links={[{ name: 'Finance' }, { name: 'Budgeting' }]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={handleCloseDialog}
            >
              Back
            </Button>
          }
        />
      </Box>
      <form onSubmit={formik.handleSubmit}>
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
              <NumericFormatCustom
                size="small"
                label="Fund Allocation"
                name="fundAllocation"
                value={formik.values.fundAllocation}
                onChange={formik.handleChange}
                fullWidth
                // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
              />
              {/* <TextField
                  name="fundAllocation"
                  label="Fund Allocation"
                  value={formik.values.fundAllocation}
                  onChange={formik.handleChange}
                  size="small"
                  type="number"
                  fullWidth
                /> */}
            </Grid2>
          </Grid2>
        </Box>
        <DialogActions>
          {/* <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button> */}
          <Button type="submit" variant="outlined" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default FinanceNewBudgetCreateDialog;
