import type {
  SeatingSubjectDto,
  SeatingPlanGroupDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { formatPlanSchedules } from '../workflow-utils';

export interface PublishedRoomGroup {
  id: string;
  roomId: string;
  roomName: string;
  anchorPlan: SeatingPlanGroupDto;
  plans: SeatingPlanGroupDto[];
  subjectNames: string[];
  scheduleLabel: string;
}

function dateKey(subject: SeatingSubjectDto) {
  return subject.examDate?.slice(0, 10);
}

function timeInMinutes(value?: string | null) {
  if (!value) return undefined;
  const match = value.match(/(?:T|^)(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
}

function subjectsOverlap(left: SeatingSubjectDto, right: SeatingSubjectDto) {
  const leftDate = dateKey(left);
  const rightDate = dateKey(right);
  if (!leftDate || !rightDate || leftDate !== rightDate) return false;

  const leftStart = timeInMinutes(left.startTime);
  const leftEnd = timeInMinutes(left.endTime);
  const rightStart = timeInMinutes(right.startTime);
  const rightEnd = timeInMinutes(right.endTime);
  if (
    leftStart === undefined ||
    leftEnd === undefined ||
    rightStart === undefined ||
    rightEnd === undefined
  ) {
    return true;
  }

  return leftStart < rightEnd && rightStart < leftEnd;
}

export function plansOverlap(left: SeatingPlanGroupDto, right: SeatingPlanGroupDto) {
  return left.subjects.some((leftSubject) =>
    right.subjects.some((rightSubject) => subjectsOverlap(leftSubject, rightSubject))
  );
}

export function buildPublishedRoomGroups(plans: SeatingPlanGroupDto[]): PublishedRoomGroup[] {
  const roomIds = [...new Set(plans.flatMap((plan) => plan.selectedRoomIds))];
  const groups = new Map<string, PublishedRoomGroup>();

  roomIds.forEach((roomId) => {
    const roomPlans = plans.filter((plan) => plan.selectedRoomIds.includes(roomId));
    roomPlans.forEach((anchorPlan) => {
      const overlappingPlans = roomPlans.filter(
        (candidate) => candidate === anchorPlan || plansOverlap(anchorPlan, candidate)
      );
      const planIds = overlappingPlans.map((plan) => plan.seatingPlanId).sort();
      const id = `${roomId}:${planIds.join(':')}`;
      if (groups.has(id)) return;

      const roomName =
        roomPlans.flatMap((plan) => plan.availableRooms).find((room) => room.roomId === roomId)
          ?.roomName ?? roomId;
      const subjectNames = [
        ...new Set(
          overlappingPlans.flatMap((plan) => plan.subjects.map((subject) => subject.subjectName))
        ),
      ];
      groups.set(id, {
        id,
        roomId,
        roomName,
        anchorPlan,
        plans: overlappingPlans,
        subjectNames,
        scheduleLabel: formatPlanSchedules(anchorPlan.subjects),
      });
    });
  });

  return [...groups.values()].sort(
    (left, right) =>
      left.roomName.localeCompare(right.roomName) ||
      left.scheduleLabel.localeCompare(right.scheduleLabel)
  );
}
