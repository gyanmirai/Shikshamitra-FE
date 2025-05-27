'use client';

import React, { useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import expenseData from 'src/json/finance/expense/expenseTrackingData.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import FinanceExpenseDetailsDialog from './component/finance-expense-details-dialog';
import FinanceAddExpenseTrackingDialog from './component/finance-add-expense-tracking-dialog';

const FinanceExpenseTrackingScreen = () => {
  // Dialog control for add/edit expense form
  const dialog = useBoolean();
  // Dialog control for viewing expense details
  const dialogForDetailsInExpense = useBoolean();
  // Dialog control for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  // State to store the currently selected expense data
  const [selectedExpense, setSelectedExpense] = useState(expenseData);
  // Flag to determine if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State to store all expense data for the table
  const [tableData, setTableData] = useState(expenseData);
  // Control visibility of the add/edit expense dialog
  const [open, setOpen] = useState(false);

  // Reset edit mode and close the dialog
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  // Close the expense details dialog
  const closeDialogForDetailsInExpense = () => {
    dialogForDetailsInExpense.onFalse();
  };

  // Effect to handle changes in selected expense or edit mode
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
                filterType: 'formattedNumber',
                align: 'right',
                render(value) {
                  return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                },
              },

              // {
              //   id: 'paymentStatus',
              //   label: 'Status',
              //   filterType: 'enum',
              //   enumOptions: FinancePaymentHistoryStatusOptions,
              //   minWidth: '180px',
              //   align: 'left',
              //   isSort: false,
              //   render(value, row) {
              //     const color = FinancePaymentHistoryStatusTypeColors[
              //       value as FinancePaymentHistoryStatusType
              //     ] as LabelColor;

              //     return (
              //       <Label color={color}>
              //         {FinancePaymentHistoryStatusType[value as FinancePaymentHistoryStatusType]}
              //       </Label>
              //     );
              //   },
              // },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                minWidth: '140px',
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
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
        // <DeleteConfirmationDialog
        //   open={dialogForDeleteConfirmation.value}
        //   onClose={() => {
        //     dialogForDeleteConfirmation.onFalse();
        //   }}
        //   onConfirm={() => {}}
        //   title="Delete Item"
        //   description="Are you sure you want to delete this item? This action cannot be undone."
        // />
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
