import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { profileInformationApi } from './student-profile-information-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const statusPath = '*/api/app/student-document/required-documents-status/:studentId';
const documentPath = '*/api/app/student-document/document';
const uploadPath = '*/api/app/student-document/upload-document/:studentId';
let store: ReturnType<typeof createDocumentTestStore>;
function stubDocumentUrls() {
  const createUrl = vi.fn(() => 'blob:private-student-document');
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
});

it('reads canonical required-status routes and unwraps raw and wrapped results', async () => {
  const seen: unknown[] = [];
  mswServer.use(
    http.get(statusPath, ({ params }) => {
      seen.push(params.studentId);
      const rows = [{ documentTypeId: 'type-1', documentTypeName: 'Photo', isUploaded: false }];
      return HttpResponse.json(params.studentId === 'student-1' ? rows : { data: rows });
    })
  );
  const results = await Promise.all(
    ['student-1', 'student-2'].map((studentId) =>
      store
        .dispatch(
          profileInformationApi.endpoints.getProfileStudentDocuments.initiate({ studentId })
        )
        .unwrap()
    )
  );
  results.forEach((result) => {
    expect(result).toEqual([
      { documentTypeId: 'type-1', documentTypeName: 'Photo', isUploaded: false },
    ]);
  });
  expect(seen).toHaveLength(2);
  expect(seen).toEqual(expect.arrayContaining(['student-1', 'student-2']));
});

it('sends the backend processed-file JSON contract and refreshes only the affected document collection', async () => {
  const reads = new Map<string, number>();
  const body = {
    documentTypeId: 'type-1',
    fileName: 'photo.png',
    contentType: 'image/png',
    size: 5,
    content: btoa('image'),
  };
  mswServer.use(
    http.get(statusPath, ({ params }) => {
      const key = String(params.studentId);
      reads.set(key, (reads.get(key) ?? 0) + 1);
      return HttpResponse.json([]);
    }),
    http.post(uploadPath, async ({ params, request }) => {
      expect(params.studentId).toBe('student-1');
      expect(request.headers.get('content-type')).toContain('application/json');
      expect(await request.json()).toEqual(body);
      return HttpResponse.json({ documentId: 'uploaded-file-1' });
    })
  );
  await store
    .dispatch(
      profileInformationApi.endpoints.getProfileStudentDocuments.initiate({
        studentId: 'student-1',
      })
    )
    .unwrap();
  await store
    .dispatch(
      profileInformationApi.endpoints.getProfileStudentDocuments.initiate({
        studentId: 'student-2',
      })
    )
    .unwrap();
  await store
    .dispatch(
      profileInformationApi.endpoints.uploadProfileStudentDocument.initiate({
        studentId: 'student-1',
        body,
      })
    )
    .unwrap();
  await vi.waitFor(() => expect(reads.get('student-1')).toBe(2));
  expect(reads.get('student-2')).toBe(1);
});

it('decodes canonical JSON download bytes outside Redux and clears the temporary URL', async () => {
  const bytes = btoa('%PDF-1.7');
  let authorization = '';
  mswServer.use(
    http.get(documentPath, ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('studentId')).toBe('student-1');
      expect(params.get('documentId')).toBe('document-1');
      authorization = request.headers.get('authorization') ?? '';
      return HttpResponse.json({
        fileName: 'folder/record.pdf',
        contentType: 'application/pdf',
        content: bytes,
      });
    })
  );
  const { createUrl, revokeUrl } = stubDocumentUrls();
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    expect(this.download).toBe('record.pdf');
  });
  expect(
    await store
      .dispatch(
        profileInformationApi.endpoints.downloadProfileStudentDocument.initiate({
          studentId: 'student-1',
          documentId: 'document-1',
        })
      )
      .unwrap()
  ).toEqual({ downloaded: true });
  expect(authorization).toBe('Bearer test-document-token');
  expect(click).toHaveBeenCalledOnce();
  expect(createUrl).toHaveBeenCalledOnce();
  const cached = JSON.stringify(store.getState().api.mutations);
  expect(cached).not.toContain(bytes);
  expect(cached).not.toContain('blob:private-student-document');
  await vi.waitFor(() => expect(revokeUrl).toHaveBeenCalledWith('blob:private-student-document'), {
    timeout: 2000,
  });
});

it('does not turn a denied canonical download into a file or successful response', async () => {
  mswServer.use(
    http.get(documentPath, () => HttpResponse.json({ detail: 'Access denied' }, { status: 403 }))
  );
  const { createUrl } = stubDocumentUrls();
  await expect(
    store
      .dispatch(
        profileInformationApi.endpoints.downloadProfileStudentDocument.initiate({
          studentId: 'student-1',
          documentId: 'document-1',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 403 });
  expect(createUrl).not.toHaveBeenCalled();
});
