import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { substitutionManagementApi } from './substitutionManagementApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('refreshes substitute suggestions after a teacher is marked unavailable', async () => {
  let unavailable = false;
  let suggestionRequests = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/substitutions/suggested-teachers', () => {
      suggestionRequests += 1;
      return HttpResponse.json(unavailable ? [] : [{ teacherId: 'teacher-1', teacherName: 'Dharmik' }]);
    }),
    http.post('*/api/academics/timetable/teacher-availability', () => {
      unavailable = true;
      return HttpResponse.json({ id: 'availability-1' });
    })
  );

  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  const args = { date: '2026-09-25T00:00:00+05:30', startTime: '16:30', endTime: '17:30' };
  const suggestions = substitutionManagementApi.endpoints.getSuggestedTeachersByContext;
  const subscription = store.dispatch(suggestions.initiate(args));

  try {
    expect((await subscription.unwrap()).map((teacher) => teacher.teacherId)).toEqual(['teacher-1']);

    await store.dispatch(
      substitutionManagementApi.endpoints.createTeacherAvailability.initiate({
        teacherId: 'teacher-1',
        teacherName: 'Dharmik',
        availabilityDate: args.date,
        startTime: '12:30',
        endTime: '17:30',
        availabilityStatus: 0,
        sourceType: 0,
        reason: 'Unavailable',
        isFullDay: true,
        notifyLeadership: true,
      })
    ).unwrap();

    await waitFor(() => {
      expect(suggestionRequests).toBe(2);
      expect(suggestions.select(args)(store.getState()).data).toEqual([]);
    });
  } finally {
    subscription.unsubscribe();
  }
});

it('fetches current suggestions when the create dialog is reopened', async () => {
  let unavailable = false;
  let suggestionRequests = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/substitutions/suggested-teachers', () => {
      suggestionRequests += 1;
      return HttpResponse.json(unavailable ? [] : [{ teacherId: 'teacher-1', teacherName: 'Dharmik' }]);
    })
  );

  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  const args = { date: '2026-09-25T00:00:00+05:30', startTime: '16:30', endTime: '17:30' };
  const suggestions = substitutionManagementApi.endpoints.getSuggestedTeachersByContext;
  const first = store.dispatch(suggestions.initiate(args));
  expect((await first.unwrap()).map((teacher) => teacher.teacherId)).toEqual(['teacher-1']);
  first.unsubscribe();

  await waitFor(() => expect(suggestions.select(args)(store.getState()).status).toBe('uninitialized'));
  unavailable = true;
  const reopened = store.dispatch(suggestions.initiate(args));
  try {
    expect(await reopened.unwrap()).toEqual([]);
    expect(suggestionRequests).toBe(2);
  } finally {
    reopened.unsubscribe();
  }
});
