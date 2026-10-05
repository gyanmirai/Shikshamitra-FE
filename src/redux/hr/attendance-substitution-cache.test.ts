import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { substitutionManagementApi } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { attendanceApi } from './attendanceApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('refreshes academic substitute suggestions after HR saves a teacher absence', async () => {
  let absent = false;
  let reads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/substitutions/suggested-teachers', () => {
      reads += 1;
      return HttpResponse.json(
        absent ? [] : [{ teacherId: 'teacher-1', teacherName: 'Available Teacher' }]
      );
    }),
    http.post('*/api/hr/attendance/take-attendance/day/save', () => {
      absent = true;
      return HttpResponse.json({ upsertedCount: 1 });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const args = { date: '2026-10-05T00:00:00+05:30', startTime: '10:30', endTime: '11:30' };
  const endpoint = substitutionManagementApi.endpoints.getSuggestedTeachersByContext;
  const subscription = store.dispatch(endpoint.initiate(args));
  try {
    expect(await subscription.unwrap()).toHaveLength(1);
    await store
      .dispatch(
        attendanceApi.endpoints.saveDayAttendance.initiate({
          attendanceDate: '2026-10-05',
          entries: [{ employeeId: 'teacher-1', statusWire: 'ABSENT' }],
        })
      )
      .unwrap();
    await waitFor(() => {
      expect(reads).toBe(2);
      expect(endpoint.select(args)(store.getState()).data).toEqual([]);
    });
  } finally {
    subscription.unsubscribe();
    store.dispatch(api.util.resetApiState());
  }
});
