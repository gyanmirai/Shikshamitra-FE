'use client';

import type { IColumn } from 'src/components/customizabaleTable/type';

import React from 'react';

import { Switch, Tooltip, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IReadOnlyFeeStructureTableProps } from '../fee-structure-interface';

// import type { FeeItem } from '../data/fee-structure-data';

const ReadOnlyFeeStructureTable: React.FC<IReadOnlyFeeStructureTableProps> = ({ data }) => {
  const column = [
    { id: 'feeHead', label: 'Fee Head' },
    {
      id: 'grossFee',
      label: 'Gross Fee',
      filterType: 'formattedNumber',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'generalDiscount',
      label: 'General Discount',
      filterType: 'formattedNumber',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'payableFee',
      label: 'Payable Fee',
      filterType: 'formattedNumber',
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'monthly',
      label: 'Monthly Payable Fee',
      filterType: 'formattedNumber',
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
      filterType: 'formattedNumber',
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
      filterType: 'formattedNumber',
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
        if (row.paymentMethod.length > 2) {
          return (
            <Tooltip title={row.paymentMethod.join(' , ')} arrow placement="top">
              <Typography
                sx={{
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}
              >
                {row.paymentMethod.slice(0, 2).join(' , ')}
              </Typography>
            </Tooltip>
          );
        }
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
      filterType: 'formattedNumber',
      render(value: any, row: any) {
        return (
          <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
            {`${formatNumber(row.lateFeeChargesAmount)}   `}
          </Typography>
        );
      },
    },
    {
      id: 'lateFeeChargesType',
      label: 'Late Fee Charges Type',
      filterType: 'string',
      render(value: any, row: any) {
        return (
          <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
            {` ${row.lateFeeChargesType} `}
          </Typography>
        );
      },
    },
    {
      id: 'discountReason',
      label: 'Discount Reason',
      filterType: 'string',
      render(value: any, row: any) {
        const fullText = row.discountReason || '';
        const wordLimit = 15;
        const words = fullText.trim().split(' ');
        const shortText =
          words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : fullText;

        return (
          <Tooltip title={fullText} arrow placement="top">
            <Typography
              sx={{
                fontSize: '12px',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              }}
            >
              {shortText}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      id: 'active',
      label: 'Active/In Active',
      isSort: false,
      isFilter: false,
      sticky: true,
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
      columns={column as IColumn[]}
      data={data}
    />
  );
};

export default ReadOnlyFeeStructureTable;
