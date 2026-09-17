import type { RoomFacility, ReservationRequirements } from '../types';

export type ReservationValidationErrors = Partial<
  Record<keyof ReservationRequirements | 'untilDate', string>
>;

export interface RoomSuggestionRequest {
  date: string;
  startTime: string;
  endTime: string;
  requiredCapacity: number;
  requiredFacilities: RoomFacility[];
  preferredBuildingId?: string;
  page?: number;
  limit: number;
}

export const DEFAULT_ROOM_SUGGESTION_LIMIT = 500;

export const validateRoomSearchRequirements = (
  requirements: ReservationRequirements
): ReservationValidationErrors => {
  const errors: ReservationValidationErrors = {};

  if (!requirements.reservationType) {
    errors.reservationType = 'Reservation type is required.';
  }
  if (!requirements.date) {
    errors.date = 'Date is required.';
  }
  if (!requirements.startTime) {
    errors.startTime = 'Start time is required.';
  }
  if (!requirements.endTime) {
    errors.endTime = 'End time is required.';
  } else if (requirements.startTime && requirements.endTime <= requirements.startTime) {
    errors.endTime = 'End time must be after start time.';
  }

  return errors;
};

export const validateRoomBookingRequirements = (
  requirements: ReservationRequirements
): ReservationValidationErrors => {
  const errors = validateRoomSearchRequirements(requirements);

  if (!requirements.purpose.trim()) {
    errors.purpose = 'Purpose is required.';
  }
  if (requirements.isRecurring && !requirements.recurringConfig?.untilDate) {
    errors.untilDate = 'Repeat until date is required.';
  }

  return errors;
};

export const buildRoomSuggestionRequest = (
  requirements: ReservationRequirements
): RoomSuggestionRequest => ({
  date: requirements.date,
  startTime: requirements.startTime,
  endTime: requirements.endTime,
  requiredCapacity: requirements.requiredCapacity || 0,
  requiredFacilities: requirements.requiredFacilities,
  preferredBuildingId:
    requirements.preferredBuilding === 'all' || !requirements.preferredBuilding
      ? undefined
      : requirements.preferredBuilding,
  page: requirements.page,
  limit: requirements.limit || DEFAULT_ROOM_SUGGESTION_LIMIT,
});
