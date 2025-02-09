import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, Checkbox, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

// Define the types
interface Fee {
  id: number;
  feeHead: string;
  month: string;
  amount: number;
}

interface FormValues {
  selectedFees: number[];
  paymentMode: string[];
  transactionId: string;
  transactionIdOnline: string;
  note: string;
  chequeDate: any;
  bankName: string;
  chequeNumber: string;
  amountDue: string;
  receivedAmount: string;
  cashAmount: string;
  onlineAmount: string;
  cardAmount: string;
  chequeAmount: string;
}

const pendingFees: Fee[] = [
  { id: 1, feeHead: 'Library', month: 'Month-1', amount: 5100 },
  { id: 2, feeHead: 'Tuition', month: 'Month-2', amount: 5200 },
  { id: 3, feeHead: 'Library', month: 'Month-3', amount: 5300 },
  { id: 4, feeHead: 'Tuition', month: 'Month-4', amount: 5400 },
  { id: 5, feeHead: 'Library', month: 'Month-5', amount: 5500 },
  { id: 6, feeHead: 'Tuition', month: 'Month-6', amount: 5600 },
  { id: 7, feeHead: 'Library', month: 'Month-7', amount: 5700 },
  { id: 8, feeHead: 'Tuition', month: 'Month-8', amount: 5800 },
  { id: 9, feeHead: 'Library', month: 'Month-9', amount: 5900 },
  { id: 10, feeHead: 'Tuition', month: 'Month-10', amount: 6000 },
  { id: 11, feeHead: 'Library', month: 'Month-11', amount: 6100 },
  { id: 12, feeHead: 'Tuition', month: 'Month-12', amount: 6200 },
  { id: 13, feeHead: 'Library', month: 'Month-13', amount: 6300 },
  { id: 14, feeHead: 'Tuition', month: 'Month-14', amount: 6400 },
  { id: 15, feeHead: 'Library', month: 'Month-15', amount: 6500 },
  { id: 16, feeHead: 'Tuition', month: 'Month-16', amount: 6600 },
  { id: 17, feeHead: 'Library', month: 'Month-17', amount: 6700 },
  { id: 18, feeHead: 'Tuition', month: 'Month-18', amount: 6800 },
  { id: 19, feeHead: 'Library', month: 'Month-19', amount: 6900 },
  { id: 20, feeHead: 'Tuition', month: 'Month-20', amount: 7000 },
  { id: 21, feeHead: 'Library', month: 'Month-21', amount: 7100 },
  { id: 22, feeHead: 'Tuition', month: 'Month-22', amount: 7200 },
  { id: 23, feeHead: 'Library', month: 'Month-23', amount: 7300 },
  { id: 24, feeHead: 'Tuition', month: 'Month-24', amount: 7400 },
  { id: 25, feeHead: 'Library', month: 'Month-25', amount: 7500 },
  { id: 26, feeHead: 'Tuition', month: 'Month-26', amount: 7600 },
  { id: 27, feeHead: 'Library', month: 'Month-27', amount: 7700 },
  { id: 28, feeHead: 'Tuition', month: 'Month-28', amount: 7800 },
  { id: 29, feeHead: 'Library', month: 'Month-29', amount: 7900 },
  { id: 30, feeHead: 'Tuition', month: 'Month-30', amount: 8000 },
];

interface FeeCollectionFormProps {
  dialogValue: boolean;
  onClose: () => void;
}

const FeeCollectionForm: React.FC<FeeCollectionFormProps> = ({ dialogValue, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFees = pendingFees.filter(
    (fee) =>
      fee.feeHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomDialog fullScreen title="Fee Collection" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Formik<FormValues>
          initialValues={{
            selectedFees: [],
            paymentMode: [],
            transactionId: '',
            transactionIdOnline: '',
            note: '',
            chequeDate: dayjs(),
            bankName: '',
            chequeNumber: '',
            amountDue: '',
            receivedAmount: '',
            cashAmount: '',
            cardAmount: '',
            chequeAmount: '',
            onlineAmount: '',
          }}
          onSubmit={(values) => console.log('Selected Fees:', values)}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Box>
                <Scrollbar sx={{ p: 2, bgcolor: 'white', maxHeight: '600px' }}>
                  <CustomizableTable
                    columns={[
                      {
                        id: 'select',
                        label: 'Select',
                        render: (value, row) => (
                          <Checkbox checked onChange={(e) => console.log(e)} />
                        ),
                      },
                      { id: 'feeHead', label: 'Fee Head' },
                      { id: 'month', label: 'Month' },
                      { id: 'amount', label: 'Amount' },
                    ]}
                    data={filteredFees}
                    tableId="fee-collect-table"
                  />
                  <Grid container pt="15px" gap={3}>
                    <Grid item xs={12} md={3}>
                      <CustomSelect
                        multiple
                        label="Payment Mode"
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'Card', label: 'Card' },
                          { value: 'Online', label: 'Online' },
                          { value: 'Cheque', label: 'Cheque' },
                        ]}
                        value={values.paymentMode}
                        onChange={(selectedValues) => setFieldValue('paymentMode', selectedValues)}
                        formControlProps={{ sx: { width: '100%' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <NumericFormatCustom
                        size="small"
                        label="Amount Due"
                        name="amountDue"
                        value={values.amountDue}
                        onChange={(e) => {
                          setFieldValue('Amount Due', e);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <NumericFormatCustom
                        size="small"
                        label="Received Payment"
                        name="receivedPayment"
                        value={values.receivedAmount}
                        onChange={(e) => {
                          setFieldValue('receivedPayment', e);
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  {values.paymentMode.length > 0 && (
                    <Grid container spacing={2} p={2}>
                      {values.paymentMode.includes('Cash') && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Cash Details
                          </Typography>

                          <NumericFormatCustom
                            label="Cash Amount"
                            value={values.cashAmount}
                            onChange={(e) => {
                              setFieldValue('cashAmount', e);
                            }}
                            size="small"
                            fullWidth
                          />
                        </Grid>
                      )}
                      {values.paymentMode.includes('Online') && (
                        <Grid item xs={12} md={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Online Details
                          </Typography>
                          <Box display="flex" gap={2} flexDirection="row">
                            <TextField
                              name="transactionIdForOnline"
                              label="Transaction ID"
                              value={values.transactionIdOnline}
                              onChange={(e) => setFieldValue('transactionIdOnline', e.target.value)}
                              size="small"
                              fullWidth
                            />
                            <NumericFormatCustom
                              size="small"
                              fullWidth
                              label="Online Amount"
                              value={values.onlineAmount}
                              onChange={(e) => setFieldValue('onlineAmount', e)}
                            />
                          </Box>
                        </Grid>
                      )}

                      {values.paymentMode.includes('Card') && (
                        <Grid item xs={12} md={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Card Details
                          </Typography>
                          <Box display="flex" gap={2} flexDirection="row">
                            <TextField
                              name="transactionId"
                              label="Transaction ID"
                              value={values.transactionId}
                              onChange={(e) => setFieldValue('transactionId', e.target.value)}
                              size="small"
                              fullWidth
                            />
                            <NumericFormatCustom
                              size="small"
                              fullWidth
                              label="Card Amount"
                              value={values.cardAmount}
                              onChange={(e) => setFieldValue('cardAmount', e)}
                            />
                          </Box>
                        </Grid>
                      )}

                      {values.paymentMode.includes('Cheque') && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Cheque Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                              <TextField
                                name="chequeNumber"
                                label="Cheque Number"
                                value={values.chequeNumber}
                                onChange={(e) => setFieldValue('chequeNumber', e.target.value)}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <DatePicker
                                label="Cheque Date"
                                value={values.chequeDate}
                                onChange={(date) => setFieldValue('chequeDate', date)}
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
                                value={values.bankName}
                                onChange={(e) => setFieldValue('bankName', e.target.value)}
                                size="small"
                                fullWidth
                              />
                            </Grid>

                            <Grid item xs={12} md={3}>
                              <NumericFormatCustom
                                label="Cheque Amount"
                                value={values.chequeAmount}
                                onChange={(e) => setFieldValue('chequeAmount', e)}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  <Grid item xs={12} pt="20px">
                    <TextField
                      multiline
                      rows={6}
                      name="note"
                      label="Note"
                      value={values.note}
                      onChange={(e) => setFieldValue('note', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Scrollbar>
              </Box>
            </Form>
          )}
        </Formik>
      </Scrollbar>
      <DialogActions>
        <Box display="flex" justifyContent="flex-end">
          <Button
            size="small"
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </CustomDialog>
  );
};

export default FeeCollectionForm;
