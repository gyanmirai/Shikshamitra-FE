import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import {
  useWaiveAdmissionDocumentMutation,
  useReviewAdmissionDocumentMutation,
  useUploadAdmissionDocumentMutation,
  useRecordAdmissionDocumentOriginalMutation,
} from 'src/redux/student/admissions/admission-document-verification-api';

import type { DocumentAction, DocumentActionValues } from './document-action-model';

export function useDocumentActions(
  summary: ApplicationDocumentVerification,
  requirement: AdmissionDocumentRequirement
) {
  const [upload] = useUploadAdmissionDocumentMutation();
  const [original] = useRecordAdmissionDocumentOriginalMutation();
  const [review] = useReviewAdmissionDocumentMutation();
  const [waive] = useWaiveAdmissionDocumentMutation();
  return async (action: DocumentAction, values: DocumentActionValues) => {
    const key = {
      applicationId: summary.applicationId,
      stageInstanceId: summary.stageInstanceId,
      concurrencyStamp: summary.concurrencyStamp,
      code: requirement.code,
    };
    const notes = values.notes.trim();
    if (action === 'upload' && values.file)
      return upload({ ...key, file: values.file, notes }).unwrap();
    if (action === 'original') return original({ ...key, notes }).unwrap();
    if (action === 'waive') return waive({ ...key, reason: notes }).unwrap();
    const latest = requirement.evidence.at(-1);
    if ((action === 'accept' || action === 'reject') && latest)
      return review({
        evidenceId: latest.id,
        concurrencyStamp: key.concurrencyStamp,
        decision: action === 'accept' ? 'accepted' : 'rejected',
        reason: notes || undefined,
      }).unwrap();
    throw new Error('Refresh the checklist before trying this action again.');
  };
}
