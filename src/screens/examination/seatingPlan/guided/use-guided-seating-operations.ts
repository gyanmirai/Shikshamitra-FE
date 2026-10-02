import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
  ExaminationSeatingReadinessDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  usePrepareSeatingPlanMutation,
  useDeleteGuidedSeatingPlanMutation,
  usePublishExaminationSeatingMutation,
  useUpdateSeatingPlanSubjectsMutation,
  useValidateExaminationSeatingMutation,
  useResetExaminationSeatingDraftMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { getWorkflowErrorMessage } from './workflow-errors';
import { useGuidedSeatingAllocation } from './hooks/use-guided-seating-allocation';

import type { GuidedSeatingValues } from './types';

export function useGuidedSeatingOperations(examId: string) {
  const [examinationReadiness, setExaminationReadiness] =
    useState<ExaminationSeatingReadinessDto>();
  const [isPublished, setIsPublished] = useState(false);
  const [publication, setPublication] = useState<SeatingPlanWorkspaceDto>();
  const [prepare, prepareState] = usePrepareSeatingPlanMutation();
  const [updateSubjects, updateSubjectsState] = useUpdateSeatingPlanSubjectsMutation();
  const [deletePlanMutation, deletePlanState] = useDeleteGuidedSeatingPlanMutation();
  const [resetDraftMutation, resetDraftState] = useResetExaminationSeatingDraftMutation();
  const [validateExamination, validateExaminationState] = useValidateExaminationSeatingMutation();
  const [publishExamination, publishState] = usePublishExaminationSeatingMutation();

  const allocation = useGuidedSeatingAllocation(examId, () => setExaminationReadiness(undefined));

  const preparePlan = async (examSubjectIds: string[], name: string) => {
    const result = await prepare({
      examId,
      body: { examSubjectIds, name: name.trim() || undefined },
    }).unwrap();
    setExaminationReadiness(result.readiness);
    return result.selectedSeatingPlanId ?? undefined;
  };

  const updatePlanSubjects = async (
    plan: SeatingPlanGroupDto,
    name: string,
    examSubjectIds: string[]
  ) => {
    await updateSubjects({
      examId,
      body: {
        seatingPlanId: plan.seatingPlanId,
        name: name.trim() || plan.name,
        scopeType: examSubjectIds.length === 1 ? 2 : 1,
        examSubjectIds,
        resetAllocationsWhenSubjectsChange: plan.allocatedStudents > 0,
      },
    }).unwrap();
    allocation.resetPreview();
    setExaminationReadiness(undefined);
  };

  const deletePlan = async (seatingPlanId: string) => {
    await deletePlanMutation({ examId, seatingPlanId }).unwrap();
    allocation.resetPreview();
    setExaminationReadiness(undefined);
  };

  const resetDraft = async (reason: string) => {
    const result = await resetDraftMutation({ examId, reason }).unwrap();
    allocation.resetPreview();
    allocation.resetVersion();
    setExaminationReadiness(result.readiness);
    return result;
  };

  const runExaminationValidation = async () => {
    const result = await validateExamination({ examId }).unwrap();
    setExaminationReadiness(result);
    return result;
  };

  const publish = async (values: GuidedSeatingValues) => {
    const readiness = await runExaminationValidation();
    if (!readiness.isReadyToPublish) return false;
    const published = await publishExamination({
      examId,
      body: { notifyStudents: values.notifyStudents, notifyParents: values.notifyParents },
    }).unwrap();
    setExaminationReadiness(published.readiness);
    setPublication(published);
    setIsPublished(true);
    return published;
  };

  const showError = (error: unknown) =>
    shikshaMitraToast.error({ message: getWorkflowErrorMessage(error) });
  const isBusy = [
    prepareState,
    updateSubjectsState,
    deletePlanState,
    resetDraftState,
    validateExaminationState,
    publishState,
  ].some((state) => state.isLoading);

  return {
    ...allocation,
    examinationReadiness,
    publication,
    isPublished,
    isBusy: isBusy || allocation.isBusy,
    preparePlan,
    updatePlanSubjects,
    deletePlan,
    resetDraft,
    runExaminationValidation,
    publish,
    showError,
  };
}
