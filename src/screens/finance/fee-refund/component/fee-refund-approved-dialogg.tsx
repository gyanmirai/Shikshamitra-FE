// import dayjs from 'dayjs';
// import { useFormik } from 'formik';
// import React, { useState, useEffect } from 'react';

// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Grid, Button, Divider, TextField, Typography, DialogActions } from '@mui/material';

// import { useBoolean } from 'src/hooks/use-boolean';

// import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';
// import CustomSelect from 'src/components/custom-select';
// import NumericFormatCustom from 'src/components/custom-numeric-format';

// import FeeConfirmationDialog from '../../fee-collection/collectFees/component/fee-confirmation-dialog';
// import ReceivedAmountWarning from '../../fee-collection/collectFees/component/received-amount-warning-dialog';

// // import FeeConfirmationDialog from './fee-confirmation-dialog';
// // import ReceivedAmountWarning from './received-amount-warning-dialog';

// interface FinanceFeeRefundApprovedDialogProps {
//   dialogValue: boolean;
//   data: any;
//   onSave: (values: any) => void;
//   onClose: () => void;
//   isEdit: boolean;
//   allData: any;
// }

// interface FormikValues {
//   selectStudent: string;
//   feeType: number[];
//   amount: number;
//   paymentMode: string[];
//   transactionId: string;
//   transactionIdOnline: string;
//   note: string;
//   selectedTerms: string[];
//   receiptNumber: string;
//   chequeDate: any;
//   bankName: string;
//   receivedPayment: 0;
//   chequeNumber: string;
//   chequeAmount: number;
//   cardAmount: number;
//   onlineAmount: number;
//   cashAmount: number;
//   charges: number;
//   chargesDetails: string;
//   refundAmount: any;
//   amountPaid: any;
// }

// const FinanceFeeRefundApprovedDialog: React.FC<FinanceFeeRefundApprovedDialogProps> = ({
//   dialogValue,
//   data,
//   onClose,
//   onSave,
//   isEdit,
//   allData,
// }) => {
//   const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
//   const [feeOptions, setFeeOptions] = useState<any[]>([]);
//   const [termOptions, setTermOptions] = useState<any[]>([]);

//   const formik = useFormik<FormikValues>({
//     initialValues: {
//       selectStudent: data.name,
//       feeType: [],
//       receivedPayment: 0,
//       paymentMode: [],
//       transactionId: '',
//       transactionIdOnline: '',
//       note: '',
//       selectedTerms: [],
//       receiptNumber: '',
//       chequeDate: dayjs(),
//       bankName: '',
//       amount: 0,
//       chequeNumber: '',
//       chequeAmount: 0,
//       cardAmount: 0,
//       onlineAmount: 0,
//       cashAmount: 0,
//       charges: data.previousCharges,
//       chargesDetails: data.chargesDetails,
//       refundAmount: '',
//       amountPaid: '',
//     },
//     onSubmit: (values) => {
//       onSave(values);
//     },
//   });

//   useEffect(() => {
//     const options = data.fees.map((fee: any) => ({
//       value: fee.feeHeadId,
//       label: fee.feeHead,
//     }));
//     setFeeOptions(options);
//   }, [data]);

//   useEffect(() => {
//     // Ensure that formik.values.feeType is an array before calling includes
//     const paidTerms = data.fees
//       .filter(
//         (fee: any) =>
//           Array.isArray(formik.values.feeType) && formik.values.feeType.includes(fee.feeHeadId)
//       )
//       .flatMap((fee: any) =>
//         fee.paymentDates
//           .filter((status: any) => status.status === 'Paid')
//           .map((status: any) => ({
//             value: `${fee.feeHead}-${status.month}`,
//             label: `${fee.feeHead} - ${status.month} - ${fee.amount}`,
//             amount: fee.amount,
//           }))
//       );
//     setTermOptions(paidTerms);
//   }, [formik.values.feeType, data]);

//   const handleTermSelection = (selectedTerms: any) => {
//     formik.setFieldValue('selectedTerms', selectedTerms);

//     const totalAmount = termOptions
//       .filter((term) => selectedTerms.includes(term.value))
//       .reduce((sum, term) => sum + term.amount, 0);

//     formik.setFieldValue('amount', totalAmount);
//   };

//   const [chequeAmountState, setChequeAmountState] = useState('');
//   const [cardAmountState, setCardAmountState] = useState('');
//   const [onlineAmountState, setOnlineAmountState] = useState('');
//   const [cashAmountState, setCashAmountState] = useState('');
//   const [amountDueState, setAmountDueState] = useState('');
//   const [receivedAmountState, setReceivedAmountState] = useState('');
//   function parseNumber(value: string): number {
//     return parseFloat(value.replace(/,/g, ''));
//   }

//   const handleAmountDueChange = (formattedValue: string, numericValue: number) => {
//     setAmountDueState(formattedValue);
//   };
//   const handleReceivedAmountChange = (formattedValue: string, numericValue: number) => {
//     setReceivedAmountState(formattedValue);
//   };

//   const handleChequeAmountChange = (formattedValue: string, numericValue: number) => {
//     setChequeAmountState(formattedValue);
//   };
//   const handleCardAmountChange = (formattedValue: string, numericValue: number) => {
//     setCardAmountState(formattedValue);
//   };
//   const handleOnlineAmountChange = (formattedValue: string, numericValue: number) => {
//     setOnlineAmountState(formattedValue);
//   };
//   const handleCashAmountChange = (formattedValue: string, numericValue: number) => {
//     setCashAmountState(formattedValue);
//   };

//   const dialog = useBoolean();
//   const errorDialogForReceivedAmount = useBoolean();
//   const closeConfirmationDialog = () => {
//     dialog.onFalse();
//   };

//   const closeDialogForReceivedAmount = () => {
//     errorDialogForReceivedAmount.onFalse();
//   };

//   return (
//     <>
//       <CustomDialog maxWidth="md" title="Fee Refund" open={dialogValue} handleClose={onClose}>
//         <Box px="20px">
//           {showExistingEntryMessage && (
//             <Typography component="span" fontSize="14" color="red">
//               This Entry Already Exists
//             </Typography>
//           )}
//         </Box>

//         <Box>
//           <form onSubmit={formik.handleSubmit}>
//             <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
//               <Box pt="15px" display="flex" flexDirection="column" gap={3}>
//                 <Box>
//                   <Typography fontSize="14px">Name: Vishal Rameshbhai Patel</Typography>
//                   <Typography fontSize="14px">Standard: 10-A</Typography>
//                 </Box>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={3}>
//                     <CustomSelect
//                       label="Fee Type"
//                       options={feeOptions}
//                       // @ts-ignore
//                       value={formik.values.feeType}
//                       onChange={(selectedValues) => {
//                         if (Array.isArray(selectedValues)) {
//                           formik.setFieldValue('feeType', selectedValues);
//                         }
//                       }}
//                       formControlProps={{ sx: { width: '100%' } }}
//                       multiple
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={3}>
//                     <CustomSelect
//                       label="Paid Terms"
//                       options={termOptions}
//                       value={formik.values.selectedTerms}
//                       onChange={handleTermSelection}
//                       formControlProps={{ sx: { width: '100%' } }}
//                       multiple
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={3}>
//                     <DatePicker
//                       label="Date"
//                       slotProps={{
//                         textField: {
//                           sx: { width: '100%' },
//                           size: 'small',
//                         },
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={3}>
//                     <CustomSelect
//                       multiple
//                       label="Payment Mode"
//                       options={[
//                         { value: 'Cash', label: 'Cash' },
//                         { value: 'Card', label: 'Card' },
//                         { value: 'Online', label: 'Online' },
//                         { value: 'Cheque', label: 'Cheque' },
//                       ]}
//                       // @ts-ignore
//                       value={formik.values.paymentMode}
//                       onChange={(selectedValues) =>
//                         formik.setFieldValue('paymentMode', selectedValues)
//                       }
//                       formControlProps={{ sx: { width: '100%' } }}
//                       disabled={isEdit}
//                     />
//                   </Grid>
//                 </Grid>

//                 {formik.values.paymentMode.length > 0 && (
//                   <Grid container spacing={2} px={2}>
//                     {/* Online Payment Details */}

//                     {formik.values.paymentMode.includes('Online') && (
//                       <Grid item xs={12} md={12}>
//                         <Typography variant="subtitle2" gutterBottom>
//                           Online Details
//                         </Typography>
//                         <Box display="flex" gap={2} flexDirection="row">
//                           <TextField
//                             name="transactionIdForOnline"
//                             label="Transaction ID"
//                             value={formik.values.transactionIdOnline}
//                             onChange={formik.handleChange}
//                             size="small"
//                             fullWidth
//                           />
//                           <FormattedAmountInput
//                             label="Online Amount"
//                             value={onlineAmountState}
//                             onChange={handleOnlineAmountChange}
//                           />
//                         </Box>
//                         <Divider sx={{ py: '12px' }} />
//                       </Grid>
//                     )}

//                     {/* Card Payment Details */}
//                     {formik.values.paymentMode.includes('Card') && (
//                       <Grid item xs={12} md={12}>
//                         <Typography variant="subtitle2" gutterBottom>
//                           Card Details
//                         </Typography>
//                         <Box display="flex" gap={2} flexDirection="row">
//                           <TextField
//                             name="transactionId"
//                             label="Transaction ID"
//                             value={formik.values.transactionId}
//                             onChange={formik.handleChange}
//                             size="small"
//                             fullWidth
//                           />

//                           <FormattedAmountInput
//                             label="Card Amount"
//                             value={cardAmountState}
//                             onChange={handleCardAmountChange}
//                           />
//                         </Box>
//                         <Divider sx={{ py: '12px' }} />
//                       </Grid>
//                     )}

//                     {/* Cheque Payment Details */}
//                     {formik.values.paymentMode.includes('Cheque') && (
//                       <Grid item xs={12}>
//                         <Typography variant="subtitle2" gutterBottom>
//                           Cheque Details
//                         </Typography>
//                         <Grid container spacing={2}>
//                           <Grid item xs={12} md={3}>
//                             <TextField
//                               name="chequeId"
//                               label="Cheque Number"
//                               value={formik.values.chequeNumber}
//                               onChange={formik.handleChange}
//                               size="small"
//                               fullWidth
//                             />
//                           </Grid>
//                           <Grid item xs={12} md={3}>
//                             <DatePicker
//                               label="Cheque Date"
//                               value={formik.values.chequeDate}
//                               onChange={(date) => formik.setFieldValue('chequeDate', date)}
//                               slotProps={{
//                                 textField: {
//                                   fullWidth: true,
//                                   size: 'small',
//                                 },
//                               }}
//                             />
//                           </Grid>
//                           <Grid item xs={12} md={3}>
//                             <TextField
//                               name="bankName"
//                               label="Bank Name"
//                               value={formik.values.bankName}
//                               onChange={formik.handleChange}
//                               size="small"
//                               fullWidth
//                             />
//                           </Grid>
//                           <Grid item xs={12} md={3}>
//                             <FormattedAmountInput
//                               label="chequeAmount"
//                               value={chequeAmountState}
//                               onChange={handleChequeAmountChange}
//                             />
//                           </Grid>
//                         </Grid>

//                         <Divider sx={{ py: '12px' }} />
//                       </Grid>
//                     )}

//                     {formik.values.paymentMode.includes('Cash') && (
//                       <Grid item xs={12} md={6}>
//                         <Typography variant="subtitle2" gutterBottom>
//                           Cash Details
//                         </Typography>

//                         <FormattedAmountInput
//                           label="Cash Amount"
//                           value={cashAmountState}
//                           onChange={handleCashAmountChange}
//                         />
//                       </Grid>
//                     )}
//                   </Grid>
//                 )}

//                 <Grid
//                   container
//                   spacing={2}
//                   display="flex"
//                   flexDirection="row"
//                   justifyContent="flex-end"
//                 >
//                   <Grid item xs={12} md={6} display="flex" gap={2}>
//                     {/* <TextField
//                       disabled
//                       name="charges"
//                       label="Charges"
//                       value={formik.values.charges}
//                       onChange={formik.handleChange}
//                       size="small"
//                       fullWidth
//                       InputProps={{
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <Tooltip title={formik.values.chargesDetails}>
//                               <Iconify
//                                 icon="material-symbols-light:info-outline"
//                                 style={{ cursor: 'pointer' }}
//                               />
//                             </Tooltip>
//                           </InputAdornment>
//                         ),
//                       }}
//                     /> */}
//                     <NumericFormatCustom
//                       size="small"
//                       label="Amount Paid"
//                       name="amountPaid"
//                       value={formik.values.amountPaid}
//                       onChange={formik.handleChange}
//                       fullWidth
//                       // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
//                       // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
//                     />
//                     <NumericFormatCustom
//                       size="small"
//                       label="Refund Amount"
//                       name="refundAmount"
//                       value={formik.values.refundAmount}
//                       onChange={formik.handleChange}
//                       fullWidth
//                       // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
//                       // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
//                     />
//                     {/* <FormattedAmountInput
//                       label="Amount Paid"
//                       value={amountDueState}
//                       onChange={handleAmountDueChange}
//                     />
//                     <FormattedAmountInput
//                       label="Refund Amount"
//                       value={receivedAmountState}
//                       onChange={handleReceivedAmountChange}
//                     /> */}
//                   </Grid>
//                 </Grid>

//                 {/* <Grid container spacing={2} justifyContent="flex-end">
//                 <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
//                   <TextField
//                     name="amount"
//                     label="Amount"
//                     value={formik.values.amount}
//                     size="small"
//                     InputProps={{ readOnly: true }}

//                   />
//                 </Grid>

//               </Grid> */}

//                 <TextField
//                   multiline
//                   rows={4}
//                   name="note"
//                   label="Note"
//                   value={formik.values.note}
//                   onChange={formik.handleChange}
//                   size="small"
//                 />
//               </Box>
//             </Scrollbar>
//           </form>
//           <DialogActions>
//             <Box pr="15px" display="flex" gap={2}>
//               {/* <TextField
//               name="amount"
//               label="Amount"
//               value={formik.values.amount}
//               size="small"
//               InputProps={{ readOnly: true }}
//               sx={{width:"140px"}}

//             /> */}
//               {/* <TextField
//               name="amount"
//               label="Amount Due"
//               value={formik.values.amount}
//               size="small"
//               InputProps={{ readOnly: true }}
//               sx={{width:"140px"}}

//             />
//              <TextField
//               name="receivedPayment"
//               label="Received Payment"
//               value={formik.values.receivedPayment}
//               size="small"
//               sx={{width:"140px"}}
//               onChange={formik.handleChange}

//             /> */}
//             </Box>
//             {/* <Button onClick={onClose} variant="contained" size="small">
//             Cancel
//           </Button> */}
//             <Button
//               disabled={formik.values.receivedPayment < 1}
//               onClick={() => {}}
//               variant="contained"
//               size="small"
//             >
//               View Receipt
//             </Button>

//             <Button
//               // disabled={formik.values.receivedPayment < 1}
//               type="submit"
//               variant="contained"
//               size="small"
//               onClick={() => {
//                 if (parseNumber(receivedAmountState) > parseNumber(amountDueState)) {
//                   errorDialogForReceivedAmount.onTrue();
//                 } else {
//                   dialog.onTrue();
//                 }
//               }}
//             >
//               Collect
//             </Button>
//           </DialogActions>
//         </Box>
//       </CustomDialog>

//       {dialog.value && (
//         <FeeConfirmationDialog
//           onConfirm={closeConfirmationDialog}
//           studentName="Vishal Rameshbhai Patel"
//           amount={40000}
//           open={dialog.value}
//           onClose={closeConfirmationDialog}
//         />
//       )}

//       {errorDialogForReceivedAmount.value && (
//         <ReceivedAmountWarning
//           open={errorDialogForReceivedAmount.value}
//           onClose={closeDialogForReceivedAmount}
//           title="Received amount cannot exceed the due amount."
//         />
//       )}
//     </>
//   );
// };

// export default FinanceFeeRefundApprovedDialog;
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
