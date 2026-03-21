import React from 'react';
import { Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IHostelFeeHeadForFeeStructureProps } from '../hostelFeeInterface';

const HostelFeeHeadForFeeStructure: React.FC<IHostelFeeHeadForFeeStructureProps> = ({
  data,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    isFilter={false}
    isShowedDense={false}
    isSearch={false}
    tableId="added-fee-head-for-fee-structure-table"
    columns={[
      {
        id: 'bookRecipt',
        label: 'Receipt Book',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'uppercase' }}>
              {row.bookRecipt}
            </Typography>
          );
        },
      },
      {
        id: 'applicableGrade',
        label: 'Class',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
              {row.applicableGrade}
            </Typography>
          );
        },
      },
      {
        id: 'feeHead',
        label: 'Fee Head',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
              {row.feeHead}
            </Typography>
          );
        },
      },
      {
        id: 'grossFee',
        label: 'Gross Fee (₹)',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>{formatNumber('INR', row.grossFee)}</Typography>
          );
        },
      },
      {
        id: 'payableFee',
        label: 'Payable Fee (₹)',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>{formatNumber('INR', row.payableFee)}</Typography>
          );
        },
      },
      {
        id: 'discountAmount',
        label: 'Discount Amount (₹)',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>
              {formatNumber('INR', row.discountAmount)}
            </Typography>
          );
        },
      },
      {
        id: 'discountRemark',
        label: 'Discount Remark',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
              {row.discountRemark}
            </Typography>
          );
        },
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        isFilter: false,
        isSort: false,
        render(value, row) {
          const paymentMethods = Array.isArray(row.paymentMethod)
            ? row.paymentMethod.join(', ')
            : row.paymentMethod;
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
              {paymentMethods}
            </Typography>
          );
        },
      },

      {
        id: 'lateFeeChargesType',
        label: 'Late Fee Type',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
              {row.lateFeeChargesType}
            </Typography>
          );
        },
      },
      {
        id: 'lateFeeChargesAmount',
        label: 'Late Fee Amount (₹)',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>
              {formatNumber('INR', row.lateFeeChargesAmount)}
            </Typography>
          );
        },
      },

      // { id: 'paymentDueDate', label: 'Payment Due Date' },
      {
        id: 'action',
        label: 'Action',
        isFilter: false,
        isSort: false,
        sticky: true,
        align: 'right',
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              showDeleteIcon
              handleDeleteClick={() => {
                onDelete(row);
              }}
              // showEditIcon
              // handleEditClick={() => {
              //   onEdit(row);
              // }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default HostelFeeHeadForFeeStructure;
