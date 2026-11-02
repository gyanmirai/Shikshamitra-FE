import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';
import { profileInformationApi } from 'src/redux/student/records/student-profile-information-api';

import { StudentRegistrationApi } from './registration-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const statusPath = '*/api/app/student-document/required-documents-status/:studentId';
const uploadPath = '*/api/app/student-document/upload-document/:studentId';
const legacyStatusPath =
  '*/api/student/enrollment/registrations/:studentId/documents/required-status';
const legacyUploadPath = '*/api/student/enrollment/registrations/:studentId/documents';
const requirements = [
  { documentTypeId: 'type-1', documentTypeName: 'Certificate', isUploaded: false },
];
let store: ReturnType<typeof createDocumentTestStore>;

const form = (type = 'application/pdf') => {
  const value = new FormData();
  value.append('documentTypeId', 'type-1');
  value.append('file', new File(['%PDF-1.7\n\u0000\u0080\u00ff'], 'certificate.pdf', { type }));
  return value;
};

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-document-token' })),
    http.get(legacyStatusPath, () => HttpResponse.json({ code: 'LegacyRoute' }, { status: 410 })),
    http.post(legacyUploadPath, () => HttpResponse.json({ code: 'LegacyRoute' }, { status: 410 }))
  );
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.restoreAllMocks();
});

it.each([false, true])(
  'reads the canonical required-status contract (wrapped=%s)',
  async (wrapped) => {
    const seen: string[] = [];
    mswServer.use(
      http.get(statusPath, ({ params }) => {
        seen.push(String(params.studentId));
        return HttpResponse.json(wrapped ? { data: requirements } : requirements);
      })
    );

    await expect(
      store
        .dispatch(
          StudentRegistrationApi.endpoints.getStudentDocuments.initiate({ studentId: 'student-1' })
        )
        .unwrap()
    ).resolves.toEqual(requirements);
    expect(seen).toEqual(['student-1']);
  }
);

it.each(['application/pdf', ''])(
  'converts the existing FormData into exact canonical JSON bytes (mime=%s)',
  async (type) => {
    const body = form(type);
    const file = body.get('file') as File;
    let writes = 0;
    mswServer.use(
      http.post(uploadPath, async ({ params, request }) => {
        writes += 1;
        expect(params.studentId).toBe('student-1');
        expect(request.headers.get('content-type')).toContain('application/json');
        expect(await request.json()).toEqual({
          documentTypeId: 'type-1',
          fileName: 'certificate.pdf',
          contentType: type || 'application/octet-stream',
          size: file.size,
          content: btoa('%PDF-1.7\n\u0000\u00c2\u0080\u00c3\u00bf'),
        });
        return HttpResponse.json({ data: { documentId: 'document-1', wasReplaced: true } });
      })
    );

    await expect(
      store
        .dispatch(
          StudentRegistrationApi.endpoints.uploadStudentDocuments.initiate({
            studentId: 'student-1',
            body,
          })
        )
        .unwrap()
    ).resolves.toEqual({ documentId: 'document-1', wasReplaced: true });
    expect(writes).toBe(1);
  }
);

async function subscribeDocumentCollections(reads: Map<string, number>) {
  mswServer.use(
    http.get(statusPath, ({ params }) => {
      const id = String(params.studentId);
      reads.set(id, (reads.get(id) ?? 0) + 1);
      return HttpResponse.json(requirements);
    })
  );
  await Promise.all(
    ['student-1', 'student-2'].map((studentId) =>
      store
        .dispatch(
          profileInformationApi.endpoints.getProfileStudentDocuments.initiate({ studentId })
        )
        .unwrap()
    )
  );
}

async function finishInvalidations() {
  await new Promise((resolve) => setTimeout(resolve, 20));
  await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
}

it('refreshes only the changed Student document collection after successful upload', async () => {
  const reads = new Map<string, number>();
  await subscribeDocumentCollections(reads);
  const accepted = () => HttpResponse.json({ documentId: 'document-1' });
  // The legacy response also succeeds here so this test isolates invalidation from URL migration.
  mswServer.use(http.post(uploadPath, accepted), http.post(legacyUploadPath, accepted));

  await store
    .dispatch(
      StudentRegistrationApi.endpoints.uploadStudentDocuments.initiate({
        studentId: 'student-1',
        body: form(),
      })
    )
    .unwrap();
  await finishInvalidations();
  expect(reads.get('student-1')).toBe(2);
  expect(reads.get('student-2')).toBe(1);
});

it.each([400, 403, 503])(
  'retains the server error and document caches when upload fails (%s)',
  async (status) => {
    const reads = new Map<string, number>();
    await subscribeDocumentCollections(reads);
    const failure = {
      code: status === 400 ? 'Document:InvalidFormat' : 'Document:Denied',
      data: { AcceptedFormats: ['pdf'] },
    };
    const denied = () => HttpResponse.json(failure, { status });
    mswServer.use(http.post(uploadPath, denied), http.post(legacyUploadPath, denied));

    await expect(
      store
        .dispatch(
          StudentRegistrationApi.endpoints.uploadStudentDocuments.initiate({
            studentId: 'student-1',
            body: form(),
          })
        )
        .unwrap()
    ).rejects.toEqual({ status, data: failure });
    await finishInvalidations();
    expect(reads.get('student-1')).toBe(1);
    expect(reads.get('student-2')).toBe(1);
  }
);

it('does not send a request when the selected file cannot be read', async () => {
  const writes = vi.fn(() => HttpResponse.json({ documentId: 'unexpected' }));
  mswServer.use(http.post(uploadPath, writes), http.post(legacyUploadPath, writes));
  vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(() => {
    throw new Error('Read failed');
  });

  await expect(
    store
      .dispatch(
        StudentRegistrationApi.endpoints.uploadStudentDocuments.initiate({
          studentId: 'student-1',
          body: form(),
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
  expect(writes).not.toHaveBeenCalled();
});
