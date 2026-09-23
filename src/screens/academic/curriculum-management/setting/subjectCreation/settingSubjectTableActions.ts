import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import type { ISubject } from './type';

type SubjectTableActionOptions = {
  canAdd: boolean;
  canView: boolean;
  canDelete: boolean;
  onViewUsage: (subject: ISubject) => void;
  onEdit: (subject: ISubject) => void;
  onArchive: (subject: ISubject) => void;
  onRestore: (subject: ISubject) => void;
  onDelete: (subject: ISubject) => void;
};

export function getSettingSubjectTableActions(
  subject: ISubject,
  isArchived: boolean,
  options: SubjectTableActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.canView) {
    actions.push({
      id: 'view-usage',
      label: 'View usage',
      icon: GlobalIcons.eye,
      onClick: () => options.onViewUsage(subject),
    });
  }

  if (isArchived) {
    if (options.canAdd) {
      actions.push({
        id: 'restore',
        label: 'Restore subject',
        icon: 'solar:restart-bold',
        color: 'success.main',
        onClick: () => options.onRestore(subject),
      });
    }

    return actions;
  }

  if (options.canAdd) {
    actions.push(
      {
        id: 'edit',
        label: 'Edit subject',
        icon: GlobalIcons.edit,
        onClick: () => options.onEdit(subject),
      },
      {
        id: 'archive',
        label: 'Archive subject',
        icon: 'solar:archive-bold',
        color: 'warning.main',
        onClick: () => options.onArchive(subject),
      }
    );
  }

  if (options.canDelete) {
    const disabled = !subject.canDelete;
    const disabledReason = 'This subject is already used. View usage before deleting.';

    actions.push({
      id: 'delete',
      label: 'Delete subject',
      icon: GlobalIcons.delete,
      color: 'error.main',
      disabled,
      tooltip: disabled ? disabledReason : undefined,
      onClick: () => options.onDelete(subject),
    });
  }

  return actions;
}
