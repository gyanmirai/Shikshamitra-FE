import React from 'react';

import { Box, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

const data = [
  {
    id: 1,
    date: '25-04-2025',
    type: 'Tuition Fee',
    amount: '5000',
    grossFee: 52500,
  },
  {
    id: 2,
    date: '25-04-2025',
    discount: '500',
    type: 'Sports Fee',
    amount: '5000',
    grossFee: 5500,
  },
  {
    id: 3,
    date: '25-04-2025',
    type: 'Library Fee',
    discount: '0',
    amount: '2500',
    grossFee: 2500,
  },
];
const HostelFeeBreakdownTab = () => {
  // Calculate the total gross fee and amount
  const totals = {
    grossFee: data.reduce((sum, row) => sum + row.grossFee, 0),
    amount: data.reduce((sum, row) => sum + parseFloat(row.amount), 0),
  };
  return (
    <>
      <CustomizableTable
        tableId="hostel-fee-breakdown"
        noDataText="Hostel Fee Data Not Found"
        searchFieldProps={{
          placeholder: 'Search Date, Fee Type...',
          label: 'Search Date, Fee Type...',
        }}
        isFilter={false}
        isPagination={false}
        isSearch={false}
        columns={[
          { id: 'date', label: 'Due Date', filterType: 'date' },
          { id: 'type', label: 'Fee Type' },
          {
            id: 'grossFee',
            label: 'Gross Fee',
            filterType: 'formattedNumber',
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
            id: 'amount',
            label: 'Payable Fee',
            filterType: 'formattedNumber',
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
            amount: totals.amount,
          },
        ]}
      />
      <Box pb="20px" />
    </>
  );
};

export default HostelFeeBreakdownTab;
