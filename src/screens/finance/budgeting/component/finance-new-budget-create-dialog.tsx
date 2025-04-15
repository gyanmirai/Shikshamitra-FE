import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Box display="flex" flexDirection="column" gap={2}>
        <CustomBreadcrumbs
          description="you can define budget allocations for the current financial year. Select the category, choose the type (Income or Expense), and enter the amount you want to allocate"
          heading="Budgeting"
          links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Budgeting' }]}
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
      <form
        onSubmit={formik.handleSubmit}
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            pt="10px"
            display="flex"
            flexDirection="column"
            height="100%"
            gap={3}
            flexGrow={1}
            p={2}
          >
            <Grid2 container spacing={2}>
              <Grid2 xs={6}>
                <ShakingTextField
                  error={formik.touched.categoryType && Boolean(formik.errors.categoryType)}
                >
                  <CustomSelect
                    label="Category Type"
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
                    label="Select Category"
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
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 xs={6}>
                <ShakingTextField
                  error={formik.touched.fundAllocation && Boolean(formik.errors.fundAllocation)}
                >
                  <NumericFormatCustom
                    size="small"
                    label="Fund Allocation"
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
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <SubmitButton />
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FinanceNewBudgetCreateDialog;
