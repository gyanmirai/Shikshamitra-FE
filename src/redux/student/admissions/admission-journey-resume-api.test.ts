import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionPipelineApi } from './admission-pipeline-api';
import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationsApi } from './admission-applications-api';

let store: ReturnType<typeof createDocumentTestStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('resumes the same application with a closure-bound command and refreshes the active queue', async () => {
  let resumed = false;
  let body: unknown;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/application', () =>
      HttpResponse.json({
        data: { id: 'application', applicationNumber: 'APP-35', status: resumed ? 1 : 2 },
      })
    ),
    http.get('*/api/student/enrollment/admissions/applications/pipeline', () =>
      HttpResponse.json({
        data: { totalCount: resumed ? 1 : 0, items: resumed ? [{ id: 'application' }] : [] },
      })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application/resume-journey',
      async ({ request }) => {
        body = await request.json();
        resumed = true;
        return HttpResponse.json({
          data: { id: 'application', applicationNumber: 'APP-35', status: 1 },
        });
      }
    )
  );
  const application = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('application')
  );
  const pipeline = store.dispatch(
    admissionPipelineApi.endpoints.getAdmissionPipeline.initiate({
      academicYearId: 'year',
      skipCount: 0,
      maxResultCount: 25,
    })
  );
  await Promise.all([application.unwrap(), pipeline.unwrap()]);
  const input = {
    reason: 'Parent returned',
    concurrencyStamp: 'current',
    closureHistoryId: 'closure',
    idempotencyKey: 'resume-1',
  };
  const result = await store
    .dispatch(
      admissionApplicationsApi.endpoints.resumeAdmissionApplicationJourney.initiate({
        id: 'application',
        input,
      })
    )
    .unwrap();
  expect(body).toEqual(input);
  expect(result.applicationNumber).toBe('APP-35');
  await waitFor(() =>
    expect(
      admissionPipelineApi.endpoints.getAdmissionPipeline.select({
        academicYearId: 'year',
        skipCount: 0,
        maxResultCount: 25,
      })(store.getState()).data?.totalCount
    ).toBe(1)
  );
  application.unsubscribe();
  pipeline.unsubscribe();
});
