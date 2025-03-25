import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button, FormControl, FormHelperText } from '@mui/material';

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const validationSchema = Yup.object({
    categoryType: Yup.string()

      .required('Category type is required'),

    categoryName: Yup.string().required('Category name is required'),

    fundAllocation: Yup.string()
      .required('Expense amount is required')
      .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
      .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
        const numericValue = Number(value);
        return numericValue > 0;
      }),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
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
    <Box display="flex" flexDirection="column" gap={2} height="100%">
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
                <FormControl
                  fullWidth
                  error={Boolean(formik.touched.categoryType && formik.errors.categoryType)}
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
                  />
                  {formik.touched.categoryType && formik.errors.categoryType && (
                    <FormHelperText>{String(formik.errors.categoryType)}</FormHelperText>
                  )}
                </FormControl>
              </Grid2>
              <Grid2 xs={6}>
                <FormControl
                  fullWidth
                  error={Boolean(formik.touched.categoryName && formik.errors.categoryName)}
                >
                  <CustomSelect
                    label="Select Category"
                    options={categoryListBasedOnType}
                    value={formik.values.categoryName}
                    onChange={(value) => formik.setFieldValue('categoryName', value)}
                    disabled={edit}
                  />
                  {formik.touched.categoryName && formik.errors.categoryName && (
                    <FormHelperText>{String(formik.errors.categoryName)}</FormHelperText>
                  )}
                </FormControl>
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
                  error={formik.touched.fundAllocation && Boolean(formik.errors.fundAllocation)}
                  helperText={
                    formik.touched.fundAllocation && formik.errors.fundAllocation
                      ? String(formik.errors.fundAllocation)
                      : ''
                  }
                />
              </Grid2>
            </Grid2>
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FinanceNewBudgetCreateDialog;
