import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import type { ISubject } from './type';

type SubjectTableActionOptions = {
  canAdd: boolean;
  canDelete: boolean;
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

  if (isArchived) {
    if (options.canAdd) {
      actions.push({
        id: 'restore',
        label: `Restore ${subject.name}`,
        icon: 'solar:restart-bold',
        onClick: () => options.onRestore(subject),
      });
    }

    return actions;
  }

  if (options.canAdd) {
    actions.push(
      {
        id: 'edit',
        label: `Edit ${subject.name}`,
        icon: GlobalIcons.edit,
        onClick: () => options.onEdit(subject),
      },
      {
        id: 'archive',
        label: `Archive ${subject.name}`,
        icon: 'solar:archive-bold',
        onClick: () => options.onArchive(subject),
      }
    );
  }

  if (options.canDelete) {
    const disabled = !subject.canDelete;
    const disabledReason = 'This subject is already used. View usage before deleting.';

    actions.push({
      id: 'delete',
      label: `Delete ${subject.name}`,
      icon: GlobalIcons.delete,
      color: 'error.main',
      disabled,
      tooltip: disabled ? disabledReason : undefined,
      onClick: () => options.onDelete(subject),
    });
  }

  return actions;
}
