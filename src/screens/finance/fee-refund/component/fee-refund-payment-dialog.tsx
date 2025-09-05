import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, TextField, Typography } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

import type { IFormikValues, IFeeRefundPaymentDialogProps } from '../fee-refund-interface';

const FeeRefundPaymentDialog: React.FC<IFeeRefundPaymentDialogProps> = ({
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
  const formik = useFormik<IFormikValues>({
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
    onSubmit: (values) => {
      onSave(values);
    },
  });

  const [chequeAmountState, setChequeAmountState] = useState<string>('');
  const [bankAmountState, setBankAmountState] = useState<string>('');
  const [cardAmountState, setCardAmountState] = useState<string>('');
  const [, setOnlineAmountState] = useState<string>('');
  const [, setCashAmountState] = useState<string>('');

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Box px={2} pt={5} display="flex" flexDirection="column" gap={3}>
          <TextField
            multiline
            rows={4}
            name="remarks"
            label="Remarks By Authority"
            value="Collect Via Cash"
            onChange={formik.handleChange}
            size="small"
            disabled
          />
          <TextField
            multiline
            rows={4}
            name="remarks"
            label="Remarks"
            value={formik.values.remarks}
            onChange={(e) => {
              const capitalizedText = capitalizeWords(e.target.value);
              formik.setFieldValue('remarks', capitalizedText);
            }}
            size="small"
          />
          <CustomSelect
            label="Payment Mode"
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
            value={formik.values.paymentMode}
            onChange={(selectedValues) => formik.setFieldValue('paymentMode', selectedValues)}
            formControlProps={{ sx: { maxWidth: 220 } }}
          />
          {formik.values.paymentMode === 'Online' && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 12 }}>
                <Typography variant="subtitle2">Online Details</Typography>
                <TextField
                  name="transactionIdOnline"
                  label="Transaction ID"
                  value={formik.values.transactionIdOnline}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {formik.values.paymentMode === 'Card' && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="transactionId"
                  label="Transaction ID"
                  value={formik.values.transactionId}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormattedAmountInput
                  label="Card Amount"
                  value={cardAmountState}
                  onChange={(formatted, numeric) => setCardAmountState(formatted)}
                />
              </Grid>
            </Grid>
          )}

          {formik.values.paymentMode === 'Cheque' && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  name="chequeNumber"
                  label="Cheque Number"
                  value={formik.values.chequeNumber}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker
                  label="Cheque Date"
                  value={formik.values.chequeDate}
                  onChange={(date) => formik.setFieldValue('chequeDate', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  name="bankName"
                  label="Bank Name"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <NumericFormatCustom
                  label="Cheque Amount"
                  value={chequeAmountState}
                  onChange={(formatted) => setChequeAmountState(formatted.target.value)}
                  name="chequeAmount"
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default FeeRefundPaymentDialog;
