'use client';

import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import type { ISubjectFormValues } from '../type';

interface UseWeeklyLecturesDialogsResult {
  selected: ISubjectFormValues | null;
  isEdit: boolean;
  disabled: boolean;
  formDialog: ReturnType<typeof useBoolean>;
  viewDialog: ReturnType<typeof useBoolean>;
  openCreate: () => void;
  openEdit: (row: ISubjectFormValues) => void;
  openView: (row: ISubjectFormValues) => void;
  closeForm: (event: unknown, isSubmit?: boolean) => void;
  closeView: () => void;
}

const RESET_DELAY_MS = 200;

/**
 * Centralizes the dialog state machine + confirm-on-leave behaviour.
 * Returning callbacks via `useCallback` is required: they are passed down
 * into memoized children (table column renderers) where stable identity
 * prevents avoidable re-renders.
 */
export function useWeeklyLecturesDialogs(): UseWeeklyLecturesDialogsResult {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [selected, setSelected] = useState<ISubjectFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const formDialog = useBoolean(false);
  const viewDialog = useBoolean(false);

  const resetState = useCallback(() => {
    setTimeout(() => {
      setIsEdit(false);
      setDisabled(false);
      setSelected(null);
      dispatch(setIsChanges(false));
    }, RESET_DELAY_MS);
  }, [dispatch]);

  const openCreate = useCallback(() => {
    setSelected(null);
    setIsEdit(false);
    setDisabled(false);
    formDialog.onTrue();
  }, [formDialog]);

  const openEdit = useCallback(
    (row: ISubjectFormValues) => {
      setSelected(row);
      setIsEdit(true);
      setDisabled(false);
      formDialog.onTrue();
    },
    [formDialog]
  );

  const openView = useCallback(
    (row: ISubjectFormValues) => {
      setSelected(row);
      setDisabled(true);
      viewDialog.onTrue();
    },
    [viewDialog]
  );

  const closeForm = useCallback(
    (_event: unknown, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        formDialog.onFalse();
        resetState();
        return;
      }
      if (!isChanges) {
        formDialog.onFalse();
        resetState();
      }
    },
    [formDialog, isChanges, resetState]
  );

  const closeView = useCallback(() => {
    viewDialog.onFalse();
    setIsEdit(false);
    setDisabled(false);
    setSelected(null);
  }, [viewDialog]);

  return {
    selected,
    isEdit,
    disabled,
    formDialog,
    viewDialog,
    openCreate,
    openEdit,
    openView,
    closeForm,
    closeView,
  };
}
