import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionInquiriesApi } from './admission-inquiries-api';

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

it.each(['create', 'confirm'] as const)(
  'refreshes the existing child sibling status after a successful family-only %s',
  async (operation) => {
    let linked = false;
    let reads = 0;
    let unrelatedReads = 0;
    const source = { id: 'source', familyId: 'family', hasLinkedSiblings: false };
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/inquiries/source', () => {
        reads += 1;
        return HttpResponse.json({ data: { ...source, hasLinkedSiblings: linked } });
      }),
      http.get('*/api/student/enrollment/admissions/inquiries/unrelated', () => {
        unrelatedReads += 1;
        return HttpResponse.json({
          data: { id: 'unrelated', familyId: 'another-family', hasLinkedSiblings: false },
        });
      }),
      http.post('*/api/student/enrollment/admissions/inquiries', () => {
        linked = true;
        return HttpResponse.json({ data: { id: 'target', familyId: 'family' } });
      }),
      http.post('*/api/student/enrollment/admissions/inquiries/target/confirm-family', () => {
        linked = true;
        return HttpResponse.json({ data: { id: 'target', familyId: 'family' } });
      })
    );
    const subscription = store.dispatch(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('source')
    );
    await subscription.unwrap();
    const unrelated = store.dispatch(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('unrelated')
    );
    await unrelated.unwrap();
    expect(reads).toBe(1);
    const body = {
      existingFamilyId: 'family',
      existingParentApplicantId: 'source-child',
      familyLinkOnly: true,
    };
    if (operation === 'create') {
      await store
        .dispatch(
          admissionInquiriesApi.endpoints.createAdmissionInquiry.initiate({
            ...body,
            admissionCycleId: 'cycle',
            admissionOfferingId: 'offering',
            boardId: 'board',
            mediumId: 'medium',
            standardId: 'class',
            applicantName: 'QA New Child',
            applicantFirstName: 'QA New Child',
            guardianFirstName: 'QA Mother',
            guardianPhone: '9876543210',
            phone: '9876543210',
            preferredLanguageCode: 'en',
            source: 0,
          })
        )
        .unwrap();
    } else {
      await store
        .dispatch(
          admissionInquiriesApi.endpoints.confirmAdmissionInquiryFamily.initiate({
            id: 'target',
            body: { ...body, concurrencyStamp: 'stamp' },
          })
        )
        .unwrap();
    }
    await vi.waitFor(() => {
      expect(
        admissionInquiriesApi.endpoints.getAdmissionInquiry.select('source')(store.getState()).data
          ?.hasLinkedSiblings
      ).toBe(true);
    });
    expect(reads).toBe(2);
    expect(unrelatedReads).toBe(1);
    subscription.unsubscribe();
    unrelated.unsubscribe();
  }
);

it('omits the class predicate for All Classes and preserves the scoped union across class reads', async () => {
  const inquiries = [
    { id: 'inquiry-class-8', standardId: 'class-8' },
    { id: 'inquiry-class-9', standardId: 'class-9' },
  ];
  const queries: URLSearchParams[] = [];
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries', ({ request }) => {
      const params = new URL(request.url).searchParams;
      queries.push(params);
      const standardId = params.get('standardId');
      const items = inquiries.filter((inquiry) => !standardId || inquiry.standardId === standardId);
      return HttpResponse.json({ data: { totalCount: items.length, items } });
    })
  );
  const scope = {
    academicYearId: 'year',
    boardId: 'board',
    mediumId: 'medium',
    search: 'ada',
    excludePostApplication: true,
    isTransferred: false,
    maxResultCount: 25,
    skipCount: 0,
  };
  const read = (standard: string) =>
    store
      .dispatch(
        admissionInquiriesApi.endpoints.getAdmissionInquiries.initiate({
          ...scope,
          ...academicClassFilterInput(standard),
        })
      )
      .unwrap();
  const specific = await read('class-8');
  const all = await read('');
  const otherClass = await read('class-9');

  expect(all.totalCount).toBe(2);
  expect(all.items.map((item) => item.id)).toEqual(
    expect.arrayContaining([...specific.items, ...otherClass.items].map((item) => item.id))
  );
  expect(specific.items.map((item) => item.id)).toEqual(['inquiry-class-8']);
  expect(otherClass.items.map((item) => item.id)).toEqual(['inquiry-class-9']);
  expect(queries[1].has('standardId')).toBe(false);
  expect(queries[1].has('standardIds')).toBe(false);
  expect(queries[1].toString()).not.toContain('__all__');
  Object.entries(scope).forEach(([key, value]) => {
    queries.forEach((params) => expect(params.get(key)).toBe(String(value)));
  });
});

it('sends owner queue filters and offering-scoped counsellor assignment requests', async () => {
  let listQuery = new URLSearchParams();
  let counsellorQuery = new URLSearchParams();
  let assignmentBody: unknown;
  let communicationBody: unknown;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries', ({ request }) => {
      listQuery = new URL(request.url).searchParams;
      return HttpResponse.json({ data: { totalCount: 0, items: [] } });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/counsellors', ({ request }) => {
      counsellorQuery = new URL(request.url).searchParams;
      return HttpResponse.json({
        data: [{ id: 'user-1', userName: 'counsellor', name: 'Asha Shah' }],
      });
    }),
    http.post(
      '*/api/student/enrollment/admissions/inquiries/inquiry-1/assign',
      async ({ request }) => {
        assignmentBody = await request.json();
        return HttpResponse.json({
          data: {
            id: 'inquiry-1',
            inquiryNumber: 'INQ-1',
            admissionCycleId: 'cycle-1',
            assignedCounsellorId: 'user-1',
            applicantName: 'Aanya Patel',
            normalizedPhone: '9876543210',
            source: 0,
            status: 0,
          },
        });
      }
    ),
    http.post(
      '*/api/student/enrollment/admissions/inquiries/inquiry-1/communications',
      async ({ request }) => {
        communicationBody = await request.json();
        return HttpResponse.json({
          data: {
            campaignId: 'campaign-1',
            status: 0,
            deliveryStarted: false,
            recipientCount: 1,
            eligibleRecipientCount: 1,
            blockedRecipientCount: 0,
            message: 'Communication draft created.',
          },
        });
      }
    )
  );

  const { endpoints } = admissionInquiriesApi;
  await store
    .dispatch(
      endpoints.getAdmissionInquiries.initiate({
        isAssigned: false,
        workQueue: 1,
        skipCount: 0,
        maxResultCount: 25,
      })
    )
    .unwrap();
  const communication = await store
    .dispatch(
      endpoints.createAdmissionInquiryCommunication.initiate({
        id: 'inquiry-1',
        body: {
          title: 'Campus visit follow-up',
          subject: null,
          body: 'Please reply to reserve a campus visit slot.',
          channels: [1],
          importanceLevel: 0,
          requiresAcknowledgement: false,
          publishImmediately: false,
        },
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.getAdmissionInquiryAssignableCounsellors.initiate({
        admissionOfferingId: 'offering-1',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.assignAdmissionInquiryCounsellor.initiate({
        id: 'inquiry-1',
        body: { mode: 0, counsellorId: 'user-1', candidateCounsellorIds: [] },
      })
    )
    .unwrap();

  expect(listQuery.get('isAssigned')).toBe('false');
  expect(listQuery.get('workQueue')).toBe('1');
  expect(listQuery.get('maxResultCount')).toBe('25');
  expect(counsellorQuery.get('admissionOfferingId')).toBe('offering-1');
  expect(assignmentBody).toEqual({
    mode: 0,
    counsellorId: 'user-1',
    candidateCounsellorIds: [],
  });
  expect(communicationBody).toEqual({
    title: 'Campus visit follow-up',
    subject: null,
    body: 'Please reply to reserve a campus visit slot.',
    channels: [1],
    importanceLevel: 0,
    requiresAcknowledgement: false,
    publishImmediately: false,
  });
  expect(communication).toMatchObject({ campaignId: 'campaign-1', recipientCount: 1 });
});

it('uses the edit, timeline, bulk assignment and filtered export contracts', async () => {
  let updateBody: unknown;
  let bulkBody: unknown;
  let exportQuery = new URLSearchParams();
  mswServer.use(
    http.put('*/api/student/enrollment/admissions/inquiries/inquiry-1', async ({ request }) => {
      updateBody = await request.json();
      return HttpResponse.json({ data: { id: 'inquiry-1', concurrencyStamp: 'stamp-2' } });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/inquiry-1/timeline', () =>
      HttpResponse.json({
        data: [
          {
            id: 'activity-1',
            activityType: 'ContactRecorded',
            description: 'Outbound phone contact recorded.',
            occurredAt: '2026-09-18T08:00:00Z',
          },
        ],
      })
    ),
    http.post('*/api/student/enrollment/admissions/inquiries/bulk/assign', async ({ request }) => {
      bulkBody = await request.json();
      return HttpResponse.json({
        data: { requestedCount: 2, updatedCount: 2, failedInquiryIds: [] },
      });
    }),
    http.get('*/api/student/enrollment/admissions/inquiries/export', ({ request }) => {
      exportQuery = new URL(request.url).searchParams;
      return new HttpResponse('Inquiry number,Applicant\r\nINQ-1,Aanya Patel', {
        headers: { 'Content-Type': 'text/csv' },
      });
    })
  );

  const { endpoints } = admissionInquiriesApi;
  await store
    .dispatch(
      endpoints.updateAdmissionInquiry.initiate({
        id: 'inquiry-1',
        body: {
          applicantName: 'Aanya Patel',
          phone: '9876543210',
          email: 'parent@example.com',
          source: 1,
          sourceDetail: 'September open house',
          preferredLanguageCode: 'hi',
          concurrencyStamp: 'stamp-1',
        },
      })
    )
    .unwrap();
  const timeline = await store
    .dispatch(endpoints.getAdmissionInquiryTimeline.initiate('inquiry-1'))
    .unwrap();
  const bulkResult = await store
    .dispatch(
      endpoints.bulkAssignAdmissionInquiryCounsellor.initiate({
        inquiryIds: ['inquiry-1', 'inquiry-2'],
        assignment: { mode: 0, counsellorId: 'user-1', candidateCounsellorIds: [] },
      })
    )
    .unwrap();
  const csv = await store
    .dispatch(
      endpoints.exportAdmissionInquiries.initiate({
        search: 'Aanya',
        status: 0,
        skipCount: 0,
        maxResultCount: 25,
      })
    )
    .unwrap();

  expect(updateBody).toMatchObject({
    preferredLanguageCode: 'hi',
    concurrencyStamp: 'stamp-1',
  });
  expect(timeline[0]).toMatchObject({ activityType: 'ContactRecorded' });
  expect(bulkBody).toEqual({
    inquiryIds: ['inquiry-1', 'inquiry-2'],
    assignment: { mode: 0, counsellorId: 'user-1', candidateCounsellorIds: [] },
  });
  expect(bulkResult.updatedCount).toBe(2);
  expect(exportQuery.get('search')).toBe('Aanya');
  expect(exportQuery.get('status')).toBe('0');
  expect(await csv.text()).toContain('INQ-1,Aanya Patel');
});

it('separates transferred Pipeline records and saves status with raw pinned-form values', async () => {
  let query = new URLSearchParams();
  let body: unknown;
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries', ({ request }) => {
      query = new URL(request.url).searchParams;
      return HttpResponse.json({
        data: {
          totalCount: 1,
          items: [
            {
              id: 'inquiry-1',
              status: 2,
              legacyStatus: 4,
              isTransferred: true,
              applicationId: 'application-1',
            },
          ],
        },
      });
    }),
    http.put('*/api/student/enrollment/admissions/inquiries/inquiry-1', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({
        data: { id: 'inquiry-1', status: 6, concurrencyStamp: 'new-stamp' },
      });
    })
  );
  const list = await store
    .dispatch(
      admissionInquiriesApi.endpoints.getAdmissionInquiries.initiate({
        isTransferred: true,
        excludePostApplication: false,
        status: 2,
      })
    )
    .unwrap();
  expect(query.get('isTransferred')).toBe('true');
  expect(query.get('excludePostApplication')).toBe('false');
  expect(list.items[0]).toMatchObject({
    status: 2,
    legacyStatus: 4,
    applicationId: 'application-1',
  });
  await store
    .dispatch(
      admissionInquiriesApi.endpoints.updateAdmissionInquiry.initiate({
        id: 'inquiry-1',
        body: {
          applicantName: 'Riya Shah',
          phone: '9876543210',
          preferredLanguageCode: 'en',
          source: 1,
          concurrencyStamp: 'stamp',
          status: 6,
          statusReason: 'Family changed plans',
          admissionOfferingId: 'offering-1',
          formValues: [{ fieldCode: 'GUARDIAN_MOBILE', valueJson: '"9876543210"' }],
        },
      })
    )
    .unwrap();
  expect(body).toMatchObject({
    status: 6,
    statusReason: 'Family changed plans',
    concurrencyStamp: 'stamp',
    formValues: [{ fieldCode: 'GUARDIAN_MOBILE', valueJson: '"9876543210"' }],
  });
});
