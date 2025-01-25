import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
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

const FinanceAddExpenseTrackingDialog: React.FC<FinanceAddExpenseTrackingDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  const initialValues = useMemo<FormikValue>(
    () => ({
      expenseCategory: isEdit ? (data.expenseCategory ?? '') : '',
      expenseAmount: isEdit ? (data.expenseAmount ?? '') : '',
      paymentMethod: isEdit ? (data.paymentMethod ?? '') : '',
      date: isEdit ? (dayjs(data.date) ?? dayjs()) : dayjs(),
      paymentStatus: isEdit ? (data.paymentStatus ?? '') : '',
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      expenseName: '',
      notes: '',
    }),
    [data, isEdit]
  );

  const formik = useFormik<FormikValue>({
    initialValues,
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.expenseCategory) === normalize(values.expenseCategory)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
      console.log('Form Submitted:', values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

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
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Expense Tracking"
          links={[{ name: 'Finance' }, { name: 'Expense Tracking' }]}
          sx={{ px: 1, mb: 2 }}
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
      <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Expense Category Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>

      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3} pt="10px">
            <Grid item xs={6}>
              <CustomSelect
                label="Expense Category"
                options={[]}
                value={formik.values.expenseCategory}
                onChange={(value) => formik.setFieldValue('expenseCategory', value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="expenseName"
                label="Expense Name"
                value={formik.values.expenseName}
                onChange={formik.handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <NumericFormatCustom
                size="small"
                label="Expense Amount"
                name="expenseAmount"
                value={formik.values.expenseAmount}
                onChange={formik.handleChange}
                fullWidth
                // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomSelect
                label="Payment Method"
                options={[]}
                value={formik.values.paymentMethod}
                onChange={(value) => formik.setFieldValue('paymentMethod', value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
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
            <Grid item xs={6}>
              <CustomSelect
                label="Payment Status"
                options={[]}
                value={formik.values.paymentStatus}
                onChange={(value) => formik.setFieldValue('paymentStatus', value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                multiline
                rows={4}
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
          <DialogActions>
            <Button type="submit" variant="contained" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </>
  );
};

export default FinanceAddExpenseTrackingDialog;
