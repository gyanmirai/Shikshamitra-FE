import { it, expect, describe } from 'vitest';

import {
  buildRoomSuggestionRequest,
  DEFAULT_ROOM_SUGGESTION_LIMIT,
  validateRoomSearchRequirements,
  validateRoomBookingRequirements,
} from './roomSuggestionSearch';

import type { ReservationRequirements } from '../types';

const createRequirements = (
  overrides: Partial<ReservationRequirements> = {}
): ReservationRequirements => ({
  reservationType: 'class',
  purpose: '',
  date: '2026-08-29',
  startTime: '09:00',
  endTime: '09:45',
  requiredCapacity: 30,
  preferredBuilding: 'all',
  requiredFacilities: ['projector'],
  priority: 'normal',
  isRecurring: false,
  ...overrides,
});

describe('room suggestion search contract', () => {
  it('allows an availability search without a booking purpose', () => {
    expect(validateRoomSearchRequirements(createRequirements())).toEqual({});
  });

  it('still requires a purpose before the selected room can be booked', () => {
    expect(validateRoomBookingRequirements(createRequirements())).toEqual({
      purpose: 'Purpose is required.',
    });
  });

  it('rejects an invalid search time range', () => {
    expect(
      validateRoomSearchRequirements(createRequirements({ startTime: '10:00', endTime: '09:00' }))
    ).toEqual({ endTime: 'End time must be after start time.' });
  });

  it('builds only the fields accepted by the room suggestion endpoint', () => {
    expect(buildRoomSuggestionRequest(createRequirements())).toEqual({
      date: '2026-08-29',
      startTime: '09:00',
      endTime: '09:45',
      requiredCapacity: 30,
      requiredFacilities: ['projector'],
      preferredBuildingId: undefined,
      page: undefined,
      limit: DEFAULT_ROOM_SUGGESTION_LIMIT,
    });
  });
});
