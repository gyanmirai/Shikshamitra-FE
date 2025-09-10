import { useFormik } from 'formik';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';
import { Box, Grid, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

interface FinanceChequeBounceChargeCollectDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}

const FinanceChequeBounceChargeCollect: React.FC<FinanceChequeBounceChargeCollectDialogProps> = ({
  data,
  dialogValue,
  onClose,
  onSave,
}) => {
  const formik = useFormik({
    initialValues: {
      paymentMode: '',
      chequeNo: data.chequeNo,
      bankName: data.bankName,
      receiptBook: '',
      amount: data.amount,
      id: data.id,

      remarks: '',
    },
    onSubmit: (values: any) => {
      console.log('Form Submitted type:', values);
      onSave(values);
    },
  });

  const [chequeAmountState, setChequeAmountState] = useState('');
  const [bankAmountState, setBankAmountState] = useState('');
  const [cardAmountState, setCardAmountState] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onlineAmountState, setOnlineAmountState] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // const handleOnlineAmountChange = (formattedValue: string, numericValue: number) => {
  //   setOnlineAmountState(formattedValue);
  // };
  // const handleCashAmountChange = (formattedValue: string, numericValue: number) => {
  //   setCashAmountState(formattedValue);
  // };
  return (
    <CustomDialog
      maxWidth="md"
      title="Cheque Bounce Charge Collect"
      open={dialogValue}
      handleClose={onClose}
    >
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              {/* <Typography variant="subtitle2">Student: </Typography>

              */}
              <Box display="flex" flexDirection="row" gap={3}>
                <Typography variant="subtitle2">John Doe, Grade: 10-A</Typography>
                {/* <Typography variant="subtitle2">Paid Amount via Cash : ₹ 10,000</Typography>
                <Typography variant="subtitle2">Paid Amount via Cash : ₹ 10,000</Typography>
                <Typography variant="subtitle2">Paid Amount via Account: ₹ 4,000</Typography> */}
              </Box>

              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <TextField
                  name="totalAmount"
                  label="Total Charges"
                  value={formatNumber(formik.values.totalAmount, 'INR')}
                  onChange={formik.handleChange}
                  size="small"
                  disabled
                />

                <CustomSelect
                  label="Payment Mode"
                  options={[
                    { value: 'Cash', label: 'Cash' },
                    { value: 'inAccount', label: 'In Account' },
                    { value: 'Online', label: 'Upi' },
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
                    <Grid size={{ xs: 12, md: 12 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        flexDirection="row"
                        gap={3}
                      >
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
                      </Box>

                      <Box
                        pt="15px"
                        display="flex"
                        justifyContent="flex-end"
                        justifyItems="flex-end"
                      >
                        <Button disabled onClick={onClose} variant="contained" size="small">
                          Proceed
                        </Button>
                      </Box>
                    </Grid>
                  )}

                  {/* Card Payment Details */}
                  {formik.values.paymentMode.includes('Card') && (
                    <Grid size={{ xs: 12, md: 12 }}>
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
                    </Grid>
                  )}

                  {/* Cheque Payment Details */}
                  {formik.values.paymentMode.includes('Cheque') && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Cheque Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField
                            name="chequeId"
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
                            slotProps={{
                              textField: { fullWidth: true, size: 'small' },
                            }}
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
                          <FormattedAmountInput
                            label="ChequeAmount"
                            value={chequeAmountState}
                            onChange={handleChequeAmountChange}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {/* Bank Account Payment Details */}
                  {formik.values.paymentMode.includes('inAccount') && (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        flexDirection="row"
                        gap={3}
                      >
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
                        <Grid size={{ xs: 12, md: 6 }}>
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
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            name="ifscNumber"
                            label="IFSC Number"
                            value={formik.values.ifscNumber}
                            onChange={formik.handleChange}
                            size="small"
                            fullWidth
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <CustomSelect
                            label="Bank Name"
                            options={[]}
                            name="bankNameForAccount"
                            value={formik.values.bankNameForAccount}
                            onChange={(val) => formik.setFieldValue('bankNameForAccount', val)}
                            formControlProps={{ sx: { minWidth: 410 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormattedAmountInput
                            label="Amount"
                            value={bankAmountState}
                            onChange={handleBankAmountChange}
                          />
                        </Grid>
                      </Grid>

                      <Box
                        pt="15px"
                        display="flex"
                        justifyContent="flex-end"
                        justifyItems="flex-end"
                      >
                        <Button disabled onClick={onClose} variant="contained" size="small">
                          Proceed
                        </Button>
                      </Box>
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

export default FinanceChequeBounceChargeCollect;
