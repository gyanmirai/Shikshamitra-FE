'use client';

import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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

  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      const resetState = () => {
        setTimeout(() => {
          setSelected(null);
          dispatch(setIsChanges(false));
        }, 200);
      };

      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
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
    },
    [isChanges, dispatch, addElectiveGroupDialog]
  );

  return {
    deleteDialog,
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
