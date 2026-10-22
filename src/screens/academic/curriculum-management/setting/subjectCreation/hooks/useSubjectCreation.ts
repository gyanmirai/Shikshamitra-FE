'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useDeleteSubjectMutation,
  useArchiveSubjectMutation,
  useRestoreSubjectMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { ISubject } from '../type';

export const useSubjectCreation = () => {
  const deleteSubjectDialog = useBoolean();
  const [open, setOpen] = useState(false);
  const addSubjectDialog = useBoolean(false);
  const bulkImportDialog = useBoolean(false);
  const usageDrawer = useBoolean(false);
  const archiveDialog = useBoolean(false);

  const [deleteSubject, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSubjectMutation,
  });
  const [archiveSubject, { isLoading: isArchiveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveSubjectMutation,
  });
  const [restoreSubject, { isLoading: isRestoreLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRestoreSubjectMutation,
  });

  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const dispatch = useDispatch();

  const handleClose = () => {
    addSubjectDialog.onFalse();
    setSelectedSubject(null);
    dispatch(setIsChanges(false));
  };

  return {
    deleteSubjectDialog,
    open,
    setOpen,
    addSubjectDialog,
    bulkImportDialog,
    usageDrawer,
    archiveDialog,
    isDeleteLoading,
    isArchiveLoading,
    isRestoreLoading,
    currentMedium,
    selectedSubject,
    setSelectedSubject,
    deleteSubject,
    archiveSubject,
    restoreSubject,
    handleClose,
  };
};
