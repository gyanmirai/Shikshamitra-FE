import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { documentActionLabels } from './document-action-model';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

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
  const actions: DocumentAction[] = [];
  if (!readOnly) {
    if (requirement.canRecordOriginal && permissions.original) actions.push('original');
    if ((requirement.canAccept ?? requirement.canReview) && permissions.review)
      actions.push('accept');
    if (requirement.canReview && permissions.review) actions.push('reject');
    if (allowWaivers && requirement.canWaive && permissions.waive) actions.push('waive');
  }
  const hasHistory = permissions.view && requirement.evidence.length > 0;
  if (!actions.length && !hasHistory) return null;
  return (
    <ThreeDotsActions
      sx={{ justifyContent: 'center' }}
      moreLabel={`More actions for ${requirement.name}`}
      actions={({ popover }) => (
        <>
          {actions.map((action) => (
            <MenuItem
              key={action}
              disabled={disabled}
              onClick={() => {
                popover.onClose();
                onAction(action);
              }}
            >
              {documentActionLabels[action]}
            </MenuItem>
          ))}
          {hasHistory && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                onHistory();
              }}
            >
              Evidence history ({requirement.evidence.length})
            </MenuItem>
          )}
        </>
      )}
    />
  );
}
