import type { StudentAdmissionEvidence } from 'src/redux/student/admissions/student-admission-evidence-api';

import { it, expect } from 'vitest';

import {
  buildStudentDocumentRows,
  studentDocumentUploadError,
  studentDocumentUploadPayload,
  canRetainStudentDocumentsAfterFailure,
} from './student-document-table-model';

const evidence: StudentAdmissionEvidence = {
  id: 'evidence-1',
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  requirementCode: 'birth',
  requirementLabel: 'Birth certificate',
  versionNumber: 1,
  kind: 'upload',
  fileName: 'birth.pdf',
  originalSeen: false,
  submittedBy: 'staff-1',
  submittedAt: '2026-10-10T10:00:00Z',
  status: 'accepted',
  canDownload: true,
  reviews: [],
};

it('uses one table row for each retained requirement while preserving its ordered evidence versions', () => {
  const replacement = {
    ...evidence,
    id: 'evidence-2',
    versionNumber: 2,
    fileName: 'corrected.pdf',
  };
  const rows = buildStudentDocumentRows([], [replacement, evidence]);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    name: 'Birth certificate',
    source: 'Admission',
    file: 'corrected.pdf',
    status: 'Accepted',
    canDownload: true,
  });
  expect(rows[0].evidence?.map((item) => item.id)).toEqual(['evidence-1', 'evidence-2']);
});

it('keeps application and stage evidence distinct even when they use the same requirement code', () => {
  expect(
    buildStudentDocumentRows(
      [],
      [
        evidence,
        { ...evidence, id: 'evidence-2', applicationId: 'application-2' },
        { ...evidence, id: 'evidence-3', stageInstanceId: 'stage-2' },
      ]
    )
  ).toHaveLength(3);
});

it.each([
  { kind: 'original' as const, status: 'accepted' as const, file: 'Physical original recorded' },
  { kind: 'waiver' as const, status: 'waived' as const, file: 'Requirement waived' },
])(
  'allows retained $kind history without inventing an uploaded file or upload target',
  ({ kind, status, file }) => {
    const [row] = buildStudentDocumentRows(
      [],
      [{ ...evidence, kind, status, fileName: null, canDownload: false }]
    );
    expect(row).toMatchObject({ file, canView: true, canDownload: false });
    expect(row.document).toBeUndefined();
  }
);

it('does not enable student preview/download based only on the uploaded flag when the uploaded ID is absent', () => {
  const [row] = buildStudentDocumentRows(
    [{ documentTypeId: 'type-1', documentTypeName: 'Photo', isUploaded: true }],
    []
  );
  expect(row).toMatchObject({
    source: 'Student record',
    status: 'Uploaded',
    canView: false,
    canDownload: false,
  });
});

it('does not label an upload with missing metadata as a physical original', () => {
  const [row] = buildStudentDocumentRows([], [{ ...evidence, fileName: null, canDownload: false }]);
  expect(row).toMatchObject({ file: 'File unavailable', canDownload: false });
});

it('retains actionable accepted-format feedback for ordinary upload validation', () => {
  expect(
    studentDocumentUploadError(
      {
        data: {
          error: {
            code: 'Document:InvalidFormat',
            data: { AcceptedFormats: [{ label: 'PDF' }, 'JPG'] },
          },
        },
      },
      'Photo'
    )
  ).toBe('Invalid format for Photo. Accepted formats: PDF, JPG');
  expect(studentDocumentUploadError({ data: { code: 'Document:InvalidFormat' } }, 'Photo')).toBe(
    'Invalid document format for Photo.'
  );
  expect(
    studentDocumentUploadError({ data: { message: 'Temporary failure' } }, 'Photo')
  ).toBeUndefined();
});

it('serializes actual uploaded file bytes with the processed DTO metadata', async () => {
  expect(
    await studentDocumentUploadPayload(
      new File(['image'], 'student.png', { type: 'image/png' }),
      'type-1'
    )
  ).toEqual({
    documentTypeId: 'type-1',
    fileName: 'student.png',
    contentType: 'image/png',
    size: 5,
    content: btoa('image'),
  });
});

it('keeps previous document rows only for transient failures and masks them after denied scope or permission reads', () => {
  expect(canRetainStudentDocumentsAfterFailure({ status: 503 })).toBe(true);
  expect(canRetainStudentDocumentsAfterFailure({ status: 'FETCH_ERROR' })).toBe(true);
  expect(canRetainStudentDocumentsAfterFailure({ status: 403 })).toBe(false);
  expect(canRetainStudentDocumentsAfterFailure({ status: 401 })).toBe(false);
  expect(canRetainStudentDocumentsAfterFailure({ status: 400 })).toBe(false);
});
