'use client';

import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetSubjectKpiQuery,
  useGetSubjectAssignmentsQuery,
  useArchiveSubjectAssignmentMutation,
  useRestoreSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { useClassSelection } from './useClassSelection';
import { useSubjectMutations } from './useSubjectMutations';
import { SubjectAssignmentStatus } from '../enum/subjectType';

import type { ISubjectFormValues } from '../component/type';

export function useSubjectAssignment() {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { allClass, classes, classId, handleClassChange } = useClassSelection({ medium });

  const [query, setQuery] = useState<{ page: number; pageSize: number }>({
    page: 0,
    pageSize: 10,
  });

  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classId, ...query, status: 'all' },
    options: { skip: !classId },
  });

  const { data: kpiData, isLoading: isKpiLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectKpiQuery,
    params: { classId },
    options: { skip: !classId },
  });

  const [archiveSubject, { isLoading: isArchiveLoading }] = useArchiveSubjectAssignmentMutation();
  const [restoreSubject, { isLoading: isRestoreLoading }] = useRestoreSubjectAssignmentMutation();

  const addSubjectDialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const archiveConfirmDialog = useBoolean();
  const restoreConfirmDialog = useBoolean();

  const [selectedSubject, setSelectedSubject] = useState<ISubjectFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleCloseDialog = useCallback(() => {
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    archiveConfirmDialog.onFalse();
    restoreConfirmDialog.onFalse();
    setIsEdit(false);
    setTimeout(() => setSelectedSubject(null), 100);
  }, [deleteConfirmDialog, confirmPublishDialog, archiveConfirmDialog, restoreConfirmDialog]);

  const { isDeleteLoading, isPublishLoading, handleConfirmDelete, handleConfirmPublish } =
    useSubjectMutations({
      classId,
      query,
      refetch,
      selectedSubject,
      onDeleteComplete: () => {
        deleteConfirmDialog.onFalse();
        setSelectedSubject(null);
      },
      onPublishComplete: () => {
        confirmPublishDialog.onFalse();
        setTimeout(() => setSelectedSubject(null), 100);
      },
    });

  /**
   * Memoization Justification:
   * Passed as prop to SubjectBreadcrumbs and SubjectAssignmentForm.
   * Prevents unnecessary re-renders when parent state changes unrelated to this handler.
   */
  const handleClose = useCallback(
    (_e: unknown, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
        addSubjectDialog.onFalse();
        setIsEdit(false);
        setSelectedSubject(null);
        dispatch(setIsChanges(false));
      } else if (!isChanges) {
        addSubjectDialog.onFalse();
        setIsEdit(false);
        setSelectedSubject(null);
      }
    },
    [isChanges, addSubjectDialog, dispatch]
  );

  /**
   * Memoization Justification:
   * Passed to SubjectTable as `onView` prop.
   * Prevents table re-renders on unrelated parent state changes.
   */
  const handleViewSubject = useCallback(
    (subject: ISubjectFormValues) => {
      setSelectedSubject(subject);
      showSubjectDialog.onTrue();
    },
    [showSubjectDialog]
  );

  /**
   * Memoization Justification:
   * Passed to SubjectTable as `onEdit` prop.
   */
  const handleEditSubject = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      setIsEdit(true);
      addSubjectDialog.onTrue();
    },
    [addSubjectDialog]
  );

  /**
   * Memoization Justification:
   * Passed to SubjectTable as `onDelete` prop.
   */
  const handleRequestDelete = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      deleteConfirmDialog.onTrue();
    },
    [deleteConfirmDialog]
  );

  /**
   * Memoization Justification:
   * Passed to SubjectTable as `onToggleStatus` prop.
   */
  const handleRequestToggleStatus = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      if (row.status === SubjectAssignmentStatus.Archived) {
        restoreConfirmDialog.onTrue();
        return;
      }
      confirmPublishDialog.onTrue();
    },
    [confirmPublishDialog, restoreConfirmDialog]
  );

  const handleRequestArchive = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      archiveConfirmDialog.onTrue();
    },
    [archiveConfirmDialog]
  );

  const handleRequestRestore = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      restoreConfirmDialog.onTrue();
    },
    [restoreConfirmDialog]
  );

  const handleConfirmArchive = useCallback(async () => {
    if (!selectedSubject?.id) return;
    try {
      await archiveSubject({ assignmentId: selectedSubject.id }).unwrap();
      archiveConfirmDialog.onFalse();
      setSelectedSubject(null);
      refetch();
    } catch {
      // error handled by RTK Query
    }
  }, [selectedSubject, archiveSubject, archiveConfirmDialog, refetch]);

  const handleConfirmRestore = useCallback(async () => {
    if (!selectedSubject?.id) return;
    try {
      await restoreSubject({ assignmentId: selectedSubject.id }).unwrap();
      restoreConfirmDialog.onFalse();
      setSelectedSubject(null);
      refetch();
    } catch {
      // error handled by RTK Query
    }
  }, [selectedSubject, restoreSubject, restoreConfirmDialog, refetch]);

  const handleAddNew = useCallback(() => {
    addSubjectDialog.onTrue();
    setIsEdit(false);
    setSelectedSubject(null);
  }, [addSubjectDialog]);

  const handleBackFromView = useCallback(() => {
    showSubjectDialog.onFalse();
    setSelectedSubject(null);
  }, [showSubjectDialog]);

  return {
    allClass,
    classes,
    classId,
    selectedSubject,
    isEdit,
    isDeleteLoading,
    isPublishLoading,
    isArchiveLoading,
    isRestoreLoading,
    isTableLoading,
    isFetching,
    subjectTableData,
    kpiData,
    isKpiLoading,
    addSubjectDialog,
    deleteConfirmDialog,
    confirmPublishDialog,
    archiveConfirmDialog,
    restoreConfirmDialog,
    showSubjectDialog,
    handleClose,
    handleViewSubject,
    handleEditSubject,
    handleRequestDelete,
    handleRequestToggleStatus,
    handleRequestArchive,
    handleRequestRestore,
    handleConfirmArchive,
    handleConfirmRestore,
    handleCloseDialog,
    handleConfirmDelete,
    handleConfirmPublish,
    handleClassChange,
    handleAddNew,
    handleBackFromView,
    query,
    setQuery,
  };
}
