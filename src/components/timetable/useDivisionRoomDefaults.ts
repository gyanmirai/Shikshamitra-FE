import { useRef, useEffect } from 'react';
import { divisionApi } from 'src/redux/division/divisionApi';
import { roomsApi } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { applyDivisionRoomDefaults } from './roomAssignmentDefaults';

import type { TimeSlot, DayOfWeek } from './types';

interface DivisionRoomDefaultsProps {
  slots: Record<DayOfWeek, TimeSlot[]>;
  onChange: (slots: Record<DayOfWeek, TimeSlot[]>) => void;
  divisionId: string;
  readOnly: boolean;
}

export function useDivisionRoomDefaults({
  slots,
  onChange,
  divisionId,
  readOnly,
}: DivisionRoomDefaultsProps) {
  const skip = readOnly || !divisionId;
  const [loadDivision] = divisionApi.useLazyGetDivisionByIdQuery();
  const [loadRoom] = roomsApi.useLazyGetRoomByIdQuery();
  const latestDraft = useRef({ slots, onChange });
  const defaultRoom = useRef<{ id: string; roomName: string } | null>(null);

  useEffect(() => {
    latestDraft.current = { slots, onChange };
  }, [onChange, slots]);

  useEffect(() => {
    defaultRoom.current = null;
    if (skip) return undefined;

    let active = true;
    const resolveDefault = async () => {
      try {
        const division = await loadDivision(divisionId).unwrap();
        if (!active || !division.roomId) return;

        const room = await loadRoom(division.roomId).unwrap();
        if (!active || room.id !== division.roomId) return;

        defaultRoom.current = room;
        const draft = latestDraft.current;
        const updatedSlots = applyDivisionRoomDefaults(draft.slots, room);
        if (updatedSlots !== draft.slots) draft.onChange(updatedSlots);
      } catch {
        if (active) defaultRoom.current = null;
      }
    };
    resolveDefault();

    return () => {
      active = false;
      defaultRoom.current = null;
    };
  }, [divisionId, loadDivision, loadRoom, skip]);

  useEffect(() => {
    if (skip || !defaultRoom.current) return;
    const updatedSlots = applyDivisionRoomDefaults(slots, defaultRoom.current);
    if (updatedSlots !== slots) onChange(updatedSlots);
  }, [onChange, skip, slots]);
}
