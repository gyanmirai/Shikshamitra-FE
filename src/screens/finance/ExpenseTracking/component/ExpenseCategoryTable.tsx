'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';

import type { IExpenseFormValues } from './type';

interface IExpenseCategoryTableProps {
  data: IExpenseFormValues[];
  addExpenseCategory: { onTrue: () => void };
  setEditData: (data: IExpenseFormValues | null) => void;
  onEdit?: (row: IExpenseFormValues) => void;
  onDelete?: (row: IExpenseFormValues) => void;
  // onView?: (row: IExpenseRecord) => void;
  isLoading: boolean;
}

const ExpenseCategoryTable: React.FC<IExpenseCategoryTableProps> = ({
  data,
  addExpenseCategory,
  setEditData,
  onEdit,
  onDelete,
  // onView,
  isLoading,
}) => {
  /**
   * Memoization Justification:
   * Columns are expensive to create on every render if they include complex render functions.
   * Memoizing ensures reference stability for the CustomizableTable component,
   * preventing unnecessary table re-renders.
   */
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'categoryName',
        label: 'Expense Category',
        align: 'left',
        minWidth: 170,
        filterType: 'string',
        sticky: true,
      },
      {
        id: 'name',
        label: 'Expense Title',
        align: 'left',
        minWidth: '160px',
        filterType: 'string',
      },
      {
        id: 'categoryTags',
        label: 'Expense Category Tags',
        minWidth: 200,
        align: 'left',
        render(value) {
          return Array.isArray(value) ? value.join(', ') : '-';
        },
      },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        render: (value) => `₹ ${value?.toLocaleString()}`,
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        align: 'left',
        minWidth: '160px',
        render: (value) => PaymentMethodLabels[value as keyof typeof PaymentMethodLabels] || value,
      },
      {
        id: 'paymentDate',
        label: 'Date',
        align: 'left',
        filterType: 'date',
        render: (value) => (
          <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'notes',
        label: 'Notes',
        align: 'left',
        minWidth: '150px',
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 100,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showDeleteIcon
            // showViewIcon
            // handleViewClick={() => {
            //   onView?.(row as IExpenseRecord);
            // }}
            handleEditClick={() => onEdit?.(row as IExpenseFormValues)}
            handleDeleteClick={() => onDelete?.(row as IExpenseFormValues)}
          />
        ),
      },
    ],
    [onDelete, onEdit] // Added dependencies to ensure closures are updated
  );

  return (
    <CustomizableTable
      tableId="expense-category-table"
      isLoading={isLoading}
      noDataText={
        <>
          No Expense data found
          <Box
            onClick={() => {
              addExpenseCategory.onTrue();
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
            Add Expense
          </Box>
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};
export default ExpenseCategoryTable;
