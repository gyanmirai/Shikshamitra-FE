'use client';

import React from 'react';
import Loading from 'src/app/loading';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Button, Typography, CircularProgress } from '@mui/material';

import ViewExpenseData from './component/ViewExpenseData';
import ExpenseCategoryForm from './component/ExpenseCategoryForm';
import ExpenseCategoryTable from './component/ExpenseCategoryTable';
import { useExpenseManagement } from './hooks/useExpenseManagement';

const FinanceExpenseTracking = () => {
  const {
    selectedExpense,
    setSelectedExpense,
    addExpenseDialog,
    deleteExpenseDialog,
    viewExpenseDialog,
    expenseLoading,
    expenseDetailedData,
    isLoading,
    expenseById,
    isLoadingDetails,
    handleClose,
    handleViewDialogClose,
    handleEdit,
    handleDeleteClick,
    handleViewClick,
    handleConfirmDelete,
  } = useExpenseManagement();

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
              sx={{ px: '32px' }}
            >
              Expense
            </Button>
          }
          sx={{ px: 2 }}
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
            <Loading />
          </Box>
        ) : (
          <ExpenseCategoryTable
            data={expenseDetailedData || []}
            addExpenseCategory={addExpenseDialog}
            setEditData={setSelectedExpense}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
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
          <Button variant="contained" color="error" size="small" onClick={handleConfirmDelete}>
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
        {isLoadingDetails ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <ViewExpenseData
            viewExpenseDialog={viewExpenseDialog}
            expenseData={expenseById || selectedExpense}
            expenseDetailedData={expenseDetailedData}
            onClose={handleViewDialogClose}
          />
        )}
      </CustomDialog>
    </Box>
  );
};

export default FinanceExpenseTracking;
