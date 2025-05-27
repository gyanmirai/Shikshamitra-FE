'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  Tooltip,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';

import ChargesReceiptPDF from 'src/screens/finance/transection-receipt/charges-receipt';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { chargesData } from '../charges-data/charges_data';

import type { IFinanceCollectChargesProps } from '../interface/charges-interface';

const FinanceCollectCharges: React.FC<IFinanceCollectChargesProps> = ({
  dialogValue,
  onClose,
  data,
}) => {
  // Initialize Formik
  const formik = useFormik<any>({
    initialValues: {
      feeType: [],
      paymentMode: ['Cash'],
      transactionIdOnline: '',
      onlineAmount: '',
      transactionId: '',
      cardAmount: '',
      chequeNumber: '',
      chequeDate: null,
      bankName: '',
      chequeAmount: '',
      cashAmount: '',
      chargesList: [],
    },
    onSubmit: (values) => {},
  });

  const [charges] = useState(chargesData);
  const filteredChargesData = charges.filter((charge) =>
    formik.values.feeType.includes(charge.chargeType)
  );

  const filteredDetails = charges
    .map((charge) => charge.details) // Get the 'details' array from each charge
    .flat(); // Flatten the nested arrays of details into a single array

  const [selectedCharges, setSelectedCharges] = useState<any[]>([]);
  const [selectedChargesAmount, setSelectedChargesAmount] = useState(0);
  const handleSelectCharges = (sdata: any, amount: number) => {
    setSelectedCharges((prev) => {
      if (prev.includes(sdata)) {
        // Remove row and subtract its amount
        setSelectedChargesAmount((prevAmount) => prevAmount - amount);
        return prev.filter((id) => id !== sdata);
      }
      // Add row and add its amount
      setSelectedChargesAmount((prevAmount) => prevAmount + amount);
      return [...prev, sdata];
    });
  };

  const chargesDialog = useBoolean();

  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">Charges Collection</Typography>
          <Tooltip
            arrow
            placement="right"
            title="These charges include any late fees and bounced check charges, if applicable; otherwise, the amount will be 0.You can select multiple charges and collect them together."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '800px' }}>
          <Box display="flex" flexDirection="row" gap={2} py="12px" pb="20px">
            <Typography>
              <strong>Name:</strong> Vishal RameshBhai Patel
            </Typography>
            <Typography>
              <strong>Standard:</strong> 10-B
            </Typography>
            <Typography>
              <strong>Gr Number:</strong> 89866
            </Typography>
            <Typography>
              <strong>Roll Number:</strong> 1
            </Typography>
            <Typography>
              <strong>Total Charges:</strong> 1500
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {/* <Typography sx={{ pl: "20px", pt: "20px", fontWeight: "600", fontSize: "20px" }}  >Late Fee Charges</Typography> */}
            <Grid item xs={12} md={12}>
              <CustomizableTable
                tableId="charges-table"
                isShowedDense={false}
                isFilter={false}
                isSearch={false}
                columns={[
                  {
                    id: 'chargesHeadId',
                    label: 'Select',
                    isFilter: false,
                    isSort: false,

                    render: (value, row) => (
                      <Checkbox
                        checked={selectedCharges.includes(value)}
                        onChange={() => handleSelectCharges(value, row.totalCharges)}
                      />
                    ),
                  },

                  { id: 'dueDate', label: 'Due Date', filterType: 'date' },
                  {
                    id: 'chargesPerDay',
                    label: 'ChargesPerDay',
                    filterType: 'formattedNumber',
                    render(value, row) {
                      if (row.chargesPerDay !== null) {
                        return (
                          <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
                        );
                      }
                      return <Typography>-</Typography>;
                    },
                  },
                  {
                    id: 'noOfDay',
                    label: 'No Of Day',
                    filterType: 'number',
                  },
                  {
                    id: 'totalCharges',
                    label: 'Total Charges',
                    filterType: 'formattedNumber',
                    render(value, row) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  { id: 'feeHead', label: 'Fee Head' },
                  { id: 'checkDate', label: 'Date on Check', filterType: 'date' },
                  { id: 'receivedCheckDate', label: 'Received Check Date', filterType: 'date' },
                  { id: 'chequeAmount', label: 'Cheque Amount', filterType: 'number' },
                  // { id: "charges", label: "Charges" },
                  { id: 'bankName', label: 'Bank Name' },
                ]}
                data={filteredDetails}
              />
            </Grid>

            <Box pb="20px" />
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
              {/* {formik.values.paymentMode.includes('Cash') && (
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
              )} */}
            </Grid>
          )}
          {chargesDialog.value && (
            <CustomDialog
              title="Charges"
              maxWidth="md"
              handleClose={() => {
                chargesDialog.onFalse();
                // setReceiptData(null);
              }}
              open={chargesDialog.value}
            >
              <ChargesReceiptPDF
                from={{
                  name: 'Deep Darshan Vidhya Sankool',
                  address: 'Near Madhuvan Circle',
                  branch: 'Dindoli - 560078',
                }}
                to={{ name: 'Vishal Patel', className: '5-A', rollNo: '23' }}
                selectedCharges={[
                  {
                    dueDate: dayjs('2025-05-01'),
                    dayOverDue: 10,
                    chargePerDay: 50,
                    totalCharges: 500,
                    receivedAmount: 800,
                    dateOnCheque: dayjs('2025-05-15'),
                    ReceivedChequeDate: dayjs('2025-05-17'),
                    chequeAmount: 2000,
                    bankName: 'HDFC Bank',
                    feeHead: 'Tuition Fee',
                    type: 'late',
                  },
                ]}
                paymentDetails={{
                  paymentMode: 'Cheque',
                  chequeNo: '9876543210',
                  bank: 'State Bank of India',
                  dateOnCheque: dayjs('2025-06-01'),
                  transectionId: 'TXN1234567890',
                }}
              />
            </CustomDialog>
          )}
        </Scrollbar>
        <DialogActions>
          <Button
            disabled={selectedChargesAmount < 1}
            type="submit"
            variant="outlined"
            startIcon={<Iconify icon="game-icons:receive-money" />}
          >
            {`Collect Charges ${formatNumber(selectedChargesAmount, 'INR')}`}
          </Button>
          <Button
            disabled={selectedChargesAmount < 1}
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.receiptIcon} />}
            onClick={() => {
              chargesDialog.onTrue();
            }}
          >
            View Receipt
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default FinanceCollectCharges;
