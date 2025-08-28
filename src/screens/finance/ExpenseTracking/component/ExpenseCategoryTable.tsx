'use client';

import React from 'react';

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
}

const ExpenseCategoryTable: React.FC<IExpenseCategoryTableProps> = ({
  data,
  addExpenseCategory,
  setEditData,
  onEdit,
  onDelete,
  onView,
}) => (
  <CustomizableTable
    tableId="expense-category-table"
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
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="body2" fontWeight={500}>
            {row.expenseCategory}
          </Typography>
        ),
      },
      {
        id: 'amount',
        label: 'Expenses Amount',
        align: 'left',
        filterType: 'number',
        render: (value, row) => (
          <Typography variant="body2">₹ {row.amount?.toLocaleString()}</Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: '70px',
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
