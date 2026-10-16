import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { Stack, Typography } from '@mui/material';

import { documentActionLabels } from './document-action-model';
import { DocumentFileControl } from './document-file-control';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

const actionIcons: Record<Exclude<DocumentAction, 'upload'>, string> = {
  accept: 'mdi:check',
  reject: 'mdi:undo-variant',
  original: 'mdi:file-check-outline',
  waive: 'mdi:file-cancel-outline',
};

export function DocumentTableActions({
  requirement,
  permissions,
  disabled,
  readOnly,
  allowWaivers,
  onAction,
  onHistory,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  allowWaivers: boolean;
  onAction: (action: DocumentAction) => void;
  onHistory: () => void;
}) {
  const actions: Exclude<DocumentAction, 'upload'>[] = [];
  if (!readOnly) {
    if (requirement.canRecordOriginal && permissions.original) actions.push('original');
    if ((requirement.canAccept ?? requirement.canReview) && permissions.review)
      actions.push('accept');
    if (requirement.canReview && permissions.review) actions.push('reject');
    if (allowWaivers && requirement.canWaive && permissions.waive) actions.push('waive');
  }
  const hasHistory = permissions.view && requirement.evidence.length > 0;
  if (!actions.length && !hasHistory) return <Typography color="text.secondary">—</Typography>;
  return (
    // This checklist intentionally exposes every eligible action, per the approved design.
    <Stack direction="row" gap={0.5} justifyContent="center" useFlexGap flexWrap="wrap">
      {actions.map((action) => (
        <DocumentFileControl
          key={action}
          label={`${documentActionLabels[action]} for ${requirement.name}`}
          icon={actionIcons[action]}
          color={action === 'accept' ? 'success' : 'default'}
          disabled={disabled}
          reason="Wait for the current operation to finish."
          onClick={() => onAction(action)}
        />
      ))}
      {hasHistory && (
        <DocumentFileControl
          label={`Evidence history for ${requirement.name} (${requirement.evidence.length})`}
          icon="mdi:history"
          disabled={false}
          onClick={onHistory}
        />
      )}
    </Stack>
  );
}
