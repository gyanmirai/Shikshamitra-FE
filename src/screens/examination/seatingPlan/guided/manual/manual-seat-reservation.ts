import type { SeatingRoomLayout, SeatingSeat } from '../../types';

export function toggleSeatReservationInRooms(
  rooms: SeatingRoomLayout[],
  roomId: string,
  targetSeat: SeatingSeat
): SeatingRoomLayout[] {
  const room = rooms.find((item) => item.roomId === roomId);
  const seat = room?.seats.find((item) => item.seatId === targetSeat.seatId);

  if (!seat || seat.isDisabled || seat.isExternalExamOccupied) return rooms;

  return rooms.map((item) =>
    item.roomId === roomId
      ? {
          ...item,
          seats: item.seats.map((itemSeat) =>
            itemSeat.seatId === targetSeat.seatId
              ? { ...itemSeat, isReserved: !itemSeat.isReserved }
              : itemSeat
          ),
        }
      : item
  );
}
