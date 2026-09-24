'use client';

import type { RootState } from 'src/redux/store';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';
import {
  useGetSubjectKpiQuery,
  useGetSubjectAssignmentsQuery,
  useCopySubjectAssignmentsMutation,
  useArchiveSubjectAssignmentMutation,
  useRestoreSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { useClassSelection } from './useClassSelection';
import { useSubjectMutations } from './useSubjectMutations';
import { SubjectAssignmentStatus } from '../enum/subjectType';

import type { ISubjectFormValues } from '../component/type';
import type { CopySubjectPayload } from '../component/SubjectCopyDialog';

const TEACHER_SEARCH_DEBOUNCE_MS = 400;

export function useSubjectAssignment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlAssignmentId = searchParams.get('assignmentId');
  const urlSubjectId = searchParams.get('subjectId');

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { allClass, classes, classId, handleClassChange } = useClassSelection({ medium });

  const [query, setQuery] = useState<{ page: number; pageSize: number; teacherSearch: string }>({
    page: 0,
    pageSize: 10,
    teacherSearch: '',
  });
  const [debouncedTeacherSearch, setDebouncedTeacherSearch] = useState('');
  const trimmedTeacherSearch = debouncedTeacherSearch.trim();

  useDebounceEffect(
    () => {
      const nextSearch = query.teacherSearch.trim();

      setDebouncedTeacherSearch((previousSearch) =>
        previousSearch === nextSearch ? previousSearch : nextSearch
      );

      setQuery((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }));
    },
    TEACHER_SEARCH_DEBOUNCE_MS,
    [query.teacherSearch]
  );

  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      standardId: classId,
      page: query.page,
      pageSize: query.pageSize,
      status: 'all',
      ...(trimmedTeacherSearch ? { teacherSearch: trimmedTeacherSearch } : {}),
    },
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
  const [copySubjects, { isLoading: isCopyLoading }] = useCopySubjectAssignmentsMutation();

  const addSubjectDialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const archiveConfirmDialog = useBoolean();
  const restoreConfirmDialog = useBoolean();
  const copySubjectsDialog = useBoolean();

  const [selectedSubject, setSelectedSubject] = useState<ISubjectFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Deep linking guard: auto-open workspace ONLY ONCE on initial mount if assignmentId or subjectId is in URL
  const hasCheckedDeepLinkRef = useRef(false);

  useEffect(() => {
    if (hasCheckedDeepLinkRef.current) return;

    if (urlAssignmentId || urlSubjectId) {
      hasCheckedDeepLinkRef.current = true;
      showSubjectDialog.onTrue();
    }
  }, [urlAssignmentId, urlSubjectId, showSubjectDialog]);

  const handleCloseDialog = useCallback(() => {
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    archiveConfirmDialog.onFalse();
    restoreConfirmDialog.onFalse();
    copySubjectsDialog.onFalse();
    setIsEdit(false);
    setTimeout(() => setSelectedSubject(null), 100);
  }, [
    deleteConfirmDialog,
    confirmPublishDialog,
    archiveConfirmDialog,
    restoreConfirmDialog,
    copySubjectsDialog,
  ]);

  const handleConfirmCopySubjects = useCallback(
    async (payload: CopySubjectPayload) => {
      try {
        const response = await copySubjects(payload).unwrap();
        shikshaMitraToast.success({
          message: response.data.message || 'Subject allocations copied successfully.',
        });
        copySubjectsDialog.onFalse();
        refetch();
      } catch (error: unknown) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to copy subject allocations.',
        });
        throw error;
      }
    },
    [copySubjects, copySubjectsDialog, refetch]
  );

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
   * Opens the dedicated Subject Workspace.
   */
  const handleViewSubject = useCallback(
    (subject: ISubjectFormValues) => {
      setSelectedSubject(subject);
      showSubjectDialog.onTrue();
      hasCheckedDeepLinkRef.current = true;

      if (typeof window !== 'undefined' && subject?.id) {
        const url = new URL(window.location.href);
        url.searchParams.set('assignmentId', String(subject.id));
        if (subject.subjects?.[0]?.subjectId) {
          url.searchParams.set('subjectId', subject.subjects[0].subjectId);
        }
        window.history.replaceState({}, '', url.toString());
      }
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

  /**
   * Memoization Justification:
   * Passed to SubjectActionBar (React.memo) as `onTeacherSearchChange`.
   * Keeps toolbar input changes from recreating the handler while debounce commits the filter.
   */
  const handleTeacherSearchChange = useCallback((value: string) => {
    setQuery((prev) => ({ ...prev, teacherSearch: value }));
  }, []);

  const handleBackFromView = useCallback(() => {
    showSubjectDialog.onFalse();
    setSelectedSubject(null);
    hasCheckedDeepLinkRef.current = true;

    // Clean up URL parameters and router state synchronously
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('assignmentId');
      url.searchParams.delete('subjectId');
      window.history.replaceState({}, '', url.pathname);
    }
    router.replace(pathname);
  }, [showSubjectDialog, router, pathname]);

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
    isCopyLoading,
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
    copySubjectsDialog,
    handleClose,
    handleViewSubject,
    handleEditSubject,
    handleRequestDelete,
    handleRequestToggleStatus,
    handleRequestArchive,
    handleRequestRestore,
    handleConfirmArchive,
    handleConfirmRestore,
    handleConfirmCopySubjects,
    handleCloseDialog,
    handleConfirmDelete,
    handleConfirmPublish,
    handleClassChange,
    handleTeacherSearchChange,
    handleAddNew,
    handleBackFromView,
    query,
    setQuery,
  };
}
