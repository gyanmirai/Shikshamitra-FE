import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import {
  incomeTrackingApi,
  useGetIncomeTrackingQuery,
  useGetIncomeTrackingByIdQuery,
  useDeleteIncomeTrackingMutation,
} from 'src/redux/finance/income-tracking-management/incomeTracking';

import type { IIncomeRecord } from '../types';

export const useIncomeTrackingScreen = () => {
  // State for selected income record
  const [selectedIncome, setSelectedIncome] = useState<IIncomeRecord | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Custom hooks for dialogs
  const addIncomeDialog = useBoolean();
  const deleteIncomeDialog = useBoolean();
  // const viewIncomeDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  const {
    data: incomeData,
    isLoading: loadingIncomeData,
    isFetching: fetchingIncomeData,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeTrackingQuery,
    params: { academicYearId: currentYear.id },
    options: {
      skip: !currentYear.id,
    },
  });

  const { data: incomeDetailedData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeTrackingByIdQuery,
    params: selectedIncome?.id,
    options: {
      skip: !selectedIncome?.id,
    },
  });

  // DELETE mutation
  const [deleteIncomeCategory] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteIncomeTrackingMutation,
  });

  // Redux
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Memoization Justification:
   * Memoized to prevent re-creation on every render, which would break referential equality
   * for child components relying on this handler.
   */
  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        addIncomeDialog.onFalse();
        setSelectedIncome(null);
        dispatch(setIsChanges(false));
      } else if (!isChanges) {
        addIncomeDialog.onFalse();
        setSelectedIncome(null);
      }
    },
    [isChanges, addIncomeDialog, dispatch]
  );

  // const handleViewDialogClose = useCallback(() => {
  //   setSelectedIncome(null);
  //   viewIncomeDialog.onFalse();
  // }, [viewIncomeDialog]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedIncome) {
      deleteIncomeDialog.onFalse();
      const currentData =
        incomeData?.items && incomeData?.items.length > 0 ? incomeData?.items : [];
      confirmWithUndo({
        item: selectedIncome,
        onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
          const index = currentData.findIndex((item: any) => item.id === selectedIncome.id);
          if (index !== -1) {
            setDeleteIndex(index);
            dispatchFn(
              incomeTrackingApi.util.updateQueryData(
                'getIncomeTracking',
                { academicYearId: currentYear.id },
                (draft: any) => {
                  const list = Array.isArray(draft) ? draft : draft?.items || [];
                  const paramsIndex = list.findIndex((item: any) => item.id === selectedIncome.id);
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
          if (selectedIncome?.id) {
            await deleteIncomeCategory(selectedIncome.id);
          }
        },
      });
      setSelectedIncome(null);
    }
  }, [
    selectedIncome,
    deleteIncomeDialog,
    incomeData,
    confirmWithUndo,
    refetch,
    deleteIncomeCategory,
    currentYear.id,
  ]);

  return {
    selectedIncome,
    setSelectedIncome,
    addIncomeDialog,
    deleteIncomeDialog,
    // viewIncomeDialog,
    incomeData,
    fetchingIncomeData,
    loadingIncomeData,
    incomeDetailedData,
    handleClose,
    // handleViewDialogClose,
    handleDeleteConfirm,
  };
};
