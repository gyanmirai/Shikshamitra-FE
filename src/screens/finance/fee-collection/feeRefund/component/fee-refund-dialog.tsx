import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

import { Scrollbar } from 'src/components/scrollbar';
import CommonTable from 'src/components/commonTable';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FeeRefundDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
  total: any;
  tuitionFeeAmount: any;
  libraryFeeFeeAmount: any;
  totalFeeAmount: any;
}

interface FormikValues {
  selectStudent: string;
  feeType: number[];
  amount: number;
  paymentMode: string[];
  transactionId: string;
  transactionIdOnline: string;
  note: string;
  selectedTerms: string[];
  receiptNumber: string;
  chequeDate: any;
  bankName: string;
  receivedPayment: 0,
  chequeNumber: string;
  chequeAmount: number;
  cardAmount: number;
  onlineAmount: number;
  cashAmount: number;
  charges: number;
  chargesDetails: string;
  totalAmount: number;

  transectionIdOrCheque: string;

  remarks: string;
  id: number;



}
const columnsTable = [
  { key: 'feeHead', label: 'Fee Head' },
  { key: 'refundAmount', label: 'Refund Amount' },
];
const FeeRefundDialog: React.FC<FeeRefundDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
  total,
  tuitionFeeAmount,
  libraryFeeFeeAmount,
  totalFeeAmount,

}) => {
  console.log('selectedEntry', data);
  console.log('alldata', allData);

  const datax: any[] = [];

  allData.forEach((val: any) => {
    const refundData = {
      feeHead: val.feeHead,
      refundAmount: val.refundAmount,
    };
    datax.push(refundData);
  });

  const formik = useFormik<FormikValues>({
    initialValues: {

      totalAmount: totalFeeAmount,

      transectionIdOrCheque: '',

      remarks: '',

      id: isEdit
        ? data.id ?? Math.floor(Math.random() * 1000000000)
        : Math.floor(Math.random() * 1000000000),
      selectStudent: "jay",
      feeType: [],
      receivedPayment: 0,
      paymentMode: [],
      transactionId: '',
      transactionIdOnline: '',
      note: '',
      selectedTerms: [],
      receiptNumber: "",
      chequeDate: dayjs(),
      bankName: "",
      amount: 0,
      chequeNumber: "",
      chequeAmount: 0,
      cardAmount: 0,
      onlineAmount: 0,
      cashAmount: 0,
      charges: data.previousCharges,
      chargesDetails: data.chargesDetails,
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      // const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      console.log('Form Submitted type', values);
    },
  });

  const [chequeAmountState, setChequeAmountState] = useState('');
  const [cardAmountState, setCardAmountState] = useState('');
  const [onlineAmountState, setOnlineAmountState] = useState('');
  const [cashAmountState, setCashAmountState] = useState('');

  const handleChequeAmountChange = (formattedValue: string, numericValue: number) => {
    setChequeAmountState(formattedValue);

  };
  const handleCardAmountChange = (formattedValue: string, numericValue: number) => {
    setCardAmountState(formattedValue);

  };
  const handleOnlineAmountChange = (formattedValue: string, numericValue: number) => {
    setOnlineAmountState(formattedValue);

  };
  const handleCashAmountChange = (formattedValue: string, numericValue: number) => {
    setCashAmountState(formattedValue);

  };


  const dataForRefund = [
    {
      studentName: "JAY",
      paymentId: "j878d",
      feeHead: 'Tuition',
      paidAmount: '10000',
      refundAmount: "0",
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: "Tuition",
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: "June-2024",
              date: "15-01-2024",
              status: "Unpaid",
              amount: 5000,
              paymentHistory: [
                { paymentMode: "Card", amount: "2000", paymentId: "54j8", paymentStatus: "Success" },
                { paymentMode: "Cash", amount: "2000" },
                { paymentMode: "Online", amount: "1000", paymentId: "h8749", paymentStatus: "Failed" },
                { paymentMode: "Online", amount: "500", paymentId: "h8749", paymentStatus: "Success" },
                { paymentMode: "Check", amount: "500", paymentId: "h8749", paymentStatus: "Not Clear", charges: 500 },
              ],
            },
            {
              month: "July-2024",
              date: "15-02-2024",
              status: "Paid",
              amount: 5000,
              paymentHistory: [
                { paymentMode: "Bank Transfer", amount: "3000", paymentId: "jh238", paymentStatus: "Success" },
                { paymentMode: "Card", amount: "2000", paymentId: "aa123", paymentStatus: "Success" },
              ],
            },
          ]
        },


      ]


    },
    {
      studentName: "JAY",
      paymentId: "j878d",
      feeHead: 'Library',
      paidAmount: '4000',
      refundAmount: "0",
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: "Tuition",
          totalFees: 60000,
          amount: 5000,
          paymentDates: [

            {
              month: "July-2024",
              date: "15-02-2024",
              status: "Paid",
              amount: 5000,
              paymentHistory: [
                { paymentMode: "Bank Transfer", amount: "3000", paymentId: "jh238", paymentStatus: "Success" },
                { paymentMode: "Card", amount: "2000", paymentId: "aa123", paymentStatus: "Success" },
              ],
            },
          ]
        },


      ]


    },



  ];

  return (
    <CustomDialog maxWidth="md" title="Refund" open={dialogValue} handleClose={onClose}>


      <Box >
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>

            <Box pt="10px" display="flex" flexDirection="column" gap={3}>

              {/* <Typography variant="subtitle2">Student: </Typography>

              */}
              <Box display="flex" flexDirection="row" gap={3}>
                <Typography variant="subtitle2">John Doe, Grade: 10</Typography>
                {/* <Typography variant="subtitle2">Paid Amount via Cash : ₹ 10,000</Typography>
                <Typography variant="subtitle2">Paid Amount via Cash : ₹ 10,000</Typography>
                <Typography variant="subtitle2">Paid Amount via Account: ₹ 4,000</Typography> */}
              </Box>
              {/* <Divider style={{ margin: "0px 0" }} /> */}
              <CommonTable
                isPagination={false}
                columns={[
                  { key: 'feeHead', label: 'Fee Head' },
                  { key: 'refundAmount', label: 'Refund Amount' },
                  { key: 'paidViaCash', label: 'Cash Payment' },
                  { key: 'account', label: 'Account Payment' },
                ]}
                data={[
                  {
                    feeHead: "Tuition",
                    refundAmount: tuitionFeeAmount,
                    paidViaCash: 4000,
                    account: 0,
                  },
                  {
                    feeHead: "Library",
                    refundAmount: libraryFeeFeeAmount,
                    paidViaCash: 0,
                    account: 0,
                  }
                ]}
              />

              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <TextField
                  name="amount"
                  label="Amount"
                  value={formatNumber(formik.values.totalAmount, "INR")}
                  onChange={formik.handleChange}
                  size="small"
                  disabled
                />

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
                  formControlProps={{ sx: { minWidth: 190 } }}
                />
              </Box>
              {formik.values.paymentMode.length > 0 && (
                <Grid container spacing={2} px={2}>


                  {/* Online Payment Details */}


                  {formik.values.paymentMode.includes("Online") && (
                    <Grid item xs={12} md={12}>
                      <Typography variant="subtitle2" gutterBottom>Online Details</Typography>
                      <Box display="flex" gap={2} flexDirection="row">
                        <TextField
                          name="transactionIdForOnline"
                          label="Transaction ID"
                          value={formik.values.transactionIdOnline}
                          onChange={formik.handleChange}
                          size="small"
                          fullWidth
                        />
                        <FormattedAmountInput

                          label="Online Amount"
                          value={onlineAmountState}
                          onChange={handleOnlineAmountChange}

                        />
                      </Box>
                      {/* <Divider sx={{ py: "12px", }} /> */}
                    </Grid>
                  )}

                  {/* Card Payment Details */}
                  {formik.values.paymentMode.includes("Card") && (
                    <Grid item xs={12} md={12}>
                      <Typography variant="subtitle2" gutterBottom>Card Details</Typography>
                      <Box display="flex" gap={2} flexDirection="row">
                        <TextField
                          name="transactionId"
                          label="Transaction ID"
                          value={formik.values.transactionId}
                          onChange={formik.handleChange}
                          size="small"
                          fullWidth
                        />

                        <FormattedAmountInput

                          label="Card Amount"
                          value={cardAmountState}
                          onChange={handleCardAmountChange}

                        />
                      </Box>
                      {/* <Divider sx={{ py: "12px", }} /> */}
                    </Grid>
                  )}

                  {/* Cheque Payment Details */}
                  {formik.values.paymentMode.includes("Cheque") && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Cheque Details</Typography>
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
                            onChange={(date) => formik.setFieldValue("chequeDate", date)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
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
                          <FormattedAmountInput
                            label="chequeAmount"
                            value={chequeAmountState}
                            onChange={handleChequeAmountChange}
                          />

                        </Grid>
                      </Grid>

                      {/* <Divider sx={{ py: "12px", }} /> */}
                    </Grid>
                  )}


                  {formik.values.paymentMode.includes("Cash") && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Cash Details</Typography>


                      <FormattedAmountInput

                        label="Cash Amount"
                        value={cashAmountState}
                        onChange={handleCashAmountChange}

                      />

                    </Grid>
                  )}
                </Grid>
              )}

              {/* <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <TextField
                  name="transectionId"
                  label="Transection Id/Cheque No"
                  value={formik.values.transectionIdOrCheque}
                  onChange={formik.handleChange}
                  size="small"
                />

                <TextField
                  name="bankName"
                  label="Bank Name"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Box> */}
              <TextField
                multiline
                rows={4}
                name="remarks"
                label="Remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                size="small"
              />
            </Box>
            <Box pb="20px" />

          </Scrollbar>
          <DialogActions>
            {/* <Button onClick={onClose} variant="contained" size="small">
                               Cancel
                            </Button> */}
            {/* <Button type="submit" variant="contained" size="small">
              Cancel
            </Button> */}
            <Button disabled onClick={onClose} variant="contained" size="small">
              Generate Receipt
            </Button>

          </DialogActions>
        </form>
      </Box>




    </CustomDialog>
  );
};

export default FeeRefundDialog;
