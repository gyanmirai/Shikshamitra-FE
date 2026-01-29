'use client';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import expenseData from 'src/json/finance/expense/expenseTrackingData.json';
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
  const [selectedExpense, setSelectedExpense] = useState<any>();
  // Flag to determine if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State to store all expense data for the table
  const [tableData] = useState(expenseData);
  // Control visibility of the add/edit expense dialog
  const [open, setOpen] = useState(false);

  // Reset edit mode and close the dialog

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
          <CustomBreadcrumbs
            heading="Expense Tracking"
            links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Expense Tracking' }]}
            description="The Expense Tracking screen provides a detailed overview of all recorded expenses. You can track expense categories, view transaction details, and monitor financial records efficiently."
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => {
                  setOpen(true);
                }}
              >
                Expense
              </Button>
            }
          />

          <CustomizableTable
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
                  return <Typography fontSize="13px">{formatNumber(value, 'INR')}</Typography>;
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
                label: 'Actions',
                isFilter: false,
                isSort: false,
                minWidth: '50px',
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
                        setSelectedExpense(row);
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
            data={tableData.detailedExpenseData}
          />
        </>
      )}

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedExpense(null);
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete expense{' '}
              <strong>{selectedExpense?.expenseCategory}</strong> ?
            </>
          }
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
