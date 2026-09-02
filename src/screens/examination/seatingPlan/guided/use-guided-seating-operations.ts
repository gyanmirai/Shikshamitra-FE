import type {
  SeatingPlanGroupDto,
  SeatingValidationDto,
  SeatingPlanWorkspaceDto,
  GuidedAllocationPreviewDto,
  ExaminationSeatingReadinessDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useSaveSeatingPlanBulkMutation } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';
import {
  usePrepareSeatingPlanMutation,
  useSaveGuidedSeatingDraftMutation,
  useDeleteGuidedSeatingPlanMutation,
  usePublishExaminationSeatingMutation,
  useApplyGuidedSeatAllocationMutation,
  useUpdateSeatingPlanSubjectsMutation,
  useValidateGuidedSeatingPlanMutation,
  useValidateExaminationSeatingMutation,
  usePreviewGuidedSeatAllocationMutation,
  useResetExaminationSeatingDraftMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { getWorkflowErrorMessage } from './workflow-errors';
import {
  buildApplyPayload,
  buildDraftPayload,
  buildPreviewPayload,
  buildManualApplyPayload,
} from './guided-payloads';

import type { GuidedSeatingValues } from './types';

export function useGuidedSeatingOperations(examId: string) {
  const [preview, setPreview] = useState<GuidedAllocationPreviewDto>();
  const [validation, setValidation] = useState<SeatingValidationDto>();
  const [examinationReadiness, setExaminationReadiness] =
    useState<ExaminationSeatingReadinessDto>();
  const [version, setVersion] = useState<string>();
  const [isPublished, setIsPublished] = useState(false);
  const [publication, setPublication] = useState<SeatingPlanWorkspaceDto>();
  const [prepare, prepareState] = usePrepareSeatingPlanMutation();
  const [updateSubjects, updateSubjectsState] = useUpdateSeatingPlanSubjectsMutation();
  const [deletePlanMutation, deletePlanState] = useDeleteGuidedSeatingPlanMutation();
  const [resetDraftMutation, resetDraftState] = useResetExaminationSeatingDraftMutation();
  const [saveDraft, saveState] = useSaveGuidedSeatingDraftMutation();
  const [previewAllocation, previewState] = usePreviewGuidedSeatAllocationMutation();
  const [applyAllocation, applyState] = useApplyGuidedSeatAllocationMutation();
  const [saveManualAllocation, manualSaveState] = useSaveSeatingPlanBulkMutation();
  const [validatePlan, validateState] = useValidateGuidedSeatingPlanMutation();
  const [validateExamination, validateExaminationState] =
    useValidateExaminationSeatingMutation();
  const [publishExamination, publishState] = usePublishExaminationSeatingMutation();

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
    setPreview(undefined);
    setValidation(undefined);
    setExaminationReadiness(undefined);
  };

  const deletePlan = async (seatingPlanId: string) => {
    await deletePlanMutation({ examId, seatingPlanId }).unwrap();
    setPreview(undefined);
    setValidation(undefined);
    setExaminationReadiness(undefined);
  };

  const resetDraft = async (reason: string) => {
    const result = await resetDraftMutation({ examId, reason }).unwrap();
    setPreview(undefined);
    setValidation(undefined);
    setVersion(undefined);
    setExaminationReadiness(result.readiness);
    return result;
  };

  const saveRooms = async (
    seatingPlanId: string,
    values: GuidedSeatingValues,
    currentVersion?: string | null
  ) => {
    const result = await saveDraft({
      examId,
      body: buildDraftPayload(seatingPlanId, values, currentVersion),
    }).unwrap();
    setVersion(result.version);
    setExaminationReadiness(undefined);
    return result;
  };

  const generatePreview = async (seatingPlanId: string, values: GuidedSeatingValues) => {
    const result = await previewAllocation({
      examId,
      body: buildPreviewPayload(seatingPlanId, values),
    }).unwrap();
    setPreview(result);
    return result;
  };

  const applyPreview = async (
    seatingPlanId: string,
    values: GuidedSeatingValues,
    currentVersion?: string | null
  ) => {
    if (!preview) return undefined;
    const result = await applyAllocation({
      examId,
      body: buildApplyPayload(seatingPlanId, values, preview, currentVersion),
    }).unwrap();
    setVersion(result.version);
    setExaminationReadiness(undefined);
    return result;
  };

  const runValidation = async (seatingPlanId: string) => {
    const result = await validatePlan({ examId, seatingPlanId }).unwrap();
    setValidation(result);
    return result;
  };

  const runExaminationValidation = async () => {
    const result = await validateExamination({ examId }).unwrap();
    setExaminationReadiness(result);
    return result;
  };

  const applyManualPreview = async (
    seatingPlanId: string,
    values: GuidedSeatingValues,
    previousRoomIds: string[],
    currentVersion?: string | null
  ) => {
    if (!preview) return undefined;
    const result = await saveManualAllocation({
      examId,
      body: buildManualApplyPayload(
        seatingPlanId,
        values,
        preview,
        previousRoomIds,
        currentVersion
      ),
    }).unwrap();
    setVersion(result.version);
    setExaminationReadiness(undefined);
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
    saveState,
    previewState,
    applyState,
    manualSaveState,
    validateState,
    validateExaminationState,
    publishState,
  ].some((state) => state.isLoading);

  return {
    preview,
    validation,
    examinationReadiness,
    publication,
    version,
    isPublished,
    isBusy,
    preparePlan,
    updatePlanSubjects,
    deletePlan,
    resetDraft,
    saveRooms,
    generatePreview,
    applyPreview,
    applyManualPreview,
    runValidation,
    runExaminationValidation,
    publish,
    showError,
    resetPreview: () => {
      setPreview(undefined);
      setValidation(undefined);
    },
    setManualPreview: setPreview,
  };
}
