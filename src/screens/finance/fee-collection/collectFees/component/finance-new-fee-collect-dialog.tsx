import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Button,
  Accordion,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ViewReceipt from 'src/screens/finance/viewReceipt/view-receipt';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
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

  const formik = useFormik({
    initialValues: {
      selectStudent: data.name,
      feeType: '',
      receivedPayment: 0,
      paymentMode: [],
      note: '',
      selectedTerms: [],
      receiptNumber: '',
      amount: 0,
      charges: data.previousCharges,
      chargesDetails: data.chargesDetails,
      feeDetails: [
        {
          feeType: '',
          pendingTerm: '',
          paymentMode: [
            {
              cash: {
                amount: '',
                totalAmountDue: '',
                totalAmountReceived: '',
              },
            },
            {
              online: {
                amount: '',
                transactionId: '',
                totalAmountDue: '',
                totalAmountReceived: '',
              },
            },
            {
              card: {
                amount: '',
                transactionId: '',
                totalAmountDue: '',
                totalAmountReceived: '',
              },
            },
            {
              cheque: {
                amount: '',
                chequeNumber: '',
                bankName: '',
                chequeDate: '',
                totalAmountDue: '',
                totalAmountReceived: '',
              },
            },
          ],
        },
      ],
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
            label: `${status.month} - ${fee.payableFee}`,
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
  const [selectedFees, setSelectedFees] = useState<any>([
    {
      feeType: '',
      pendingTerm: '',
      paymentMode: [],
      amountDue: '',
      receivedAmount: '',
    },
  ]);
  const [currentSelection, setCurrentSelection] = useState({
    feeType: '',
    pendingTerm: '',
    paymentMode: [],
    amountDue: '',
    receivedAmount: '',
  });

  const handleAddFee = () => {
    console.log('handleAddFee called');
    const { feeType, selectedTerms: pendingTerm, paymentMode } = formik.values;

    // Ensure required fields are selected before adding
    if (feeType === '' || pendingTerm.length < 1 || paymentMode.length < 1) {
      window.alert('Please select fee type and pending term and payment mode.');
      return;
    }

    // Create new fee entry
    formik.setFieldValue(`feeDetails.${feeType}`, {
      amountDue: '',
      receivedAmount: '',
      paymentMode: [],
      paymentModes: {
        cash: { amount: '' },
        online: { amount: '', transactionId: '' },
        card: { amount: '', transactionId: '' },
        cheque: { amount: '', chequeNumber: '', bankName: '', chequeDate: '' },
      },
    });
    const newFee = {
      feeType,
      pendingTerm,
      paymentMode,
      amountDue: '',
      receivedAmount: '',
    };

    // Update selected fees
    setSelectedFees((prevFees: any) => [...prevFees, newFee]);

    // Reset current selection
    formik.setValues({
      ...formik.values,
      feeType: '',
      selectedTerms: [],
      paymentMode: [],
    });

    console.log('Updated selectedFees:', [...selectedFees, newFee]);
  };

  const handleDeleteFee = (index: number) => {
    // Remove the fee at the specified index
    const updatedFees = [...selectedFees];
    updatedFees.splice(index, 1);
    setSelectedFees(updatedFees);
  };

  return (
    <>
      <CustomDialog maxWidth="xl" title="Fee Collection" open={dialogValue} handleClose={onClose}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '600px' }}>
          <Box px="20px">
            {showExistingEntryMessage && (
              <Typography component="span" fontSize="14" color="red">
                This Entry Already Exists
              </Typography>
            )}
          </Box>
          <Box>
            {selectedFees.length > 1 &&
              selectedFees.map((fee: any, index: number) => {
                const feeIndex = formik.values.feeDetails.findIndex(
                  (f) => f.feeType === fee.feeType
                );

                return (
                  index !== 0 &&
                  feeIndex !== -1 && (
                    <Accordion key={index} sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography variant="h6" flexGrow={1}>
                            {fee.feeType}
                          </Typography>
                          <Iconify
                            sx={{ paddingRight: '10px', fontSize: '48px', transform: 'scale(2)' }}
                            color="red"
                            icon="material-symbols-light:delete-outline"
                            onClick={() => handleDeleteFee(index)}
                          />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Typography>
                          <strong>Selected Term: </strong>{' '}
                          {Array.isArray(fee.pendingTerm)
                            ? fee.pendingTerm
                                .map((term: any) =>
                                  term.replace(new RegExp(`^${fee.feeType}\\s*-\\s*`), '').trim()
                                ) // Remove "feeType -"
                                .join(', ')
                            : fee.pendingTerm
                                .replace(new RegExp(`^${fee.feeType}\\s*-\\s*`), '')
                                .trim()}
                        </Typography>

                        <Typography sx={{ pt: '15px' }} variant="subtitle1">
                          Payment Details
                        </Typography>

                        {fee.paymentMode.length > 0 && (
                          <Grid container spacing={2} px={2} pt={3}>
                            {fee.paymentMode.includes('Cash') && feeIndex !== -1 && (
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Cash Details
                                </Typography>

                                {/** 🔥 Find paymentModeIndex dynamically before using it */}
                                {(() => {
                                  const paymentModeIndex = formik.values.feeDetails[
                                    feeIndex
                                  ]?.paymentMode.findIndex(
                                    (mode) => Object.keys(mode)[0] === 'cash'
                                  );

                                  return (
                                    paymentModeIndex !== -1 && (
                                      <NumericFormatCustom
                                        label="Cash Amount"
                                        value={
                                          formik.values.feeDetails[feeIndex]?.paymentMode[
                                            paymentModeIndex
                                          ]?.cash?.amount || ''
                                        }
                                        onChange={(e) => {
                                          formik.setFieldValue(
                                            `feeDetails[${feeIndex}].paymentMode[${paymentModeIndex}].cash.amount`,
                                            e
                                          );
                                        }}
                                        size="small"
                                        fullWidth
                                      />
                                    )
                                  );
                                })()}
                              </Grid>
                            )}
                          </Grid>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )
                );
              })}
          </Box>
          <Box>
            <form onSubmit={formik.handleSubmit}>
              <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
                <Box pt="15px" display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
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
                    <Box>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleAddFee}
                      >
                        Add
                      </Button>
                    </Box>
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
                  </Grid>

                  {/* <TextField
                  multiline
                  rows={6}
                  name="note"
                  label="Note"
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  size="small"
                /> */}
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
        </Scrollbar>
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

// {formik.values.paymentMode.length > 0 && (
//   <Grid container spacing={2} px={2}>
//     {/* Online Payment Details */}

//     {formik.values.paymentMode.includes('Online') && (
//       <Grid item xs={12} md={12}>
//         <Typography variant="subtitle2" gutterBottom>
//           Online Details
//         </Typography>
//         <Box display="flex" gap={2} flexDirection="row">
//           <TextField
//             name="transactionIdForOnline"
//             label="Transaction ID"
//             value={formik.values.transactionIdOnline}
//             onChange={formik.handleChange}
//             size="small"
//             fullWidth
//           />
//           <NumericFormatCustom
//             size="small"
//             fullWidth
//             label="Online Amount"
//             value={formik.values.onlineAmount}
//             onChange={(e) => formik.setFieldValue('onlineAmount', e)}
//           />
//         </Box>
//         <Divider sx={{ py: '12px' }} />
//       </Grid>
//     )}

//     {/* Card Payment Details */}
//     {formik.values.paymentMode.includes('Card') && (
//       <Grid item xs={12} md={12}>
//         <Typography variant="subtitle2" gutterBottom>
//           Card Details
//         </Typography>
//         <Box display="flex" gap={2} flexDirection="row">
//           <TextField
//             name="transactionId"
//             label="Transaction ID"
//             value={formik.values.transactionId}
//             onChange={formik.handleChange}
//             size="small"
//             fullWidth
//           />

//           <NumericFormatCustom
//             size="small"
//             fullWidth
//             label="Card Amount"
//             value={formik.values.cardAmount}
//             onChange={(e) => formik.setFieldValue('cardAmount', e)}
//           />
//         </Box>
//         <Divider sx={{ py: '12px' }} />
//       </Grid>
//     )}

//     {/* Cheque Payment Details */}
//     {formik.values.paymentMode.includes('Cheque') && (
//       <Grid item xs={12}>
//         <Typography variant="subtitle2" gutterBottom>
//           Cheque Details
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={3}>
//             <TextField
//               name="chequeId"
//               label="Cheque Number"
//               value={formik.values.chequeNumber}
//               onChange={formik.handleChange}
//               size="small"
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <DatePicker
//               label="Cheque Date"
//               value={formik.values.chequeDate}
//               onChange={(date) => formik.setFieldValue('chequeDate', date)}
//               slotProps={{
//                 textField: {
//                   fullWidth: true,
//                   size: 'small',
//                 },
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <TextField
//               name="bankName"
//               label="Bank Name"
//               value={formik.values.bankName}
//               onChange={formik.handleChange}
//               size="small"
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <NumericFormatCustom
//               label="Cheque Amount"
//               value={formik.values.chequeAmount}
//               onChange={(e) => formik.setFieldValue('chequeAmount', e)}
//               size="small"
//               fullWidth
//             />
//           </Grid>
//         </Grid>

//         <Divider sx={{ py: '12px' }} />
//       </Grid>
//     )}

//     {formik.values.paymentMode.includes('Cash') && (
//       <Grid item xs={12} md={6}>
//         <Typography variant="subtitle2" gutterBottom>
//           Cash Details
//         </Typography>

//         <NumericFormatCustom
//           label="Cash Amount"
//           value={formik.values.cashAmount}
//           onChange={(e) => {
//             formik.setFieldValue('cashAmount', e);
//           }}
//           size="small"
//           fullWidth
//         />
//       </Grid>
//     )}
//   </Grid>
// )}
