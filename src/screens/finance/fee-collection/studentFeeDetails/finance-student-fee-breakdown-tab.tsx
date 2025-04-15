import React from 'react';

import { Box, Card, Chip, Typography, CardContent } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

interface PaymentStatus {
  title: string;
  status: string;
}

interface FeeCardProps {
  feeHead: string;
  paymentTerm: string;
  paymentStatus: PaymentStatus[];
}
const FeeCard: React.FC<FeeCardProps> = ({ feeHead, paymentTerm, paymentStatus }) => {
  const unpaidStatuses = paymentStatus.filter((status) => status.status === 'Unpaid');

  return (
    <Card style={{ margin: '10px', padding: '10px' }}>
      <CardContent>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          {feeHead}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Payment Term: {paymentTerm}
        </Typography>

        <Typography variant="subtitle1">Payment Status:</Typography>
        <Chip label={`Unpaid: ${unpaidStatuses.length}`} color="error" />

        <Box mt={1}>
          {paymentStatus.map((status, index) => (
            <Typography key={index} style={{ color: status.status === 'Paid' ? 'green' : 'red' }}>
              {status.title}: <strong>{status.status}</strong>
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const FinanceStudentFeeBreakdownTab = () => {
  const data = [
    {
      id: 1,
      date: '25-04-2025',
      type: 'Tuition Fee',
      discount: '2500',
      amount: '50000',
      additionalDiscount: 0,
      grossFee: 52500,
    },
    {
      id: 2,
      date: '25-04-2025',
      discount: '500',
      type: 'Sports Fee',
      amount: '5000',
      additionalDiscount: 0,
      grossFee: 5500,
    },
    {
      id: 3,
      date: '25-04-2025',
      type: 'Library Fee',
      discount: '0',
      amount: '2500',
      additionalDiscount: 0,
      grossFee: 2500,
    },
  ];

  const totals = {
    grossFee: data.reduce((sum, row) => sum + row.grossFee, 0),
    discount: data.reduce((sum, row) => sum + parseFloat(row.discount), 0),
    additionalDiscount: data.reduce((sum, row) => sum + row.additionalDiscount, 0),
    amount: data.reduce((sum, row) => sum + parseFloat(row.amount), 0),
  };
  return (
    <>
      <CustomizableTable
        tableId="finance-student-fee-breakdown-tab"
        isFilter={false}
        isPagination={false}
        isSearch={false}
        columns={[
          { id: 'date', label: 'Due Date', filterType: 'date' },
          { id: 'type', label: 'Type' },
          {
            id: 'grossFee',
            label: 'Gross Fee',
            filterType: 'number',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                    ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                  }}
                >
                  {formatNumber(value, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'discount',
            label: 'General Discount',
            filterType: 'number',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                    ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                  }}
                >
                  {formatNumber(row.discount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'additionalDiscount',
            label: 'Additional Discount',
            filterType: 'number',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                    ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                  }}
                >
                  {formatNumber(row.additionalDiscount, 'INR')}
                </Typography>
              );
            },
          },

          {
            id: 'amount',
            label: 'Payable Fee',
            filterType: 'number',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                    ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                  }}
                >
                  {formatNumber(row.amount, 'INR')}
                </Typography>
              );
            },
          },
        ]}
        data={[
          ...data,
          {
            id: 'total',
            date: '',
            type: 'Total',
            grossFee: totals.grossFee,
            discount: totals.discount,
            additionalDiscount: totals.additionalDiscount,
            amount: totals.amount,
          },
        ]}
      />
      <Box pb="20px" />
    </>
  );
};

export default FinanceStudentFeeBreakdownTab;
