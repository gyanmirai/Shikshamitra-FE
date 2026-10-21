import { http, HttpResponse } from 'msw';
import { DndContext } from '@dnd-kit/core';
import { mswServer } from 'src/test/mswServer';
import { _api as iconifyApi } from '@iconify/react';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SeatLayoutCanvas from './SeatLayoutCanvas';
import { toSeatingRoomLayout } from '../../utils/room-layout';

beforeEach(() => {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
});

it('renders only physical seats, shows zero seats for missing benches, and retains the occupant at its saved number', () => {
  const room = toSeatingRoomLayout(
    { room: { columnRows: [1, 3], benchCapacity: 1, capacity: 4 } },
    'room-a',
    'A101'
  );
  const student = { studentId: 'student-a', studentName: 'Assigned student', rollNo: 1 };
  const { container } = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DndContext>
        <SeatLayoutCanvas
          room={room}
          assignments={[
            {
              studentId: student.studentId,
              roomId: room.roomId,
              seatId: 'room-a:4',
              seatNumber: 4,
              assignedBy: 'manual',
            },
          ]}
          studentsById={new Map([[student.studentId, student]])}
          conflictSeatIds={new Set()}
          onAssign={vi.fn()}
          onUnassign={vi.fn()}
          isReadOnly
        />
      </DndContext>
    </ThemeProvider>
  );
  expect(container.querySelectorAll('[data-seat-id]')).toHaveLength(4);
  expect(screen.getAllByText('No bench')).toHaveLength(2);
  expect(screen.getAllByText('0 seats')).toHaveLength(2);
  expect(screen.getByText('Assigned student')).toBeInTheDocument();
  expect(container.querySelector('[data-seat-id="room-a:4"]')).toHaveTextContent(
    'Assigned student'
  );
});
