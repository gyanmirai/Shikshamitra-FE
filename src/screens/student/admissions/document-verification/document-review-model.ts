import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export const documentReviewActionLabels: Record<DocumentAction, string> = {
  upload: 'Upload document',
  original: 'Record physical original',
  accept: 'Approve',
  reject: 'Reject',
  waive: 'Waive requirement',
};

export const documentReviewActionIcons: Record<DocumentAction, string> = {
  upload: 'mdi:upload',
  original: 'mdi:file-check-outline',
  accept: 'mdi:check',
  reject: 'mdi:undo-variant',
  waive: 'mdi:file-cancel-outline',
};

export function getDocumentReviewActions(
  requirement: AdmissionDocumentRequirement,
  permissions: ReturnType<typeof useDocumentPermissions>,
  readOnly: boolean,
  allowWaivers: boolean
): DocumentAction[] {
  if (readOnly) return [];
  const actions: DocumentAction[] = [];
  if (requirement.canUpload && permissions.upload) actions.push('upload');
  if (requirement.canRecordOriginal && permissions.original) actions.push('original');
  if ((requirement.canAccept ?? requirement.canReview) && permissions.review)
    actions.push('accept');
  if (requirement.canReview && permissions.review) actions.push('reject');
  if (allowWaivers && requirement.canWaive && permissions.waive) actions.push('waive');
  return actions;
}
