import type {
  SeatingValidationDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import { useSaveSeatingPlanBulkMutation } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';
import {
  useSaveGuidedSeatingDraftMutation,
  useApplyGuidedSeatAllocationMutation,
  useValidateGuidedSeatingPlanMutation,
  usePreviewGuidedSeatAllocationMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { showSeatingValidationWarnings } from '../seating-validation-toast';
import {
  buildApplyPayload,
  buildDraftPayload,
  buildPreviewPayload,
  buildManualApplyPayload,
} from '../guided-payloads';

import type { GuidedSeatingValues } from '../types';

export function useGuidedSeatingAllocation(examId: string, clearReadiness: () => void) {
  const [preview, setPreview] = useState<GuidedAllocationPreviewDto>();
  const [validation, setValidation] = useState<SeatingValidationDto>();
  const [version, setVersion] = useState<string>();
  const [saveDraft, saveState] = useSaveGuidedSeatingDraftMutation();
  const [previewAllocation, previewState] = usePreviewGuidedSeatAllocationMutation();
  const [applyAllocation, applyState] = useApplyGuidedSeatAllocationMutation();
  const [saveManualAllocation, manualSaveState] = useSaveSeatingPlanBulkMutation();
  const [validatePlan, validateState] = useValidateGuidedSeatingPlanMutation();

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
    clearReadiness();
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
    clearReadiness();
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
    clearReadiness();
    return result;
  };

  const runValidation = async (seatingPlanId: string) => {
    const result = await validatePlan({ examId, seatingPlanId }).unwrap();
    setValidation(result);
    showSeatingValidationWarnings(result);
    return result;
  };

  return {
    preview,
    validation,
    version,
    isBusy: [saveState, previewState, applyState, manualSaveState, validateState].some(
      (state) => state.isLoading
    ),
    saveRooms,
    generatePreview,
    applyPreview,
    applyManualPreview,
    runValidation,
    resetVersion: () => setVersion(undefined),
    resetPreview: () => {
      setPreview(undefined);
      setValidation(undefined);
    },
    setManualPreview: setPreview,
  };
}
