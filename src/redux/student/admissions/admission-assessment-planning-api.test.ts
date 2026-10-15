import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionAssessmentPlanningApi } from './admission-assessment-planning-api';
import {
  assessmentPath,
  sessionResponse,
  createAssessmentTestStore,
} from './assessment-test-fixture';

import type { AssessmentSharedSessionInput } from './admission-assessment-types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createAssessmentTestStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createAssessmentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

const sharedSession: AssessmentSharedSessionInput = {
  name: 'Shared interviews',
  sessionType: 'individualInterview',
  roomId: 'room-1',
  interviewerId: 'employee-2',
  startsAt: '2026-10-20T04:30:00.000Z',
  endsAt: '2026-10-20T06:30:00.000Z',
  capacity: 6,
  location: 'Main / First / Interview room',
  slotDurationMinutes: 15,
  breakMinutes: 5,
  scopes: [
    { admissionOfferingId: 'offering-1', workflowStageDefinitionId: 'definition-1' },
    { admissionOfferingId: 'offering-2', workflowStageDefinitionId: 'definition-2' },
  ],
};

it('sends optional academic filters and multi-class CSV without forcing an Offering or Stage', async () => {
  let seen: URLSearchParams | undefined;
  mswServer.use(
    http.get(`${assessmentPath}/sessions/workbench`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json({ data: { totalCount: 1, items: [sessionResponse] } });
    })
  );
  const result = await store
    .dispatch(
      admissionAssessmentPlanningApi.endpoints.getAssessmentSessionWorkbench.initiate({
        academicYearId: 'year-1',
        standardIds: 'class-1,class-2',
        search: 'Main & East',
        skipCount: 50,
        maxResultCount: 25,
        includeCancelled: true,
      })
    )
    .unwrap();
  expect(Object.fromEntries(seen!)).toEqual({
    academicYearId: 'year-1',
    standardIds: 'class-1,class-2',
    search: 'Main & East',
    skipCount: '50',
    maxResultCount: '25',
    includeCancelled: 'true',
  });
  expect(result).toEqual({ totalCount: 1, items: [sessionResponse] });
});

it('keeps existing session identity and version in booking preview and unwraps proposed applicants independently from the table page', async () => {
  let body: unknown;
  const preview = {
    totalCount: 42,
    items: [],
    proposedBookings: [{ applicationId: 'app-1', stageInstanceId: 'stage-1' }],
    availableCount: 30,
    previewFingerprint: 'fingerprint',
  };
  mswServer.use(
    http.post(`${assessmentPath}/sessions/preview`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: preview });
    })
  );
  const input = {
    session: sharedSession,
    sessionId: 'session-1',
    sessionConcurrencyStamp: 'fresh-session-stamp',
    skipCount: 25,
    maxResultCount: 25,
    search: 'Sam',
  };
  const result = await store
    .dispatch(admissionAssessmentPlanningApi.endpoints.previewAssessmentSession.initiate(input))
    .unwrap();
  expect(body).toEqual(input);
  expect(result).toEqual(preview);
});

it('preserves the complete confirmation receipt and slot selection instead of reconstructing scope or time from the screen', async () => {
  let body: unknown;
  const input = {
    session: sharedSession,
    sessionId: 'existing-session',
    sessionConcurrencyStamp: 'session-version',
    previewFingerprint: 'verified-preview-fingerprint',
    idempotencyKey: 'confirmation-retry-key',
    bookings: [
      {
        applicationId: 'app-1',
        stageInstanceId: 'stage-1',
        concurrencyStamp: 'app-stamp-1',
        slotStartsAt: '2026-10-20T04:50:00Z',
      },
      {
        applicationId: 'app-2',
        stageInstanceId: 'stage-2',
        concurrencyStamp: 'app-stamp-2',
        slotStartsAt: null,
      },
    ],
  };
  mswServer.use(
    http.post(`${assessmentPath}/sessions/confirm`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { session: sessionResponse, bookedCount: 2 } });
    })
  );
  const result = await store
    .dispatch(admissionAssessmentPlanningApi.endpoints.confirmAssessmentSession.initiate(input))
    .unwrap();
  expect(body).toEqual(input);
  expect(result).toEqual({ session: sessionResponse, bookedCount: 2 });
});

it('refreshes the subscribed workbench and resources after a successful booking confirmation', async () => {
  let booked = false;
  let workbenchReads = 0;
  let resourceReads = 0;
  mswServer.use(
    http.get(`${assessmentPath}/sessions/workbench`, () => {
      workbenchReads += 1;
      return HttpResponse.json({
        data: { totalCount: 1, items: [{ ...sessionResponse, bookedCount: booked ? 2 : 0 }] },
      });
    }),
    http.get(`${assessmentPath}/session-resources`, () => {
      resourceReads += 1;
      return HttpResponse.json({ rooms: [], interviewers: [] });
    }),
    http.post(`${assessmentPath}/sessions/confirm`, () => {
      booked = true;
      return HttpResponse.json({ session: { ...sessionResponse, bookedCount: 2 }, bookedCount: 2 });
    })
  );
  const query = { skipCount: 0, maxResultCount: 25 };
  await store
    .dispatch(
      admissionAssessmentPlanningApi.endpoints.getAssessmentSessionWorkbench.initiate(query)
    )
    .unwrap();
  await store
    .dispatch(admissionAssessmentPlanningApi.endpoints.getAssessmentSessionResources.initiate())
    .unwrap();
  await store
    .dispatch(
      admissionAssessmentPlanningApi.endpoints.confirmAssessmentSession.initiate({
        session: sharedSession,
        idempotencyKey: 'key',
        previewFingerprint: 'fingerprint',
        bookings: [],
      })
    )
    .unwrap();
  await waitFor(() => {
    expect(
      admissionAssessmentPlanningApi.endpoints.getAssessmentSessionWorkbench.select(query)(
        store.getState()
      ).data?.items[0].bookedCount
    ).toBe(2);
    expect(workbenchReads).toBeGreaterThanOrEqual(2);
    expect(resourceReads).toBeGreaterThanOrEqual(2);
  });
});

it('loads a session detail and available slots through their owning endpoints with wrapped or raw responses', async () => {
  const slots = [{ startsAt: '2026-10-20T04:30:00Z', endsAt: '2026-10-20T04:45:00Z' }];
  mswServer.use(
    http.get(`${assessmentPath}/sessions/session-1`, () =>
      HttpResponse.json({ data: sessionResponse })
    ),
    http.get(`${assessmentPath}/sessions/session-1/slots`, () => HttpResponse.json(slots))
  );
  expect(
    await store
      .dispatch(
        admissionAssessmentPlanningApi.endpoints.getAssessmentSessionById.initiate('session-1')
      )
      .unwrap()
  ).toEqual(sessionResponse);
  expect(
    await store
      .dispatch(
        admissionAssessmentPlanningApi.endpoints.getAssessmentSessionSlots.initiate('session-1')
      )
      .unwrap()
  ).toEqual(slots);
});

it('uses a minimal searchable staff lookup without employee-profile or room-management parameters', async () => {
  let seen: URLSearchParams | undefined;
  mswServer.use(
    http.get(`${assessmentPath}/interviewers`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json({ data: [{ id: 'employee-72', name: 'Asha Sharma' }] });
    })
  );
  expect(
    await store
      .dispatch(
        admissionAssessmentPlanningApi.endpoints.getAssessmentInterviewers.initiate('Asha & Sharma')
      )
      .unwrap()
  ).toEqual([{ id: 'employee-72', name: 'Asha Sharma' }]);
  expect(Object.fromEntries(seen!)).toEqual({ search: 'Asha & Sharma' });
});

it('sends session update and cancellation versions with the explicit pending-booking decision', async () => {
  const seen: unknown[] = [];
  mswServer.use(
    http.put(`${assessmentPath}/sessions/session-1`, async ({ request }) => {
      seen.push(await request.json());
      return HttpResponse.json({ data: sessionResponse });
    }),
    http.post(`${assessmentPath}/sessions/session-1/cancel`, async ({ request }) => {
      seen.push(await request.json());
      return HttpResponse.json({ ...sessionResponse, isCancelled: true });
    })
  );
  const update = { ...sharedSession, concurrencyStamp: 'edit-version' };
  await store
    .dispatch(
      admissionAssessmentPlanningApi.endpoints.updateSharedAssessmentSession.initiate({
        id: 'session-1',
        body: update,
      })
    )
    .unwrap();
  const result = await store
    .dispatch(
      admissionAssessmentPlanningApi.endpoints.cancelSharedAssessmentSession.initiate({
        id: 'session-1',
        concurrencyStamp: 'cancel-version',
        cancelPendingBookings: true,
        notes: 'Rescheduling this batch',
      })
    )
    .unwrap();
  expect(seen).toEqual([
    update,
    {
      concurrencyStamp: 'cancel-version',
      cancelPendingBookings: true,
      notes: 'Rescheduling this batch',
    },
  ]);
  expect(result.isCancelled).toBe(true);
});
