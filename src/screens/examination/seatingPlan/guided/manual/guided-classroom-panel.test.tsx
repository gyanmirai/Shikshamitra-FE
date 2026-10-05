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
  it('allows inspecting automatic seats without assignment, removal or reservation actions', () => {
    const assign = vi.fn();
    const remove = vi.fn();
    const reserve = vi.fn();
    const student = { studentId: 'student-1', studentName: 'Preview Student', rollNo: 7 };
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <DndContext>
          <GuidedClassroomPanel
            rooms={initialRooms}
            students={[student]}
            assignments={[
              {
                studentId: student.studentId,
                roomId: 'room-1',
                seatId: 'room-1:1',
                seatNumber: 1,
                assignedBy: 'auto',
              },
            ]}
            activeRoomId="room-1"
            isReadOnly
            selectedStudent={student}
            readOnlyDescription="Automatic seating preview is read-only."
            onSwitchRoom={vi.fn()}
            onAssign={assign}
            onUnassign={remove}
            onToggleReserve={reserve}
          />
        </DndContext>
      </ThemeProvider>
    );
    expect(screen.getByText('Preview Student')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Seat .* actions/ })).not.toBeInTheDocument();
    const emptySeat = screen.getByRole('img', { name: 'Seat 2, empty' });
    expect(emptySeat).toHaveAttribute('tabindex', '-1');
    fireEvent.click(emptySeat);
    fireEvent.keyDown(emptySeat, { key: 'Enter' });
    expect(assign).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(reserve).not.toHaveBeenCalled();
    expect(screen.getByText('Automatic seating preview is read-only.')).toBeInTheDocument();
  });

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
