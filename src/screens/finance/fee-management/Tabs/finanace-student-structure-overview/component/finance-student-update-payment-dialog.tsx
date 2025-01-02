import React from 'react';
import { useFormik } from 'formik';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import type studentFeePaymentStatusUpdated from '../data/student-fee-payment-status-updated';

interface FinanceStudentUpdatePaymentDialogProps {
  dialogValue: boolean;
  data: studentFeePaymentStatusUpdated;
  onSave: (values: studentFeePaymentStatusUpdated) => void;
  onClose: () => void;
}

const FinanceStudentUpdatePaymentDialog: React.FC<FinanceStudentUpdatePaymentDialogProps> = ({
  data,
  onClose,
  dialogValue,
  onSave,
}) => {
  const formik = useFormik({
    initialValues: {
      paymentAmount: '',
      paymentStatus: '',
      date: '',
      id: data.id,
    },
    // validationSchema: validationSchema,
    onSubmit: (values: studentFeePaymentStatusUpdated) => {
      console.log('Form Submitted type:', typeof values.date);
      onSave(values);
    },
  });
  console.log('data from parent', data);
  return (
    <CustomDialog title="Payment Status Form" open={dialogValue} handleClose={onClose}>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 xl={6}>
                <Box py="8px" display="flex" flexDirection="row" gap={3}>
                  <CustomSelect
                    label="Payment status"
                    options={[
                      { value: 'fullypaid', label: 'Fully Paid' },
                      { value: 'partiallypaid', label: 'Partially Paid' },
                      { value: 'overdue', label: 'Overdue' },
                    ]}
                    value={formik.values.paymentStatus}
                    onChange={(e) => formik.setFieldValue('paymentStatus', e)}
                    formControlProps={{ sx: { minWidth: 195 } }}
                  />
                  <TextField
                    name="paymentAmount"
                    label="Payment amount"
                    value={formik.values.paymentAmount}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                    helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                  />
                </Box>

                <DatePicker
                  label="To Date"
                  // value="",
                  onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Grid2>
            </Box>
            <DialogActions>
              <Button variant="contained" size="small">
                Preview
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

export default FinanceStudentUpdatePaymentDialog;
