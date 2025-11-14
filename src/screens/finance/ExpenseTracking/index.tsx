'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetExpensesQuery } from 'src/redux/finance/expenseApi/expenseApi';
import { Box, Card, Button, Typography, CircularProgress } from '@mui/material';
import { useGetExpenseDetailsQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';

import ViewExpenseData from './component/ViewExpenseData';
import ExpenseCategoryForm from './component/ExpenseCategoryForm';
import ExpenseCategoryTable from './component/ExpenseCategoryTable';

import type { IExpenseFormValues } from './component/type';

const FinanceExpenseTracking = () => {
  // State for selected expense record
  const [selectedExpense, setSelectedExpense] = useState<IExpenseFormValues | null>(null);

  // Custom hooks for dialogs
  const addExpenseDialog = useBoolean();
  const deleteExpenseDialog = useBoolean();
  const viewExpenseDialog = useBoolean();
  const { data: expenseData, isLoading: expenseLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpensesQuery,
  });
  const { data: expenseDetailedData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseDetailsQuery,
  });

  // Redux
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handle form/dialog close
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addExpenseDialog.onFalse();
      setSelectedExpense(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addExpenseDialog.onFalse();
      setSelectedExpense(null);
    }
  };

  const handleViewDialogClose = () => {
    setSelectedExpense(null);
    viewExpenseDialog.onFalse();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addExpenseDialog.value ? (
        <CustomBreadcrumbs
          heading={selectedExpense ? 'Update Expense Tracking' : 'Add Expense Tracking'}
          description={
            selectedExpense
              ? 'Update expense record details such as category, date, amount, and payment method to maintain accurate expense tracking.'
              : 'This screen allows users to fill in all required fields and add a new expense entry.'
          }
          isBack
          onBack={() => handleClose(null, false)}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Expense Tracking',
              href: '/finance/expenseTracking',
              onClick: () => {
                addExpenseDialog.onFalse();
                setSelectedExpense(null);
              },
            },
            {
              name: selectedExpense ? 'Update Expense Tracking' : 'Add Expense Tracking',
              href: '/finance/expense-tracking',
            },
          ]}
          sx={{ mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Expense Tracking"
          description="This screen displays all expense categories with the option to view detailed entries under each category and add new expense records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Expense Tracking', href: '/finance/setting' },
          ]}
          action={
            <Button
              onClick={() => addExpenseDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
            >
              Expense
            </Button>
          }
          sx={{ px: 1, mb: 1 }}
        />
      )}

      <>
        {/* Form for add/edit expense */}
        {addExpenseDialog.value ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <ExpenseCategoryForm
              open={addExpenseDialog}
              onClose={handleClose}
              editData={selectedExpense}
            />
          </Card>
        ) : expenseLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="400px"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading expense data...
            </Typography>
          </Box>
        ) : (
          <ExpenseCategoryTable
            data={expenseDetailedData || []}
            addExpenseCategory={addExpenseDialog}
            setEditData={setSelectedExpense}
            isLoading={isLoading}
            onEdit={(data) => {
              addExpenseDialog.onTrue();
              setSelectedExpense(data);
            }}
            onDelete={(data) => {
              deleteExpenseDialog.onTrue();
              setSelectedExpense(data);
            }}
            onView={(data) => {
              viewExpenseDialog.onTrue();
              setSelectedExpense(data);
            }}
          />
        )}
      </>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteExpenseDialog.value}
        onClose={() => {
          setSelectedExpense(null);
          deleteExpenseDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete expense record{' '}
            <strong>{selectedExpense?.expenseName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteExpenseDialog.onFalse();
              setSelectedExpense(null);
              shikshaMitraToast.success({
                message: `Expense record : ${selectedExpense?.expenseName} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
        }
      />

      <CustomDialog
        open={viewExpenseDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" minWidth={400}>
            <Typography variant="h5">View Expenses</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all expense entries under a particular expense category."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={handleViewDialogClose}
        maxWidth="md"
      >
        <ViewExpenseData
          viewExpenseDialog={viewExpenseDialog}
          expenseData={selectedExpense}
          expenseDetailedData={expenseDetailedData}
          onClose={handleViewDialogClose}
        />
      </CustomDialog>
    </Box>
  );
};

export default FinanceExpenseTracking;
