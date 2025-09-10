import React from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Chip, Typography, CardContent } from '@mui/material';
import data from 'src/json/finance/fee-details-student/fee-breakdown.json';

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
  // Calculate total values by reducing over the data array
  // Sums up grossFee, discount, additionalDiscount and amount fields
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
        isPagination={false}
        columns={[
          { id: 'date', label: 'Due Date', filterType: 'date' },
          {
            id: 'type',
            label: 'Type',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                    ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
                  }}
                >
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'grossFee',
            label: 'Gross Fee',
            filterType: 'formattedNumber',
            align: 'right',
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
            filterType: 'formattedNumber',
            align: 'right',
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
            filterType: 'formattedNumber',
            align: 'right',
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
            filterType: 'formattedNumber',
            align: 'right',
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
