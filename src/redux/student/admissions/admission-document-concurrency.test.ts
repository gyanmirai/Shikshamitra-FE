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

it('rejects stale evidence mutations and refreshes the current application stamp', async () => {
  let changed = false;
  mswServer.use(
    http.get(documentStagePath, () =>
      HttpResponse.json({ ...documentSummary, concurrencyStamp: changed ? 'fresh' : 'old' })
    ),
    http.post(`${documentPath}/evidence/evidence-1/review`, () => {
      changed = true;
      return HttpResponse.json(
        { detail: 'The application changed. Refresh and try again.' },
        { status: 409 }
      );
    })
  );
  await store.dispatch(documents.endpoints.getApplicationDocuments.initiate(documentKey)).unwrap();
  await expect(
    store
      .dispatch(
        documents.endpoints.reviewAdmissionDocument.initiate({
          evidenceId: 'evidence-1',
          concurrencyStamp: 'old',
          decision: 'accepted',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  await waitFor(() =>
    expect(
      documents.endpoints.getApplicationDocuments.select(documentKey)(store.getState()).data
        ?.concurrencyStamp
    ).toBe('fresh')
  );
});
