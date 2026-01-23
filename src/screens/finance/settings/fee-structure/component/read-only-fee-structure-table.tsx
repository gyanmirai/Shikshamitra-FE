'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IReadOnlyFeeStructureTableProps } from '../fee-structure-interface';

// import type { FeeItem } from '../data/fee-structure-data';

const ReadOnlyFeeStructureTable: React.FC<IReadOnlyFeeStructureTableProps> = ({ data }) => {
  const column = [
    {
      id: 'feeHead',
      label: 'Fee Head',
      isFilter: false,
      align: 'left',
    },
    {
      id: 'grossFee',
      label: 'Gross Fee',
      align: 'left',
      isFilter: false,
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'generalDiscount',
      label: 'General Discount',
      align: 'left',
      isFilter: false,
      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'payableFee',
      label: 'Payable Fee',
      isFilter: false,
      align: 'left',

      render(value: number) {
        return (
          <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(value), 'INR')}</Typography>
        );
      },
    },
    {
      id: 'monthly',
      label: 'Monthly Payable Fee',
      isFilter: false,
      align: 'left',
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
      isFilter: false,
      align: 'left',
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
      isFilter: false,
      align: 'left',
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
      isFilter: false,
      align: 'left',
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
      isFilter: false,
      align: 'left',
      render(value: any, row: any) {
        return (
          <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
            {`${formatNumber(row.lateFeeChargesAmount, 'INR')}   `}
          </Typography>
        );
      },
    },
    {
      id: 'lateFeeChargesType',
      label: 'Late Fee Charges Type',
      isFilter: false,
      align: 'left',
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
      isFilter: false,
      align: 'left',
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
    // {
    //   id: 'active',
    //   label: 'Active/Not Active',
    //   isSort: false,
    //   isFilter: false,
    //   sticky: true,
    //   render(value: any, row: any) {
    //     return <Switch name="creditcard" checked={row.isActive} onChange={() => { }} />;
    //   },
    // },
  ];

  return (
    <CustomizableTable
      tableId="readOnlyTableForFeeStructure"
      columns={column as IColumn[]}
      data={data}
    />
  );
};

export default ReadOnlyFeeStructureTable;
