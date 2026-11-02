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
  const [loadDivision, division] = divisionApi.useLazyGetDivisionByIdQuery({
    refetchOnFocus: true,
  });
  const [loadRoom] = roomsApi.useLazyGetRoomByIdQuery();
  const latestDraft = useRef({ slots, onChange });
  const defaultRoom = useRef<{ id: string; roomName: string } | null>(null);

  useEffect(() => {
    latestDraft.current = { slots, onChange };
  }, [onChange, slots]);

  useEffect(() => {
    if (!skip) loadDivision(divisionId);
  }, [divisionId, loadDivision, skip]);

  useEffect(() => {
    defaultRoom.current = null;
    const roomId = division.currentData?.roomId;
    if (
      skip ||
      division.originalArgs !== divisionId ||
      division.isFetching ||
      division.isError ||
      !roomId
    )
      return undefined;

    let active = true;
    const resolveRoom = async () => {
      try {
        const room = await loadRoom(roomId).unwrap();
        if (!active || room.id !== roomId) return;
        defaultRoom.current = room;
        const draft = latestDraft.current;
        const updatedSlots = applyDivisionRoomDefaults(draft.slots, room);
        if (updatedSlots !== draft.slots) draft.onChange(updatedSlots);
      } catch {
        if (active) defaultRoom.current = null;
      }
    };
    resolveRoom();
    return () => {
      active = false;
      defaultRoom.current = null;
    };
  }, [
    division.currentData,
    division.isError,
    division.isFetching,
    division.originalArgs,
    divisionId,
    loadRoom,
    skip,
  ]);

  useEffect(() => {
    if (skip || !defaultRoom.current) return;
    const updatedSlots = applyDivisionRoomDefaults(slots, defaultRoom.current);
    if (updatedSlots !== slots) onChange(updatedSlots);
  }, [onChange, skip, slots]);
}
