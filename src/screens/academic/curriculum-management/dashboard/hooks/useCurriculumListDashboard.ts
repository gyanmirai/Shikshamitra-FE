'use client';

import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
  useGetSubjectAssignmentsQuery,
  usePublishSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

export const useCurriculumListDashboard = () => {
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classId, setClassId] = useState('');
  const [publishSubjectAssignment] = usePublishSubjectAssignmentMutation();
  const [classes, setClasses] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    newValue: PublishUnpublishStatusType;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classId, page: 1, pageSize: 100 },
    options: { skip: !classId },
  });

  /**
   * Memoization Justification:
   * Re-computing curriculumTableData on every render of the dashboard is expensive
   * because it maps over the API responses and shapes the UI table row structures.
   * This memoization prevents needless object re-allocations and table redraws when unrelated state changes.
   */
  const curriculumTableData = useMemo(() => {
    const items: any[] = assignmentsData?.items ?? assignmentsData?.data?.items ?? [];
    return items.map((item: any) => ({
      id: item.subjectAssignmentId ?? item.id ?? '',
      curriculumName: item.name ?? item.curriculumName ?? `${item.standardName ?? ''} Curriculum`,
      className: item.standardName ?? item.className ?? '',
      subjects: item.subjectCount ?? item.subjects?.length ?? 0,
      lastUpdated: item.updatedAt ?? item.lastModifiedAt ?? item.createdAt ?? new Date(),
      status: item.status ?? PublishUnpublishStatusType.Draft,
    }));
  }, [assignmentsData]);

  const handleStatusChange = useCallback(
    (id: string, currentStatus: PublishUnpublishStatusType) => {
      const newStatus =
        currentStatus === PublishUnpublishStatusType.Published
          ? PublishUnpublishStatusType.Draft
          : PublishUnpublishStatusType.Published;
      setPendingStatusChange({ id, newValue: newStatus });
      confirmPublishDialog.onTrue();
    },
    [confirmPublishDialog]
  );

  const confirmStatusChange = useCallback(async () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      try {
        await publishSubjectAssignment({ assignmentId: id, status: newValue }).unwrap();
        shikshaMitraToast.success({
          message: `Curriculum ${
            newValue === PublishUnpublishStatusType.Published ? 'published' : 'unpublished'
          } successfully.`,
        });
      } catch {
        shikshaMitraToast.error({ message: 'Failed to update curriculum status.' });
      }
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  }, [pendingStatusChange, publishSubjectAssignment, confirmPublishDialog]);

  const handleCloseDialog = useCallback(() => {
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  }, [confirmPublishDialog]);

  useEffect(() => {
    if (!classId && classData?.items?.length > 0) {
      const firstClass = classData.items[0];
      setClasses(firstClass?.name ?? '');
      setClassId(firstClass?.id ?? '');
    }
  }, [classData?.items, classId]);

  return {
    classData,
    classId,
    setClassId,
    classes,
    setClasses,
    curriculumTableData,
    isAssignmentsLoading,
    confirmPublishDialog,
    pendingStatusChange,
    handleStatusChange,
    confirmStatusChange,
    handleCloseDialog,
  };
};
