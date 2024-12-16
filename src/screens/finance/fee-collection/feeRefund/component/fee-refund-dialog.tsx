import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, Tooltip, TextField, Typography } from '@mui/material';

import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

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
  paymentMode: string;
  transactionId: string;
  transactionIdOnline: string;
  note: string;
  selectedTerms: string[];
  receiptNumber: string;
  chequeDate: any;
  bankName: string;
  receivedPayment: 0;
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
  accountNumber: number;
  bankNameForAccount: string;
  accountAmount: number;
  ifscNumber: string;
  upiId: string;
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
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      selectStudent: 'jay',
      feeType: [],
      receivedPayment: 0,
      paymentMode: '',
      transactionId: '',
      transactionIdOnline: '',
      note: '',
      selectedTerms: [],
      receiptNumber: '',
      chequeDate: dayjs(),
      bankName: '',
      amount: 0,
      chequeNumber: '',
      chequeAmount: 0,
      cardAmount: 0,
      onlineAmount: 0,
      cashAmount: 0,
      charges: data.previousCharges,
      chargesDetails: data.chargesDetails,
      accountNumber: 0,
      bankNameForAccount: '',
      accountAmount: 0,
      ifscNumber: '',
      upiId: '',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      // const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      console.log('Form Submitted type', values);
    },
  });

  const [chequeAmountState, setChequeAmountState] = useState('');
  const [bankAmountState, setBankAmountState] = useState('');
  const [cardAmountState, setCardAmountState] = useState('');
  const [onlineAmountState, setOnlineAmountState] = useState('');
  const [cashAmountState, setCashAmountState] = useState('');
  const handleBankAmountChange = (formattedValue: string, numericValue: number) => {
    setBankAmountState(formattedValue);
  };
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
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Tuition',
      paidAmount: '10000',
      refundAmount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'June-2024',
              date: '15-01-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: '54j8',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '2000' },
                {
                  paymentMode: 'Online',
                  amount: '1000',
                  paymentId: 'h8749',
                  paymentStatus: 'Failed',
                },
                {
                  paymentMode: 'Online',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Check',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Not Clear',
                  charges: 500,
                },
              ],
            },
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Library',
      paidAmount: '4000',
      refundAmount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Box px="15px" pt="10px" display="flex" flexDirection="column" gap={3}>
          <Box pt="10px" display="flex" flexDirection="row" gap={3}>
            {/* <TextField
              name="totalAmount"
              label="Total Refund Amount"
              value={formatNumber(formik.values.totalAmount, "INR")}
              onChange={formik.handleChange}
              size="small"
              disabled
            /> */}

            <CustomSelect
              label="Payment Mode"
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Account', label: 'Account' },
                { value: 'Online', label: 'Upi' },
                { value: 'Cheque', label: 'Cheque' },
              ]}
              // @ts-ignore
              value={formik.values.paymentMode}
              onChange={(selectedValues) => formik.setFieldValue('paymentMode', selectedValues)}
              formControlProps={{ sx: { minWidth: 190 } }}
            />
          </Box>
          {formik.values.paymentMode.length > 0 && (
            <Grid container spacing={2} px={2}>
              {/* Online Payment Details */}

              {formik.values.paymentMode.includes('Online') && (
                <Grid item xs={12} md={12}>
                  <Box display="flex" justifyContent="space-between" flexDirection="row" gap={3}>
                    <Typography sx={{ pb: '15px' }} variant="subtitle2">
                      Online Details
                    </Typography>

                    <Box>
                      {/* Linked Account Row */}
                      <Tooltip placement="top-start" title="Issue refund to this account">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap={1}
                          sx={{ pb: 1 }}
                        >
                          <Typography variant="subtitle2">Linked Account:</Typography>
                          <Typography variant="subtitle2">notaxytz@oksbi</Typography>
                        </Box>
                      </Tooltip>

                      {/* Last Transaction Row */}
                      <Tooltip placement="top-start" title="Issue refund to this account">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap={1}
                          sx={{ pb: 1 }}
                        >
                          <Typography variant="subtitle2">Last Transaction:</Typography>
                          <Typography variant="subtitle2">dummy@upi</Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} flexDirection="row">
                    <TextField
                      name="transactionIdForOnline"
                      label="Transaction ID"
                      value={formik.values.transactionIdOnline}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      name="upiId"
                      label="Upi ID"
                      value={formik.values.upiId}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                    />
                    {/* <FormattedAmountInput

                          label="Online Amount"
                          value={onlineAmountState}
                          onChange={handleOnlineAmountChange}

                        /> */}
                  </Box>
                  <Box pt="15px" display="flex" justifyContent="flex-end" justifyItems="flex-end">
                    <Button disabled onClick={onClose} variant="contained" size="small">
                      Proceed
                    </Button>
                  </Box>
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
                      <FormattedAmountInput
                        label="ChequeAmount"
                        value={chequeAmountState}
                        onChange={handleChequeAmountChange}
                      />
                    </Grid>
                  </Grid>

                  {/* <Divider sx={{ py: "12px", }} /> */}
                </Grid>
              )}

              {formik.values.paymentMode.includes('Account') && (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" flexDirection="row" gap={3}>
                    <Typography sx={{ pb: '15px' }} variant="subtitle2">
                      Bank Details
                    </Typography>

                    <Box>
                      {/* Linked Account Row */}
                      <Tooltip placement="top-start" title="Issue refund to this account">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap={1}
                          sx={{ pb: 1 }}
                        >
                          <Typography variant="subtitle2">Linked Account:</Typography>
                          <Typography variant="subtitle2">Bank Of Baroda</Typography>
                        </Box>
                      </Tooltip>

                      {/* Last Transaction Row */}
                      <Tooltip placement="top-start" title="Issue refund to this account">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap={1}
                          sx={{ pb: 1 }}
                        >
                          <Typography variant="subtitle2">Last Transaction:</Typography>
                          <Typography variant="subtitle2">Bank Of Baroda</Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="accountNumber"
                        label="Bank Account Number"
                        value={formik.values.accountNumber}
                        onChange={formik.handleChange}
                        size="small"
                        fullWidth
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="ifscNumber"
                        label="IFSC Number"
                        value={formik.values.ifscNumber}
                        onChange={formik.handleChange}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <CustomSelect
                        label="Bank Name"
                        options={[]}
                        name="bankNameForAccount"
                        value={formik.values.bankNameForAccount}
                        onChange={(val) => formik.setFieldValue('bankNameForAccount', val)}
                        formControlProps={{ fullWidth: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormattedAmountInput
                        label="Amount"
                        value={bankAmountState}
                        onChange={handleBankAmountChange}
                      />
                    </Grid>
                  </Grid>

                  <Box pt="15px" display="flex" justifyContent="flex-end" justifyItems="flex-end">
                    <Button disabled onClick={onClose} variant="contained" size="small">
                      Proceed
                    </Button>
                  </Box>
                </Grid>
              )}

              {/* 

                  {formik.values.paymentMode.includes("Cash") && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Cash Details
                      </Typography>

                      <FormattedAmountInput
                        label="Cash Amount"
                        value={cashAmountState}
                        onChange={handleCashAmountChange}
                      />
                    </Grid>
                  )} */}
            </Grid>
          )}

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
      </form>
    </Box>
  );
};

export default FeeRefundDialog;
