'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
  // {
  //   id: 1,
  //   expenseCategory: 'Office Rent',
  //   expenseAmount: '1000',
  //   paymentMethod: 'Bank Transfer',
  //   date: '2024-09-10',
  //   paymentStatus: 'Paid',
  //   action: 'View',
  //   incomeList: [
  //     {
  //       incomeName: "Tuition Fees",
  //       amount: 25000,
  //       date: "11-10-2024"

  //     },
  //     {
  //       incomeName: "Tuition Fees",
  //       amount: 25000,
  //       date: "12-10-2024"

  //     },

  //   ]
  // },

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
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Expense
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Expense Overview
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          {
            id: 'expenseCategory',
            label: 'Expense Category',
            children(row) {
              return (
                <CustomizableTable
                  isFilter={false}
                  isPagination={false}
                  isSearch={false}
                  columns={[
                    { id: 'expenseName', label: 'Expense Name' },
                    {
                      id: 'amount',
                      label: 'Amount',
                      render(value) {
                        return (
                          <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
                        );
                      },
                    },
                    { id: 'date', label: 'Received Date' },
                  ]}
                  data={row.expenseList}
                />
              );
            },
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
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          console.log("data row", row)
                          dialogForDetailsInExpense.onTrue();
                          setSelectedExpense(row)
                        }}
                      >
                        <Iconify icon="mdi:eye" />
                        View Details
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedExpense(row);
                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(row);
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
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

      {dialogForDetailsInExpense.value && <FinanceExpenseDetailsDialog 
        dialogValue={dialogForDetailsInExpense.value}
        onClose={closeDialogForDetailsInExpense}
        data={selectedExpense} />}
    </>
  );
};

export default FinanceExpenseTrackingScreen;
