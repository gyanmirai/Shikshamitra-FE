'use client';

import React from 'react';
import { Box } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IPaymentTerm, IPaymentTermTableProps } from '../type';

const PaymentTermTable: React.FC<IPaymentTermTableProps> = ({
  data,
  addPaymentTerm,
  setEditData,
  onEdit,
  editData,
  onDelete,
}) => (
  <CustomizableTable
    tableId="payment-term-table"
    noDataText={
      <>
        No Payment Term data found
        <Box
          onClick={() => {
            addPaymentTerm.onTrue();
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Add Payment Term
        </Box>
      </>
    }
    columns={[
      {
        id: 'paymentTermName',
        label: 'Name',
        align: 'left',
      },
      {
        id: 'totalInstallments',
        label: 'Installments',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 80,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            handleEditClick={() => onEdit?.(row as IPaymentTerm)}
            showDeleteIcon
            handleDeleteClick={() => onDelete?.(row as IPaymentTerm)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default PaymentTermTable;
