import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import type { IElectiveSubject } from '../type';

type ElectiveGroupActionOptions = {
  canAdd: boolean;
  canView: boolean;
  canDelete: boolean;
  onViewUsage: (group: IElectiveSubject) => void;
  onEdit: (group: IElectiveSubject) => void;
  onArchive: (group: IElectiveSubject) => void;
  onRestore: (group: IElectiveSubject) => void;
  onDelete: (group: IElectiveSubject) => void;
};

export function getElectiveSubjectTableActions(
  group: IElectiveSubject,
  isArchived: boolean,
  options: ElectiveGroupActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.canView) {
    actions.push({
      id: 'view-usage',
      label: 'View usage',
      icon: GlobalIcons.eye,
      onClick: () => options.onViewUsage(group),
    });
  }

  if (isArchived) {
    actions.push({
      id: 'restore',
      label: 'Restore group',
      icon: 'solar:restart-bold',
      color: 'success.main',
      onClick: () => options.onRestore(group),
    });

    return actions;
  }

  if (options.canAdd) {
    actions.push(
      {
        id: 'edit',
        label: 'Edit group',
        icon: GlobalIcons.edit,
        onClick: () => options.onEdit(group),
      },
      {
        id: 'archive',
        label: 'Archive group',
        icon: 'solar:archive-bold',
        color: 'warning.main',
        onClick: () => options.onArchive(group),
      }
    );
  }

  if (options.canDelete) {
    const disabled = !group.canDelete;
    const disabledReason =
      'This elective group is already used in class allocation. View usage before deleting.';

    actions.push({
      id: 'delete',
      label: 'Delete group',
      icon: GlobalIcons.delete,
      color: 'error.main',
      disabled,
      tooltip: disabled ? disabledReason : undefined,
      onClick: () => options.onDelete(group),
    });
  }

  return actions;
}
