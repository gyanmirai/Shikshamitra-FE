import { useMemo } from 'react';

import type { SeatingSeat, SeatingAssignment, SeatingRoomLayout } from '../../types';

export function useRoomStudioLayout(room: SeatingRoomLayout, assignments: SeatingAssignment[]) {
  /**
   * Memoization Justification:
   * - A room can contain hundreds of seats; indexing benches and occupants is independent
   *   of canvas zoom and the per-seat drag updates from dnd-kit.
   */
  return useMemo(() => {
    const grouped = new Map<string, SeatingSeat[]>();
    room.seats.forEach((seat) => {
      const key = `${seat.row}-${seat.column}`;
      grouped.set(key, [...(grouped.get(key) ?? []), seat]);
    });
    const benches = [...grouped.values()].map((seats) =>
      seats.sort((a, b) => a.seatNumber - b.seatNumber)
    );
    return {
      benches,
      assignmentBySeat: new Map(
        assignments.filter((item) => item.roomId === room.roomId).map((item) => [item.seatId, item])
      ),
      columns: Math.max(room.columns, ...room.seats.map((seat) => seat.column + 1), 1),
      benchWidth: Math.max(
        180,
        ...benches.map((seats) => seats.length * 88 + (seats.length - 1) * 8)
      ),
    };
  }, [room, assignments]);
}
