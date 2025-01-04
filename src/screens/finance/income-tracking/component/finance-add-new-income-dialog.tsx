import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';

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

  const formik = useFormik<FormikValue>({
    initialValues: {
      incomeSource: isEdit ? (data.incomeSource ?? '') : '',
      incomeAmount: isEdit ? (data.incomeAmount ?? '') : '',
      paymentMethod: isEdit ? (data.paymentMethod ?? '') : '',
      date: isEdit ? (dayjs(data.date) ?? dayjs()) : dayjs(),
      paymentStatus: isEdit ? (data.paymentStatus ?? '') : '',
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      incomeName: '',
      notes: '',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
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
      console.log('Form Submitted type', values);
    },
  });

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Create New'} Income`}
      open={dialogValue}
      handleClose={onClose}
      maxWidth="md"
    >
      <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Income Source is Already Exist
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>
      <Scrollbar>
        <Box>
          <form onSubmit={formik.handleSubmit}>
            <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
              <Grid container spacing={3} pt="10px">
                <Grid item xs={6}>
                  <CustomSelect
                    label="Income Category"
                    options={[]}
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
                    // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                    // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
                  />
                  {/* <TextField
                    name="incomeAmount"
                    label="Income Amount"
                    value={formik.values.incomeAmount}
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
              {/* <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button> */}
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceAddNewIncomeDialog;
