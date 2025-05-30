import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useMemo, useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, DialogActions } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { validationSchemaForNewBudget } from '../budget_validation';

import type { IFinanceNewBudgetCreateDialogProps } from '../interface/budgeting_interface';

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

const FinanceNewBudgetCreateDialog: React.FC<IFinanceNewBudgetCreateDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  edit,
  activeTab,
}) => {
  const [categoryListBasedOnType, setCategoryListBasedOnType] = useState<any>([]);

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemaForNewBudget,
    onSubmit: (values: any) => {
      onSave(values);
    },
  });

  // Update category list dynamically based on selected category type
  useEffect(() => {
    const type = formik.values.categoryType;

    if (type === '123') {
      setCategoryListBasedOnType(incomeCategories);
    } else if (type === '345') {
      setCategoryListBasedOnType(expenseCategories);
    } else {
      setCategoryListBasedOnType([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.categoryType]);

  useEffect(() => {
    if (activeTab === 'expenses') {
      formik.setFieldValue('categoryType', '345');
    } else if (activeTab === 'income') {
      formik.setFieldValue('categoryType', '123');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <ShakingTextField
              error={formik.touched.categoryType && Boolean(formik.errors.categoryType)}
            >
              <CustomSelect
                label="Category Type *"
                options={[
                  { value: '123', label: 'Income' },
                  { value: '345', label: 'Expense' },
                ]}
                value={formik.values.categoryType}
                onChange={(value) => formik.setFieldValue('categoryType', value)}
                disabled={edit}
                autoFocus
                error={formik.touched.categoryType && Boolean(formik.errors.categoryType)}
                helperText={
                  formik.touched.categoryType && formik.errors.categoryType
                    ? String(formik.errors.categoryType)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid2>
          <Grid2 xs={6}>
            <ShakingTextField
              error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            >
              <CustomSelect
                label="Select Category *"
                options={categoryListBasedOnType}
                value={formik.values.categoryName}
                onChange={(value) => formik.setFieldValue('categoryName', value)}
                disabled={edit}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={
                  formik.touched.categoryName && formik.errors.categoryName
                    ? String(formik.errors.categoryName)
                    : ''
                }
              />{' '}
            </ShakingTextField>
          </Grid2>

          <Grid2 xs={6}>
            <ShakingTextField
              error={formik.touched.fundAllocation && Boolean(formik.errors.fundAllocation)}
            >
              <NumericFormatCustom
                size="small"
                label="Fund Allocation *"
                name="fundAllocation"
                value={formik.values.fundAllocation}
                onChange={formik.handleChange}
                fullWidth
                error={formik.touched.fundAllocation && Boolean(formik.errors.fundAllocation)}
                helperText={
                  formik.touched.fundAllocation && formik.errors.fundAllocation
                    ? String(formik.errors.fundAllocation)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid2>
        </Grid2>

        <DialogActions>
          <SubmitButton />
        </DialogActions>
      </Box>
    </form>
  );
};

export default FinanceNewBudgetCreateDialog;
