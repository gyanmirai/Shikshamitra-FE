import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import type { LessonPlanRow } from './lessonPlanData';

type LessonPlanTableActionOptions = {
  canManageDiary: boolean;
  canView: boolean;
  hasDiary: boolean;
  diaryDisabled: boolean;
  diaryTooltip: string;
  onOpenDiary: (plan: LessonPlanRow) => void;
  onViewDetails: (plan: LessonPlanRow) => void;
};

export function getLessonPlanTableActions(
  plan: LessonPlanRow,
  options: LessonPlanTableActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.canManageDiary) {
    actions.push({
      id: 'diary',
      label: options.hasDiary ? 'Edit diary notes' : 'Add diary notes',
      icon: 'mdi:notebook-edit-outline',
      color: 'primary.main',
      disabled: options.diaryDisabled,
      tooltip: options.diaryTooltip,
      onClick: () => options.onOpenDiary(plan),
    });
  }

  if (options.canView) {
    actions.push({
      id: 'view',
      label: 'View details',
      icon: GlobalIcons.eye,
      color: 'text.secondary',
      onClick: () => options.onViewDetails(plan),
    });
  }

  return actions;
}
