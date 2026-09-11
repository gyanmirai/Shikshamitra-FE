import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionDocumentVerificationApi as documents } from './admission-document-verification-api';
import {
  documentKey,
  documentPath,
  documentSummary,
  documentStagePath,
  createDocumentTestStore,
} from './document-test-fixture';

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

it('uploads private multipart evidence with an application stamp and refreshes checklist state', async () => {
  let uploaded = false;
  let contentType = '';
  let submitted: FormData | undefined;
  mswServer.use(
    http.get(documentStagePath, () =>
      HttpResponse.json({
        data: {
          ...documentSummary,
          concurrencyStamp: uploaded ? 'new-stamp' : 'application-stamp',
        },
      })
    ),
    http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, async ({ request }) => {
      contentType = request.headers.get('content-type') ?? '';
      submitted = await request.formData();
      uploaded = true;
      return HttpResponse.json({ data: documentSummary });
    })
  );
  await store.dispatch(documents.endpoints.getApplicationDocuments.initiate(documentKey)).unwrap();
  await store
    .dispatch(
      documents.endpoints.uploadAdmissionDocument.initiate({
        ...documentKey,
        code: 'BIRTH_CERTIFICATE',
        concurrencyStamp: 'application-stamp',
        notes: 'Clear copy',
        file: new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' }),
      })
    )
    .unwrap();
  expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
  expect(submitted?.get('concurrencyStamp')).toBe('application-stamp');
  expect(submitted?.get('notes')).toBe('Clear copy');
  expect(submitted?.get('file')).toMatchObject({ name: 'birth.pdf', type: 'application/pdf' });
  expect(submitted?.get('applicationId')).toBeNull();
  await waitFor(() =>
    expect(
      documents.endpoints.getApplicationDocuments.select(documentKey)(store.getState()).data
        ?.concurrencyStamp
    ).toBe('new-stamp')
  );
});

it('uses the application concurrency stamp for original, reviewer and waiver decisions', async () => {
  const requests: { path: string; body: unknown }[] = [];
  mswServer.use(
    http.post(`${documentPath}/*`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/').at(-1) ?? '',
        body: await request.json(),
      });
      return HttpResponse.json(documentSummary);
    })
  );
  const key = { ...documentKey, code: 'BIRTH_CERTIFICATE', concurrencyStamp: 'application-stamp' };
  await store
    .dispatch(
      documents.endpoints.recordAdmissionDocumentOriginal.initiate({
        ...key,
        notes: 'Original checked',
      })
    )
    .unwrap();
  await store
    .dispatch(
      documents.endpoints.reviewAdmissionDocument.initiate({
        evidenceId: 'evidence-1',
        concurrencyStamp: key.concurrencyStamp,
        decision: 'rejected',
        reason: 'Unreadable seal',
      })
    )
    .unwrap();
  await store
    .dispatch(
      documents.endpoints.waiveAdmissionDocument.initiate({
        ...key,
        reason: 'Approved transfer exception',
      })
    )
    .unwrap();
  expect(requests).toEqual([
    {
      path: 'original',
      body: { concurrencyStamp: 'application-stamp', notes: 'Original checked' },
    },
    {
      path: 'review',
      body: {
        concurrencyStamp: 'application-stamp',
        decision: 'rejected',
        reason: 'Unreadable seal',
      },
    },
    {
      path: 'waive',
      body: { concurrencyStamp: 'application-stamp', reason: 'Approved transfer exception' },
    },
  ]);
});
