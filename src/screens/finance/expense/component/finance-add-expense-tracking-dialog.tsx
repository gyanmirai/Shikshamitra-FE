import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Grid, Button, TextField } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import AutoFocus from 'src/components/autofocus';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FinanceAddExpenseTrackingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  expenseCategory: string;
  expenseAmount: string;
  paymentMethod: string;
  date: any;
  paymentStatus: string;
  id: number;
  expenseName: string;
  notes?: string;
}

const validationSchema = Yup.object().shape({
  expenseCategory: Yup.string().required('Expense category is required'),

  expenseAmount: Yup.string()
    .required('Expense amount is required')
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  paymentMethod: Yup.string().required('Payment method is required'),

  date: Yup.date().required('Date is required').typeError('Invalid date'),

  paymentStatus: Yup.string().required('Payment status is required'),

  expenseName: Yup.string().required('Expense name is required'),

  notes: Yup.string().nullable(),
});

const FinanceAddExpenseTrackingDialog: React.FC<FinanceAddExpenseTrackingDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  // State to track if an expense category already exists
  const [, setShowExistingEntryMessage] = useState<boolean>(false);
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  // Initialize form values based on whether we're editing or creating new expense
  const initialValues = useMemo<FormikValue>(
    () => ({
      expenseCategory: isEdit ? (data.expenseCategory ?? '') : '',
      expenseAmount: isEdit ? (data.expenseAmount ?? '') : '',
      paymentMethod: isEdit ? (data.paymentMethod ?? '') : '',
      date: isEdit ? (dayjs(data.date) ?? dayjs()) : dayjs(),
      paymentStatus: isEdit ? (data.paymentStatus ?? '') : '',
      // Generate random ID for new entries
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      expenseName: '',
      notes: '',
    }),
    [data, isEdit]
  );

  // Setup formik form handling with validation and submission logic
  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      // Normalize strings for case-insensitive comparison
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      // Check if expense category already exists in data
      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.expenseCategory) === normalize(values.expenseCategory)
      );
      if (!isEdit) {
        // For new entries, check for duplicates
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        // Allow saving if editing existing entry
        onSave(values);
      }
    },
    enableReinitialize: true,
  });

  // Track form changes to prompt user before leaving
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  // Handle dialog close with unsaved changes confirmation
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
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Expense Tracking"
          links={[{ name: 'Finance' }, { name: 'Expense Tracking' }]}
          sx={{ px: 1, mb: 2 }}
          description="The Expense Tracking dialog allows you to add and manage expense records. Enter the expense category, amount, date, and relevant details to ensure accurate financial tracking."
        />
        <Box
          sx={{ mr: '15px', mb: '20px' }}
          gap={3}
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
        >
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>
      {/* <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Expense Category Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box> */}
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
          <Box display="flex" flexDirection="column" gap={2} height="100%" flexGrow={1} p={2}>
            <Grid container spacing={3} pt="10px">
              <Grid item xs={6}>
                <ShakingTextField
                  error={formik.touched.expenseCategory && Boolean(formik.errors.expenseCategory)}
                >
                  <AutoFocus>
                    <CustomSelect
                      label="Expense Category"
                      options={[]}
                      value={formik.values.expenseCategory}
                      onChange={(value) => formik.setFieldValue('expenseCategory', value)}
                      formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                      disabled={isEdit}
                      error={
                        formik.touched.expenseCategory && Boolean(formik.errors.expenseCategory)
                      }
                      helperText={
                        formik.touched.expenseCategory ? formik.errors.expenseCategory || '' : ''
                      }
                    />
                  </AutoFocus>
                </ShakingTextField>
              </Grid>
              <Grid item xs={6}>
                <ShakingTextField
                  error={formik.touched.expenseName && Boolean(formik.errors.expenseName)}
                >
                  <TextField
                    name="expenseName"
                    label="Expense Name"
                    value={formik.values.expenseName}
                    onChange={(e) => {
                      formik.setFieldValue('expenseName', capitalizeWords(e.target.value));
                    }}
                    size="small"
                    fullWidth
                    error={formik.touched.expenseName && Boolean(formik.errors.expenseName)}
                    helperText={formik.touched.expenseName && formik.errors.expenseName}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={6}>
                <ShakingTextField
                  error={formik.touched.expenseAmount && Boolean(formik.errors.expenseAmount)}
                >
                  <NumericFormatCustom
                    size="small"
                    label="Expense Amount"
                    name="expenseAmount"
                    value={formik.values.expenseAmount}
                    onChange={formik.handleChange}
                    fullWidth
                    error={formik.touched.expenseAmount && Boolean(formik.errors.expenseAmount)}
                    helperText={formik.touched.expenseAmount && formik.errors.expenseAmount}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={6}>
                <ShakingTextField
                  error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                >
                  <CustomSelect
                    label="Payment Method"
                    options={[]}
                    value={formik.values.paymentMethod}
                    onChange={(value) => formik.setFieldValue('paymentMethod', value)}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                    disabled={isEdit}
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                    helperText={
                      formik.touched.paymentMethod ? formik.errors.paymentMethod || '' : ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={6}>
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(newValue) => formik.setFieldValue('date', newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  disabled={isEdit}
                />
              </Grid>

              {/* <Grid item xs={6}>
                <CustomSelect
                  label="Payment Status"
                  options={[]}
                  value={formik.values.paymentStatus}
                  onChange={(value) => formik.setFieldValue('paymentStatus', value)}
                  formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                  disabled={isEdit}
                  error={formik.touched.paymentStatus && Boolean(formik.errors.paymentStatus)}
                  helperText={formik.touched.paymentStatus ? formik.errors.paymentStatus || '' : ''}
                />
              </Grid> */}

              <Grid item xs={12}>
                <TextField
                  multiline
                  rows={4}
                  name="notes"
                  label="Notes"
                  value={formik.values.notes}
                  onChange={(e) => {
                    formik.setFieldValue('notes', capitalizeWords(e.target.value));
                  }}
                  size="small"
                  fullWidth
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <Button size="small" type="submit" variant="outlined">
              Save
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FinanceAddExpenseTrackingDialog;
