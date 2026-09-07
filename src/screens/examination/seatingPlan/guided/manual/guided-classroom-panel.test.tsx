import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { GuidedClassroomPanel } from './guided-classroom-panel';
import { toggleSeatReservationInRooms } from './manual-seat-reservation';

import type { SeatingRoomLayout } from '../../types';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const initialRooms: SeatingRoomLayout[] = [
  {
    roomId: 'room-1',
    roomName: 'B106',
    capacity: 2,
    rows: 1,
    columns: 1,
    benchCapacity: 2,
    seats: [
      { seatId: 'room-1:1', seatNumber: 1, row: 0, column: 0 },
      { seatId: 'room-1:2', seatNumber: 2, row: 0, column: 0 },
    ],
  },
];

function ReservationHarness() {
  const [rooms, setRooms] = useState(initialRooms);

  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <GuidedClassroomPanel
          rooms={rooms}
          assignments={[]}
          students={[]}
          activeRoomId="room-1"
          isReadOnly={false}
          onSwitchRoom={vi.fn()}
          onAssign={vi.fn()}
          onUnassign={vi.fn()}
          onToggleReserve={(roomId, seat) =>
            setRooms((current) => toggleSeatReservationInRooms(current, roomId, seat))
          }
        />
      </DndContext>
    </ThemeProvider>
  );
}

describe('GuidedClassroomPanel seat reservations', () => {
  it('reserves and unreserves an empty seat while updating usable capacity', () => {
    render(<ReservationHarness />);

    expect(screen.getByRole('button', { name: 'B106 — 0/2' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Seat 2 actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Reserve Seat' }));

    expect(screen.getByRole('button', { name: 'Seat 2, reserved' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'B106 — 0/1' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Seat 2 actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Unreserve Seat' }));

    expect(screen.getByRole('button', { name: 'Seat 2, empty' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'B106 — 0/2' })).toBeTruthy();
  });
});
