import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
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

  const formik = useFormik<FormikValue>({
    initialValues: {
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
    },
    // validationSchema: validationSchema,  // Uncomment if using validation schema
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
  });
  const formatNumber = (num: any) => new Intl.NumberFormat().format(num);

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Create New'} Expense Entry`}
      open={dialogValue}
      handleClose={onClose}
      maxWidth="md"
    >
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
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
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
                {/* <TextField
                  name="expenseAmount"
                  label="Expense Amount"
                  value={formik.values.expenseAmount}
                  onChange={formik.handleChange}
                  size="small"
                  type="number"
                  fullWidth
                /> */}
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
          </Scrollbar>
          <DialogActions>
            <Button type="submit" variant="contained" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default FinanceAddExpenseTrackingDialog;
