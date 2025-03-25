import React from 'react';

import { Switch, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

interface ReadOnlyFeeStructureTableProps {
  data: any[];
}

const ReadOnlyFeeStructureTable: React.FC<ReadOnlyFeeStructureTableProps> = ({ data }) => {
  const columns = [
    { id: 'feeHead', label: 'Fee Head' },
    {
      id: 'grossFee',
      label: 'Gross Fee',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'generalDiscount',
      label: 'General Discount',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'payableFee',
      label: 'Payable Fee',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'monthly',
      label: 'Monthly Payable Fee',
      render(value: number, row: any) {
        return (
          <Typography sx={{ fontSize: '12px' }}>
            {formatNumber(Number(row.payableFee / 12), 'INR')}
          </Typography>
        );
      },
    },
    {
      id: 'quartly',
      label: 'Quarterly Payable Fee',
      render(value: number, row: any) {
        return (
          <Typography sx={{ fontSize: '12px' }}>
            {formatNumber(Number(row.payableFee / 4), 'INR')}
          </Typography>
        );
      },
    },
    {
      id: 'bi-annual',
      label: 'Bi-Annually Payable Fee',
      render(value: number, row: any) {
        return (
          <Typography sx={{ fontSize: '12px' }}>
            {formatNumber(Number(row.payableFee / 2), 'INR')}
          </Typography>
        );
      },
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      render(value: any, row: any) {
        return (
          <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
            {row.paymentMethod.join(' , ')}
          </Typography>
        );
      },
    },
    {
      id: 'lateFeeCharges',
      label: 'Late Fee Charges',
      render(value: any, row: any) {
        return (
          <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
            {`${row.lateFeeChargesAmount} ₹ / ${row.lateFeeChargesType} `}
          </Typography>
        );
      },
    },
    {
      id: 'active',
      label: 'Active/In Active',
      render(value: any, row: any) {
        return <Switch name="creditcard" checked={row.isActive} onChange={() => {}} />;
      },
    },
  ];

  return (
    <CustomizableTable
      tableId="readOnlyTableForFeeStructure"
      isSearch={false}
      isFilter={false}
      isPagination={false}
      isShowedDense={false}
      columns={columns}
      data={data}
    />
  );
};

export default ReadOnlyFeeStructureTable;
