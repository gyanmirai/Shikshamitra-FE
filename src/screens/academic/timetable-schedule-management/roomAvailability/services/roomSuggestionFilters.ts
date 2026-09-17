import type { SuggestedRoom } from '../types';

export interface RoomSuggestionFilters {
  search: string;
  building: string;
  floor: string;
  minimumCapacity: number;
  minimumMatchScore: number;
}

export const ALL_ROOM_FILTER_VALUE = 'all';

export const DEFAULT_ROOM_SUGGESTION_FILTERS: RoomSuggestionFilters = {
  search: '',
  building: ALL_ROOM_FILTER_VALUE,
  floor: ALL_ROOM_FILTER_VALUE,
  minimumCapacity: 0,
  minimumMatchScore: 0,
};

const normalize = (value: string | undefined) => value?.trim().toLocaleLowerCase() ?? '';

export const filterRoomSuggestions = (
  rooms: SuggestedRoom[],
  filters: RoomSuggestionFilters
): SuggestedRoom[] => {
  const search = normalize(filters.search);

  return rooms.filter((room) => {
    const searchableValues = [
      room.roomName,
      room.buildingName,
      room.floorName,
      room.type,
      String(room.capacity),
      ...room.facilities,
    ];

    const matchesSearch =
      !search || searchableValues.some((value) => normalize(value).includes(search));
    const matchesBuilding =
      filters.building === ALL_ROOM_FILTER_VALUE || room.buildingName === filters.building;
    const matchesFloor =
      filters.floor === ALL_ROOM_FILTER_VALUE || room.floorName === filters.floor;

    return (
      matchesSearch &&
      matchesBuilding &&
      matchesFloor &&
      room.capacity >= filters.minimumCapacity &&
      room.matchScore >= filters.minimumMatchScore
    );
  });
};

export const getRoomSuggestionFilterOptions = (
  rooms: SuggestedRoom[],
  field: 'buildingName' | 'floorName'
): string[] =>
  Array.from(
    new Set(
      rooms.map((room) => room[field]?.trim()).filter((value): value is string => Boolean(value))
    )
  ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

export const hasActiveRoomSuggestionFilters = (filters: RoomSuggestionFilters): boolean =>
  Boolean(filters.search.trim()) ||
  filters.building !== ALL_ROOM_FILTER_VALUE ||
  filters.floor !== ALL_ROOM_FILTER_VALUE ||
  filters.minimumCapacity > 0 ||
  filters.minimumMatchScore > 0;
