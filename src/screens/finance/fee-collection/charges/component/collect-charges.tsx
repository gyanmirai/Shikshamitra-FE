import React from 'react';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FinanceCollectChargesProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any;
}

const FinanceCollectCharges: React.FC<FinanceCollectChargesProps> = ({
  dialogValue,
  onClose,
  data,
}) => {
  // Initialize Formik
  const formik = useFormik<any>({
    initialValues: {
      feeType: [],
      paymentMode: [],
      transactionIdOnline: '',
      onlineAmount: '',
      transactionId: '',
      cardAmount: '',
      chequeNumber: '',
      chequeDate: null,
      bankName: '',
      chequeAmount: '',
      cashAmount: '',
    },
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
    },
  });

  return (
    <CustomDialog maxWidth="md" title="Charges Collection" open={dialogValue} handleClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Box display="flex" flexDirection="row" gap={2} py="12px">
            <Typography>
              <strong>Name:</strong> Vishal RameshBhai Patel
            </Typography>
            <Typography>
              <strong>Standard:</strong> 10/B
            </Typography>
            <Typography>
              <strong>Gr Number:</strong> 89866
            </Typography>
            <Typography>
              <strong>Roll Number:</strong> 1
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Head"
                options={[]} // Add options dynamically
                value={formik.values.feeType}
                onChange={(selectedValues) => formik.setFieldValue('feeType', selectedValues)}
                formControlProps={{ sx: { width: '100%' } }}
                multiple
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Charges"
                options={[]} // Add options dynamically
                value={formik.values.feeType}
                onChange={(selectedValues) => formik.setFieldValue('feeType', selectedValues)}
                formControlProps={{ sx: { width: '100%' } }}
                multiple
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Payment Mode"
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Card', label: 'Card' },
                  { value: 'Online', label: 'Online' },
                  { value: 'Cheque', label: 'Cheque' },
                ]}
                value={formik.values.paymentMode}
                onChange={(selectedValues) => formik.setFieldValue('paymentMode', selectedValues)}
                formControlProps={{ sx: { width: '100%' } }}
              />
            </Grid>
          </Grid>

          {formik.values.paymentMode.length > 0 && (
            <Grid container spacing={2} mt={2}>
              {/* Online Payment Details */}
              {formik.values.paymentMode.includes('Online') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Online Details
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      name="transactionIdOnline"
                      label="Transaction ID"
                      value={formik.values.transactionIdOnline}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                    />
                    <NumericFormatCustom
                      size="small"
                      label="Online Amount"
                      name="onlineAmount"
                      value={formik.values.onlineAmount}
                      onChange={formik.handleChange}
                      fullWidth
                    />
                  </Box>
                </Grid>
              )}

              {/* Card Payment Details */}
              {formik.values.paymentMode.includes('Card') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Card Details
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      name="transactionId"
                      label="Transaction ID"
                      value={formik.values.transactionId}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                    />
                    <NumericFormatCustom
                      size="small"
                      label="Card Amount"
                      name="cardAmount"
                      value={formik.values.cardAmount}
                      onChange={formik.handleChange}
                      fullWidth
                    />
                  </Box>
                </Grid>
              )}

              {/* Cheque Payment Details */}
              {formik.values.paymentMode.includes('Cheque') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cheque Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        name="chequeNumber"
                        label="Cheque Number"
                        value={formik.values.chequeNumber}
                        onChange={formik.handleChange}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        label="Cheque Date"
                        value={formik.values.chequeDate}
                        onChange={(date) => formik.setFieldValue('chequeDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        name="bankName"
                        label="Bank Name"
                        value={formik.values.bankName}
                        onChange={formik.handleChange}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <NumericFormatCustom
                        size="small"
                        label="Cheque Amount"
                        name="chequeAmount"
                        value={formik.values.chequeAmount}
                        onChange={formik.handleChange}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Cash Payment Details */}
              {formik.values.paymentMode.includes('Cash') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cash Details
                  </Typography>
                  <NumericFormatCustom
                    size="small"
                    label="Cash Amount"
                    name="cashAmount"
                    value={formik.values.cashAmount}
                    onChange={formik.handleChange}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          )}
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained" size="small">
            Collect Charges
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default FinanceCollectCharges;
