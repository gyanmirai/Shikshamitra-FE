import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { documentPath, createDocumentTestStore } from './document-test-fixture';
import { admissionDocumentDownloadApi } from './admission-document-download-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createDocumentTestStore>;
function stubDownloadUrls() {
  const createUrl = vi.fn(() => 'blob:private-document');
  const revokeUrl = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createUrl;

      static revokeObjectURL = revokeUrl;
    }
  );
  return { createUrl, revokeUrl };
}
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-document-token' }))
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('authorizes private downloads, keeps bytes out of the RTK cache and revokes the temporary URL', async () => {
  let authorization = '';
  mswServer.use(
    http.get(`${documentPath}/evidence/evidence-1/download`, ({ request }) => {
      authorization = request.headers.get('authorization') ?? '';
      return new HttpResponse('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } });
    })
  );
  const { createUrl, revokeUrl } = stubDownloadUrls();
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  const result = await store
    .dispatch(
      admissionDocumentDownloadApi.endpoints.downloadAdmissionDocument.initiate({
        evidenceId: 'evidence-1',
        fileName: 'birth.pdf',
      })
    )
    .unwrap();
  expect(authorization).toBe('Bearer test-document-token');
  expect(result).toEqual({ downloaded: true });
  expect(createUrl).toHaveBeenCalledOnce();
  expect(click).toHaveBeenCalledOnce();
  expect(JSON.stringify(store.getState().api.mutations)).not.toContain('blob:private-document');
  expect(document.querySelector('a[download]')).toBeNull();
  await vi.waitFor(() => expect(revokeUrl).toHaveBeenCalledWith('blob:private-document'), {
    timeout: 2000,
  });
});

it('does not create a downloadable URL when the student evidence endpoint denies access', async () => {
  mswServer.use(
    http.get(
      '*/api/student/records/students/student-1/admission-evidence/evidence-1/download',
      () => HttpResponse.json({ detail: 'Access denied' }, { status: 403 })
    )
  );
  const { createUrl } = stubDownloadUrls();
  await expect(
    store
      .dispatch(
        admissionDocumentDownloadApi.endpoints.downloadAdmissionDocument.initiate({
          evidenceId: 'evidence-1',
          fileName: 'birth.pdf',
          studentId: 'student-1',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 403 });
  expect(createUrl).not.toHaveBeenCalled();
});
