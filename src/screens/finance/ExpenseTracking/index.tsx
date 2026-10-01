'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExpenseCategoryForm from './component/ExpenseCategoryForm';
import ExpenseCategoryTable from './component/ExpenseCategoryTable';
import { useExpenseManagement } from './hooks/useExpenseManagement';

interface FinanceExpenseTrackingProps {
  embedded?: boolean;
}

const FinanceExpenseTracking = ({ embedded = false }: FinanceExpenseTrackingProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(permissions, `${financePermissions.accounts.expense}.Add`);
  const canDelete = hasGrantedPermission(permissions, `${financePermissions.accounts.expense}.Delete`);
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
      {!embedded && (
        <CustomBreadcrumbs
          heading="Expense Tracking"
          description="This screen displays all expense categories with the option to view detailed entries under each category and add new expense records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Accounts', href: '/finance/expenseTracking' },
            { name: 'Expense Tracking' },
          ]}
          action={canAdd ?
            <Button
              onClick={() => addExpenseDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Expense
            </Button> : undefined
          }
        />
      )}

      {embedded && canAdd && !addExpenseDialog.value && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            onClick={() => addExpenseDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Expense
          </Button>
        </Box>
      )}

      <ExpenseCategoryTable
        data={expenseDetailedData?.items || []}
        addExpenseCategory={addExpenseDialog}
        canAdd={canAdd}
        setEditData={setSelectedExpense}
        isLoading={isFetchingDetails || isLoadingDetails}
        onEdit={canAdd ? handleEdit : undefined}
        onDelete={canDelete ? handleDeleteClick : undefined}
        // onView={handleViewClick}
      />

      <CustomDialog
        open={addExpenseDialog.value}
        handleClose={() => {
          addExpenseDialog.onFalse();
          setTimeout(() => {
            setSelectedExpense(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedExpense ? 'Update Expense Tracking' : 'Add Expense Tracking'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedExpense
                  ? 'Update expense record details such as category, date, amount, and payment method to maintain accurate expense tracking.'
                  : 'This screen allows users to fill in all required fields and add a new expense entry.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <ExpenseCategoryForm
          open={addExpenseDialog}
          onClose={handleClose}
          editData={selectedExpense}
        />
      </CustomDialog>

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
