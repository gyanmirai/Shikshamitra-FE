'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceExpenseDetailsDialog from './component/finance-expense-details-dialog';
import FinanceAddExpenseTrackingDialog from './component/finance-add-expense-tracking-dialog';

interface ExpenseData {
  expenseCategory: string;
  expenseAmount: string;
  paymentMethod: string;
  date: string;
  id: number;
  paymentStatus: string;
  action?: string;
  expenseList?: any;
}

let expenseData: ExpenseData[] = [
  {
    id: 3,
    expenseCategory: 'Internet Bills',
    expenseAmount: '1500',
    paymentMethod: 'Credit Card',
    date: '2024-09-15',
    paymentStatus: 'Paid',
    action: 'View',
    expenseList: [
      {
        expenseName: 'Admin',
        amount: 500,
        date: '11-10-2024',
      },
      {
        expenseName: 'School',
        amount: 1000,
        date: '11-10-2024',
      },
    ],
  },
];

const FinanceExpenseTrackingScreen = () => {
  const dialog = useBoolean();
  const dialogForDetailsInExpense = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();
  const [selectedExpense, setSelectedExpense] = useState(expenseData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(expenseData);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const closeDialogForDetailsInExpense = () => {
    dialogForDetailsInExpense.onFalse();
  };

  useEffect(() => {}, [selectedExpense, isEdit]);

  const handleSave = (dataFromDialog: ExpenseData) => {
    const { expenseCategory, expenseAmount, paymentMethod, date, paymentStatus, id } =
      dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = expenseData.findIndex((val) => id === val.id);

      const newExpenseEntry = {
        expenseCategory,
        expenseAmount,
        paymentMethod,
        date,
        paymentStatus,
        id,
        action: isEdit ? 'edit' : 'add',
      };

      const updatedData = [...expenseData];

      if (isEdit && existingEntryIndex !== -1) {
        updatedData[existingEntryIndex] = newExpenseEntry;
      } else {
        updatedData.push(newExpenseEntry);
      }

      setTableData(updatedData);
    }

    closeDialog();
    console.log('Updated Data:', dataFromDialog);
  };

  const handleDelete = (item: any) => {
    expenseData = expenseData.filter((val) => val.id !== item.id);
    setTableData([...expenseData]);
  };

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Expense Tracking"
          links={[{ name: 'Finance' }, { name: 'Expense Tracking' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box
          sx={{ mr: '15px', mb: '20px' }}
          gap={3}
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
        >
          <Button
            startIcon={<Iconify icon="ic:outline-plus" />}
            onClick={dialog.onTrue}
            variant="contained"
            size="small"
          >
            New Expense
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="expenseTable"
        columns={[
          {
            id: 'expenseCategory',
            label: 'Expense Category',
          },
          {
            id: 'expenseAmount',
            label: 'Expense Amount',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          { id: 'paymentMethod', label: 'Payment Method' },
          { id: 'date', label: 'Date' },
          {
            id: 'paymentStatus',
            label: 'Payment Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Overdue'
                      ? 'error'
                      : value === 'Unpaid'
                        ? 'warning'
                        : value === 'Paid'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    dialogForDetailsInExpense.onTrue();
                    setSelectedExpense(row);
                  }}
                  showDeleteIcon
                  handleDeleteClick={() => {
                    dialogForDeleteConfirmation.onTrue();
                    // handleDelete(row);
                  }}
                  showEditIcon
                  handleEditClick={() => {
                    setIsEdit(true);
                    setSelectedExpense(row);
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}
      <Box>
        {dialog.value && selectedExpense && (
          <FinanceAddExpenseTrackingDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedExpense}
            isEdit={isEdit}
            allData={tableData}
          />
        )}
      </Box>

      {dialogForDetailsInExpense.value && (
        <FinanceExpenseDetailsDialog
          dialogValue={dialogForDetailsInExpense.value}
          onClose={closeDialogForDetailsInExpense}
          data={selectedExpense}
        />
      )}
    </>
  );
};

export default FinanceExpenseTrackingScreen;
