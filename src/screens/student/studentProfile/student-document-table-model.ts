import type { StudentAdmissionEvidence } from 'src/redux/student/admissions/student-admission-evidence-api';
import type {
  ProfileStudentDocumentUpload,
  ProfileStudentDocumentRequirement,
} from 'src/redux/student/records/student-profile-information-api';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { documentStatusLabels } from 'src/screens/student/admissions/document-verification/document-status';

export type StudentDocumentRequirement = ProfileStudentDocumentRequirement;

// Matches StudentLifeCycleStatusEnum and StudentDocumentManager.ValidateStudentStatus.
export const studentDocumentUploadStatuses = {
  registrationFormIssued: 2,
  registration: 4,
} as const;
export const studentStatusAllowsDocumentUpload = (status: number) =>
  status === studentDocumentUploadStatuses.registrationFormIssued ||
  status === studentDocumentUploadStatuses.registration;

export function canRetainStudentDocumentsAfterFailure(failure: unknown): boolean {
  const status =
    failure && typeof failure === 'object' && 'status' in failure ? failure.status : undefined;
  return (
    status === 'FETCH_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    (typeof status === 'number' && status >= 500 && status <= 599)
  );
}

export async function studentDocumentUploadPayload(
  file: File,
  documentTypeId: string
): Promise<ProfileStudentDocumentUpload> {
  const dataUrl = await fileToBase64(file);
  return {
    documentTypeId,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
    content: dataUrl.slice(dataUrl.indexOf(',') + 1),
  };
}

export type StudentDocumentTableRow = {
  id: string;
  name: string;
  source: 'Student record' | 'Admission';
  file: string;
  recordedAt?: string | null;
  status: string;
  canView: boolean;
  canDownload: boolean;
  document?: StudentDocumentRequirement;
  evidence?: StudentAdmissionEvidence[];
};

export function buildStudentDocumentRows(
  documents: StudentDocumentRequirement[],
  evidence: StudentAdmissionEvidence[]
): StudentDocumentTableRow[] {
  const rows: StudentDocumentTableRow[] = documents.map((document) => ({
    id: `student:${document.documentTypeId}`,
    name: document.documentTypeName,
    source: 'Student record',
    file: document.fileName || '—',
    recordedAt: document.creationTime,
    status: document.isUploaded ? 'Uploaded' : 'Missing',
    canView: document.isUploaded && Boolean(document.uploadedDocumentId),
    canDownload: document.isUploaded && Boolean(document.uploadedDocumentId),
    document,
  }));
  const groups = new Map<string, StudentAdmissionEvidence[]>();
  evidence.forEach((item) => {
    const key = `${item.applicationId}:${item.stageInstanceId}:${item.requirementCode}`;
    const versions = groups.get(key) ?? [];
    versions.push(item);
    groups.set(key, versions);
  });
  groups.forEach((items, key) => {
    const versions = [...items].sort((left, right) => left.versionNumber - right.versionNumber);
    const latest = versions.at(-1)!;
    rows.push({
      id: `admission:${key}`,
      name: latest.requirementLabel,
      source: 'Admission',
      file:
        latest.kind === 'waiver'
          ? 'Requirement waived'
          : latest.kind === 'original'
            ? 'Physical original recorded'
            : latest.fileName || 'File unavailable',
      recordedAt: latest.submittedAt,
      status: documentStatusLabels[latest.status],
      canView: true,
      canDownload: latest.canDownload && Boolean(latest.fileName),
      evidence: versions,
    });
  });
  return rows;
}

const formatAcceptedFormat = (format: unknown): string => {
  if (typeof format === 'string') return format.trim();
  if (typeof format === 'number') return String(format);
  if (format && typeof format === 'object') {
    const item = format as { label?: unknown; name?: unknown; value?: unknown };
    return formatAcceptedFormat(item.label ?? item.name ?? item.value);
  }
  return '';
};

export function studentDocumentUploadError(failure: unknown, name: string): string | undefined {
  const error = failure as { data?: { error?: unknown } & Record<string, unknown> };
  const body = (error?.data?.error ?? error?.data) as
    { code?: string; data?: { AcceptedFormats?: unknown; acceptedFormats?: unknown } } | undefined;
  if (body?.code !== 'Document:InvalidFormat') return undefined;
  const formats = body.data?.AcceptedFormats ?? body.data?.acceptedFormats;
  const accepted = Array.isArray(formats)
    ? formats.map(formatAcceptedFormat).filter(Boolean).join(', ')
    : formatAcceptedFormat(formats);
  return accepted
    ? `Invalid format for ${name}. Accepted formats: ${accepted}`
    : `Invalid document format for ${name}.`;
}
