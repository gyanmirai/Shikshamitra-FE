import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionInquiriesApi } from './admission-inquiries-api';
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

it('sends an audited correction and refreshes finalization checks without changing approval or number', async () => {
  let corrected = false;
  let body: unknown;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries/inquiry', () =>
      HttpResponse.json({
        data: {
          id: 'inquiry',
          email: corrected ? 'corrected@example.com' : 'original@example.com',
        },
      })
    ),
    http.get('*/api/student/enrollment/admissions/applications/app', () =>
      HttpResponse.json({
        data: {
          id: 'app',
          applicationNumber: 'APP-46',
          status: 6,
          concurrencyStamp: corrected ? 'next' : 'current',
        },
      })
    ),
    http.get('*/api/student/enrollment/admissions/applications/app/finalization-preview', () =>
      HttpResponse.json({
        data: {
          applicationId: 'app',
          isReady: corrected,
          items: [],
        },
      })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/app/form/corrections',
      async ({ request }) => {
        body = await request.json();
        corrected = true;
        return HttpResponse.json({
          data: {
            formInstanceId: 'form',
            status: 1,
            canCorrectForm: true,
            values: [{ fieldCode: 'DOB', valueJson: '"2018-01-01"' }],
          },
        });
      }
    )
  );
  const application = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('app')
  );
  const preview = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionFinalizationPreview.initiate('app')
  );
  const inquiry = store.dispatch(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('inquiry')
  );
  await Promise.all([application.unwrap(), preview.unwrap(), inquiry.unwrap()]);
  const input = {
    id: 'app',
    concurrencyStamp: 'current',
    reason: 'Correct birth date',
    idempotencyKey: 'correction-1',
    values: [{ fieldCode: 'DOB', valueJson: '"2018-01-01"' }],
  };
  const result = await store
    .dispatch(admissionApplicationsApi.endpoints.correctAdmissionApplicationForm.initiate(input))
    .unwrap();
  const { id: _id, ...expected } = input;
  expect(body).toEqual(expected);
  expect(result.status).toBe(1);
  await waitFor(() =>
    expect(
      admissionApplicationsApi.endpoints.getAdmissionFinalizationPreview.select('app')(
        store.getState()
      ).data?.isReady
    ).toBe(true)
  );
  expect(
    admissionApplicationsApi.endpoints.getAdmissionApplication.select('app')(store.getState()).data
  ).toMatchObject({ applicationNumber: 'APP-46', status: 6 });
  await waitFor(() =>
    expect(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.select('inquiry')(store.getState()).data
        ?.email
    ).toBe('corrected@example.com')
  );
  application.unsubscribe();
  preview.unsubscribe();
  inquiry.unsubscribe();
});
