import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import type { IBudgetFormValues } from './type';

const BudgetStep1 = (props: FormikProps<IBudgetFormValues>) => {
  const formik = props;

  // Redux state selectors for current academic selections
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const [boards, setBoards] = useState([]);
  console.log('formik.values----', formik.values);
  useEffect(() => {
    setBoards(currentYear.boards || []);
  }, [currentYear]);
  // Category options
  const budgetCategoryOptions = [
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' },
  ];

  const incomeCategories = [
    { value: 'Tuition Fees', label: 'Tuition Fees' },
    { value: 'Exam Fees', label: 'Exam Fees' },
    { value: 'Transport Fees', label: 'Transport Fees' },
    { value: 'Donations', label: 'Donations' },
    { value: 'Grants', label: 'Grants' },
  ];

  const expenseCategories = [
    { value: 'Academic', label: 'Academic' },
    { value: 'Administrative', label: 'Administrative' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Utilities', label: 'Utilities' },
  ];

  const budgetSubCategoryOptions =
    formik.values.budgetCategory === 'Income'
      ? incomeCategories
      : formik.values.budgetCategory === 'Expense'
        ? expenseCategories
        : [];

  // Department options
  const departmentOptions = [
    { value: 'Science Department', label: 'Science Department' },
    { value: 'Math Department', label: 'Math Department' },
    { value: 'English Department', label: 'English Department' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.board && formik.errors.board) || false}>
            <CustomSelect
              name="board"
              label="Board *"
              isLoading={boardLoading}
              options={boards || []}
              labelKey="name"
              valueKey="id"
              value={formik.values.board}
              onChange={(value) => {
                formik.setFieldValue('board', value);
              }}
              error={!!(formik.touched.board && formik.errors.board) || false}
              helperText={(formik.touched.board && formik.errors.board) || ''}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.budgetTitle && formik.errors.budgetTitle)}>
            <TextField
              fullWidth
              label="Budget Title *"
              name="budgetTitle"
              value={formik.values.budgetTitle}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/[^a-zA-Z\s]/g, '')
                  .split(' ')
                  .map((word) =>
                    word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                  )
                  .join(' ');
                formik.setFieldValue('budgetTitle', value);
                formik.setFieldTouched('budgetTitle', false);
              }}
              error={formik.touched.budgetTitle && Boolean(formik.errors.budgetTitle)}
              helperText={formik.touched.budgetTitle && formik.errors.budgetTitle}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Budget Category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.budgetCategory && formik.errors.budgetCategory)}
          >
            <CustomSelect
              options={budgetCategoryOptions}
              value={formik.values.budgetCategory}
              onChange={(val) => {
                formik.setFieldValue('budgetCategory', val);
                formik.setFieldTouched('budgetCategory', false);
                formik.setFieldValue('budgetSubCategories', []);
              }}
              label="Budget Category *"
              formControlProps={{ fullWidth: true }}
              error={formik.touched.budgetCategory && Boolean(formik.errors.budgetCategory)}
              helperText={formik.touched.budgetCategory ? formik.errors.budgetCategory : undefined}
            />
          </ShakingTextField>
        </Grid>

        {/* Budget Sub Category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.budgetSubCategories && formik.errors.budgetSubCategories)}
          >
            <ResponsiveMultiSelect
              label={
                formik.values.budgetCategory === 'Income'
                  ? 'Income Category *'
                  : 'Expense Category *'
              }
              options={budgetSubCategoryOptions}
              value={formik.values.budgetSubCategories}
              disabled={!formik.values.budgetCategory}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              onChange={(val: string[]) => {
                formik.setFieldValue('budgetSubCategories', val);
                formik.setFieldTouched('budgetSubCategories', false);
                const updated = val.map((subCat) => ({
                  category: formik.values.budgetCategory,
                  subCategory: subCat,
                  amount: null,
                  notes: null,
                }));
                formik.setFieldValue('subCategories', updated);
              }}
              error={
                formik.touched.budgetSubCategories && Boolean(formik.errors.budgetSubCategories)
              }
              helperText={
                formik.touched.budgetSubCategories
                  ? (formik.errors.budgetSubCategories as string)
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
            <DatePicker
              value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
              format="DD-MM-YYYY"
              label="Start Date *"
              onChange={(newDate) => {
                formik.setFieldValue('startDate', newDate);
                formik.setFieldTouched('startDate', false);
              }}
              minDate={dayjs()}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.startDate && Boolean(formik.errors.startDate),
                  helperText: formik.touched.startDate ? formik.errors.startDate : ' ',
                  FormHelperTextProps: {
                    sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                  },
                  InputLabelProps: { sx: { lineHeight: '1.2em' } },
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.endDate && formik.errors.endDate)}>
            <DatePicker
              value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
              format="DD-MM-YYYY"
              label="End Date *"
              onChange={(newDate) => {
                formik.setFieldValue('endDate', newDate);
                formik.setFieldTouched('endDate', true, false);
              }}
              disablePast
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.endDate && Boolean(formik.errors.endDate),
                  helperText: formik.touched.endDate ? formik.errors.endDate : ' ',
                  FormHelperTextProps: {
                    sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                  },
                  InputLabelProps: { sx: { lineHeight: '1.2em' } },
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* Department */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.departments && formik.errors.departments)}>
            <ResponsiveMultiSelect
              label="Department *"
              options={departmentOptions}
              value={formik.values.departments}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              onChange={(val: string[]) => {
                formik.setFieldValue('departments', val);
                formik.setFieldTouched('departments', false);
              }}
              error={formik.touched.departments && Boolean(formik.errors.departments)}
              helperText={
                formik.touched.departments ? (formik.errors.departments as string) : undefined
              }
            />
          </ShakingTextField>
        </Grid>

        {/* Total Budget Amount */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.totalBudgetAmount && formik.errors.totalBudgetAmount)}
          >
            <NumericFormatCustom
              size="small"
              fullWidth
              label="Total Budget Amount *"
              name="totalBudgetAmount"
              value={formik.values.totalBudgetAmount || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[₹,\s]/g, '');
                formik.setFieldValue('totalBudgetAmount', Number(val));
                formik.setFieldTouched('totalBudgetAmount', false);
              }}
              error={formik.touched.totalBudgetAmount && Boolean(formik.errors.totalBudgetAmount)}
              helperText={formik.touched.totalBudgetAmount && formik.errors.totalBudgetAmount}
              sx={{ width: '100%', padding: 0, borderRadius: 1 }}
            />
          </ShakingTextField>
        </Grid>

        {/* Spending Threshold */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.spendingThreshold && formik.errors.spendingThreshold)}
          >
            <TextField
              fullWidth
              type="number"
              label="Spending Threshold Alerts (%) *"
              value={formik.values.spendingThreshold}
              onChange={(e) => formik.setFieldValue('spendingThreshold', e.target.value)}
              error={formik.touched.spendingThreshold && Boolean(formik.errors.spendingThreshold)}
              helperText={formik.touched.spendingThreshold && formik.errors.spendingThreshold}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formik.values.description}
              onChange={(e) => formik.setFieldValue('description', e.target.value)}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetStep1;
