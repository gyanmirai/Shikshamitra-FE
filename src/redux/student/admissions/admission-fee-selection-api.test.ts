import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { studentOnboardingType, studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionFeeSelectionApi } from './admission-fee-selection-api';
import { admissionFeeCollectionApi } from './admission-fee-collection-api';
import { studentOnboardingApi } from '../onboarding/student-onboarding-api';

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

it('reads candidates through the application adapter and keeps application identifiers outside save/confirm bodies', async () => {
  const path = '*/api/student/enrollment/admissions/fee-selections/applications/application-1';
  const captured: { method: string; path: string; body: unknown }[] = [];
  const state = {
    applicationId: 'application-1',
    concurrencyStamp: 'stamp-2',
    available: true,
    selection: null,
  };
  let onboardingReads = 0;
  const capture = async ({ request }: { request: Request }) => {
    captured.push({
      method: request.method,
      path: new URL(request.url).pathname,
      body: await request.json(),
    });
    return HttpResponse.json({ data: state });
  };
  mswServer.use(
    http.get('*/api/student/onboarding/case-1', () => {
      onboardingReads += 1;
      return HttpResponse.json({ data: { id: 'case-1' } });
    }),
    http.get(path, () => HttpResponse.json({ data: state })),
    http.get(`${path}/candidates`, () =>
      HttpResponse.json({ data: [{ structureId: 'structure-1', heads: [] }] })
    ),
    http.put(path, capture),
    http.post(`${path}/confirm-onboarding`, capture)
  );
  const { endpoints } = admissionFeeSelectionApi;
  const onboarding = store.dispatch(
    studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('case-1')
  );
  await onboarding.unwrap();
  const read = store.dispatch(endpoints.getAdmissionFeeSelection.initiate('application-1'));
  expect(await read.unwrap()).toEqual(state);
  const candidates = store.dispatch(
    endpoints.getAdmissionFeeSelectionCandidates.initiate('application-1')
  );
  expect(await candidates.unwrap()).toEqual([{ structureId: 'structure-1', heads: [] }]);
  await store
    .dispatch(
      endpoints.saveAdmissionFeeSelection.initiate({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-1',
        structureId: 'structure-1',
        optionalHeadIds: ['bus'],
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.confirmAdmissionFeeSelectionOnboarding.initiate({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-2',
      })
    )
    .unwrap();
  expect(captured).toEqual([
    {
      method: 'PUT',
      path: '/api/student/enrollment/admissions/fee-selections/applications/application-1',
      body: { concurrencyStamp: 'stamp-1', structureId: 'structure-1', optionalHeadIds: ['bus'] },
    },
    {
      method: 'POST',
      path: '/api/student/enrollment/admissions/fee-selections/applications/application-1/confirm-onboarding',
      body: { concurrencyStamp: 'stamp-2' },
    },
  ]);
  expect(
    api.util
      .selectInvalidatedBy(store.getState(), [studentAdmissionsCrmType.admissionApplication])
      .some((entry) => entry.endpointName === 'getAdmissionFeeSelection')
  ).toBe(true);
  await waitFor(() => expect(onboardingReads).toBeGreaterThan(1), { timeout: 5000 });
  expect(
    api.util
      .selectInvalidatedBy(store.getState(), [studentOnboardingType.onboardingCaseDetail])
      .some((entry) => entry.endpointName === 'getStudentOnboardingCase')
  ).toBe(true);
  await read.refetch().unwrap();
  read.unsubscribe();
  candidates.unsubscribe();
  onboarding.unsubscribe();
});

it('preserves business errors rather than treating rejected saves as success', async () => {
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/fee-selections/applications/application-1', () =>
      HttpResponse.json(
        { error: { code: 'Admissions:FeeSelection:ConcurrencyConflict' } },
        { status: 409 }
      )
    )
  );
  const command = store.dispatch(
    admissionFeeSelectionApi.endpoints.saveAdmissionFeeSelection.initiate({
      applicationId: 'application-1',
      concurrencyStamp: 'old',
      structureId: 'structure-1',
      optionalHeadIds: [],
    })
  );
  await expect(command.unwrap()).rejects.toMatchObject({ status: 409 });
});

it.each(['first selection', 'changed selection', 'rejected selection'])(
  'keeps Finance collection eligibility in sync after a %s without refreshing another application',
  async (scenario) => {
    const rejected = scenario === 'rejected selection';
    let saved = false;
    const reads = { summary: 0, form: 0, other: 0 };
    const initialStructure = scenario === 'changed selection' ? 'old-structure' : null;
    const structure = () => (saved ? 'new-structure' : initialStructure);
    const collectionPath = '*/api/fee-collections/admission-applications';
    const selectionPath =
      '*/api/student/enrollment/admissions/fee-selections/applications/application-1';
    mswServer.use(
      http.get(selectionPath, () =>
        HttpResponse.json({ data: { applicationId: 'application-1', selection: structure() } })
      ),
      http.get(`${collectionPath}/application-1/summary`, () => {
        reads.summary += 1;
        return HttpResponse.json({
          data: {
            canCollect: Boolean(structure()),
            structureName: structure(),
            blocker: structure()
              ? null
              : 'Confirm a published fee structure before collecting fees.',
          },
        });
      }),
      http.get(`${collectionPath}/application-1/collect-form`, () => {
        reads.form += 1;
        return HttpResponse.json({ data: { structureName: structure() } });
      }),
      http.get(`${collectionPath}/application-2/summary`, () => {
        reads.other += 1;
        return HttpResponse.json({ data: { canCollect: false } });
      }),
      http.put(selectionPath, () => {
        if (rejected) return HttpResponse.json({ detail: 'Selection changed.' }, { status: 409 });
        saved = true;
        return HttpResponse.json({ data: { applicationId: 'application-1' } });
      })
    );
    const { endpoints } = admissionFeeCollectionApi;
    const selection = store.dispatch(
      admissionFeeSelectionApi.endpoints.getAdmissionFeeSelection.initiate('application-1')
    );
    const summary = store.dispatch(
      endpoints.getAdmissionFeeCollectionSummary.initiate('application-1')
    );
    const form = store.dispatch(endpoints.getAdmissionFeeCollectForm.initiate('application-1'));
    const other = store.dispatch(
      endpoints.getAdmissionFeeCollectionSummary.initiate('application-2')
    );
    await Promise.all([selection.unwrap(), summary.unwrap(), form.unwrap(), other.unwrap()]);
    const save = store.dispatch(
      admissionFeeSelectionApi.endpoints.saveAdmissionFeeSelection.initiate({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-1',
        structureId: 'new-structure',
        optionalHeadIds: [],
      })
    );
    if (rejected) {
      await expect(save.unwrap()).rejects.toMatchObject({ status: 409 });
      expect(reads).toEqual({ summary: 1, form: 1, other: 1 });
      expect(
        endpoints.getAdmissionFeeCollectionSummary.select('application-1')(store.getState()).data
      ).toMatchObject({ canCollect: false, structureName: null });
    } else {
      await save.unwrap();
      await waitFor(() => {
        expect(
          endpoints.getAdmissionFeeCollectionSummary.select('application-1')(store.getState()).data
        ).toMatchObject({ canCollect: true, structureName: 'new-structure', blocker: null });
        expect(reads).toEqual({ summary: 2, form: 2, other: 1 });
      });
    }
    selection.unsubscribe();
    summary.unsubscribe();
    form.unsubscribe();
    other.unsubscribe();
  }
);
