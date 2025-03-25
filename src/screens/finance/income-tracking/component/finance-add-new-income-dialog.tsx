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

  const validationSchema = Yup.object().shape({
    incomeSource: Yup.string().required('Income source is required'),
    incomeAmount: Yup.string()
      .required('Income amount is required')
      .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
      .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
        const numericValue = Number(value);
        return numericValue > 0;
      }),
    paymentMethod: Yup.string().required('Payment method is required'),
    date: Yup.date().required('Date is required').typeError('Invalid date'),
    paymentStatus: Yup.string().required('Payment status is required'),
    incomeName: Yup.string().required('Income name is required'),
    notes: Yup.string().optional(), // Optional field
  });

  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
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
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      {/* Header Section */}
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

      {/* Form Card */}
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
          <Box display="flex" flexDirection="column" gap={2} height="100%" flexGrow={1}>
            <Box flexGrow={1} p={2}>
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
                    error={formik.touched.incomeSource && Boolean(formik.errors.incomeSource)}
                    helperText={formik.touched.incomeSource ? formik.errors.incomeSource || '' : ''}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="incomeName"
                    label="Income Name"
                    value={formik.values.incomeName}
                    onChange={(e) =>
                      formik.setFieldValue('incomeName', capitalizeWords(e.target.value))
                    }
                    size="small"
                    fullWidth
                    error={formik.touched.incomeName && Boolean(formik.errors.incomeName)}
                    helperText={formik.touched.incomeName && formik.errors.incomeName}
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
                    error={formik.touched.incomeAmount && Boolean(formik.errors.incomeAmount)}
                    helperText={formik.touched.incomeAmount && formik.errors.incomeAmount}
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
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                    helperText={
                      formik.touched.paymentMethod ? formik.errors.paymentMethod || '' : ''
                    }
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
                    // error={Boolean(formik.touched.date && formik.errors.date)}
                    // helperText={formik.touched.date ? formik.errors.date || '' : ''}
                  />
                </Grid>

                <Grid item xs={6}>
                  <CustomSelect
                    label="Payment Status"
                    options={[{ label: 'Paid', value: 'Paid' }]}
                    value={formik.values.paymentStatus}
                    onChange={(value) => formik.setFieldValue('paymentStatus', value)}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                    disabled={isEdit}
                    error={formik.touched.paymentStatus && Boolean(formik.errors.paymentStatus)}
                    helperText={
                      formik.touched.paymentStatus ? formik.errors.paymentStatus || '' : ''
                    }
                  />
                </Grid>

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

            {/* CTA Section */}
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            {/* <Button size="small" variant="outlined" onClick={handleCloseDialog}>Cancel</Button> */}
            <Button size="small" type="submit" variant="outlined">
              Save
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FinanceAddNewIncomeDialog;
