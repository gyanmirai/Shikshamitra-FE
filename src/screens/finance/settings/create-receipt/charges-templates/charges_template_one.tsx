import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Grid, Radio, Divider, Typography } from '@mui/material';

import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

// Dummy data
const dummyReceipt = {
  from: {
    name: 'Deep Darshan Vidhya Sankool',
    address: 'Near Madhuvan Circle',
    branch: 'Dindoli - 560078',
  },
  to: { name: 'Vishal Patel', className: '5-A', rollNo: '23' },
  lateFeeCharges: [
    {
      feeHead: 'Tuition Fee',
      dueDate: '05-Apr-2025',
      daysOverdue: '12',
      chargePerDay: '₹10',
      total: '₹120',
    },
    {
      feeHead: 'Transport Fee',
      dueDate: '10-Apr-2025',
      daysOverdue: '7',
      chargePerDay: '₹5',
      total: '₹35',
    },
  ],
  chequeBounceCharges: [
    {
      feeHead: 'Tuition Fee',
      chequeDate: '01-Apr-2025',
      receivedDate: '04-Apr-2025',
      amount: '₹5000',
      bank: 'HDFC',
      charges: '₹150',
    },
  ],
  paymentDetails: {
    paymentMode: 'UPI',
    transectionId: 'TXN123456789',
    refundedBy: 'Admin - Prakash Patel',
    refundDate: dayjs().format('DD/MM/YYYY hh:mm A'),
    remarks: 'Overpayment adjustment',
  },
  total: 600,
};

// Dummy numberToWords
const numberToWords = (num: number) => `${num} only`;

const ChargesTemplateOne = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('LateBounceChargeTemplate');

  // const receipt = dummyReceipt;
  const { from, to, total } = dummyReceipt;

  // const hasLateCharges = selectedCharges.some(row => row.type === 'late');
  // const hasBounceCharges = selectedCharges.some(row => row.type === 'bounce');
  const renderPaymentDetails = (paymentDetails: any) => {
    const mode = paymentDetails.paymentMode;

    const getFormattedRows = (rows: { label: string; value?: string }[]) => (
      <Grid container spacing={1}>
        {rows.map((row, index) => (
          <Grid item xs={6} key={index} display="flex" justifyContent="flex-start">
            <Typography fontSize="10px">
              <strong>{row.label}:</strong> {row.value || '-'}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );

    switch (mode) {
      case 'Cash':
        return getFormattedRows([{ label: 'Payment Mode', value: 'Cash' }]);

      case 'Cheque':
        return getFormattedRows([
          { label: 'Payment Mode', value: 'Cheque' },
          { label: 'Cheque No', value: paymentDetails.chequeNo },
          { label: 'Bank', value: paymentDetails.bank },
          {
            label: 'Date on Cheque',
            value: paymentDetails.dateOnCheque
              ? dayjs(paymentDetails.dateOnCheque).format('DD/MM/YYYY')
              : '-',
          },
        ]);

      case 'Online':
      case 'UPI':
        return getFormattedRows([
          { label: 'Payment Mode', value: mode },
          { label: 'Transaction ID', value: paymentDetails.transectionId },
        ]);

      default:
        return null;
    }
  };
  return (
    <Grid container spacing={2} mb={3} justifyContent="flex-start">
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            border: '1px solid #ddd',
            borderRadius: '8px',
            p: 1.5,
            textAlign: 'center',
            height: '100%',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          {/* Radio */}
          <Radio
            checked={selectedTemplate === 'LateBounceChargeTemplate'}
            onChange={() => setSelectedTemplate('LateBounceChargeTemplate')}
            value="LateBounceChargeTemplate"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />

          {/* Title */}
          <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 2 }}>
            Charges Template
          </Typography>

          {/* From & To */}
          <Grid container sx={{ fontSize: '0.75rem', justifyContent: 'space-between' }}>
            <Grid item xs={5}>
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography fontSize="10px" fontWeight="bold">
                  From:
                </Typography>
                <Typography fontSize="10px">{from?.name}</Typography>
                <Typography fontSize="10px">{from?.address}</Typography>
                <Typography fontSize="10px">{from?.branch}</Typography>
              </Box>
            </Grid>
            <Grid item xs={5}>
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography fontSize="10px" fontWeight="bold">
                  To:
                </Typography>
                <Typography fontSize="10px">
                  <strong>Name:</strong> {to?.name}
                </Typography>
                <Typography fontSize="10px">
                  <strong>Class:</strong> {to?.className}
                </Typography>
                <Typography fontSize="10px">
                  <strong>Roll No:</strong> {to?.rollNo}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt={2} mb={1} display="flex" justifyContent="flex-start">
            {renderPaymentDetails(dummyReceipt.paymentDetails)}
          </Box>
          {/* Late Fee Table */}
          <Typography
            fontSize="10px"
            fontWeight="bold"
            mb={1}
            mt={2}
            display="flex"
            justifyContent="flex-start"
          >
            Late Fee Charges
          </Typography>
          <ReceiptTable
            columns={[
              { id: 'feeHead', label: 'Fee Head' },
              { id: 'dueDate', label: 'Due Date' },
              { id: 'daysOverdue', label: 'Days Overdue' },
              { id: 'chargePerDay', label: 'Charge/Day' },
              { id: 'total', label: 'Total' },
            ]}
            data={dummyReceipt.lateFeeCharges}
          />

          {/* Cheque Bounce Table */}
          <Typography
            fontSize="10px"
            fontWeight="bold"
            mt={2}
            mb={1}
            display="flex"
            justifyContent="flex-start"
          >
            Cheque Bounce Charges
          </Typography>
          <ReceiptTable
            columns={[
              { id: 'feeHead', label: 'Fee Head' },
              { id: 'chequeDate', label: 'Cheque Date' },
              { id: 'receivedDate', label: 'Received Date' },
              { id: 'amount', label: 'Amount' },
              { id: 'bank', label: 'Bank' },
              { id: 'charges', label: 'Charges' },
            ]}
            data={dummyReceipt.chequeBounceCharges}
          />

          {/* Footer Totals */}
          <Divider sx={{ my: 1 }} />
          <Box mt={1} display="flex" justifyContent="flex-end">
            <Box sx={{ textAlign: 'right', fontSize: '10px' }}>
              <Typography fontSize="10px">
                <strong>Total Paid:</strong> ₹{total}
              </Typography>
              <Typography fontSize="10px" sx={{ pb: 1 }}>
                (In Words: {numberToWords(total)} Rupees Only)
              </Typography>
              <Typography sx={{ pb: '10px', fontSize: '10px' }}>
                {dayjs().format('DD/MM/YYYY')}
              </Typography>

              <Typography fontSize="10px">_________________________</Typography>
              <Typography fontSize="10px">Receiver Sign</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChargesTemplateOne;
