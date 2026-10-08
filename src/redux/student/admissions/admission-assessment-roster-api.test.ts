import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionAssessmentsApi } from './admission-assessments-api';
import { admissionAssessmentRosterApi } from './admission-assessment-roster-api';
import {
  stageKey,
  stagePath,
  sessionKey,
  assessmentPath,
  assessmentResponse,
  createAssessmentTestStore,
} from './assessment-test-fixture';

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

it('sends bounded scope/session/search/queue/page to the roster and refreshes after booking', async () => {
  const seen: URLSearchParams[] = [];
  let booked = false;
  const query = {
    ...sessionKey,
    sessionId: 'session-1',
    search: 'Sam & Ali',
    queue: 'review' as const,
    sorting: 'applicantName asc',
    skipCount: 25,
    maxResultCount: 25,
  };
  mswServer.use(
    http.get(`${assessmentPath}/applicants`, ({ request }) => {
      seen.push(new URL(request.url).searchParams);
      return HttpResponse.json({
        data: {
          totalCount: booked ? 0 : 1,
          items: [],
          counts: {
            all: 1,
            toBook: booked ? 0 : 1,
            attendance: booked ? 1 : 0,
            result: 0,
            review: 0,
            ready: 0,
            attention: 0,
            completed: 0,
          },
        },
      });
    }),
    http.post(`${stagePath}/attempts`, () => {
      booked = true;
      return HttpResponse.json(assessmentResponse);
    })
  );
  await store
    .dispatch(admissionAssessmentRosterApi.endpoints.getAssessmentApplicants.initiate(query))
    .unwrap();
  expect(Object.fromEntries(seen[0])).toEqual({ ...query, skipCount: '25', maxResultCount: '25' });
  await store
    .dispatch(
      admissionAssessmentsApi.endpoints.bookAssessmentAttempt.initiate({
        ...stageKey,
        sessionId: 'session-1',
        concurrencyStamp: 'stamp',
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionAssessmentRosterApi.endpoints.getAssessmentApplicants.select(query)(store.getState())
        .data?.counts.attendance
    ).toBe(1)
  );
});
