import { useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
  subjectAssignmentsApi,
  useDeleteSubjectAssignmentMutation,
  usePublishSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';

import type { ISubjectFormValues } from '../component/type';

interface UseSubjectMutationsParams {
  classId: string;
  query: { page: number; pageSize: number };
  refetch: () => void;
  selectedSubject: ISubjectFormValues | null;
  onDeleteComplete: () => void;
  onPublishComplete: () => void;
}

export function useSubjectMutations({
  classId,
  query,
  refetch,
  selectedSubject,
  onDeleteComplete,
  onPublishComplete,
}: UseSubjectMutationsParams) {
  const { confirmWithUndo } = useConfirmWithUndo();

  const [deleteSubjectAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSubjectAssignmentMutation,
  });

  const [publishSubjectAssignment, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishSubjectAssignmentMutation,
  });

  /**
   * Memoization Justification:
   * Passed to SubjectDeleteDialog (React.memo) as `onConfirm` prop.
   * Contains async mutation and optimistic cache update logic.
   */
  const handleConfirmDelete = useCallback(async () => {
    confirmWithUndo({
      item: selectedSubject,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
        dispatchFn(
          subjectAssignmentsApi.util.updateQueryData(
            'getSubjectAssignments',
            { standardId: classId, ...query },
            (draft: { data?: { items: Array<{ id?: string | number }> } }) => {
              const idx = draft?.data?.items.findIndex((b) => b.id === selectedSubject?.id);
              setDeleteIndex(idx ?? -1);
              if (idx !== undefined && idx !== -1) draft?.data?.items.splice(idx, 1);
            }
          )
        );
      },
      onUndoRestore: () => refetch(),
      onCommit: () => deleteSubjectAssignment({ assignmentId: selectedSubject?.id || '' }),
    });
    onDeleteComplete();
  }, [
    confirmWithUndo,
    selectedSubject,
    classId,
    query,
    refetch,
    deleteSubjectAssignment,
    onDeleteComplete,
  ]);

  /**
   * Memoization Justification:
   * Passed to SubjectPublishDialog (React.memo) as `onConfirm` prop.
   * Contains async mutation logic with status toggling.
   */
  const handleConfirmPublish = useCallback(async () => {
    const nextStatus =
      selectedSubject?.status === PublishUnpublishStatusType.Published
        ? PublishUnpublishStatusType.Draft
        : PublishUnpublishStatusType.Published;

    await publishSubjectAssignment({
      assignmentId: selectedSubject?.id,
      status: nextStatus,
    }).unwrap();

    const label = getSubjectDisplayLabel(selectedSubject);
    const action =
      nextStatus === PublishUnpublishStatusType.Published ? 'published' : 'moved to draft';

    shikshaMitraToast.success({
      message: `"${label}" subject ${action} successfully`,
    });

    onPublishComplete();
  }, [selectedSubject, publishSubjectAssignment, onPublishComplete]);

  return { isDeleteLoading, isPublishLoading, handleConfirmDelete, handleConfirmPublish };
}
