import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import type { INotificationTemplate } from '../types';

export const useNotificationTemplateState = () => {
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<INotificationTemplate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<INotificationTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<INotificationTemplate | null>(null);

  const viewDialog = useBoolean();
  const confirmDialog = useBoolean();

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Memoization Justification:
   * This function is passed to the Form component as a prop and used as a callback.
   * Memoizing it prevents unnecessary re-renders of the NotificationTemplateForm
   * when the parent component re-renders.
   */
  const handleCloseDialog = useCallback(
    (_e: any, isSubmit?: boolean) => {
      const resetState = () => {
        setTimeout(() => {
          setEditingTemplate(null);
          setOpen(false);
          dispatch(setIsChanges(false));
        }, 200);
      };

      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        resetState();
      } else if (!isChanges) {
        resetState();
      }
    },
    [dispatch, isChanges]
  );

  return {
    open,
    setOpen,
    editingTemplate,
    setEditingTemplate,
    viewTemplate,
    setViewTemplate,
    deleteTemplate,
    setDeleteTemplate,
    viewDialog,
    confirmDialog,
    handleCloseDialog,
    isChanges,
  };
};
