'use client';

import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useDeleteSubjectMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { ISubject } from '../type';

export const useSubjectCreation = () => {
  const deleteSubjectDialog = useBoolean();
  const [open, setOpen] = useState(false);
  const addSubjectDialog = useBoolean(false);
  const drawerOpen = useBoolean(false);

  const [deleteSubject, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSubjectMutation,
  });

  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const dispatch = useDispatch();

  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      const resetState = () => {
        setTimeout(() => {
          setSelectedSubject(null);
          dispatch(setIsChanges(false));
        }, 200);
      };

      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        addSubjectDialog.onFalse();
        resetState();
      } else if (!isChanges) {
        addSubjectDialog.onFalse();
        setTimeout(() => {
          setSelectedSubject(null);
        }, 200);
      }
    },
    [isChanges, dispatch, addSubjectDialog]
  );

  return {
    deleteSubjectDialog,
    open,
    setOpen,
    addSubjectDialog,
    drawerOpen,
    isDeleteLoading,
    currentMedium,
    selectedSubject,
    setSelectedSubject,
    deleteSubject,
    handleClose,
  };
};
