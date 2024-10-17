'use client'

import React, { useState, useEffect } from 'react'

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceAddExpenseTrackingDialog from './component/finance-add-expense-tracking-dialog';


interface ExpenseData {
    expenseCategory: string,
    expenseAmount: string,
    paymentMethod: string,
    date: string,
    id: number,
    paymentStatus: string,
    action?: string,
};

let expenseData: ExpenseData[] = [
    {
        id: 1,
        expenseCategory: 'Office Rent',
        expenseAmount: '1000',
        paymentMethod: 'Bank Transfer',
        date: "2024-09-10",
        paymentStatus: "Paid",
        action: 'View',
    },
    {
        id: 2,
        expenseCategory: 'Stationery',
        expenseAmount: '300',
        paymentMethod: 'Cash',
        date: "2024-09-12",
        paymentStatus: "Pending",
        action: 'View',
    },
    {
        id: 3,
        expenseCategory: 'Internet Bills',
        expenseAmount: '150',
        paymentMethod: 'Credit Card',
        date: "2024-09-15",
        paymentStatus: "Paid",
        action: 'View',
    },
];

const FinanceExpenseTrackingScreen = () => {

    const dialog = useBoolean();
    const [selectedExpense, setSelectedExpense] = useState(expenseData);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(expenseData);

    const closeDialog = () => {
        setIsEdit(false);
        dialog.onFalse();
    }

    useEffect(() => { }, [selectedExpense, isEdit]);

    const handleSave = (dataFromDialog: ExpenseData) => {
        const { expenseCategory, expenseAmount, paymentMethod, date, paymentStatus, id } = dataFromDialog;

        if (dataFromDialog) {
            const existingEntryIndex = expenseData.findIndex(val => id === val.id);

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
        expenseData = expenseData.filter(val =>
            (val.id) !== (item.id)
        );
        setTableData([...expenseData]);
    }

    return (<>
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
                { id: 'expenseCategory', label: 'Expense Category' },
                { id: 'expenseAmount', label: 'Expense Amount' },
                { id: 'paymentMethod', label: 'Payment Method' },
                { id: 'date', label: 'Date' },
                { id: 'paymentStatus', label: 'Payment Status' },
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
                                                handleDelete(row)
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
    </>);
};

export default FinanceExpenseTrackingScreen;
