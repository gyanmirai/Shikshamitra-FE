import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';

import { Box, Grid, Radio, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';
import { numberToWords } from 'src/utils/numberToWords';

import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

interface ReceiptItem {
  feeHead: string;
  feeHeadMonth: string;
  amount: number;
  received: number;
  paymentMode: string;
  details: string;
}

interface PaymentDetails {
  paymentMode: 'Cash' | 'Cheque' | 'Online' | 'UPI';
  transectionId?: string; // Consider renaming to `transactionId`
  chequeNo?: string;
  bank?: string;
  dateOnCheque?: Dayjs | null;
  refundedBy?: string;

  remarks?: string;
}

interface ReceiptData {
  from: {
    name: string;
    address: string;
    branch: string;
  };
  to: {
    name: string;
    className: string;
    rollNo: string;
  };
  paymentMode: string;
  bank: string;
  ref: string;
  date: string;
  pendingFees: number;
  total: number;
  tableData: ReceiptItem[];
  paymentDetails: PaymentDetails;
}

interface TemplateOneProps {
  selectedTemplate: string;
  onSelectTemplate: (data: any) => void;
  data?: ReceiptData;
}

const defaultData: ReceiptData = {
  from: {
    name: 'Deep Darshan Vidhya Sankool',
    address: 'Near Madhuvan Circle',
    branch: 'Dindoli - 560078',
  },
  to: { name: 'Vishal Patel', className: '5-A', rollNo: '23' },
  paymentMode: 'Payment Gateway',
  bank: 'Paytm',
  ref: '09788nhgh679jlk',
  date: '06/08/2025',
  pendingFees: 900,
  total: 1600,
  tableData: [
    {
      feeHead: 'Library',
      amount: 1000,
      feeHeadMonth: 'March',
      received: 800,
      paymentMode: 'Cheque',
      details: 'Cheque No: 1234567890 , Bank: HDFC',
    },
    {
      feeHead: 'Sports',
      amount: 800,
      feeHeadMonth: 'March',
      received: 800,
      paymentMode: 'Cash',
      details: '-',
    },
  ],
  paymentDetails: {
    paymentMode: 'UPI',
    transectionId: 'TXN123456789',
    refundedBy: 'Admin - Prakash Patel',
    remarks: 'Overpayment adjustment',
  },
};

const TemplateOne: React.FC<TemplateOneProps> = ({ selectedTemplate, onSelectTemplate, data }) => {
  const receipt = data || defaultData;
  const { from, to } = receipt;
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
          <Radio
            checked={selectedTemplate === 'TemplateOne'}
            onChange={() => onSelectTemplate('TemplateOne')}
            value="TemplateOne"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />

          <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 5 }}>
            Fee Receipt
          </Typography>

          {/* From & To */}
          <Grid container sx={{ fontSize: '0.75rem', justifyContent: 'space-between' }}>
            <Grid item xs={5}>
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography fontSize="10px" fontWeight="bold">
                  From:
                </Typography>
                <Typography fontSize="10px">{from.name}</Typography>
                <Typography fontSize="10px">{from.address}</Typography>
                <Typography fontSize="10px">{from.branch}</Typography>
              </Box>
            </Grid>
            <Grid item xs={5}>
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography fontSize="10px" fontWeight="bold">
                  To:
                </Typography>
                <Typography fontSize="10px">
                  <strong>Name:</strong> {to.name}
                </Typography>
                <Typography fontSize="10px">
                  <strong>Class:</strong> {to.className}
                </Typography>
                <Typography fontSize="10px">
                  <strong>Roll No:</strong> {to.rollNo}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt={2} mb={1} display="flex" justifyContent="flex-start">
            {renderPaymentDetails(receipt.paymentDetails)}
          </Box>

          {/* Receipt Table */}
          <ReceiptTable
            columns={[
              { id: 'feeHead', label: 'Fee Head' },
              { id: 'feeHeadMonth', label: 'Month' },
              { id: 'amount', label: 'Due' },
              { id: 'received', label: 'Received' },
              { id: 'paymentMode', label: 'Mode' },
              { id: 'details', label: 'Details' },
            ]}
            data={receipt.tableData}
          />

          {/* Footer Totals */}
          <Box mt={7} display="flex" justifyContent="flex-end" sx={{ fontSize: '0.65rem' }}>
            <Box sx={{ textAlign: 'right', fontSize: '10px' }}>
              <Typography fontSize="10px">
                <strong>Total Paid:</strong> {formatNumber(receipt.total, 'INR')}
              </Typography>
              <Typography sx={{ pb: '10px', fontSize: '10px' }}>
                (In Words: {numberToWords(receipt.total)} Rupees Only)
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

export default TemplateOne;
