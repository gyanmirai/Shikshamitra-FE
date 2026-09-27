import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import { SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectFormValues } from '../type';

type SubjectActionOptions = {
  canAdd: boolean;
  canDelete: boolean;
  onEdit: (row: ISubjectFormValues) => void;
  onDelete: (row: ISubjectFormValues) => void;
  onArchive?: (row: ISubjectFormValues) => void;
  onRestore?: (row: ISubjectFormValues) => void;
};

export function getSubjectTableActions(
  subject: ISubjectFormValues,
  options: SubjectActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];
  const subjectName = subject.subjectName || 'subject';
  const isArchived = subject.status === SubjectAssignmentStatus.Archived;

  if (options.canAdd) {
    actions.push({
      id: 'edit',
      label: `Edit ${subjectName}`,
      icon: GlobalIcons.edit,
      onClick: () => options.onEdit(subject),
    });
  }

  if (isArchived && options.canAdd) {
    actions.push({
      id: 'reactivate',
      label: `Reactivate ${subjectName}`,
      icon: 'mdi:restore',
      color: 'success.main',
      onClick: () => options.onRestore?.(subject),
    });
  }

  if (!isArchived && options.canDelete && subject.status !== SubjectAssignmentStatus.Draft) {
    actions.push({
      id: 'archive',
      label: `Archive ${subjectName}`,
      icon: GlobalIcons.archive,
      color: 'warning.main',
      onClick: () => options.onArchive?.(subject),
    });
  }

  if (options.canDelete) {
    const removeDisabled = subject.canDelete === false;
    actions.push({
      id: 'remove',
      label: `Remove ${subjectName}`,
      icon: 'mdi:minus-circle-outline',
      color: 'error.main',
      disabled: removeDisabled,
      tooltip: removeDisabled
        ? subject.deleteDisabledReason ||
          'This subject is already used in another module. Remove those references before removing it.'
        : undefined,
      onClick: () => options.onDelete(subject),
    });
  }

  return actions;
}
