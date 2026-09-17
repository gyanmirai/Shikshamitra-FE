import { it, expect, describe } from 'vitest';

import {
  filterRoomSuggestions,
  getRoomSuggestionFilterOptions,
  DEFAULT_ROOM_SUGGESTION_FILTERS,
} from './roomSuggestionFilters';

import type { SuggestedRoom } from '../types';

const rooms: SuggestedRoom[] = [
  {
    roomId: 'a004',
    roomName: 'A004',
    buildingName: 'Main Building',
    floorName: 'First Floor',
    type: 'Classroom',
    capacity: 40,
    facilities: ['projector', 'whiteboard'],
    availability: 'full',
    matchScore: 85,
    reason: 'Good match',
    conflictStatus: 'none',
    badges: [],
    needsApproval: false,
  },
  {
    roomId: 'lab-2',
    roomName: 'Science Lab 2',
    buildingName: 'Activity Block',
    floorName: 'Second Floor',
    type: 'Laboratory',
    capacity: 60,
    facilities: ['labEquipment', 'smartBoard'],
    availability: 'partial',
    matchScore: 72,
    reason: 'Partial match',
    conflictStatus: 'warning',
    badges: [],
    needsApproval: true,
  },
];

describe('room suggestion result filters', () => {
  it('searches room metadata and facilities without changing the source order', () => {
    expect(
      filterRoomSuggestions(rooms, {
        ...DEFAULT_ROOM_SUGGESTION_FILTERS,
        search: 'projector',
      }).map((room) => room.roomId)
    ).toEqual(['a004']);
  });

  it('combines location, capacity, and match score filters', () => {
    expect(
      filterRoomSuggestions(rooms, {
        ...DEFAULT_ROOM_SUGGESTION_FILTERS,
        building: 'Activity Block',
        floor: 'Second Floor',
        minimumCapacity: 50,
        minimumMatchScore: 70,
      }).map((room) => room.roomId)
    ).toEqual(['lab-2']);
  });

  it('returns sorted unique filter options and omits missing floor names', () => {
    expect(getRoomSuggestionFilterOptions(rooms, 'buildingName')).toEqual([
      'Activity Block',
      'Main Building',
    ]);
    expect(
      getRoomSuggestionFilterOptions(
        [...rooms, { ...rooms[0], roomId: 'no-floor', floorName: undefined }],
        'floorName'
      )
    ).toEqual(['First Floor', 'Second Floor']);
  });
});
