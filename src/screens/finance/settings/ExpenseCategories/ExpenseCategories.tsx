'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import {
  expenseCategoryApi,
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
    data: expenseCategoryData,
    isLoading: expenseCategoryLoading,
    isFetching: expenseCategoryFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseCategoryQuery,
    params: {
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    },
  });

  // DELETE mutation
  const [deleteExpenseCategory, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExpenseCategoryMutation,
  });

  // Dialog control states
  const deleteExpenseCategoryDialog = useBoolean();
  const addExpenseCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<IExpenseCategory | null>(
    null
  );
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

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

  if (expenseCategoryLoading && !expenseCategoryFetching) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {discardConfirmation}
      <CustomBreadcrumbs
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
        isLoading={expenseCategoryLoading || expenseCategoryFetching}
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

      <ConfirmDialog
        open={deleteExpenseCategoryDialog.value}
        onClose={() => {
          setSelectedExpenseCategory(null);
          deleteExpenseCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete expense category{' '}
            <strong>{selectedExpenseCategory?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={() => {
              if (!selectedExpenseCategory?.id) return;

              confirmWithUndo({
                message: 'Deletion pending',
                item: selectedExpenseCategory,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    expenseCategoryApi.util.updateQueryData(
                      'getExpenseCategory',
                      { academicYearId: currentYear?.id, ...queryParams },
                      (draft: any) => {
                        const list = Array.isArray(draft) ? draft : draft?.items || [];
                        const index = list.findIndex(
                          (c: any) => c.id === (selectedExpenseCategory as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          list.splice(index, 1);
                          if (typeof draft?.totalCount === 'number')
                            draft.totalCount = Math.max(0, draft.totalCount - 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteExpenseCategory(selectedExpenseCategory.id),
              });
              deleteExpenseCategoryDialog.onFalse();
              setSelectedExpenseCategory(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FinanceExpenseCategoriesScreen;
