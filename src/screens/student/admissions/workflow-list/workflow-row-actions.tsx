import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { isAdmissionWorkflowPublishable } from '../workflow-access';

export type WorkflowActionPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canClone: boolean;
  canCreateVersion: boolean;
  canArchive: boolean;
  canReopen: boolean;
  canViewUsage: boolean;
  canPublish?: boolean;
};

type Props = WorkflowActionPermissions & {
  workflow: AdmissionWorkflow;
  onEdit: () => void;
  onClone: () => void;
  onCreateVersion: () => void;
  onUsage: () => void;
  onArchive: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  busy?: boolean;
};

export function WorkflowRowActions({
  workflow,
  canEdit,
  canDelete,
  canClone,
  canCreateVersion,
  canArchive,
  canReopen,
  canViewUsage,
  canPublish,
  publishing = false,
  busy = false,
  onEdit,
  onClone,
  onCreateVersion,
  onUsage,
  onArchive,
  onReopen,
  onDelete,
  onPublish,
}: Props) {
  const actions: AdaptiveThreeDotsAction[] = [];
  const showPublish = Boolean(canPublish && isAdmissionWorkflowPublishable(workflow.status));
  const deleteAction: AdaptiveThreeDotsAction = {
    id: 'delete',
    label: `Delete ${workflow.name}`,
    icon: 'mdi:delete-outline',
    color: workflow.status === 0 ? 'error.main' : 'text.disabled',
    disabled: workflow.status !== 0,
    onClick: onDelete,
  };
  if (showPublish)
    actions.push({
      id: 'publish',
      label: `Publish ${workflow.name}`,
      icon: 'mdi:publish',
      loading: publishing,
      onClick: onPublish,
    });
  if (canReopen && workflow.status === 2)
    actions.push({
      id: 'reopen',
      label: 'Re-open',
      icon: 'mdi:archive-arrow-up-outline',
      onClick: onReopen,
    });
  if (canEdit)
    actions.push({
      id: 'edit',
      label: `Edit ${workflow.name}`,
      icon: 'mdi:pencil-outline',
      disabled: ![0, 3].includes(workflow.status),
      tooltip: [0, 3].includes(workflow.status)
        ? undefined
        : 'Only draft and validated workflows can be edited.',
      onClick: onEdit,
    });
  if (canDelete && !showPublish) actions.push(deleteAction);
  if (canClone)
    actions.push({
      id: 'clone',
      label: 'Clone as draft',
      icon: 'mdi:content-copy',
      onClick: onClone,
    });
  if (canDelete && showPublish) actions.push(deleteAction);
  if (canCreateVersion && [1, 2, 7].includes(workflow.status))
    actions.push({
      id: 'new-version',
      label: 'Create new version',
      icon: 'mdi:file-plus-outline',
      onClick: onCreateVersion,
    });
  if (canViewUsage)
    actions.push({
      id: 'usage',
      label: 'View usage',
      icon: 'mdi:chart-box-outline',
      onClick: onUsage,
    });
  if (canArchive && [1, 7].includes(workflow.status))
    actions.push({
      id: 'archive',
      label: 'Archive',
      icon: 'mdi:archive-outline',
      color: 'warning.main',
      onClick: onArchive,
    });

  return (
    <AdaptiveThreeDotsActions
      placement="right-top"
      moreLabel={`Actions for ${workflow.name}`}
      directActionLimit={3}
      mobileDirectActionLimit={showPublish ? 1 : 0}
      sx={{
        justifyContent: 'flex-end',
        gap: 0,
        '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } },
      }}
      actions={actions.map((action) => ({ ...action, disabled: busy || action.disabled }))}
    />
  );
}
