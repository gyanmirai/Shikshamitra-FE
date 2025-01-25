import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

interface FinanceAddNewIncomeDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  incomeSource: string;
  incomeAmount: string;
  paymentMethod: string;
  date: any;
  paymentStatus: string;
  id: number;
  incomeName: string;
  notes?: string;
}

const FinanceAddNewIncomeDialog: React.FC<FinanceAddNewIncomeDialogProps> = ({
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
      incomeSource: isEdit ? (data.incomeSource ?? '') : '',
      incomeAmount: isEdit ? (data.incomeAmount ?? '') : '',
      paymentMethod: isEdit ? (data.paymentMethod ?? '') : '',
      date: isEdit ? dayjs(data.date) : dayjs(),
      paymentStatus: isEdit ? (data.paymentStatus ?? '') : '',
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      incomeName: '',
      notes: '',
    }),
    [data, isEdit]
  );

  const formik = useFormik<FormikValue>({
    initialValues,
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.incomeSource) === normalize(values.incomeSource)
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
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Income Tracking"
          links={[{ name: 'Finance' }, { name: 'Income Tracking' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
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
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3} pt="10px">
          <Grid item xs={6}>
            <CustomSelect
              label="Income Category"
              options={[
                { label: 'Donation', value: 'Donation' },
                { label: 'Fees', value: 'Fees' },
              ]}
              value={formik.values.incomeSource}
              onChange={(value) => formik.setFieldValue('incomeSource', value)}
              formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
              disabled={isEdit}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="incomeName"
              label="Income Name"
              value={formik.values.incomeName}
              onChange={formik.handleChange}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <NumericFormatCustom
              size="small"
              label="Income Amount"
              name="incomeAmount"
              value={formik.values.incomeAmount}
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              label="Payment Method"
              options={[{ label: 'Online', value: 'Online' }]}
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
              options={[
                { label: 'Paid', value: 'Paid' },
                // { label: 'Completed', value: 'Completed' },
              ]}
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
          <Button type="submit" variant="outlined" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default FinanceAddNewIncomeDialog;
