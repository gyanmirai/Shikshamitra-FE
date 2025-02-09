import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, Divider, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ViewReceipt from 'src/screens/finance/viewReceipt/view-receipt';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import FeeConfirmationDialog from './fee-confirmation-dialog';
import ReceivedAmountWarning from './received-amount-warning-dialog';

interface FinanceNewCollectFeeDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;

  isFromStudentAdmission: boolean;
}

interface FormikValues {
  selectStudent: string;
  feeType: string;
  amount: number;
  paymentMode: string[];
  transactionId: string;
  transactionIdOnline: string;
  note: string;
  selectedTerms: string[];
  receiptNumber: string;
  chequeDate: any;
  bankName: string;
  receivedPayment: 0;
  chequeNumber: string;

  charges: number;
  chargesDetails: string;

  amountDue: string;
  receivedAmount: string;
  cashAmount: string;
  onlineAmount: string;
  cardAmount: string;
  chequeAmount: string;
}

const FinanceNewCollectFeeDialog: React.FC<FinanceNewCollectFeeDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,

  isFromStudentAdmission,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const [feeOptions, setFeeOptions] = useState<any[]>([]);
  const [termOptions, setTermOptions] = useState<any[]>([]);

  const formik = useFormik<FormikValues>({
    initialValues: {
      selectStudent: data.name,
      feeType: '',
      receivedPayment: 0,
      paymentMode: [],
      transactionId: '',
      transactionIdOnline: '',
      note: '',
      selectedTerms: [],
      receiptNumber: '',
      chequeDate: dayjs(),
      bankName: '',
      amount: 0,
      chequeNumber: '',
      charges: data.previousCharges,
      chargesDetails: data.chargesDetails,
      amountDue: '',
      receivedAmount: '',
      cashAmount: '',
      cardAmount: '',
      chequeAmount: '',
      onlineAmount: '',
    },
    onSubmit: (values) => {
      console.log('here values', values);
      onSave(values);
    },
  });

  useEffect(() => {
    // Initialize options
    let options = [];

    // If it's from student admission, filter only the "Admission" feeHead
    if (isFromStudentAdmission) {
      options = data.fees
        .filter((fee: any) => fee.feeHead === 'Admission') // Only add Admission fee
        .map((fee: any) => ({
          value: fee.feeHeadId,
          label: fee.feeHead,
        }));
    } else {
      // Otherwise, map all fee heads
      options = data.fees.map((fee: any) => ({
        value: fee.feeHeadId,
        label: fee.feeHead,
      }));
    }

    // Set the fee options
    setFeeOptions(options);
  }, [data, isFromStudentAdmission]);

  useEffect(() => {
    const unpaidTerms = data.fees
      .filter((fee: any) => {
        // If isFromAdmission is true, only include "Admission" fee head
        if (isFromStudentAdmission) {
          return fee.feeHead === 'Admission' && formik.values.feeType === fee.feeHeadId;
        }

        return formik.values.feeType === fee.feeHeadId;
      })
      .flatMap((fee: any) =>
        fee.paymentDueDateList
          .filter((status: any) => status.status === 'Unpaid')
          .map((status: any) => ({
            value: `${fee.feeHead}-${status.month}`,
            label: `${fee.feeHead} - ${status.month} - ${fee.payableFee}`,
            amount: fee.payableFee,
          }))
      );

    setTermOptions(unpaidTerms);
  }, [formik.values.feeType, data, isFromStudentAdmission]);

  const handleTermSelection = (selectedTerms: any) => {
    formik.setFieldValue('selectedTerms', selectedTerms);

    const totalAmount = termOptions
      .filter((term) => selectedTerms.includes(term.value))
      .reduce((sum, term) => sum + term.amount, 0);

    formik.setFieldValue('amount', totalAmount);
  };

  const dialog = useBoolean();
  const errorDialogForReceivedAmount = useBoolean();

  const closeConfirmationDialog = () => {
    dialog.onFalse();
  };

  const closeDialogForReceivedAmount = () => {
    errorDialogForReceivedAmount.onFalse();
  };

  const viewReceiptDialog = useBoolean();

  return (
    <>
      <CustomDialog maxWidth="xl" title="Fee Collection" open={dialogValue} handleClose={onClose}>
        <Box px="20px">
          {showExistingEntryMessage && (
            <Typography component="span" fontSize="14" color="red">
              This Entry Already Exists
            </Typography>
          )}
        </Box>

        <Box>
          <form onSubmit={formik.handleSubmit}>
            <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
              <Box pt="15px" display="flex" flexDirection="column" gap={3}>
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
                  <Grid item xs={12} md={3}>
                    <CustomSelect
                      label="Fee Type"
                      options={feeOptions}
                      // @ts-ignore
                      value={formik.values.feeType}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('feeType', selectedValues);
                        formik.setFieldValue('selectedTerms', []);
                      }}
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomSelect
                      label="Pending Terms"
                      options={termOptions}
                      value={formik.values.selectedTerms}
                      onChange={handleTermSelection}
                      formControlProps={{ sx: { width: '100%' } }}
                      multiple
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Date"
                      slotProps={{
                        textField: {
                          sx: { width: '100%' },
                          size: 'small',
                        },
                      }}
                    />
                  </Grid> */}
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
                      // @ts-ignore
                      value={formik.values.paymentMode}
                      onChange={(selectedValues) =>
                        formik.setFieldValue('paymentMode', selectedValues)
                      }
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </Grid>
                </Grid>

                {formik.values.paymentMode.length > 0 && (
                  <Grid container spacing={2} px={2}>
                    {/* Online Payment Details */}

                    {formik.values.paymentMode.includes('Online') && (
                      <Grid item xs={12} md={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Online Details
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="row">
                          <TextField
                            name="transactionIdForOnline"
                            label="Transaction ID"
                            value={formik.values.transactionIdOnline}
                            onChange={formik.handleChange}
                            size="small"
                            fullWidth
                          />
                          <NumericFormatCustom
                            size="small"
                            fullWidth
                            label="Online Amount"
                            value={formik.values.onlineAmount}
                            onChange={(e) => formik.setFieldValue('onlineAmount', e)}
                          />
                        </Box>
                        <Divider sx={{ py: '12px' }} />
                      </Grid>
                    )}

                    {/* Card Payment Details */}
                    {formik.values.paymentMode.includes('Card') && (
                      <Grid item xs={12} md={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Card Details
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="row">
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
                            fullWidth
                            label="Card Amount"
                            value={formik.values.cardAmount}
                            onChange={(e) => formik.setFieldValue('cardAmount', e)}
                          />
                        </Box>
                        <Divider sx={{ py: '12px' }} />
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
                              name="chequeId"
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
                              label="Cheque Amount"
                              value={formik.values.chequeAmount}
                              onChange={(e) => formik.setFieldValue('chequeAmount', e)}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        </Grid>

                        <Divider sx={{ py: '12px' }} />
                      </Grid>
                    )}

                    {formik.values.paymentMode.includes('Cash') && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Cash Details
                        </Typography>

                        <NumericFormatCustom
                          label="Cash Amount"
                          value={formik.values.cashAmount}
                          onChange={(e) => {
                            formik.setFieldValue('cashAmount', e);
                          }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    )}
                  </Grid>
                )}

                <Grid
                  container
                  spacing={2}
                  display="flex"
                  flexDirection="row"
                  justifyContent="flex-end"
                >
                  <Grid item xs={12} md={6} display="flex" gap={2}>
                    {/* <TextField
                      disabled
                      name="charges"
                      label="Charges"
                      value={formik.values.charges}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={formik.values.chargesDetails}>
                              <Iconify
                                icon="material-symbols-light:info-outline"
                                style={{ cursor: 'pointer' }}
                              />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    /> */}
                    <NumericFormatCustom
                      size="small"
                      label="Amount Due"
                      name="Amount Due"
                      value={formik.values.amountDue}
                      onChange={formik.handleChange}
                      fullWidth
                    />

                    <NumericFormatCustom
                      size="small"
                      label="Received Payment"
                      name="ReceivedPayment"
                      value={formik.values.receivedAmount}
                      onChange={formik.handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  multiline
                  rows={6}
                  name="note"
                  label="Note"
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Box>
            </Scrollbar>

            <DialogActions>
              <Button
                // disabled={formik.values.receivedPayment < 1}
                onClick={() => {
                  viewReceiptDialog.onTrue();
                }}
                variant="contained"
                size="small"
                type="submit"
              >
                View Receipt
              </Button>

              <Button
                // disabled={formik.values.receivedPayment < 1}
                type="submit"
                variant="contained"
                size="small"
                onClick={() => {
                  // if (parseNumber(receivedAmountState) > parseNumber(amountDueState)) {
                  //   errorDialogForReceivedAmount.onTrue();
                  // } else {
                  //   dialog.onTrue();
                  // }
                }}
              >
                Collect
              </Button>
            </DialogActions>
          </form>
        </Box>
      </CustomDialog>

      {dialog.value && (
        <FeeConfirmationDialog
          onConfirm={closeConfirmationDialog}
          studentName="Vishal Rameshbhai Patel"
          amount={40000}
          open={dialog.value}
          onClose={closeConfirmationDialog}
        />
      )}

      {errorDialogForReceivedAmount.value && (
        <ReceivedAmountWarning
          open={errorDialogForReceivedAmount.value}
          onClose={closeDialogForReceivedAmount}
          title="Received amount cannot exceed the due amount."
        />
      )}

      {viewReceiptDialog.value && (
        <ViewReceipt
          dialogValue={viewReceiptDialog.value}
          onClose={() => {
            viewReceiptDialog.onFalse();
          }}
        />
      )}
    </>
  );
};

export default FinanceNewCollectFeeDialog;
/* 
              {formik.values.paymentMode.length === 1 && <Grid container spacing={2}>

                <Grid item xs={12} md={3}>
                  <TextField
                    name="charges"
                    label="Receipt Number"
                    value={formik.values.receiptNumber}
                    onChange={formik.handleChange}
                    size="small"

                  />
                </Grid>
                {(formik.values.paymentMode.includes("Online") || formik.values.paymentMode.includes("Card")) && <Grid item xs={12} md={3}>
                  <TextField
                    name="transactionId"
                    label="Transaction ID"
                    value={formik.values.transactionId}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>}
                {formik.values.paymentMode.includes("Cheque") && <Grid item xs={12} md={3}>
                  <TextField
                    name="chequeId"
                    label="Cheque Number"
                    value={formik.values.transactionId}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>}
                {formik.values.paymentMode.includes("Cheque") && <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Cheque Date"
                    slotProps={{
                      textField: {
                        sx: { width: '100%', maxWidth: '200px' },
                        size: 'small',
                      },
                    }}
                  />
                </Grid>}
                {formik.values.paymentMode.includes("Cheque") && <Grid item xs={12} md={3}>
                  <TextField
                    name="bankName"
                    label="Bank Name"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    size="small"
                  />
                </Grid>}
              </Grid>} */
