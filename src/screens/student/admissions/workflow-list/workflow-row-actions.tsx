import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export type WorkflowActionPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canClone: boolean;
  canCreateVersion: boolean;
  canArchive: boolean;
  canViewUsage: boolean;
};

type Props = WorkflowActionPermissions & {
  workflow: AdmissionWorkflow;
  onEdit: () => void;
  onClone: () => void;
  onCreateVersion: () => void;
  onUsage: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function WorkflowRowActions({
  workflow,
  canEdit,
  canDelete,
  canClone,
  canCreateVersion,
  canArchive,
  canViewUsage,
  onEdit,
  onClone,
  onCreateVersion,
  onUsage,
  onArchive,
  onDelete,
}: Props) {
  const actions: AdaptiveThreeDotsAction[] = [];
  if (canEdit)
    actions.push({
      id: 'edit',
      label: `Edit `,
      icon: 'solar:pen-bold',
      disabled: workflow.status !== 0,
      onClick: onEdit,
    });
  if (canDelete)
    actions.push({
      id: 'delete',
      label: `Delete `,
      icon: 'solar:trash-bin-trash-bold',
      color: workflow.status === 0 ? 'error.main' : 'text.disabled',
      disabled: workflow.status !== 0,
      onClick: onDelete,
    });
  if (canClone)
    actions.push({
      id: 'clone',
      label: `Clone  as draft`,
      icon: 'mdi:content-copy',
      onClick: onClone,
    });
  if (canCreateVersion && [1, 2, 7].includes(workflow.status))
    actions.push({
      id: 'new-version',
      label: `Create new version `,
      icon: 'mdi:file-plus-outline',
      onClick: onCreateVersion,
    });
  if (canViewUsage)
    actions.push({
      id: 'usage',
      label: `View usage `,
      icon: 'mdi:chart-box-outline',
      onClick: onUsage,
    });
  if (canArchive && [1, 7].includes(workflow.status))
    actions.push({
      id: 'archive',
      label: `Archive `,
      icon: 'mdi:archive-outline',
      color: 'warning.main',
      onClick: onArchive,
    });

  return (
    <AdaptiveThreeDotsActions
      placement="right-top"
      moreLabel={`More actions  `}
      mobileDirectActionLimit={0}
      sx={{
        gap: 0,
        '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } },
      }}
      actions={actions}
    />
  );
}
