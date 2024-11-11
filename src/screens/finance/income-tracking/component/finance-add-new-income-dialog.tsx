import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

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
      incomeSource: isEdit ? data.incomeSource ?? '' : '',
      incomeAmount: isEdit ? data.incomeAmount ?? '' : '',
      paymentMethod: isEdit ? data.paymentMethod ?? '' : '',
      date: isEdit ? data.date ?? dayjs("24-12-2025", 'DD-MM-YYYY') : dayjs("24-12-2025", 'DD-MM-YYYY'),
      paymentStatus: isEdit ? data.paymentStatus ?? '' : '',
      id: isEdit
        ? data.id ?? Math.floor(Math.random() * 1000000000)
        : Math.floor(Math.random() * 1000000000),
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
        <Box >
          <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
            <CustomSelect
                label="Income Category"
                options={[]}
                value={formik.values.incomeSource}
                onChange={(value) => formik.setFieldValue("incomeSource", value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
              
              <TextField
                name="incomeAmount"
                label="Income Amount"
                value={formik.values.incomeAmount}
                onChange={formik.handleChange}
                size="small"
              />
              <CustomSelect
                label="Payment Method"
                options={[]}
                value={formik.values.paymentMethod}
                onChange={(value) => formik.setFieldValue("paymentMethod", value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
              <DatePicker
                label="Date"
                value={formik.values.date}
                onChange={(newValue) => formik.setFieldValue('date', newValue)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small' } }}
                disabled={isEdit}
              />

              <CustomSelect
                label="Payment Status"
                options={[]}
                value={formik.values.paymentStatus}
                onChange={(value) => formik.setFieldValue("paymentStatus", value)}
                formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                disabled={isEdit}
              />
            </Box>
          
          </Scrollbar>
          <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
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
