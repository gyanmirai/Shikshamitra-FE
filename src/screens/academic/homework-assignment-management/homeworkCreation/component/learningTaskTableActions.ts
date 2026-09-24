import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

type LearningTaskTableActionOptions = {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canClose?: boolean;
  canViewSubmissions: boolean;
  canDelete: boolean;
  deleteDisabled: boolean;
  deleteTooltip: string;
  onView: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onClose?: () => void;
  onViewSubmissions: () => void;
  onDelete: () => void;
};

export function getLearningTaskTableActions(
  options: LearningTaskTableActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.canView) {
    actions.push({
      id: 'view',
      label: 'View details',
      icon: GlobalIcons.eye,
      onClick: options.onView,
    });
  }

  if (options.canEdit) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: GlobalIcons.edit,
      onClick: options.onEdit,
    });
  }

  if (options.canPublish) {
    actions.push({
      id: 'publish',
      label: 'Publish now',
      icon: 'solar:upload-bold',
      onClick: options.onPublish,
    });
  }

  if (options.canClose) {
    actions.push({
      id: 'close',
      label: 'Close assignment',
      icon: 'solar:lock-bold',
      onClick: () => options.onClose?.(),
    });
  }

  if (options.canViewSubmissions) {
    actions.push({
      id: 'submissions',
      label: 'View submissions',
      icon: 'solar:inbox-in-bold',
      onClick: options.onViewSubmissions,
    });
  }

  actions.push({
    id: 'reminder',
    label: 'Send reminder',
    icon: GlobalIcons.bell,
    disabled: true,
    tooltip: 'Send Reminder will be enabled after notification wiring',
    onClick: () => undefined,
  });

  if (options.canDelete) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: GlobalIcons.delete,
      color: 'error.main',
      disabled: options.deleteDisabled,
      tooltip: options.deleteTooltip,
      onClick: options.onDelete,
    });
  }

  return actions;
}
