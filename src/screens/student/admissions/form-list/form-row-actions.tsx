import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

type Props = {
  form: AdmissionForm;
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canOverrideMakerChecker: boolean;
  currentUserId?: string | null;
  onPreview: () => void;
  onEdit: () => void;
  onClone: () => void;
  onValidate: () => void;
  onRequestApproval: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPublish: () => void;
  onHistory: () => void;
  onCreateVersion: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function getFormRowActionVisibility(
  status: AdmissionForm['status'],
  canManage: boolean,
  canPublish: boolean,
  canDelete: boolean,
  approvalStatus: AdmissionForm['approvalStatus'] = 0,
  isApprovalRequester = false,
  canOverrideMakerChecker = false
) {
  const isDraft = status === 0;
  const isPublished = status === 1;
  const canEditDraft = isDraft && (approvalStatus === 0 || approvalStatus === 3);

  return {
    edit: canManage && canEditDraft,
    clone: canManage,
    validate: canManage && canEditDraft,
    requestApproval: canManage && canEditDraft,
    approve:
      canPublish &&
      isDraft &&
      approvalStatus === 1 &&
      (!isApprovalRequester || canOverrideMakerChecker),
    reject:
      canPublish &&
      isDraft &&
      approvalStatus === 1 &&
      (!isApprovalRequester || canOverrideMakerChecker),
    publish: canPublish && isDraft && approvalStatus === 2,
    delete: canDelete && canEditDraft,
    history: true,
    createVersion: canPublish && isPublished,
    archive: canDelete && isPublished,
  };
}

export function FormRowActions({
  form,
  canManage,
  canPublish,
  canDelete,
  canOverrideMakerChecker,
  currentUserId,
  onPreview,
  onEdit,
  onClone,
  onValidate,
  onRequestApproval,
  onApprove,
  onReject,
  onPublish,
  onHistory,
  onCreateVersion,
  onArchive,
  onDelete,
}: Props) {
  const isApprovalRequester = Boolean(
    currentUserId &&
    form.approvalRequestedBy &&
    currentUserId.toLowerCase() === form.approvalRequestedBy.toLowerCase()
  );
  const visible = getFormRowActionVisibility(
    form.status,
    canManage,
    canPublish,
    canDelete,
    form.approvalStatus,
    isApprovalRequester,
    canOverrideMakerChecker
  );
  return (
    <ThreeDotsActions
      placement="right-top"
      moreLabel={`More actions for ${form.name}`}
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel={`Preview ${form.name}`}
      handleViewClick={onPreview}
      showEditIcon={canManage}
      editLabel={`Edit ${form.name}`}
      disableEditIcon={!visible.edit}
      handleEditClick={onEdit}
      showDeleteIcon={canDelete}
      deleteLabel={`Delete ${form.name}`}
      disableDeleteIcon={!visible.delete}
      handleDeleteClick={onDelete}
      actions={({ popover }) => {
        const run = (action: () => void) => {
          popover.onClose();
          action();
        };
        return (
          <MenuList dense>
            {visible.clone && (
              <MenuItem onClick={() => run(onClone)}>
                <Iconify icon="mdi:content-copy" /> Clone as draft
              </MenuItem>
            )}
            {visible.validate && (
              <MenuItem onClick={() => run(onValidate)}>
                <Iconify icon="mdi:check-decagram-outline" /> Validate
              </MenuItem>
            )}
            {visible.requestApproval && (
              <MenuItem onClick={() => run(onRequestApproval)}>
                <Iconify icon="mdi:account-arrow-right-outline" /> Request approval
              </MenuItem>
            )}
            {visible.approve && (
              <MenuItem onClick={() => run(onApprove)}>
                <Iconify icon="mdi:check-circle-outline" />
                {isApprovalRequester ? 'Approve with admin override' : 'Approve'}
              </MenuItem>
            )}
            {visible.reject && (
              <MenuItem onClick={() => run(onReject)}>
                <Iconify icon="mdi:close-circle-outline" />
                {isApprovalRequester ? 'Request changes with admin override' : 'Request changes'}
              </MenuItem>
            )}
            {canPublish &&
              form.status === 0 &&
              form.approvalStatus === 1 &&
              isApprovalRequester &&
              !canOverrideMakerChecker && (
                <MenuItem disabled>
                  <Iconify icon="mdi:account-clock-outline" /> Awaiting another authorized reviewer
                </MenuItem>
              )}
            {visible.publish && (
              <MenuItem onClick={() => run(onPublish)}>
                <Iconify icon="mdi:publish" /> Publish
              </MenuItem>
            )}
            {visible.createVersion && (
              <MenuItem onClick={() => run(onCreateVersion)}>
                <Iconify icon="mdi:source-branch-plus" /> New version
              </MenuItem>
            )}
            {visible.archive && (
              <MenuItem onClick={() => run(onArchive)}>
                <Iconify icon="mdi:archive-outline" /> Archive
              </MenuItem>
            )}
            {visible.history && (
              <MenuItem onClick={() => run(onHistory)}>
                <Iconify icon="mdi:history" /> History &amp; versions
              </MenuItem>
            )}
          </MenuList>
        );
      }}
    />
  );
}
