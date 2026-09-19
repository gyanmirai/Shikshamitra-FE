import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { subjectAssignmentsApi } from './subject-assignment-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

describe('subjectAssignmentsApi.getSubjectScheduleBreakdown', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });

  afterEach(() => clearCachedAuthSession());

  it('gets the lecture breakdown for the selected assignment', async () => {
    const requestedUrls: string[] = [];
    const response = {
      data: {
        subjectAssignmentId: 'assignment-id',
        standardId: 'standard-id',
        allocatedPeriodsPerWeek: 6,
        scheduledPeriods: 1,
        divisionCount: 1,
        lectures: [],
      },
    };

    mswServer.use(
      http.get(
        '*/api/academics/curriculum/subject-assignments/:assignmentId/schedule-breakdown',
        ({ request }) => {
          requestedUrls.push(request.url);
          return HttpResponse.json(response);
        }
      )
    );

    const store = createStore();
    const result = await store
      .dispatch(
        subjectAssignmentsApi.endpoints.getSubjectScheduleBreakdown.initiate({
          assignmentId: 'assignment-id',
        })
      )
      .unwrap();

    expect(requestedUrls[0]).toContain(
      '/api/academics/curriculum/subject-assignments/assignment-id/schedule-breakdown'
    );
    expect(result).toEqual(response);
    store.dispatch(api.util.resetApiState());
  });
});
