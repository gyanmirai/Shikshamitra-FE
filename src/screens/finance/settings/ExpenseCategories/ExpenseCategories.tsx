'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

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
    params: { academicYearId: currentYear?.id, ...queryParams },
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
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<IExpenseCategory | null>(
    null
  );
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

  /**
   * Handles closing of the expense category form dialog
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedExpenseCategory(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addExpenseCategoryDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addExpenseCategoryDialog.onFalse();
      setTimeout(() => {
        setSelectedExpenseCategory(null);
      }, 200);
    }
  };

  if (expenseCategoryLoading && !expenseCategoryFetching) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Expense Category"
        description="This screen displays all the created expense categories with an option to create a new expense category."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Settings' },
          { name: 'Expense Category' },
        ]}
        action={
          <Button
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
      />

      <CustomDialog
        open={addExpenseCategoryDialog.value}
        handleClose={() => {
          addExpenseCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedExpenseCategory(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedExpenseCategory ? 'Update Expense Category' : 'Add Expense Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedExpenseCategory
                  ? 'This modal allows the user to update required details of a expense category.'
                  : 'This modal allows the user to add all required details and create a new expense category.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ExpenseCategoryForm
          open={addExpenseCategoryDialog}
          onClose={handleClose}
          editData={selectedExpenseCategory}
        />
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
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={() => {
              if (!selectedExpenseCategory?.id) return;

              confirmWithUndo({
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
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FinanceExpenseCategoriesScreen;
