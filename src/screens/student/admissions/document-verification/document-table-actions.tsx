import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Button, MenuItem, MenuList, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { getDocumentTableFile } from './document-table-model';
import { DocumentDownloadButton } from './document-download-button';
import { DocumentEvidenceHistory } from './document-evidence-history';
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const hasEvidence = requirement.evidence.length > 0;
  const file = getDocumentTableFile(requirement);
  const canReadHistory = permissions.view && hasEvidence;
  const canDownload = permissions.view && permissions.download && file?.canDownload;
  const canCollect = permissions.view && !readOnly;
  const canUpload = canCollect && requirement.canUpload && permissions.upload;
  const uploadLabel = `${requirement.evidence.some((item) => item.fileName) ? 'Upload Replacement' : 'Upload Document'} for ${requirement.name}`;
  const collectionActions = canCollect
    ? getDocumentReviewActions(requirement, permissions, readOnly, allowWaivers).filter(
        (action) => action === 'original' || action === 'waive'
      )
    : [];
  return (
    <>
      <ThreeDotsActions
        showViewIcon
        showThreeDots={canReadHistory || Boolean(canDownload) || collectionActions.length > 0}
        viewLabel={`View Document For ${requirement.name}`}
        viewIcon={GlobalIcons.eye}
        disableViewIcon={!permissions.view || !hasEvidence || !onView}
        handleViewClick={onView}
        moreLabel={`More Actions For ${requirement.name}`}
        sx={{ justifyContent: 'flex-start' }}
        directActions={
          canUpload
            ? [
                {
                  id: 'upload',
                  label: uploadLabel,
                  icon: GlobalIcons.upload,
                  disabled: disabled || !onAction,
                  tooltip: disabled ? 'Wait for the Current Update to Finish.' : uploadLabel,
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
            aria-label={`More Actions For ${requirement.name}`}
          >
            {canReadHistory && (
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  setHistoryOpen(true);
                }}
              >
                <Iconify icon="mdi:history" width={16} sx={{ mr: 1 }} />
                History
              </MenuItem>
            )}
            {canDownload && file?.fileName && (
              <DocumentDownloadButton
                menu
                evidenceId={file.id}
                fileName={file.fileName}
                disabled={disabled}
                onComplete={popover.onClose}
              />
            )}
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
      {historyOpen && canReadHistory && (
        <CustomDialog
          open
          title={`${requirement.name} · History`}
          titleInfo="Review uploaded versions, decisions and rejection reasons."
          handleClose={() => setHistoryOpen(false)}
          hasForm={false}
          guardUnsavedChanges={false}
          maxWidth="sm"
        >
          <DialogScrollContent>
            <DocumentEvidenceHistory
              evidence={requirement.evidence}
              allowDownload={permissions.download}
            />
          </DialogScrollContent>
          <DialogActions sx={{ px: 2, py: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setHistoryOpen(false)}
              startIcon={<Iconify icon="mdi:close" />}
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}
