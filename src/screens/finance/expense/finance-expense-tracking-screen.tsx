'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState, useEffect } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import expenseData from 'src/json/finance/expense/expenseTrackingData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceExpenseDetailsDialog from './component/finance-expense-details-dialog';
import FinanceAddExpenseTrackingDialog from './component/finance-add-expense-tracking-dialog';

const FinanceExpenseTrackingScreen = () => {
  const dialog = useBoolean();
  const dialogForDetailsInExpense = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();
  const [selectedExpense, setSelectedExpense] = useState(expenseData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(expenseData);
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const closeDialogForDetailsInExpense = () => {
    dialogForDetailsInExpense.onFalse();
  };

  useEffect(() => {}, [selectedExpense, isEdit]);

  return (
    <>
      {/* dialog for adding new expense */}
      {open ? (
        <FinanceAddExpenseTrackingDialog
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={() => {
            setOpen(false);
          }}
          data={selectedExpense}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Expense Tracking"
              links={[
                { name: 'Finance', href: '/finance/dashboard' },
                { name: 'Expense Tracking' },
              ]}
              sx={{ px: 1, mb: 2 }}
              description="The Expense Tracking screen provides a detailed overview of all recorded expenses. You can track expense categories, view transaction details, and monitor financial records efficiently."
            />

            {/* button for adding a new expense */}
            <Box
              sx={{ mr: '15px', mb: '20px' }}
              gap={3}
              display="flex"
              flexDirection="row"
              justifyContent="flex-end"
            >
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={() => {
                  setOpen(true);
                }}
                variant="contained"
                size="small"
              >
                New Expense
              </Button>
            </Box>
          </Box>
          <CustomizableTable
            searchFieldProps={{
              placeholder: 'Search by Expense Category...',
              label: 'Search by Expense Category...',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            noDataText={
              <>
                No Expense Found{' '}
                <Box
                  onClick={() => {
                    setOpen(true);
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
            tableId="expenseTable"
            columns={[
              {
                id: 'expenseCategory',
                label: 'Expense Category',
              },
              {
                id: 'expenseAmount',
                label: 'Expense Amount',
                filterType: 'number',
                render(value) {
                  return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                },
              },
              { id: 'paymentMethod', label: 'Payment Method' },
              { id: 'date', label: 'Date', filterType: 'date' },

              {
                id: 'paymentStatus',
                label: 'Status',
                filterType: 'enum',
                enumOptions: FinancePaymentHistoryStatusOptions,
                minWidth: '180px',
                align: 'left',
                isSort: false,
                render(value, row) {
                  const color = FinancePaymentHistoryStatusTypeColors[
                    value as FinancePaymentHistoryStatusType
                  ] as LabelColor;

                  return (
                    <Label color={color}>
                      {FinancePaymentHistoryStatusType[value as FinancePaymentHistoryStatusType]}
                    </Label>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                align: 'right',
                sticky: true,
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
                        setOpen(true);
                      }}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        </>
      )}

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

      {/* view the details of particular expense based on category  */}
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
