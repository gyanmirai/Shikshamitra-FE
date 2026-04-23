'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
  subjectAssignmentsApi,
  useGetSubjectAssignmentsQuery,
  useDeleteSubjectAssignmentMutation,
  usePublishSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type { ISubjectFormValues } from '../component/type';

export function useSubjectAssignment() {
  const dispatch = useDispatch();
  const { confirmWithUndo } = useConfirmWithUndo();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // --- Mutations ---
  const [deleteSubjectAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSubjectAssignmentMutation,
  });

  const [publishSubjectAssignment, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishSubjectAssignmentMutation,
  });

  // --- Class selection state ---
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [classId, setClassId] = useState<string>('');

  const [query, setQuery] = useState<{ page: number; pageSize: number }>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClassId(allClasses[0]?.id || '');
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  // --- Query ---
  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classId, ...query },
    options: { skip: !classId },
  });

  // --- Dialog booleans ---
  const addSubjectDialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();

  // --- Selected subject & edit mode ---
  const [selectedSubject, setSelectedSubject] = useState<ISubjectFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // --- Handlers ---

  /**
   * Memoization Justification:
   * Passed as prop to SubjectBreadcrumbs and SubjectActionBar (memoized children).
   * Prevents unnecessary re-renders when parent state changes unrelated to this handler.
   */
  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
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
   * Passed to SubjectTable memoized child as `onView` prop.
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
   * Passed to SubjectTable memoized child as `onEdit` prop.
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
   * Passed to SubjectTable memoized child as `onDelete` prop.
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
   * Passed to SubjectTable memoized child as `onToggleStatus` prop.
   */
  const handleRequestToggleStatus = useCallback(
    (row: ISubjectFormValues) => {
      setSelectedSubject(row);
      confirmPublishDialog.onTrue();
    },
    [confirmPublishDialog]
  );

  const handleCloseDialog = useCallback(() => {
    addSubjectDialog.onFalse();
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setTimeout(() => setSelectedSubject(null), 100);
  }, [addSubjectDialog, deleteConfirmDialog, confirmPublishDialog]);

  const handleConfirmDelete = useCallback(async () => {
    confirmWithUndo({
      item: selectedSubject,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
        dispatchFn(
          subjectAssignmentsApi.util.updateQueryData(
            'getSubjectAssignments',
            { standardId: classId, ...query },
            (draft: any) => {
              const index = draft?.data?.items.findIndex((b: any) => b.id === selectedSubject?.id);
              setDeleteIndex(index);
              if (index !== -1) draft?.data?.items.splice(index, 1);
            }
          )
        );
      },
      onUndoRestore: (_dispatchFn, _index) => refetch(),
      onCommit: () => deleteSubjectAssignment({ assignmentId: selectedSubject?.id || '' }),
    });
    deleteConfirmDialog.onFalse();
    setSelectedSubject(null);
  }, [
    confirmWithUndo,
    selectedSubject,
    deleteConfirmDialog,
    classId,
    query,
    refetch,
    deleteSubjectAssignment,
  ]);

  const handleConfirmPublish = useCallback(async () => {
    const nextStatus =
      selectedSubject?.status === PublishUnpublishStatusType.Published
        ? PublishUnpublishStatusType.Draft
        : PublishUnpublishStatusType.Published;

    await publishSubjectAssignment({
      assignmentId: selectedSubject?.id,
      status: nextStatus,
    }).unwrap();

    confirmPublishDialog.onFalse();
    setTimeout(() => setSelectedSubject(null), 100);

    shikshaMitraToast.success({
      message: `"${
        selectedSubject?.subjectType === 1
          ? selectedSubject?.subjects
              ?.map((sub: any) => `${sub.subjectName} (${sub.subjectCode})`)
              .join(', ')
          : `${selectedSubject?.subjects?.[0]?.subjectName} (${selectedSubject?.subjects?.[0]?.subjectCode})`
      }" subject ${
        nextStatus === PublishUnpublishStatusType.Published ? 'published' : 'moved to draft'
      } successfully`,
    });
  }, [selectedSubject, publishSubjectAssignment, confirmPublishDialog]);

  const handleClassChange = useCallback(
    (value: string | number) => {
      setClassId(value as string);
      const standard = allClass.find((c) => c.id === value);
      setClasses(standard?.name || '');
    },
    [allClass]
  );

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
    // State
    medium,
    allClass,
    classes,
    classId,
    selectedSubject,
    isEdit,
    isDeleteLoading,
    isPublishLoading,
    isTableLoading,
    isFetching,
    subjectTableData,

    // Dialogs
    addSubjectDialog,
    deleteConfirmDialog,
    confirmPublishDialog,
    showSubjectDialog,

    // Handlers
    handleClose,
    handleViewSubject,
    handleEditSubject,
    handleRequestDelete,
    handleRequestToggleStatus,
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
