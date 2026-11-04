import type { ClassTeacherValidationResult } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useUpdateClassTeacherAssignmentsMutation,
  useValidateClassTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import type { useClassTeacherWorkspace } from './useClassTeacherWorkspace';

export function useClassTeacherActions(workspace: ReturnType<typeof useClassTeacherWorkspace>) {
  const [validate, { isLoading: isValidating }] = useValidateClassTeacherAssignmentsMutation();
  const [save, { isLoading: isSaving }] = useUpdateClassTeacherAssignmentsMutation();
  const lock = useRef(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [validation, setValidation] = useState<ClassTeacherValidationResult | null>(null);
  const busy = isSaving || isValidating;
  const invalidDates = workspace.tableData.some(
    (row) => row.classTeacher && row.effectiveFromDraft && !dayjs(row.effectiveFromDraft).isValid()
  );
  const payload = (saveAsDraft: boolean) => ({
    organizationId: workspace.organization,
    saveAsDraft,
    assignments: workspace.tableData
      .filter((row) => row.classTeacher)
      .map((row) => ({
        classId: row.classId,
        divisionId: row.divisionId,
        teacherId: row.classTeacher as string,
        assignmentType: row.assignmentTypeDraft,
        effectiveFrom: row.effectiveFromDraft || undefined,
        changeReason: row.changeReasonDraft,
      })),
  });
  const allowed = () =>
    !lock.current &&
    !busy &&
    workspace.canAdd &&
    workspace.organization &&
    !invalidDates &&
    !workspace.isError;

  const saveDraft = async () => {
    if (!allowed() || !workspace.hasChanges) return;
    lock.current = true;
    try {
      await save(payload(true)).unwrap();
      workspace.markSaved();
      shikshaMitraToast.success({ message: 'Class teacher draft saved.' });
      await workspace.refetch();
    } catch {
      shikshaMitraToast.error({ message: 'Draft could not be saved. Please review conflicts.' });
    } finally {
      lock.current = false;
    }
  };
  const review = async () => {
    if (!allowed() || !workspace.pendingRows.length) return;
    lock.current = true;
    try {
      setValidation(await validate(payload(false)).unwrap());
      setReviewOpen(true);
    } catch {
      shikshaMitraToast.error({ message: 'Validation failed. Please try again.' });
    } finally {
      lock.current = false;
    }
  };
  const confirm = async () => {
    if (!allowed() || !validation?.canConfirm || !workspace.pendingRows.length) return;
    lock.current = true;
    try {
      await save(payload(false)).unwrap();
      workspace.markSaved();
      setReviewOpen(false);
      shikshaMitraToast.success({ message: 'Class teacher assignments confirmed.' });
      await workspace.refetch();
    } catch {
      shikshaMitraToast.error({ message: 'Assignments could not be confirmed.' });
    } finally {
      lock.current = false;
    }
  };
  return {
    busy,
    isSaving,
    isValidating,
    invalidDates,
    reviewOpen,
    validation,
    saveDraft,
    review,
    confirm,
    closeReview: () => {
      if (!busy && !lock.current) setReviewOpen(false);
    },
  };
}
