import React from 'react';

import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFinanceAddedFeeHeadForFeeStructureProps } from '../fee-structure-interface';

const FinanceAddedFeeHeadForFeeStructure: React.FC<IFinanceAddedFeeHeadForFeeStructureProps> = ({
  data,
  onDelete,
  onEdit,
}) => {
  const dialogForDeleteConfirmation = useBoolean();
  return (
    <>
      <CustomizableTable
        noDataText="No Fee Head Added"
        isShowedDense={false}
        isSearch={false}
        tableId="added-fee-head-for-fee-structure-table"
        columns={[
          {
            id: 'bookRecipt',
            label: 'Receipt Book',
            isFilter: false,
            align: 'left',
            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'uppercase' }}>
                  {row.bookRecipt}
                </Typography>
              );
            },
          },
          {
            id: 'applicableGrade',
            label: 'Class',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {row.applicableGrade}
                </Typography>
              );
            },
          },
          {
            id: 'feeHead',
            label: 'Fee Head',
            isFilter: false,
            align: 'left',

            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {row.feeHead}
                </Typography>
              );
            },
          },
          {
            id: 'grossFee',
            label: 'Gross Fee (₹)',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px' }}>
                  {formatNumber(row.grossFee, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'payableFee',
            label: 'Payable Fee (₹)',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px' }}>
                  {formatNumber(row.payableFee, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'discountAmount',
            label: 'Discount Amount (₹)',
            isFilter: false,
            isSort: false,
            align: 'left',

            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px' }}>
                  {formatNumber(row.discountAmount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'discountRemark',
            label: 'Discount Remark',
            isFilter: false,
            isSort: false,
            align: 'left',
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {row.discountRemark}
                </Typography>
              );
            },
          },
          {
            id: 'paymentMethod',
            label: 'Payment Method',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              const paymentMethods = Array.isArray(row.paymentMethod)
                ? row.paymentMethod.join(', ')
                : row.paymentMethod;
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {paymentMethods}
                </Typography>
              );
            },
          },
          {
            id: 'lateFeeChargesType',
            label: 'Late Fee Type',
            align: 'left',

            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                  {row.lateFeeChargesType}
                </Typography>
              );
            },
          },
          {
            id: 'lateFeeChargesAmount',
            label: 'Late Fee Amount (₹)',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px' }}>
                  {formatNumber(row.lateFeeChargesAmount, 'INR')}
                </Typography>
              );
            },
          },
          // { id: 'paymentDueDate', label: 'Payment Due Date' },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            align: 'left',
            isSort: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showDeleteIcon
                  handleDeleteClick={() => {
                    dialogForDeleteConfirmation.onTrue();
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
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton
              size="small"
              variant="contained"
              loading={false}
              color="error"
              onClick={() => {}}
            >
              Yes
            </LoadingButton>
          }
        />
      )}
    </>
  );
};

export default FinanceAddedFeeHeadForFeeStructure;
