import React from 'react';

import { Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceAddedFeeHeadForFeeStructureProps {
  data: any;
  onDelete: (data: any) => void;
  onEdit: (data: any) => void;
}

const FinanceAddedFeeHeadForFeeStructure: React.FC<FinanceAddedFeeHeadForFeeStructureProps> = ({
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
        label: 'Applicable Class',
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
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>{formatNumber('INR', row.grossFee)}</Typography>
          );
        },
      },
      {
        id: 'payableFee',
        label: 'Payable Fee (₹)',
        render(value, row) {
          return (
            <Typography sx={{ fontSize: '12px' }}>{formatNumber('INR', row.payableFee)}</Typography>
          );
        },
      },
      {
        id: 'discountAmount',
        label: 'Discount Amount (₹)',
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

export default FinanceAddedFeeHeadForFeeStructure;
