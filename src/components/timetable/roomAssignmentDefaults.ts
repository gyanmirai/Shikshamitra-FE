import type { SlotSubject } from './types';

type RoomSelectionMap = Record<string, string>;

export function createSavedRoomSelections(subjects: SlotSubject[]): RoomSelectionMap {
  return subjects.reduce<RoomSelectionMap>((selections, subject) => {
    if (subject.roomId) selections[subject.subjectId] = subject.roomId;
    return selections;
  }, {});
}

export function addDivisionRoomDefault(
  selections: RoomSelectionMap,
  subjects: SlotSubject[],
  divisionRoomId?: string | null
): RoomSelectionMap {
  if (!divisionRoomId || Object.values(selections).includes(divisionRoomId)) return selections;

  const firstUnassignedSubject = subjects.find((subject) => !selections[subject.subjectId]);
  if (!firstUnassignedSubject) return selections;

  return {
    ...selections,
    [firstUnassignedSubject.subjectId]: divisionRoomId,
  };
}
