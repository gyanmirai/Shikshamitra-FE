import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { buildRules } from './workflow-utils';

import type { GuidedSeatingValues } from './types';

export function buildDraftPayload(
  seatingPlanId: string,
  values: GuidedSeatingValues,
  version?: string | null
) {
  return {
    seatingPlanId,
    roomIds: values.selectedRoomIds,
    allocationRulesJson: JSON.stringify(buildRules(values)),
    excludedStudentIds: [],
    specialRequirementStudentIds: [],
    version,
  };
}

export function buildPreviewPayload(seatingPlanId: string, values: GuidedSeatingValues) {
  return {
    seatingPlanId,
    roomIds: values.selectedRoomIds,
    ...buildRules(values),
    excludedStudentIds: [],
  };
}

export function buildApplyPayload(
  seatingPlanId: string,
  values: GuidedSeatingValues,
  preview: GuidedAllocationPreviewDto,
  version?: string | null
) {
  return {
    ...buildDraftPayload(seatingPlanId, values, version),
    assignments: preview.assignments,
  };
}

export function buildManualApplyPayload(
  seatingPlanId: string,
  values: GuidedSeatingValues,
  preview: GuidedAllocationPreviewDto,
  previousRoomIds: string[],
  version?: string | null
) {
  const roomsToReplace = [...new Set([...previousRoomIds, ...values.selectedRoomIds])];

  return {
    ...buildDraftPayload(seatingPlanId, values, version),
    rooms: roomsToReplace.map((roomId) => ({
      roomId,
      students: preview.assignments
        .filter((assignment) => assignment.roomId === roomId)
        .map((assignment) => ({
          studentId: assignment.studentId,
          seatNumber: assignment.seatNumber,
          benchId:
            assignment.benchId &&
            assignment.benchId !== '00000000-0000-0000-0000-000000000000'
              ? assignment.benchId
              : null,
          isRoomAssign: true,
        })),
    })),
  };
}
