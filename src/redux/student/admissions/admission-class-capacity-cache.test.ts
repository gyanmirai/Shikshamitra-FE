import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionOfferingsApi } from './admission-offerings-api';
import { admissionApplicationsApi } from './admission-applications-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

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

it('refreshes class seats after offer acceptance and direct admission finalization', async () => {
  let occupied = 0;
  const capacityPath = '*/api/student/enrollment/admissions/offerings/offering-1/class-capacity';
  mswServer.use(
    http.get(capacityPath, () =>
      HttpResponse.json({
        data: {
          admissionCycleId: 'cycle-1',
          academicYearId: 'year-1',
          standardId: 'class-5',
          rooms: [],
          capacity: 40,
          occupiedCount: occupied,
          remainingSeats: 40 - occupied,
          isFull: false,
          isOverCapacity: false,
        },
      })
    ),
    http.post('*/api/student/enrollment/admissions/applications/general-1/offer/accept', () => {
      occupied += 1;
      return HttpResponse.json({ data: { id: 'general-1', status: 7 } });
    }),
    http.post('*/api/student/enrollment/admissions/applications/rte-1/finalize', () => {
      occupied += 1;
      return HttpResponse.json({
        data: {
          application: { id: 'rte-1', status: 11 },
          studentId: 'student-1',
          onboardingCaseId: 'case-1',
          reusedExistingStudent: false,
        },
      });
    })
  );

  const query = store.dispatch(
    admissionOfferingsApi.endpoints.getAdmissionClassCapacity.initiate('offering-1')
  );
  expect((await query.unwrap()).remainingSeats).toBe(40);

  await store
    .dispatch(
      admissionApplicationsApi.endpoints.acceptAdmissionOffer.initiate({
        id: 'general-1',
        input: { concurrencyStamp: 'general-stamp' },
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionOfferingsApi.endpoints.getAdmissionClassCapacity.select('offering-1')(
        store.getState()
      ).data?.remainingSeats
    ).toBe(39)
  );

  await store
    .dispatch(
      admissionApplicationsApi.endpoints.finalizeAdmissionApplication.initiate({
        id: 'rte-1',
        input: {
          concurrencyStamp: 'rte-stamp',
          idempotencyKey: 'rte-finalize',
          confirmCreateNew: true,
          confirmGuardianContactVerified: true,
        },
      })
    )
    .unwrap();
  await waitFor(() =>
    expect(
      admissionOfferingsApi.endpoints.getAdmissionClassCapacity.select('offering-1')(
        store.getState()
      ).data?.remainingSeats
    ).toBe(38)
  );
  query.unsubscribe();
});
