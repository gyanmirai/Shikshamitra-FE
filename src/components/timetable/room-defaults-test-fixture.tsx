import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalState from 'src/redux/globalState/globalSlice';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';

export const divisionUrl = '*/api/app/division/:id';
export const roomsUrl = '*/api/app/room';
export const rooms = [
  { id: 'room-a', roomName: 'A101', buildingName: 'Main', floorName: 'First' },
  { id: 'room-b', roomName: 'B101', buildingName: 'Main', floorName: 'First' },
  { id: 'laboratory', roomName: 'Science Lab', buildingName: 'Science', floorName: 'Ground' },
];
export const subject: SlotSubject = {
  subjectId: 'science',
  subjectAssignmentId: 'science-allocation',
  name: 'Science',
  color: '#123456',
};
export function makeRoomSlots(subjects = [subject]): Record<DayOfWeek, TimeSlot[]> {
  return {
    MONDAY: [
      {
        id: 'period-one',
        day: 'MONDAY',
        sequence: 1,
        startTime: '09:00',
        endTime: '10:00',
        type: 'LECTURE',
        subjects,
      },
    ],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
  };
}
export function prepareRoomNetwork() {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(roomsUrl, () => HttpResponse.json({ items: rooms })),
    http.get(`${roomsUrl}/:id`, ({ params }) => {
      const room = rooms.find((item) => item.id === params.id);
      return room ? HttpResponse.json(room) : HttpResponse.json({}, { status: 404 });
    }),
    http.get(divisionUrl, ({ params }) =>
      HttpResponse.json({
        id: params.id,
        roomId: params.id === 'division-b' ? 'room-b' : 'room-a',
      })
    ),
    http.get('*/api/academics/timetable/room-availability', () =>
      HttpResponse.json(rooms.map((room) => ({ ...room, roomId: room.id, status: 'available' })))
    )
  );
}
export function createRoomTestWrapper() {
  const store = configureStore({
    reducer: { confirmPopup, globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return { store, wrapper: Wrapper };
}

export function deferredResponse() {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release };
}
