import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

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
  date: string;
  paymentStatus: string;
  id: number;
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
      expenseCategory: isEdit ? data.expenseCategory ?? '' : '',
      expenseAmount: isEdit ? data.expenseAmount ?? '' : '',
      paymentMethod: isEdit ? data.paymentMethod ?? '' : '',
      date: isEdit ? data.date ?? '' : '',
      paymentStatus: isEdit ? data.paymentStatus ?? '' : '',
      id: isEdit
        ? data.id ?? Math.floor(Math.random() * 1000000000)
        : Math.floor(Math.random() * 1000000000),
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

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Create New'} Expense Entry`}
      open={dialogValue}
      handleClose={onClose}
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
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <TextField
                name="expenseCategory"
                label="Expense Category"
                value={formik.values.expenseCategory}
                onChange={formik.handleChange}
                size="small"
              />
              <TextField
                name="expenseAmount"
                label="Expense Amount"
                value={formik.values.expenseAmount}
                onChange={formik.handleChange}
                size="small"
              />
              <TextField
                name="paymentMethod"
                label="Payment Method"
                value={formik.values.paymentMethod}
                onChange={formik.handleChange}
                size="small"
              />
              <TextField
                name="date"
                label="Date"
                value={formik.values.date}
                onChange={formik.handleChange}
                size="small"
              />
              <TextField
                name="paymentStatus"
                label="Payment Status"
                value={formik.values.paymentStatus}
                onChange={formik.handleChange}
                size="small"
              />
            </Box>
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

export default FinanceAddExpenseTrackingDialog;
