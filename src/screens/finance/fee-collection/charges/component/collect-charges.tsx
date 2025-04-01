'use client';

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

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { chargesData } from '../charges-data/charges_data';

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

  return (
    <CustomDialog
      fullScreen
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
              <strong>Standard:</strong> 10/B
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
                    render: (value, row) => (
                      <Checkbox
                        checked={selectedCharges.includes(value)}
                        onChange={() => handleSelectCharges(value, row.totalCharges)}
                      />
                    ),
                  },

                  { id: 'dueDate', label: 'Due Date' },
                  {
                    id: 'chargesPerDay',
                    label: 'ChargesPerDay',
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
                  },
                  {
                    id: 'totalCharges',
                    label: 'Total Charges',
                    render(value, row) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  { id: 'feeHead', label: 'Fee Head' },
                  { id: 'checkDate', label: 'Date on Check' },
                  { id: 'receivedCheckDate', label: 'Received Check Date' },
                  { id: 'chequeAmount', label: 'Cheque Amount' },
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
        </Scrollbar>
        <DialogActions>
          <Button
            disabled={selectedChargesAmount < 1}
            type="submit"
            variant="outlined"
            size="medium"
            color="primary"
          >
            {`Collect Charges ${formatNumber(selectedChargesAmount, 'INR')}`}
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default FinanceCollectCharges;
