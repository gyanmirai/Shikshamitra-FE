import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { feeCollectionApi } from 'src/redux/feeCollection/feeCollection';
import { studentOnboardingType, studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionFeeSelectionApi } from './admission-fee-selection-api';
import { admissionFeeCollectionApi } from './admission-fee-collection-api';
import { studentOnboardingApi } from '../onboarding/student-onboarding-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createDocumentTestStore>;
const path = '*/api/fee-collections/admission-applications/application-1';
const input = {
  academicYearId: 'application-year',
  idempotencyKey: 'same-key-on-retry',
  paymentConfirmed: true,
  dueFeePayments: [{ dueFeeId: 'due-1', feeHeadId: 'head-1', amount: 500 }],
  chargePayments: [],
  payments: [{ paymentMethod: 'Cash', amount: 500 }],
};

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.useRealTimers();
});

it('keeps summary/form reads separate from explicit prepare and forwards the same idempotency key without a fake Student identifier', async () => {
  const requests: { method: string; pathname: string; body: unknown }[] = [];
  const capture = async ({ request }: { request: Request }) => {
    requests.push({
      method: request.method,
      pathname: new URL(request.url).pathname,
      body:
        request.method === 'POST' && request.headers.get('content-type')?.includes('json')
          ? await request.json()
          : null,
    });
    return HttpResponse.json({
      data: { applicationId: 'application-1', studentId: null, summary: { pendingFee: 500 } },
    });
  };
  mswServer.use(
    http.get(`${path}/summary`, capture),
    http.post(`${path}/prepare`, capture),
    http.get(`${path}/collect-form`, capture),
    http.post(path, capture)
  );
  const { endpoints } = admissionFeeCollectionApi;
  const summary = store.dispatch(
    endpoints.getAdmissionFeeCollectionSummary.initiate('application-1')
  );
  await summary.unwrap();
  expect(requests.map((request) => request.method)).toEqual(['GET']);
  await store
    .dispatch(
      endpoints.prepareAdmissionFeeCollection.initiate({
        applicationId: 'application-1',
        variableFeeHeads: [],
      })
    )
    .unwrap();
  const form = store.dispatch(endpoints.getAdmissionFeeCollectForm.initiate('application-1'));
  await form.unwrap();
  await store
    .dispatch(endpoints.collectAdmissionFee.initiate({ applicationId: 'application-1', input }))
    .unwrap();
  await store
    .dispatch(endpoints.collectAdmissionFee.initiate({ applicationId: 'application-1', input }))
    .unwrap();
  const collects = requests.filter(
    (request) => request.method === 'POST' && request.pathname.endsWith('/application-1')
  );
  expect(collects).toHaveLength(2);
  expect(collects.map((request) => request.body)).toEqual([input, input]);
  expect(collects[0].body).not.toHaveProperty('studentId');
  expect(collects[0].body).not.toHaveProperty('applicationId');
  expect(requests.find((request) => request.pathname.endsWith('/prepare'))).toMatchObject({
    method: 'POST',
    body: { variableFeeHeads: [] },
  });
  summary.unsubscribe();
  form.unsubscribe();
});

it('invalidates the same application fee reference and Onboarding case after a successful collection', async () => {
  let collected = false;
  mswServer.use(
    http.get('*/api/student/onboarding/case-1', () =>
      HttpResponse.json({
        data: {
          id: 'case-1',
          concurrencyStamp: collected ? 'case-after-payment' : 'case-before-payment',
        },
      })
    ),
    http.get('*/api/student/enrollment/admissions/fee-selections/applications/application-1', () =>
      HttpResponse.json({ data: { applicationId: 'application-1', isLocked: collected } })
    ),
    http.post(path, () => {
      collected = true;
      return HttpResponse.json({ data: { id: 'payment-1', studentId: null } });
    })
  );
  const reference = store.dispatch(
    admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.initiate('application-1')
  );
  const onboarding = store.dispatch(
    studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('case-1')
  );
  await reference.unwrap();
  await onboarding.unwrap();
  await store
    .dispatch(
      admissionFeeCollectionApi.endpoints.collectAdmissionFee.initiate({
        applicationId: 'application-1',
        input,
      })
    )
    .unwrap();
  expect(
    api.util
      .selectInvalidatedBy(store.getState(), [
        { type: studentAdmissionsCrmType.admissionApplication, id: 'application-1' },
      ])
      .some((entry) => entry.endpointName === 'getAdmissionFeeSelection')
  ).toBe(true);
  await waitFor(() => {
    expect(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.select('case-1')(store.getState())
        .data?.concurrencyStamp
    ).toBe('case-after-payment');
    expect(
      admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.select('application-1')(
        store.getState()
      ).data?.isLocked
    ).toBe(true);
  });
  expect(
    api.util
      .selectInvalidatedBy(store.getState(), [studentOnboardingType.onboardingCaseDetail])
      .some((entry) => entry.endpointName === 'getStudentOnboardingCase')
  ).toBe(true);
  reference.unsubscribe();
  onboarding.unsubscribe();
});

it('preserves a rejected collection as an error and does not refresh financial data as if payment succeeded', async () => {
  let reads = 0;
  mswServer.use(
    http.get(`${path}/summary`, () => {
      reads += 1;
      return HttpResponse.json({ applicationId: 'application-1' });
    }),
    http.post(path, () =>
      HttpResponse.json({ detail: 'Balance changed. Refresh before collecting.' }, { status: 409 })
    )
  );
  const summary = store.dispatch(
    admissionFeeCollectionApi.endpoints.getAdmissionFeeCollectionSummary.initiate('application-1')
  );
  await summary.unwrap();
  await expect(
    store
      .dispatch(
        admissionFeeCollectionApi.endpoints.collectAdmissionFee.initiate({
          applicationId: 'application-1',
          input,
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  expect(reads).toBe(1);
  summary.unsubscribe();
});

it.each(['direct', 'wrapped'])(
  'refreshes active admission fee selection and Onboarding after a %s normal Finance account-backed collection',
  async (responseShape) => {
    let collected = false;
    const readCounts = { selection: 0, onboarding: 0 };
    mswServer.use(
      http.get('*/api/student/onboarding/case-1', () => {
        readCounts.onboarding += 1;
        return HttpResponse.json({
          data: {
            id: 'case-1',
            concurrencyStamp: collected ? 'case-after-finance-payment' : 'case-before-payment',
          },
        });
      }),
      http.get(
        '*/api/student/enrollment/admissions/fee-selections/applications/application-1',
        () => {
          readCounts.selection += 1;
          return HttpResponse.json({
            data: { applicationId: 'application-1', isLocked: collected },
          });
        }
      ),
      http.post('*/api/fee-collections', () => {
        collected = true;
        const payment = {
          id: 'finance-payment-1',
          studentId: 'student-1',
          financeFeeAccountId: 'account-1',
        };
        return HttpResponse.json(responseShape === 'wrapped' ? { data: payment } : payment);
      })
    );
    const reference = store.dispatch(
      admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.initiate('application-1')
    );
    const onboarding = store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('case-1')
    );
    await reference.unwrap();
    await onboarding.unwrap();
    await store
      .dispatch(
        feeCollectionApi.endpoints.collectFee.initiate({ ...input, studentId: 'student-1' })
      )
      .unwrap();
    await waitFor(() => {
      expect(
        studentOnboardingApi.endpoints.getStudentOnboardingCase.select('case-1')(store.getState())
          .data?.concurrencyStamp
      ).toBe('case-after-finance-payment');
      expect(
        admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.select('application-1')(
          store.getState()
        ).data?.isLocked
      ).toBe(true);
    });
    expect(readCounts).toEqual({ selection: 2, onboarding: 2 });
    reference.unsubscribe();
    onboarding.unsubscribe();
  }
);

it.each(['legacy', 'rejected'])(
  'preserves the existing fee-selection refresh without extra Onboarding requests for a %s normal Finance collection',
  async (collectionKind) => {
    const readCounts = { selection: 0, onboarding: 0 };
    mswServer.use(
      http.get('*/api/student/onboarding/case-1', () => {
        readCounts.onboarding += 1;
        return HttpResponse.json({ data: { id: 'case-1', concurrencyStamp: 'unchanged-case' } });
      }),
      http.get(
        '*/api/student/enrollment/admissions/fee-selections/applications/application-1',
        () => {
          readCounts.selection += 1;
          return HttpResponse.json({ data: { applicationId: 'application-1', isLocked: false } });
        }
      ),
      http.post('*/api/fee-collections', () =>
        collectionKind === 'rejected'
          ? HttpResponse.json({ detail: 'Balance changed.' }, { status: 409 })
          : HttpResponse.json({ id: 'legacy-payment-1', studentId: 'student-1' })
      )
    );
    const reference = store.dispatch(
      admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.initiate('application-1')
    );
    const onboarding = store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('case-1')
    );
    await reference.unwrap();
    await onboarding.unwrap();
    const collection = store.dispatch(
      feeCollectionApi.endpoints.collectFee.initiate({ ...input, studentId: 'student-1' })
    );
    if (collectionKind === 'rejected') {
      await expect(collection.unwrap()).rejects.toMatchObject({ status: 409 });
    } else {
      await collection.unwrap();
    }
    await waitFor(() => {
      expect(readCounts).toEqual({ selection: 2, onboarding: 1 });
      expect(
        admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.select('application-1')(
          store.getState()
        ).isLoading
      ).toBe(false);
    });
    expect(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.select('case-1')(store.getState())
        .isLoading
    ).not.toBe(true);
    expect(
      admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.select('application-1')(
        store.getState()
      ).isLoading
    ).not.toBe(true);
    reference.unsubscribe();
    onboarding.unsubscribe();
  }
);

it('aborts an unresponsive summary and exposes a timeout instead of loading indefinitely', async () => {
  vi.useFakeTimers();
  let requestSignal: AbortSignal | undefined;
  mswServer.use(
    http.get(`${path}/summary`, async ({ request }) => {
      requestSignal = request.signal;
      await new Promise<void>((resolve) =>
        request.signal.addEventListener('abort', () => resolve(), { once: true })
      );
      return HttpResponse.error();
    })
  );
  const summary = store.dispatch(
    admissionFeeCollectionApi.endpoints.getAdmissionFeeCollectionSummary.initiate('application-1')
  );
  await vi.waitFor(() => expect(requestSignal).toBeDefined());
  await vi.advanceTimersByTimeAsync(30_000);
  await expect(summary.unwrap()).rejects.toMatchObject({ status: 'TIMEOUT_ERROR' });
  expect(requestSignal!.aborted).toBe(true);
  expect(
    admissionFeeCollectionApi.endpoints.getAdmissionFeeCollectionSummary.select('application-1')(
      store.getState()
    ).isLoading
  ).toBe(false);
  summary.unsubscribe();
});

it('times out a collection and preserves the exact command and retry key on retry', async () => {
  vi.useFakeTimers();
  let requestSignal: AbortSignal | undefined;
  const submitted: unknown[] = [];
  mswServer.use(
    http.post(path, async ({ request }) => {
      submitted.push(await request.json());
      if (submitted.length === 1) {
        requestSignal = request.signal;
        await new Promise<void>((resolve) =>
          request.signal.addEventListener('abort', () => resolve(), { once: true })
        );
        return HttpResponse.error();
      }
      return HttpResponse.json({ data: { id: 'original-payment', studentId: null } });
    })
  );
  const first = store.dispatch(
    admissionFeeCollectionApi.endpoints.collectAdmissionFee.initiate({
      applicationId: 'application-1',
      input,
    })
  );
  await vi.waitFor(() => expect(requestSignal).toBeDefined());
  await vi.advanceTimersByTimeAsync(60_000);
  await expect(first.unwrap()).rejects.toMatchObject({ status: 'TIMEOUT_ERROR' });
  const retry = store.dispatch(
    admissionFeeCollectionApi.endpoints.collectAdmissionFee.initiate({
      applicationId: 'application-1',
      input,
    })
  );
  await expect(retry.unwrap()).resolves.toMatchObject({ id: 'original-payment' });
  expect(submitted).toEqual([input, input]);
});
