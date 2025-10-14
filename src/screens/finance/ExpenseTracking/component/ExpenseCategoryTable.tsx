'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IExpenseFormValues } from './type';

interface IExpenseCategoryTableProps {
  data: IExpenseFormValues[];
  addExpenseCategory: { onTrue: () => void };
  setEditData: (data: IExpenseFormValues | null) => void;
  onEdit?: (row: IExpenseFormValues) => void;
  onDelete?: (row: IExpenseFormValues) => void;
  onView?: (row: IExpenseFormValues) => void;
  isLoading: boolean;
}

const ExpenseCategoryTable: React.FC<IExpenseCategoryTableProps> = ({
  data,
  addExpenseCategory,
  setEditData,
  onEdit,
  onDelete,
  onView,
  isLoading,
}) => (
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
    columns={[
      {
        id: 'expenseCategory',
        label: 'Expense Category',
        align: 'left',
        minWidth: '160px',
        filterType: 'string',
        sticky: true,
      },
      {
        id: 'expenseName',
        label: 'Expense Title',
        align: 'left',
        minWidth: '160px',
        filterType: 'string',
      },
      {
        id: 'budget',
        label: 'Budget',
        align: 'left',
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
      },
      {
        id: 'date',
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
        minWidth: 50,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showDeleteIcon
            showViewIcon
            handleViewClick={() => {
              onView?.(row as IExpenseFormValues);
            }}
            handleEditClick={() => onEdit?.(row as IExpenseFormValues)}
            handleDeleteClick={() => onDelete?.(row as IExpenseFormValues)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);
export default ExpenseCategoryTable;
