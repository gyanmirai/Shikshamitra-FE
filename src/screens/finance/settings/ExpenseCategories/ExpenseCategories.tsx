'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { FinanceSettingDeleteDialog } from 'src/screens/finance/settings/components/FinanceSettingDeleteDialog';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import { FinanceSetupManagerHeader } from 'src/screens/finance/setup/embedding/FinanceSetupManagerHeader';
import {
  useGetExpenseCategoryQuery,
  useDeleteExpenseCategoryMutation,
} from 'src/redux/finance/expenseCategory';

import ExpenseCategoryForm from './Components/ExpenseCategoryForm';
import ExpenseCategoryTable from './Components/ExpenseCategoryTable';

import type { IExpenseCategory } from './Components/type';

const FinanceExpenseCategoriesScreen = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useAccountSettingPermissions('ExpenseCategory');

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = useState<IParams['filters']>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Use custom hook to fetch expense categories
  const {
    currentData: expenseCategoryData,
    isLoading: expenseCategoryLoading,
    isFetching: expenseCategoryFetching,
    error: expenseCategoryError,
    refetch,
  } = useGetExpenseCategoryQuery({
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    }, { skip: !currentYear?.id || !access.canView, refetchOnMountOrArgChange: 60 });

  // DELETE mutation
  const [deleteExpenseCategory, { isLoading: isDeleting }] = useDeleteExpenseCategoryMutation();

  // Dialog control states
  const deleteExpenseCategoryDialog = useBoolean();
  const addExpenseCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<IExpenseCategory | null>(
    null
  );

  /**
   * Handles closing of the expense category form dialog
   */
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addExpenseCategoryDialog.value,
    () => {
      addExpenseCategoryDialog.onFalse();
      setSelectedExpenseCategory(null);
    }
  );


  return (
    <Box height="100%" display="flex" flexDirection="column">
      {discardConfirmation}
      <FinanceSetupManagerHeader
        editorOpen={
          addExpenseCategoryDialog.value || deleteExpenseCategoryDialog.value || isDeleting
        }
        description="This screen displays all the created expense categories with an option to create a new expense category."
        heading="Expense Category"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Settings' },
          { name: 'Expense Category' },
        ]}
        action={
          <Button
            disabled={!access.canAdd}
            onClick={() => addExpenseCategoryDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Expense Category
          </Button>
        }
      />

      <ExpenseCategoryTable
        onDelete={(data) => {
          if (!access.canDelete || !data.canDelete) return;
          setSelectedExpenseCategory(data);
          deleteExpenseCategoryDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedExpenseCategory(data);
          addExpenseCategoryDialog.onTrue();
        }}
        open={open}
        onAddExpenseCategory={addExpenseCategoryDialog}
        setOpenDialog={setOpen}
        editData={selectedExpenseCategory}
        setEditData={setSelectedExpenseCategory}
        data={expenseCategoryData?.items || []}
        isLoading={expenseCategoryLoading || (expenseCategoryFetching && !expenseCategoryData)}
        isRefreshing={expenseCategoryFetching && Boolean(expenseCategoryData)}
        error={expenseCategoryError}
        onRetry={() => refetch()}
        totalCount={expenseCategoryData?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
        filters={filters}
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        onServerFilter={(next) => {
          setFilters(next);
          setQueryParams((current) => ({ ...current, page: 1 }));
        }}
      />

      <CustomDialog
        titleInfo="Maintain the category name and description used to organize Finance records."
        open={addExpenseCategoryDialog.value}
        guardUnsavedChanges={false}
        handleClose={() => handleClose()}
        title={selectedExpenseCategory ? 'Edit Expense Category' : 'Add Expense Category'}

        maxWidth="sm"
      >
        {addExpenseCategoryDialog.value && (
          <ExpenseCategoryForm
            open={addExpenseCategoryDialog}
            onClose={handleClose}
            editData={selectedExpenseCategory}
          />
        )}
      </CustomDialog>

      <FinanceSettingDeleteDialog
        open={deleteExpenseCategoryDialog.value}
        title="Delete Expense Category"
        onClose={() => {
          setSelectedExpenseCategory(null);
          deleteExpenseCategoryDialog.onFalse();
        }}
        onDelete={
          access.canDelete && selectedExpenseCategory?.canDelete
            ? () => deleteExpenseCategory(selectedExpenseCategory.id).unwrap()
            : undefined
        }
        successMessage="Expense category deleted successfully."
      >
        Delete expense category <strong>{selectedExpenseCategory?.name}</strong>?
      </FinanceSettingDeleteDialog>
    </Box>
  );
};

export default FinanceExpenseCategoriesScreen;
