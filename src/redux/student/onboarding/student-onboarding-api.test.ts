import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { studentOnboardingApi } from './student-onboarding-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const onboardingCase = {
  id: 'case-1',
  documentUploadsEnabled: true,
  concurrencyStamp: 'case-stamp-1',
  applicationId: 'application-1',
  applicationNumber: 'APP-0001',
  applicantId: 'applicant-1',
  studentId: 'student-1',
  studentName: 'Aarav Shah',
  offeringId: 'offering-1',
  offeringCode: 'AY26-G5',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  intendedBoardId: 'board-1',
  intendedMediumId: 'medium-1',
  intendedStageId: 'stage-1',
  intendedStandardId: 'standard-5',
  intendedStandardName: 'Grade 5',
  status: 1,
  dueAt: '2026-09-24T00:00:00Z',
  isHistoricalBackfill: false,
  progressPercent: 50,
  isOverdue: false,
  steps: [],
  events: [],
};

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

describe('student onboarding API', () => {
  it('loads Offering requirements context through the scoped Onboarding settings boundary', async () => {
    const offerings = [
      { id: 'offering-1', academicYearId: 'year-1', workflowDefinitionId: 'workflow-1' },
    ];
    let requestUrl = '';
    mswServer.use(
      http.get('*/api/student/onboarding/settings/offerings', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ data: offerings });
      })
    );
    const query = store.dispatch(
      studentOnboardingApi.endpoints.getAvailableOnboardingOfferings.initiate('year-1')
    );
    expect(await query.unwrap()).toEqual(offerings);
    const url = new URL(requestUrl);
    expect(url.pathname).toBe('/api/student/onboarding/settings/offerings');
    expect(url.searchParams.get('academicYearId')).toBe('year-1');
    query.unsubscribe();
  });
  it('records and reviews canonical workflow evidence through the Onboarding boundary', async () => {
    const requests: Array<{ path: string; body: unknown }> = [];
    mswServer.use(
      http.post('*/api/student/onboarding/case-1/workflow-documents/*', async ({ request }) => {
        requests.push({ path: new URL(request.url).pathname, body: await request.json() });
        return HttpResponse.json({ data: { stageInstanceId: 'stage-1', requirements: [] } });
      })
    );
    await store
      .dispatch(
        studentOnboardingApi.endpoints.recordStudentOnboardingWorkflowOriginal.initiate({
          id: 'case-1',
          stageId: 'stage-1',
          code: 'birth-cert',
          concurrencyStamp: 'application-stamp',
          notes: 'Physical original checked',
        })
      )
      .unwrap();
    await store
      .dispatch(
        studentOnboardingApi.endpoints.reviewStudentOnboardingWorkflowDocument.initiate({
          id: 'case-1',
          evidenceId: 'evidence-1',
          concurrencyStamp: 'application-stamp',
          decision: 'accepted',
        })
      )
      .unwrap();
    expect(requests).toEqual([
      {
        path: '/api/student/onboarding/case-1/workflow-documents/stage-1/birth-cert/original',
        body: { concurrencyStamp: 'application-stamp', notes: 'Physical original checked' },
      },
      {
        path: '/api/student/onboarding/case-1/workflow-documents/evidence/evidence-1/review',
        body: { concurrencyStamp: 'application-stamp', decision: 'accepted' },
      },
    ]);
  });
  it('assigns GR and Roll through separate operations without unrelated fields', async () => {
    const requests: Array<{ path: string; body: unknown }> = [];
    mswServer.use(
      http.post('*/api/student/onboarding/case-1/:operation', async ({ request }) => {
        requests.push({ path: new URL(request.url).pathname, body: await request.json() });
        return HttpResponse.json({ data: onboardingCase });
      })
    );
    await store
      .dispatch(
        studentOnboardingApi.endpoints.assignStudentOnboardingGr.initiate({
          id: 'case-1',
          concurrencyStamp: 'stamp',
          numberSeriesId: 'series-1',
        })
      )
      .unwrap();
    await store
      .dispatch(
        studentOnboardingApi.endpoints.assignStudentOnboardingRoll.initiate({
          id: 'case-1',
          concurrencyStamp: 'stamp',
          rollNumber: 1,
          rollAssignmentMode: 'automatic',
        })
      )
      .unwrap();
    expect(requests).toEqual([
      {
        path: '/api/student/onboarding/case-1/gr-number',
        body: { concurrencyStamp: 'stamp', numberSeriesId: 'series-1' },
      },
      {
        path: '/api/student/onboarding/case-1/roll-number',
        body: { concurrencyStamp: 'stamp', rollNumber: 1, rollAssignmentMode: 'automatic' },
      },
    ]);
  });
  it('confirms fees through the Onboarding boundary and filters cases entered today', async () => {
    let body: unknown;
    let today: string | null = null;
    mswServer.use(
      http.put('*/api/student/onboarding/case-1/fee-structure', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { onboardingConfirmed: true } });
      }),
      http.get('*/api/student/onboarding', ({ request }) => {
        today = new URL(request.url).searchParams.get('enteredToday');
        return HttpResponse.json({ data: { items: [], totalCount: 0 } });
      })
    );
    await store
      .dispatch(
        studentOnboardingApi.endpoints.confirmStudentOnboardingFeeStructure.initiate({
          id: 'case-1',
          concurrencyStamp: 'stamp',
          structureId: 'fee-1',
          optionalHeadIds: [],
        })
      )
      .unwrap();
    await store
      .dispatch(
        studentOnboardingApi.endpoints.getStudentOnboardingCases.initiate({ enteredToday: true })
      )
      .unwrap();
    expect(body).toEqual({ concurrencyStamp: 'stamp', structureId: 'fee-1', optionalHeadIds: [] });
    expect(today).toBe('true');
  });
  it('loads active campus choices from the onboarding settings boundary', async () => {
    const campuses = [{ id: 'campus-north', code: 'N', name: 'North Campus' }];
    let requestPath = '';
    mswServer.use(
      http.get('*/api/student/onboarding/settings/campuses', ({ request }) => {
        requestPath = new URL(request.url).pathname;
        return HttpResponse.json({ data: campuses });
      })
    );

    const query = store.dispatch(
      studentOnboardingApi.endpoints.getAvailableOnboardingCampuses.initiate()
    );
    expect(await query.unwrap()).toEqual(campuses);
    expect(requestPath).toBe('/api/student/onboarding/settings/campuses');
    query.unsubscribe();
  });

  it('loads the server-paged worklist with operational filters', async () => {
    let requestUrl = '';

    mswServer.use(
      http.get('*/api/student/onboarding', ({ request }) => {
        requestUrl = request.url;

        return HttpResponse.json({ data: { totalCount: 1, items: [onboardingCase] } });
      })
    );

    const query = store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingCases.initiate({
        search: 'Aarav',
        status: 1,
        academicYearId: 'year-1',
        standardId: 'standard-5',
        overdueOnly: true,
        skipCount: 20,
        maxResultCount: 20,
      })
    );
    const result = await query.unwrap();
    const url = new URL(requestUrl);

    expect(result).toEqual({ totalCount: 1, items: [onboardingCase] });
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      search: 'Aarav',
      status: '1',
      academicYearId: 'year-1',
      standardId: 'standard-5',
      overdueOnly: 'true',
      skipCount: '20',
      maxResultCount: '20',
    });
    query.unsubscribe();
  });

  it('keeps case identifiers in routes and sends concurrency-safe command bodies', async () => {
    const requests: { path: string; method: string; body: Record<string, unknown> }[] = [];
    const capture = async ({ request }: { request: Request }) => {
      requests.push({
        path: new URL(request.url).pathname,
        method: request.method,
        body: (await request.json()) as Record<string, unknown>,
      });

      return HttpResponse.json({ data: onboardingCase });
    };

    mswServer.use(
      http.put('*/api/student/onboarding/case-1/steps/documents', capture),
      http.post('*/api/student/onboarding/case-1/placement', capture),
      http.post('*/api/student/onboarding/case-1/identifiers', capture),
      http.post('*/api/student/onboarding/case-1/activate', capture)
    );

    const { endpoints } = studentOnboardingApi;

    await store
      .dispatch(
        endpoints.updateStudentOnboardingStep.initiate({
          id: 'case-1',
          stepKey: 'documents',
          concurrencyStamp: 'case-stamp-1',
          status: 2,
          detail: 'Verified at school office',
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.setStudentOnboardingPlacement.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-2',
          divisionId: 'division-a',
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.allocateStudentOnboardingIdentifier.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-3',
          numberSeriesId: 'series-1',
          rollNumber: 12,
          manualValue: 'GR-MANUAL-12',
          overrideReason: 'Approved migration correction',
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.activateStudentOnboarding.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-4',
          idempotencyKey: 'activation-1',
        })
      )
      .unwrap();

    expect(requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'PUT /api/student/onboarding/case-1/steps/documents',
      'POST /api/student/onboarding/case-1/placement',
      'POST /api/student/onboarding/case-1/identifiers',
      'POST /api/student/onboarding/case-1/activate',
    ]);
    expect(requests.every(({ body }) => !('id' in body) && !('stepKey' in body))).toBe(true);
    expect(requests[2].body).toMatchObject({
      manualValue: 'GR-MANUAL-12',
      overrideReason: 'Approved migration correction',
    });
    expect(requests[3].body).toEqual({
      concurrencyStamp: 'case-stamp-4',
      idempotencyKey: 'activation-1',
    });
  });

  it('uses explicit owner, cancellation, and service-handoff operation routes', async () => {
    const commandBodies: Record<string, Record<string, unknown>> = {};

    mswServer.use(
      http.put('*/api/student/onboarding/case-1/owner', async ({ request }) => {
        commandBodies.owner = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: onboardingCase });
      }),
      http.post('*/api/student/onboarding/case-1/cancel', async ({ request }) => {
        commandBodies.cancel = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: onboardingCase });
      }),
      http.post('*/api/student/onboarding/case-1/service-handoffs/handoff-1/retry', () =>
        HttpResponse.json({
          data: {
            id: 'handoff-1',
            onboardingCaseId: 'case-1',
            serviceKey: 'student-account',
            required: true,
            status: 0,
            attemptCount: 2,
          },
        })
      ),
      http.post('*/api/student/onboarding/case-1/service-consent/confirm', async ({ request }) => {
        commandBodies.consent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: onboardingCase });
      })
    );

    const { endpoints } = studentOnboardingApi;
    await store
      .dispatch(
        endpoints.assignStudentOnboardingOwner.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-1',
          userId: 'user-1',
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.cancelStudentOnboarding.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-2',
          reason: 'Family withdrew before activation.',
        })
      )
      .unwrap();
    const handoff = await store
      .dispatch(
        endpoints.retryStudentOnboardingServiceHandoff.initiate({
          id: 'case-1',
          handoffId: 'handoff-1',
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.confirmStudentOnboardingServiceConsent.initiate({
          id: 'case-1',
          concurrencyStamp: 'case-stamp-3',
          evidenceReference: 'Signed form CONSENT-001',
        })
      )
      .unwrap();

    expect(commandBodies).toEqual({
      owner: { concurrencyStamp: 'case-stamp-1', userId: 'user-1' },
      cancel: {
        concurrencyStamp: 'case-stamp-2',
        reason: 'Family withdrew before activation.',
      },
      consent: {
        concurrencyStamp: 'case-stamp-3',
        evidenceReference: 'Signed form CONSENT-001',
      },
    });
    expect(handoff).toMatchObject({ id: 'handoff-1', status: 0, attemptCount: 2 });
  });

  it('uses academic-year-scoped settings routes', async () => {
    let policyUrl = '';
    let seriesUrl = '';

    mswServer.use(
      http.get('*/api/student/onboarding/settings/policies', ({ request }) => {
        policyUrl = request.url;

        return HttpResponse.json({ data: [] });
      }),
      http.get('*/api/student/onboarding/settings/identifier-series', ({ request }) => {
        seriesUrl = request.url;

        return HttpResponse.json({ data: [] });
      })
    );

    const policies = store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingPolicies.initiate('year-1')
    );
    const series = store.dispatch(
      studentOnboardingApi.endpoints.getStudentIdentifierSeries.initiate('year-1')
    );

    await Promise.all([policies.unwrap(), series.unwrap()]);

    expect(new URL(policyUrl).searchParams.get('academicYearId')).toBe('year-1');
    expect(new URL(seriesUrl).searchParams.get('academicYearId')).toBe('year-1');
    policies.unsubscribe();
    series.unsubscribe();
  });

  it('persists operational policy and identifier-series settings through backend commands', async () => {
    const bodies: Record<string, Record<string, unknown>> = {};
    let deactivateStamp = '';

    mswServer.use(
      http.post('*/api/student/onboarding/settings/policies', async ({ request }) => {
        bodies.policy = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: 'policy-1', ...bodies.policy } });
      }),
      http.post('*/api/student/onboarding/settings/identifier-series', async ({ request }) => {
        bodies.series = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: 'series-1', ...bodies.series } });
      }),
      http.post(
        '*/api/student/onboarding/settings/identifier-series/series-1/deactivate',
        ({ request }) => {
          deactivateStamp = new URL(request.url).searchParams.get('concurrencyStamp') ?? '';
          return HttpResponse.json({
            data: { id: 'series-1', academicYearId: 'year-1', isActive: false },
          });
        }
      )
    );

    const { endpoints } = studentOnboardingApi;
    await store
      .dispatch(
        endpoints.createStudentOnboardingPolicy.initiate({
          academicYearId: 'year-1',
          offeringId: null,
          standardId: null,
          name: 'School default',
          requireDocuments: true,
          requireFamilyDetails: true,
          requireCommunicationDetails: true,
          requireMedicalDetails: false,
          requireFeeClearance: false,
          requireStudentAccount: true,
          requireGuardianAccount: true,
          requireServiceConsent: false,
          seatReservationMinutes: 1440,
          slaHours: 72,
          isActive: true,
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.createStudentIdentifierSeries.initiate({
          academicYearId: 'year-1',
          standardId: null,
          identifierType: 0,
          code: 'GR-2026',
          name: 'GR 2026-27',
          prefix: 'GR-',
          suffix: '',
          padding: 6,
          startingSequence: 1,
          maximumSequence: 999999,
          effectiveFrom: '2026-06-01T00:00:00Z',
          effectiveUntil: null,
        })
      )
      .unwrap();
    await store
      .dispatch(
        endpoints.deactivateStudentIdentifierSeries.initiate({
          id: 'series-1',
          academicYearId: 'year-1',
          concurrencyStamp: 'series-stamp-1',
        })
      )
      .unwrap();

    expect(bodies.policy).toMatchObject({
      academicYearId: 'year-1',
      offeringId: null,
      standardId: null,
      seatReservationMinutes: 1440,
      slaHours: 72,
    });
    expect(bodies.series).toMatchObject({
      academicYearId: 'year-1',
      identifierType: 0,
      startingSequence: 1,
      maximumSequence: 999999,
    });
    expect(deactivateStamp).toBe('series-stamp-1');
  });

  it('round-trips scoped settings with schema and concurrency metadata', async () => {
    const savedRecord = {
      id: 'settings-1',
      concurrencyStamp: 'settings-stamp-1',
      academicYearId: 'year-1',
      schemaVersion: 1,
      configurationJson: '{"readinessAccess":{"requireDocuments":true}}',
    };
    let getYear = '';
    let settingsReadCount = 0;
    let saveBody: Record<string, unknown> = {};
    let deleteStamp = '';

    mswServer.use(
      http.get('*/api/student/onboarding/settings/configurations', ({ request }) => {
        settingsReadCount += 1;
        getYear = new URL(request.url).searchParams.get('academicYearId') ?? '';
        return HttpResponse.json({ data: [savedRecord] });
      }),
      http.put('*/api/student/onboarding/settings/configurations', async ({ request }) => {
        saveBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: { ...savedRecord, ...saveBody, concurrencyStamp: 'settings-stamp-2' },
        });
      }),
      http.delete('*/api/student/onboarding/settings/configurations/settings-1', ({ request }) => {
        deleteStamp = new URL(request.url).searchParams.get('concurrencyStamp') ?? '';
        return HttpResponse.json({ success: true });
      })
    );

    const { endpoints } = studentOnboardingApi;
    const query = store.dispatch(
      endpoints.getStudentOnboardingSettings.initiate({ academicYearId: 'year-1' })
    );
    expect(await query.unwrap()).toEqual([savedRecord]);

    await store
      .dispatch(
        endpoints.saveStudentOnboardingSettings.initiate({
          academicYearId: 'year-1',
          schemaVersion: 1,
          configurationJson: savedRecord.configurationJson,
          concurrencyStamp: 'settings-stamp-1',
        })
      )
      .unwrap();
    await vi.waitFor(() => expect(settingsReadCount).toBe(2));
    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    await store
      .dispatch(
        endpoints.deleteStudentOnboardingSettings.initiate({
          id: 'settings-1',
          concurrencyStamp: 'settings-stamp-2',
        })
      )
      .unwrap();
    await vi.waitFor(() => expect(settingsReadCount).toBe(3));

    expect(getYear).toBe('year-1');
    expect(saveBody).toEqual({
      academicYearId: 'year-1',
      schemaVersion: 1,
      configurationJson: savedRecord.configurationJson,
      concurrencyStamp: 'settings-stamp-1',
    });
    expect(deleteStamp).toBe('settings-stamp-2');
    // Settings mutations deliberately refresh active subscribers. Finish those reads
    // while their request handlers are still installed before this test cleans up.
    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    query.unsubscribe();
  });

  it('uploads onboarding documents as multipart form data with the case concurrency stamp', async () => {
    let uploaded: Record<string, FormDataEntryValue | null> = {};

    mswServer.use(
      http.post('*/api/student/onboarding/case-1/documents', async ({ request }) => {
        const form = await request.formData();
        uploaded = {
          documentTypeId: form.get('documentTypeId'),
          concurrencyStamp: form.get('concurrencyStamp'),
          file: form.get('file'),
        };

        return HttpResponse.json({
          data: {
            caseId: 'case-1',
            studentId: 'student-1',
            concurrencyStamp: 'case-stamp-2',
            canUpload: true,
            documents: [],
          },
        });
      })
    );

    const result = await store
      .dispatch(
        studentOnboardingApi.endpoints.uploadStudentOnboardingDocument.initiate({
          caseId: 'case-1',
          documentTypeId: 'document-type-1',
          concurrencyStamp: 'case-stamp-1',
          file: new File(['evidence'], 'birth-certificate.pdf', { type: 'application/pdf' }),
        })
      )
      .unwrap();

    expect(uploaded.documentTypeId).toBe('document-type-1');
    expect(uploaded.concurrencyStamp).toBe('case-stamp-1');
    expect((uploaded.file as File).name).toBe('birth-certificate.pdf');
    expect(result.concurrencyStamp).toBe('case-stamp-2');
  });
});
it('uses the onboarding credential status and request contracts', async () => {
  const email = {
    id: 'email-1',
    accountType: 'guardian' as const,
    email: 'parent@example.com',
    status: 'Pending',
    attemptCount: 0,
    emailEnabled: true,
    canSend: true,
  };
  let body: any;
  mswServer.use(
    http.get('*/api/student/onboarding/case-1/credential-emails', () =>
      HttpResponse.json({ data: [email] })
    ),
    http.post('*/api/student/onboarding/case-1/credential-emails', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: email });
    })
  );
  const query = store.dispatch(
    studentOnboardingApi.endpoints.getStudentCredentialEmails.initiate('case-1')
  );
  expect(await query.unwrap()).toEqual([email]);
  const result = await store
    .dispatch(
      studentOnboardingApi.endpoints.sendStudentCredentialEmail.initiate({
        id: 'case-1',
        accountType: 'guardian',
        concurrencyStamp: 'latest-stamp',
      })
    )
    .unwrap();
  expect(result).toEqual(email);
  expect(body).toEqual({ accountType: 'guardian', concurrencyStamp: 'latest-stamp' });
  query.unsubscribe();
});

it('sends individual and all document overrides through the authenticated owning API', async () => {
  const documents = {
    caseId: 'case-1',
    studentId: 'student-1',
    concurrencyStamp: 'new-stamp',
    canUpload: true,
    canOverride: true,
    documents: [],
  };
  const bodies: any[] = [];
  mswServer.use(
    http.post('*/api/student/onboarding/case-1/documents/override', async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ data: documents });
    })
  );
  const submitOverride = async (overrideAll: boolean) => {
    const result = await store
      .dispatch(
        studentOnboardingApi.endpoints.overrideStudentOnboardingDocuments.initiate({
          caseId: 'case-1',
          documentTypeIds: overrideAll ? [] : ['doc-1'],
          overrideAll,
          reason: 'Authorized exception',
          concurrencyStamp: 'stamp',
        })
      )
      .unwrap();
    expect(result).toEqual(documents);
  };
  await submitOverride(false);
  await submitOverride(true);
  expect(bodies).toEqual([
    {
      documentTypeIds: ['doc-1'],
      overrideAll: false,
      reason: 'Authorized exception',
      concurrencyStamp: 'stamp',
    },
    {
      documentTypeIds: [],
      overrideAll: true,
      reason: 'Authorized exception',
      concurrencyStamp: 'stamp',
    },
  ]);
});
