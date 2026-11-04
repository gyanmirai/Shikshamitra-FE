import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';

import { admissionInquiriesApi } from './admission-inquiries-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

it('retains the old target cache on failed POST, then explicitly reads the new server stamp for a successful retry', async () => {
  const store = createDocumentTestStore();
  let serverStamp = 'A';
  const posts: unknown[] = [];
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/inquiries/target', () =>
      HttpResponse.json({ data: { id: 'target', concurrencyStamp: serverStamp } })
    ),
    http.post(
      '*/api/student/enrollment/admissions/inquiries/target/confirm-family',
      async ({ request }) => {
        const body = (await request.json()) as { concurrencyStamp: string };
        posts.push(body);
        return body.concurrencyStamp === serverStamp
          ? HttpResponse.json({
              data: { id: 'target', concurrencyStamp: 'saved', siblingFamilyConfirmed: true },
            })
          : HttpResponse.json({ error: { message: 'Inquiry changed' } }, { status: 409 });
      }
    )
  );
  const target = store.dispatch(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('target')
  );
  const body = {
    existingFamilyId: 'family',
    existingParentApplicantId: 'source-child',
    parentRelationship: 'father' as const,
    concurrencyStamp: 'A',
  };
  try {
    await target.unwrap();
    serverStamp = 'B';
    await expect(
      store
        .dispatch(
          admissionInquiriesApi.endpoints.confirmAdmissionInquiryFamily.initiate({
            id: 'target',
            body,
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 409 });
    expect(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.select('target')(store.getState()).data
        ?.concurrencyStamp
    ).toBe('A');
    const fresh = await store
      .dispatch(
        admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('target', {
          forceRefetch: true,
          subscribe: false,
        })
      )
      .unwrap();
    expect(fresh.concurrencyStamp).toBe('B');
    await expect(
      store
        .dispatch(
          admissionInquiriesApi.endpoints.confirmAdmissionInquiryFamily.initiate({
            id: 'target',
            body: { ...body, concurrencyStamp: fresh.concurrencyStamp },
          })
        )
        .unwrap()
    ).resolves.toMatchObject({ siblingFamilyConfirmed: true });
    expect(posts).toEqual([body, { ...body, concurrencyStamp: 'B' }]);
  } finally {
    target.unsubscribe();
    store.dispatch(api.util.resetApiState());
  }
});

it.each([{ status: 200 }, { status: 409 }])(
  'posts explicit saved family/parent proof and refreshes only the target after status $status',
  async ({ status }) => {
    const store = createDocumentTestStore();
    const reads = { target: 0, source: 0 };
    let submitted: unknown;
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/inquiries/:id', ({ params }) => {
        if (params.id === 'target') reads.target += 1;
        if (params.id === 'source') reads.source += 1;
        return HttpResponse.json({ data: { id: params.id, concurrencyStamp: 'fresh' } });
      }),
      http.post(
        '*/api/student/enrollment/admissions/inquiries/target/confirm-family',
        async ({ request }) => {
          submitted = await request.json();
          return status === 200
            ? HttpResponse.json({
                data: { id: 'target', siblingFamilyConfirmed: true, concurrencyStamp: 'saved' },
              })
            : HttpResponse.json({ error: { message: 'Inquiry changed' } }, { status });
        }
      )
    );
    const target = store.dispatch(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('target')
    );
    const source = store.dispatch(
      admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('source')
    );
    const body = {
      existingFamilyId: 'family',
      existingParentApplicantId: 'source-child',
      parentRelationship: 'mother' as const,
      concurrencyStamp: 'verified',
    };
    try {
      await Promise.all([target.unwrap(), source.unwrap()]);
      const saved = store.dispatch(
        admissionInquiriesApi.endpoints.confirmAdmissionInquiryFamily.initiate({
          id: 'target',
          body,
        })
      );
      if (status === 200) {
        expect(await saved.unwrap()).toMatchObject({ id: 'target', siblingFamilyConfirmed: true });
        await waitFor(() => expect(reads.target).toBe(2));
      } else await expect(saved.unwrap()).rejects.toMatchObject({ status: 409 });
      expect(submitted).toEqual(body);
      expect(reads.source).toBe(1);
      if (status !== 200) expect(reads.target).toBe(1);
    } finally {
      target.unsubscribe();
      source.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  }
);
