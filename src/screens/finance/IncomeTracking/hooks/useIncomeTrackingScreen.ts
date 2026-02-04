import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { incomeApi, useGetIncomesQuery } from 'src/redux/incomeApi/incomeApi';
import {
  useGetIncomeTrackingQuery,
  useDeleteIncomeTrackingMutation,
} from 'src/redux/finance/incomeTrackingManagement/incomeTracking';

import type { IIncomeFormValues } from '../types';

export const useIncomeTrackingScreen = () => {
  // State for selected income record
  const [selectedIncome, setSelectedIncome] = useState<IIncomeFormValues | null>(null);

  // Custom hooks for dialogs
  const addIncomeDialog = useBoolean();
  const deleteIncomeDialog = useBoolean();
  const viewIncomeDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  const { data: incomeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomesQuery,
  });

  const { data: incomeDetailedData, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeTrackingQuery,
  });

  // DELETE mutation
  const { deleteIncomeCategory } = useQueryAndMutation({
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

  const handleViewDialogClose = useCallback(() => {
    setSelectedIncome(null);
    viewIncomeDialog.onFalse();
  }, [viewIncomeDialog]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedIncome) {
      deleteIncomeDialog.onFalse();
      const currentData = incomeData && incomeData.length > 0 ? incomeData : [];
      confirmWithUndo({
        item: selectedIncome,
        onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
          const index = currentData.findIndex((item: any) => item.id === selectedIncome.id);
          if (index !== -1) {
            setDeleteIndex(index);
            dispatchFn(
              incomeApi.util.updateQueryData('getIncomes', undefined, (draft: any) => {
                if (draft) {
                  const paramsIndex = draft.findIndex((item: any) => item.id === selectedIncome.id);
                  if (paramsIndex !== -1) {
                    draft.splice(paramsIndex, 1);
                  }
                }
              })
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
  ]);

  return {
    selectedIncome,
    setSelectedIncome,
    addIncomeDialog,
    deleteIncomeDialog,
    viewIncomeDialog,
    incomeData,
    incomeDetailedData,
    handleClose,
    handleViewDialogClose,
    handleDeleteConfirm,
  };
};
