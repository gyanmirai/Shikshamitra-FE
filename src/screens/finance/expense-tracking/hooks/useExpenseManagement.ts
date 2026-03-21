import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import {
  expenseTrackingApi,
  useGetExpenseDetailsQuery,
  useDeleteExpenseDetailsMutation,
} from 'src/redux/finance/expense-api/expenseDetailedApi';

import type { IExpenseFormValues } from '../component/type';

export const useExpenseManagement = () => {
  // State
  const [selectedExpense, setSelectedExpense] = useState<IExpenseFormValues | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Dialogs
  const addExpenseDialog = useBoolean();
  const deleteExpenseDialog = useBoolean();
  const viewExpenseDialog = useBoolean();

  // Redux
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();

  const {
    data: expenseDetailedData,
    isLoading: isLoadingDetails,
    isFetching: isFetchingDetails,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseDetailsQuery,
    params: { academicYearId: currentYear?.id },
  });

  // const { data: expenseById } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetExpenseByIdQuery,
  //   options: {
  //     skip: !selectedExpense?.id,
  //   },
  // });

  const [deleteExpenseDetails] = useQueryAndMutation({
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
    if (selectedExpense) {
      deleteExpenseDialog.onFalse();
      const currentData =
        expenseDetailedData?.items && expenseDetailedData?.items.length > 0
          ? expenseDetailedData?.items
          : [];
      confirmWithUndo({
        item: selectedExpense,
        onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
          const index = currentData.findIndex((item: any) => item.id === selectedExpense.id);
          if (index !== -1) {
            setDeleteIndex(index);
            dispatchFn(
              expenseTrackingApi.util.updateQueryData(
                'getExpenseDetails',
                { academicYearId: currentYear.id },
                (draft: any) => {
                  const list = Array.isArray(draft) ? draft : draft?.items || [];
                  const paramsIndex = list.findIndex((item: any) => item.id === selectedExpense.id);
                  if (paramsIndex !== -1) {
                    list.splice(paramsIndex, 1);
                  }
                }
              )
            );
          }
        },
        onUndoRestore: () => {
          refetch();
        },
        onCommit: async () => {
          if (selectedExpense?.id) {
            await deleteExpenseDetails(selectedExpense.id);
          }
        },
      });
      setSelectedExpense(null);
    }
  }, [
    selectedExpense,
    deleteExpenseDialog,
    expenseDetailedData?.items,
    confirmWithUndo,
    currentYear.id,
    refetch,
    deleteExpenseDetails,
  ]);

  return {
    selectedExpense,
    setSelectedExpense,
    addExpenseDialog,
    deleteExpenseDialog,
    viewExpenseDialog,
    expenseDetailedData,
    isLoadingDetails,
    isFetchingDetails,
    handleClose,
    handleViewDialogClose,
    handleEdit,
    handleDeleteClick,
    handleViewClick,
    handleConfirmDelete,
  };
};
