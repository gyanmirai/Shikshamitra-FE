import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';
import { admissionFeeCollectionApi } from 'src/redux/student/admissions/admission-fee-collection-api';

import { studentRecordTransitionsApi } from './student-record-transitions-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createDocumentTestStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(
    http.get('*/api/auth/session', () =>
      HttpResponse.json({ accessToken: 'synthetic-proration-cache-token' })
    )
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('refreshes the shared Finance summary after applied withdrawal while preview performs no extra financial read', async () => {
  let reads = 0;
  let amount = 8000;
  mswServer.use(
    http.get('*/api/fee-collections/admission-applications/application-1/summary', () => {
      reads += 1;
      return HttpResponse.json({
        data: { applicationId: 'application-1', totalAmount: amount, feeHeads: [], receipts: [] },
      });
    }),
    http.post('*/api/students/records/transitions/preview', () =>
      HttpResponse.json({ data: { items: [], canSubmit: true } })
    ),
    http.post('*/api/students/records/transitions/batches', () => {
      amount = 5000;
      return HttpResponse.json({
        data: {
          batchId: 'batch-1',
          items: [{ id: 'withdrawal-1', outcome: 'Withdraw', status: 'Applied' }],
          exceptions: [],
        },
      });
    })
  );
  const subscription = store.dispatch(
    admissionFeeCollectionApi.endpoints.getAdmissionFeeCollectionSummary.initiate('application-1')
  );
  expect((await subscription.unwrap()).totalAmount).toBe(8000);
  await store
    .dispatch(
      studentRecordTransitionsApi.endpoints.previewStudentRecordTransitions.initiate({
        academicYearId: 'year-1',
        items: [],
      })
    )
    .unwrap();
  expect(reads).toBe(1);
  await store
    .dispatch(
      studentRecordTransitionsApi.endpoints.submitStudentRecordTransitions.initiate({
        academicYearId: 'year-1',
        idempotencyKey: 'withdrawal-test',
        items: [],
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionFeeCollectionApi.endpoints.getAdmissionFeeCollectionSummary.select('application-1')(
        store.getState()
      ).data?.totalAmount
    ).toBe(5000)
  );
  expect(reads).toBe(2);
  subscription.unsubscribe();
});
