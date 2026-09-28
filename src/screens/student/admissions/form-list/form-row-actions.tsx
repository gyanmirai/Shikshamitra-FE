import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

type Props = {
  form: AdmissionForm;
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canOverrideMakerChecker: boolean;
  currentUserId?: string | null;
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
  const actions: AdaptiveThreeDotsAction[] = [];
  if (canManage) actions.push({ id: 'edit', label: `Edit ${form.name}`, icon: 'solar:pen-bold', disabled: !visible.edit, onClick: onEdit });
  if (canDelete) actions.push({ id: 'delete', label: `Delete ${form.name}`, icon: 'solar:trash-bin-trash-bold', color: visible.delete ? 'error.main' : 'text.disabled', disabled: !visible.delete, onClick: onDelete });
  if (visible.clone) actions.push({ id: 'clone', label: `Clone ${form.name} as draft`, icon: 'mdi:content-copy', onClick: onClone });
  if (visible.validate) actions.push({ id: 'validate', label: `Validate ${form.name}`, icon: 'mdi:check-decagram-outline', onClick: onValidate });
  if (visible.requestApproval) actions.push({ id: 'request-approval', label: `Request approval for ${form.name}`, icon: 'mdi:account-arrow-right-outline', onClick: onRequestApproval });
  if (visible.approve) actions.push({ id: 'approve', label: `${isApprovalRequester ? 'Approve with admin override' : 'Approve'} ${form.name}`, icon: 'mdi:check-circle-outline', onClick: onApprove });
  if (visible.reject) actions.push({ id: 'reject', label: `${isApprovalRequester ? 'Request changes with admin override for' : 'Request changes for'} ${form.name}`, icon: 'mdi:close-circle-outline', onClick: onReject });
  if (canPublish && form.status === 0 && form.approvalStatus === 1 && isApprovalRequester && !canOverrideMakerChecker) {
    actions.push({ id: 'awaiting-reviewer', label: 'Awaiting another authorized reviewer', icon: 'mdi:account-clock-outline', disabled: true, onClick: () => {} });
  }
  if (visible.publish) actions.push({ id: 'publish', label: `Publish ${form.name}`, icon: 'mdi:publish', onClick: onPublish });
  if (visible.createVersion) actions.push({ id: 'new-version', label: `New version of ${form.name}`, icon: 'mdi:source-branch-plus', onClick: onCreateVersion });
  if (visible.archive) actions.push({ id: 'archive', label: `Archive ${form.name}`, icon: 'mdi:archive-outline', onClick: onArchive });
  if (visible.history) actions.push({ id: 'history', label: `History & versions for ${form.name}`, icon: 'mdi:history', onClick: onHistory });

  return <AdaptiveThreeDotsActions placement="right-top" moreLabel={`More actions for ${form.name}`} mobileDirectActionLimit={0} sx={{ gap: 0, '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } } }} actions={actions} />;
}
