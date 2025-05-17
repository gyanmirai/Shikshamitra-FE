import React from 'react';

import { Box, Grid, Radio, Divider, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';
import { numberToWords } from 'src/utils/numberToWords';

import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

interface ReceiptItem {
  feeHead: string;
  feeHeadMonth: string;
  amount: number;
}

interface ReceiptData {
  from: {
    name: string;
    address: string;
  };
  to: {
    name: string;
    class: string;
  };
  paymentMode: string;
  bank: string;
  ref: string;
  date: string;
  pendingFees: number;
  total: number;
  tableData: ReceiptItem[];
}

interface TemplateOneProps {
  selectedTemplate: string;
  onSelectTemplate: (data: any) => void;
  data?: ReceiptData; // ✅ Optional
}

const defaultData: ReceiptData = {
  from: {
    name: 'Deep Darshan Vidhya Sankool',
    address: 'Dindoli - 560078',
  },
  to: {
    name: 'Vishal Patel',
    class: '10-A',
  },
  paymentMode: 'Payment Gateway',
  bank: 'Paytm',
  ref: '09788nhgh679jlk',
  date: '06/08/2025',
  pendingFees: 900,
  total: 900,
  tableData: [
    { feeHead: 'Library Fee', amount: 1000, feeHeadMonth: 'March' },
    { feeHead: 'Sports Fee', amount: 800, feeHeadMonth: 'March' },
  ],
};

const TemplateOne: React.FC<TemplateOneProps> = ({ selectedTemplate, onSelectTemplate, data }) => {
  const receipt = data || defaultData;

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
            checked={selectedTemplate === 'TemplateOne'}
            onChange={() => onSelectTemplate('TemplateOne')}
            value="TemplateOne"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />

          <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 5 }}>
            Template 1
          </Typography>

          {/* From & To */}
          <Box sx={{ mb: 1 }}>
            <Grid
              container
              sx={{
                fontSize: '0.75rem',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <Grid item xs={5}>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  <Typography fontSize="10px">From:</Typography>
                  <Typography fontSize="10px">{receipt.from.name}</Typography>
                  <Typography fontSize="10px">{receipt.from.address}</Typography>
                </Box>
              </Grid>
              <Grid item xs={5}>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  <Typography fontSize="10px">To:</Typography>
                  <Typography fontSize="10px">
                    <strong>Name:</strong> {receipt.to.name}
                  </Typography>
                  <Typography fontSize="10px">
                    <strong>Class:</strong> {receipt.to.class}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Payment Info */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            pb="10px"
            sx={{ fontSize: '0.75rem' }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize="10px">
                <strong>Payment Mode :</strong> {receipt.paymentMode}
              </Typography>
              <Typography fontSize="10px">
                <strong>Bank:</strong> {receipt.bank}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography fontSize="10px">
                <strong>Ref:</strong> {receipt.ref}
              </Typography>
              <Typography fontSize="10px">
                <strong>Date:</strong> {receipt.date}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Receipt Table */}
          <ReceiptTable
            columns={[
              { id: 'feeHead', label: 'Fee Head' },
              { id: 'feeHeadMonth', label: 'Paid For' },
              { id: 'amount', label: 'Amount' },
            ]}
            data={receipt.tableData}
          />

          {/* Footer Totals */}
          <Box mt={7} display="flex" justifyContent="space-between" sx={{ fontSize: '0.65rem' }}>
            <Box>
              <Typography fontSize="10px">
                <strong>Pending Fees:</strong> {formatNumber(receipt.pendingFees, 'INR')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', fontSize: '10px' }}>
              <Typography fontSize="10px">
                <strong>Total:</strong> {formatNumber(receipt.total, 'INR')}
              </Typography>
              <Typography sx={{ pb: '10px', fontSize: '10px' }}>
                (In Words: {numberToWords(receipt.total)} Rupees Only)
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
