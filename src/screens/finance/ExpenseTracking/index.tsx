'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExpenseCategoryForm from './component/ExpenseCategoryForm';
import ExpenseCategoryTable from './component/ExpenseCategoryTable';
import { useExpenseManagement } from './hooks/useExpenseManagement';

const FinanceExpenseTracking = () => {
  const {
    selectedExpense,
    setSelectedExpense,
    addExpenseDialog,
    deleteExpenseDialog,
    expenseDetailedData,
    isLoadingDetails,
    isFetchingDetails,
    handleClose,
    handleEdit,
    handleDeleteClick,
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
            { name: 'Accounts', href: '/finance/expenseTracking' },
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
            },
          ]}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Expense Tracking"
          description="This screen displays all expense categories with the option to view detailed entries under each category and add new expense records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Accounts', href: '/finance/expenseTracking' },
            { name: 'Expense Tracking' },
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
        ) : (
          <ExpenseCategoryTable
            data={expenseDetailedData?.items || []}
            addExpenseCategory={addExpenseDialog}
            setEditData={setSelectedExpense}
            isLoading={isFetchingDetails || isLoadingDetails}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            // onView={handleViewClick}
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
            Are you sure you want to delete expense record <strong>{selectedExpense?.name}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" size="small" onClick={handleConfirmDelete}>
            Yes
          </Button>
        }
      />

      {/* <CustomDialog
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
            expenseData={selectedExpense}
            expenseDetailedData={expenseDetailedData}
            onClose={handleViewDialogClose}
          />
        )}
      </CustomDialog> */}
    </Box>
  );
};

export default FinanceExpenseTracking;
