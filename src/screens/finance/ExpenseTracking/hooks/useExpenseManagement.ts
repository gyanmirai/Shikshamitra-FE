import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetExpensesQuery as useGetExpensesListQuery } from 'src/redux/finance/expenseApi/expenseApi';
import {
  expenseTrackingApi,
  useGetExpenseByIdQuery,
  useGetExpenseDetailsQuery,
  useDeleteExpenseDetailsMutation,
} from 'src/redux/finance/expenseApi/expenseDetailedApi';

import type { IExpenseFormValues } from '../component/type';

export const useExpenseManagement = () => {
  // State
  const [selectedExpense, setSelectedExpense] = useState<IExpenseFormValues | null>(null);

  // Dialogs
  const addExpenseDialog = useBoolean();
  const deleteExpenseDialog = useBoolean();
  const viewExpenseDialog = useBoolean();

  // Redux
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();

  // API Queries
  const { isLoading: expenseLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpensesListQuery,
  });

  const {
    data: expenseDetailedData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseDetailsQuery,
  });

  const { data: expenseById, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseByIdQuery,
    options: {
      skip: !selectedExpense?.id,
    },
  });

  const { deleteExpenseDetails } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExpenseDetailsMutation,
  });

  // Handlers

  /**
   * Memoization Justification:
   * Passed to child components (CustomBreadcrumbs, ExpenseCategoryForm) as a callback.
   * Prevents unnecessary re-renders when parent re-renders.
   */
  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        addExpenseDialog.onFalse();
        setSelectedExpense(null);
        dispatch(setIsChanges(false));
      } else if (!isChanges) {
        addExpenseDialog.onFalse();
        setSelectedExpense(null);
      }
    },
    [addExpenseDialog, isChanges, dispatch]
  );

  const handleViewDialogClose = useCallback(() => {
    setSelectedExpense(null);
    viewExpenseDialog.onFalse();
  }, [viewExpenseDialog]);

  const handleEdit = useCallback(
    (data: IExpenseFormValues) => {
      addExpenseDialog.onTrue();
      setSelectedExpense(data);
    },
    [addExpenseDialog]
  );

  const handleDeleteClick = useCallback(
    (data: IExpenseFormValues) => {
      deleteExpenseDialog.onTrue();
      setSelectedExpense(data);
    },
    [deleteExpenseDialog]
  );

  const handleViewClick = useCallback(
    (data: IExpenseFormValues) => {
      viewExpenseDialog.onTrue();
      setSelectedExpense(data);
    },
    [viewExpenseDialog]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedExpense?.id) return;

    confirmWithUndo({
      item: selectedExpense,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
        dispatchFn(
          expenseTrackingApi.util.updateQueryData('getExpenseDetails', undefined, (draft: any) => {
            const list = Array.isArray(draft) ? draft : draft?.data || [];
            const index = list.findIndex((item: any) => item.id === (selectedExpense as any)?.id);
            setDeleteIndex(index);
            if (index !== -1) {
              list.splice(index, 1);
            }
          })
        );
      },
      onUndoRestore: () => refetch(),
      onCommit: async () => {
        // @ts-ignore - id is definitely present here
        await deleteExpenseDetails(selectedExpense.id).unwrap();
      },
    });
    deleteExpenseDialog.onFalse();
    setSelectedExpense(null);
  }, [selectedExpense, confirmWithUndo, deleteExpenseDetails, deleteExpenseDialog, refetch]);

  return {
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
  };
};
