import type { SeatingSeat, SeatingRoomLayout } from '../types';

export interface SeatingRoomSource {
  capacity?: number;
  totalBenches?: number;
  benchesPerRow?: number;
  benchesPerColumn?: number;
  benchCapacity?: number;
  columnRows?: number[] | null;
  boardPosition?: string;
  entrancePosition?: string;
  disabledSeatNumbersCsv?: string;
  reservedSeatNumbersCsv?: string;
  accessibleSeatNumbersCsv?: string;
  aisleAfterColumnsCsv?: string;
}

function parseIntCsv(csv?: string | null): Set<number> {
  return new Set(
    (csv ?? '')
      .split(',')
      .map((value) => parseInt(value.trim(), 10))
      .filter(Number.isFinite)
  );
}

export function toSeatingRoomLayout(
  response: { roomId?: string; room?: SeatingRoomSource } | undefined,
  roomId: string,
  roomName: string
): SeatingRoomLayout {
  const source = response?.room;
  const columnRows = source?.columnRows?.length ? [...source.columnRows] : undefined;
  const rawBenchCapacity = source?.benchCapacity ?? 1;
  const benchCapacity = Math.max(1, rawBenchCapacity);
  const totalBenches = source?.totalBenches ?? 0;
  const capacity = columnRows
    ? columnRows.reduce((total, rows) => total + rows, 0) * benchCapacity
    : Math.max(0, totalBenches > 0 ? totalBenches * rawBenchCapacity : (source?.capacity ?? 0));
  const columns =
    columnRows?.length ?? Math.max(capacity > 0 ? 1 : 0, source?.benchesPerColumn ?? 0);
  const rows = columnRows
    ? Math.max(...columnRows)
    : Math.max(
        source?.benchesPerRow ?? 0,
        columns ? Math.ceil(capacity / (columns * benchCapacity)) : 0
      );
  const disabled = parseIntCsv(source?.disabledSeatNumbersCsv);
  const reserved = parseIntCsv(source?.reservedSeatNumbersCsv);
  const accessible = parseIntCsv(source?.accessibleSeatNumbersCsv);
  const seats: SeatingSeat[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const seatsOnBench = !columnRows || row < columnRows[column] ? benchCapacity : 0;
      for (let position = 0; position < seatsOnBench && seats.length < capacity; position += 1) {
        const seatNumber = seats.length + 1;
        seats.push({
          seatId: `${roomId}:${seatNumber}`,
          seatNumber,
          row,
          column,
          isDisabled: disabled.has(seatNumber),
          isReserved: reserved.has(seatNumber),
          isAccessible: accessible.has(seatNumber),
        });
      }
    }
  }
  return {
    roomId,
    roomName,
    capacity,
    rows,
    columns,
    benchCapacity,
    columnRows,
    seats,
    boardPosition: source?.boardPosition,
    entrancePosition: source?.entrancePosition,
    aisleAfterColumns: [...parseIntCsv(source?.aisleAfterColumnsCsv)],
  };
}

export function getUsableSeatCount(room: SeatingRoomLayout): number {
  return room.seats.filter((seat) => !seat.isDisabled && !seat.isReserved).length;
}
