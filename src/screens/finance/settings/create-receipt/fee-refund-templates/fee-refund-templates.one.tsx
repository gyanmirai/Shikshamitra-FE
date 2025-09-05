import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid, Divider, Typography } from '@mui/material';
import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';
import dummyReceipt from 'src/json/finance/create-receipt/fee-refund-template-one.json';

const numberToWords = (num: number) => `${num} only`;

const FeeRefundTemplateOne = () => {
  const { from, to, total } = dummyReceipt;

  const renderPaymentDetails = (paymentDetails: any) => {
    // Extract payment mode from paymentDetails object
    const mode = paymentDetails.paymentMode;

    const getFormattedRows = (rows: { label: string; value?: string }[]) => (
      // Helper function to format and display payment details in a grid layout
      // Takes an array of objects with label and value properties
      // Returns a Grid component with formatted rows of payment information
      <Grid container spacing={1}>
        {rows.map((row, index) => (
          <Grid size={6} key={index} display="flex" justifyContent="flex-start">
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
      <Grid size={{ xs: 12 }}>
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
          {/* Title */}
          <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 2 }}>
            Refund Templates
          </Typography>

          {/* From & To Section */}
          <Grid container sx={{ fontSize: '0.75rem', justifyContent: 'space-between', gap: 1 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography fontSize="10px" fontWeight="bold">
                  From:
                </Typography>
                <Typography fontSize="10px">{from?.name}</Typography>
                <Typography fontSize="10px">{from?.address}</Typography>
                <Typography fontSize="10px">{from?.branch}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
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

          {/* Payment Details */}
          <Box mt={2} mb={1} display="flex" justifyContent="flex-start">
            {renderPaymentDetails(dummyReceipt.paymentDetails)}
          </Box>

          {/* Refund Table */}
          <Typography
            fontSize="10px"
            fontWeight="bold"
            mb={1}
            mt={2}
            display="flex"
            justifyContent="flex-start"
          >
            Refunded Items
          </Typography>
          <ReceiptTable
            columns={[
              { id: 'feeHead', label: 'Fee Head' },
              { id: 'refundedAmount', label: 'Refunded Amount' },
            ]}
            data={dummyReceipt.data}
          />

          {/* Totals & Signature */}
          <Divider sx={{ my: 1 }} />
          <Box mt={1} display="flex" justifyContent="flex-end">
            <Box sx={{ textAlign: 'right', fontSize: '10px' }}>
              <Typography fontSize="10px">
                <strong>Total Refunded:</strong> ₹{total}
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

export default FeeRefundTemplateOne;
