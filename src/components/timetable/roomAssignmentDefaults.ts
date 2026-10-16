import type { TimeSlot, DayOfWeek, SlotSubject } from './types';

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

  const firstUnassignedSubject = subjects.find(
    (subject) => !Object.hasOwn(selections, subject.subjectId)
  );
  if (!firstUnassignedSubject) return selections;

  return {
    ...selections,
    [firstUnassignedSubject.subjectId]: divisionRoomId,
  };
}

export function applyDivisionRoomDefaults(
  slots: Record<DayOfWeek, TimeSlot[]>,
  room?: { id: string; roomName: string } | null
): Record<DayOfWeek, TimeSlot[]> {
  if (!room?.id) return slots;

  let updatedSlots = slots;
  (Object.keys(slots) as DayOfWeek[]).forEach((day) => {
    const daySlots = slots[day];
    let updatedDaySlots = daySlots;

    daySlots.forEach((slot, index) => {
      if (slot.type !== 'LECTURE' || !slot.subjects?.length) return;

      const savedSelections = createSavedRoomSelections(slot.subjects);
      const selections = addDivisionRoomDefault(savedSelections, slot.subjects, room.id);
      if (selections === savedSelections) return;

      const subjects = slot.subjects.map((subject) =>
        !subject.roomId && selections[subject.subjectId] === room.id
          ? { ...subject, roomId: room.id, roomName: room.roomName }
          : subject
      );
      const attachedSubject = slot._attachedSubject;
      const assignedSubject = subjects.find(
        (subject) => subject.subjectId === attachedSubject?.subjectId
      );

      if (updatedSlots === slots) updatedSlots = { ...slots };
      if (updatedDaySlots === daySlots) updatedDaySlots = [...daySlots];
      updatedDaySlots[index] = {
        ...slot,
        subjects,
        ...(attachedSubject && assignedSubject
          ? {
              _attachedSubject: {
                ...attachedSubject,
                roomId: assignedSubject.roomId,
                roomName: assignedSubject.roomName,
              },
            }
          : {}),
      };
      updatedSlots[day] = updatedDaySlots;
    });
  });

  return updatedSlots;
}
