import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

import {
  getDocumentReviewActions,
  documentReviewActionIcons,
  documentReviewActionLabels,
} from './document-review-model';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentTableActions({
  requirement,
  permissions,
  onView,
  onAction,
  disabled = false,
  readOnly = false,
  allowWaivers = false,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  onView?: () => void;
  onAction?: (action: DocumentAction) => void;
  disabled?: boolean;
  readOnly?: boolean;
  allowWaivers?: boolean;
}) {
  const hasEvidence = requirement.evidence.length > 0;
  const canCollect = permissions.view && !readOnly;
  const canUpload = canCollect && requirement.canUpload && permissions.upload;
  const uploadLabel = `${requirement.evidence.some((item) => item.fileName) ? 'Upload replacement' : 'Upload document'} for ${requirement.name}`;
  // Once evidence exists these less-frequent actions remain in the review workspace.
  // Missing original-only requirements still need a reachable collection action.
  const collectionActions =
    !hasEvidence && canCollect
      ? getDocumentReviewActions(requirement, permissions, readOnly, allowWaivers).filter(
          (action) => action === 'original' || action === 'waive'
        )
      : [];
  return (
    <ThreeDotsActions
      showViewIcon
      showThreeDots={collectionActions.length > 0}
      viewLabel={`View document for ${requirement.name}`}
      viewIcon={GlobalIcons.eye}
      disableViewIcon={!permissions.view || !hasEvidence || !onView}
      handleViewClick={onView}
      moreLabel={`More actions for ${requirement.name}`}
      sx={{ justifyContent: 'flex-start' }}
      directActions={
        canUpload
          ? [
              {
                id: 'upload',
                label: uploadLabel,
                icon: GlobalIcons.upload,
                disabled: disabled || !onAction,
                tooltip: disabled ? 'Wait for the current update to finish.' : uploadLabel,
                onClick: () => {
                  if (!disabled) onAction?.('upload');
                },
              },
            ]
          : []
      }
      actions={({ popover }) => (
        <MenuList
          dense
          autoFocusItem={popover.open}
          aria-label={`More actions for ${requirement.name}`}
        >
          {collectionActions.map((action) => (
            <MenuItem
              key={action}
              disabled={disabled || !onAction}
              onClick={() => {
                if (disabled || !onAction) return;
                popover.onClose();
                onAction(action);
              }}
            >
              <Iconify icon={documentReviewActionIcons[action]} width={16} sx={{ mr: 1 }} />
              {documentReviewActionLabels[action]}
            </MenuItem>
          ))}
        </MenuList>
      )}
    />
  );
}
