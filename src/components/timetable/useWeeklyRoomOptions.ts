import type { WeeklyTimetableDay } from 'src/redux/academicAPI/timetableApi/weeklyRoomReadContracts';

import { useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetDivisionByIdQuery } from 'src/redux/division/divisionApi';
import { sortRoomOptions, createRoomOption } from 'src/components/room-selection/roomOptions';
import { useGetWeeklyTimetableRoomsQuery } from 'src/redux/academicAPI/timetableApi/roomAvailabilityApi';

import type { TimeSlot, DayOfWeek } from './types';

const DAY_NAMES: Record<DayOfWeek, WeeklyTimetableDay> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};
const withSeconds = (time: string) => (time.length === 5 ? `${time}:00` : time);

export function useWeeklyRoomOptions(
  day: DayOfWeek | undefined,
  slot: TimeSlot | null | undefined,
  standardId: string,
  divisionId: string
) {
  const rooms = useGetWeeklyTimetableRoomsQuery(
    day && slot
      ? {
          weeklyTimetableDay: DAY_NAMES[day],
          startTime: withSeconds(slot.startTime),
          endTime: withSeconds(slot.endTime),
          standardId,
          divisionId,
          includeOccupied: true,
        }
      : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const division = useGetDivisionByIdQuery(divisionId, {
    skip: !day || !divisionId,
    refetchOnMountOrArgChange: true,
  });
  const { currentData, isError } = rooms;

  // Stable options keep the dialog's division-room default effect from rerunning on each render.
  const roomList = useMemo(
    () => sortRoomOptions(isError ? [] : (currentData ?? []).map(createRoomOption)),
    [currentData, isError]
  );

  return {
    roomList,
    divisionRoomId: division.currentData?.roomId,
    isRoomsLoading:
      rooms.isLoading || rooms.isFetching || division.isLoading || division.isFetching,
    hasRoomError: isError,
    retryRooms: rooms.refetch,
  };
}
