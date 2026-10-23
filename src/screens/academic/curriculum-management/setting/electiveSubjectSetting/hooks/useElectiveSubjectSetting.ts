'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';
import {
  useDeleteElectiveGroupMutation,
  useArchiveElectiveGroupMutation,
  useRestoreElectiveGroupMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import type { IElectiveSubject } from '../type';

export const useElectiveSubjectSetting = () => {
  const deleteDialog = useBoolean();
  const [open, setOpen] = useState(false);
  const addElectiveGroupDialog = useBoolean(false);
  const archiveDialog = useBoolean(false);
  const usageDrawer = useBoolean(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const { requestNavigation, confirmation: discardConfirmation } =
    useAcademicDiscardGuard(isChanges);

  const [deleteElectiveGroup, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteElectiveGroupMutation,
  });
  const [archiveElectiveGroup, { isLoading: isArchiveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveElectiveGroupMutation,
  });
  const [restoreElectiveGroup, { isLoading: isRestoreLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRestoreElectiveGroupMutation,
  });
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [selected, setSelected] = useState<IElectiveSubject | null>(null);

  const handleClose = (_e: unknown, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelected(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (!isSubmit && isChanges) {
      requestNavigation(() => handleClose(null, true));
      return;
    }
    if (isSubmit) {
      setOpen(false);
      addElectiveGroupDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      setOpen(false);
      addElectiveGroupDialog.onFalse();
      setTimeout(() => {
        setSelected(null);
      }, 200);
    }
  };

  return {
    deleteDialog,
    discardConfirmation,
    open,
    setOpen,
    addElectiveGroupDialog,
    archiveDialog,
    usageDrawer,
    isDeleteLoading,
    isArchiveLoading,
    isRestoreLoading,
    currentMedium,
    selected,
    setSelected,
    handleClose,
    deleteElectiveGroup,
    archiveElectiveGroup,
    restoreElectiveGroup,
  };
};
