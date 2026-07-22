import { useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
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
    try {
      await deleteSubjectAssignment({ assignmentId: selectedSubject?.id || '' }).unwrap();
      const label = getSubjectDisplayLabel(selectedSubject);
      shikshaMitraToast.success({
        message: `"${label}" subject assignment deleted successfully`,
      });
      refetch();
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Failed to delete subject assignment.',
      });
    }
    onDeleteComplete();
  }, [selectedSubject, deleteSubjectAssignment, refetch, onDeleteComplete]);

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

    try {
      await publishSubjectAssignment({
        assignmentId: selectedSubject?.id,
        status: nextStatus,
      }).unwrap();

      refetch();

      const label = getSubjectDisplayLabel(selectedSubject);
      const action =
        nextStatus === PublishUnpublishStatusType.Published ? 'published' : 'moved to draft';

      shikshaMitraToast.success({
        message: `"${label}" subject ${action} successfully`,
      });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.error?.message || err?.data?.message || 'Failed to publish subject assignment.',
      });
    } finally {
      onPublishComplete();
    }
  }, [selectedSubject, publishSubjectAssignment, refetch, onPublishComplete]);

  return { isDeleteLoading, isPublishLoading, handleConfirmDelete, handleConfirmPublish };
}
