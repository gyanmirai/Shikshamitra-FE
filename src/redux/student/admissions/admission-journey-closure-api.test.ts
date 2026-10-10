import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionPipelineApi } from './admission-pipeline-api';
import { admissionInquiriesApi } from './admission-inquiries-api';
import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationsApi } from './admission-applications-api';
import { admissionAssessmentSessionsApi } from './admission-assessment-sessions-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createDocumentTestStore>;
const pipelineInput = { academicYearId: 'year', skipCount: 0, maxResultCount: 25 };
const sessionsInput = { admissionOfferingId: 'offering', workflowStageDefinitionId: 'assessment' };
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('posts a reason and stamp, refreshes the closed case and active queue, and releases cached session occupancy', async () => {
  let ended = false;
  let body: unknown;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/application', () =>
      HttpResponse.json({
        data: { id: 'application', status: ended ? 2 : 0, canEndJourney: !ended },
      })
    ),
    http.get('*/api/student/enrollment/admissions/applications/pipeline', () =>
      HttpResponse.json({
        data: { totalCount: ended ? 0 : 1, items: ended ? [] : [{ id: 'application' }] },
      })
    ),
    http.get('*/api/student/enrollment/admissions/assessments/sessions', () =>
      HttpResponse.json({ data: [{ id: 'session', bookedCount: ended ? 0 : 1 }] })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application/end-journey',
      async ({ request }) => {
        body = await request.json();
        ended = true;
        return HttpResponse.json({ data: { id: 'application', status: 2, canEndJourney: false } });
      }
    )
  );
  const queries = [
    store.dispatch(
      admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('application')
    ),
    store.dispatch(admissionPipelineApi.endpoints.getAdmissionPipeline.initiate(pipelineInput)),
    store.dispatch(
      admissionAssessmentSessionsApi.endpoints.getAssessmentSessions.initiate(sessionsInput)
    ),
  ];
  await Promise.all(queries.map((query) => query.unwrap()));
  const result = await store
    .dispatch(
      admissionApplicationsApi.endpoints.endAdmissionApplicationJourney.initiate({
        id: 'application',
        input: { reason: 'Parent chose another school', concurrencyStamp: 'stamp' },
      })
    )
    .unwrap();
  expect(body).toEqual({ reason: 'Parent chose another school', concurrencyStamp: 'stamp' });
  expect(result.status).toBe(2);
  await waitFor(() => {
    expect(
      admissionApplicationsApi.endpoints.getAdmissionApplication.select('application')(
        store.getState()
      ).data?.canEndJourney
    ).toBe(false);
    expect(
      admissionPipelineApi.endpoints.getAdmissionPipeline.select(pipelineInput)(store.getState())
        .data?.items
    ).toEqual([]);
    expect(
      admissionAssessmentSessionsApi.endpoints.getAssessmentSessions.select(sessionsInput)(
        store.getState()
      ).data?.[0].bookedCount
    ).toBe(0);
  });
  queries.forEach((query) => query.unsubscribe());
});

it('preserves cached application data on a rejected closure without needless refetch', async () => {
  let reads = 0;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/application', () => {
      reads += 1;
      return HttpResponse.json({ data: { id: 'application', status: 0, canEndJourney: true } });
    }),
    http.post('*/api/student/enrollment/admissions/applications/application/end-journey', () =>
      HttpResponse.json({ detail: 'Application changed. Refresh and try again.' }, { status: 409 })
    )
  );
  const query = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('application')
  );
  await query.unwrap();
  await expect(
    store
      .dispatch(
        admissionApplicationsApi.endpoints.endAdmissionApplicationJourney.initiate({
          id: 'application',
          input: { reason: 'Parent withdrew', concurrencyStamp: 'stale' },
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  expect(
    admissionApplicationsApi.endpoints.getAdmissionApplication.select('application')(
      store.getState()
    ).data?.status
  ).toBe(0);
  expect(reads).toBe(1);
  query.unsubscribe();
});

it('refreshes inquiry and Pipeline queues after handoff while preserving the linked inquiry record', async () => {
  let transferred = false;
  const inquiryInput = { isTransferred: false, skipCount: 0, maxResultCount: 25 };
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries', ({ request }) => {
      expect(new URL(request.url).searchParams.get('isTransferred')).toBe('false');
      return HttpResponse.json({
        data: { totalCount: transferred ? 0 : 1, items: transferred ? [] : [{ id: 'inquiry' }] },
      });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/inquiry', () =>
      HttpResponse.json({
        data: { id: 'inquiry', applicationId: transferred ? 'application' : null },
      })
    ),
    http.get('*/api/student/enrollment/admissions/applications/pipeline', () =>
      HttpResponse.json({
        data: {
          totalCount: transferred ? 1 : 0,
          items: transferred ? [{ id: 'application' }] : [],
        },
      })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applicants/applicant/applications/start',
      ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('inquiryId')).toBe('inquiry');
        expect(params.get('offeringId')).toBe('offering');
        transferred = true;
        return HttpResponse.json({ data: { id: 'application', inquiryId: 'inquiry', status: 0 } });
      }
    )
  );
  const queries = [
    store.dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiries.initiate(inquiryInput)),
    store.dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('inquiry')),
    store.dispatch(admissionPipelineApi.endpoints.getAdmissionPipeline.initiate(pipelineInput)),
  ];
  await Promise.all(queries.map((query) => query.unwrap()));
  await store
    .dispatch(
      admissionApplicationsApi.endpoints.startAdmissionApplication.initiate({
        applicantId: 'applicant',
        offeringId: 'offering',
        inquiryId: 'inquiry',
      })
    )
    .unwrap();
  await waitFor(() => {
    expect(
      admissionInquiriesApi.endpoints.getAdmissionInquiries.select(inquiryInput)(store.getState())
        .data?.items
    ).toEqual([]);
    expect(
      admissionPipelineApi.endpoints.getAdmissionPipeline.select(pipelineInput)(store.getState())
        .data?.items
    ).toEqual([{ id: 'application' }]);
    expect(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.select('inquiry')(store.getState()).data
        ?.applicationId
    ).toBe('application');
  });
  queries.forEach((query) => query.unsubscribe());
});
