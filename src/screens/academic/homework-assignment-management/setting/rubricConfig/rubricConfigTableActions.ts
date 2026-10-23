import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { GlobalIcons } from 'src/utils/icons';
import { RubricStatus } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

type RubricConfigActionOptions = {
  canAdd: boolean;
  canDelete: boolean;
  onPreview: (rubric: AssessmentRubricDto) => void;
  onEdit: (rubric: AssessmentRubricDto) => void;
  onDuplicate: (rubric: AssessmentRubricDto) => void;
  onPublish: (rubric: AssessmentRubricDto) => void;
  onUsage: (rubric: AssessmentRubricDto) => void;
  onArchive: (rubric: AssessmentRubricDto) => void;
};

export function getRubricConfigTableActions(
  rubric: AssessmentRubricDto,
  options: RubricConfigActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [
    {
      id: 'preview',
      label: `Preview ${rubric.title}`,
      icon: GlobalIcons.eye,
      onClick: () => options.onPreview(rubric),
    },
  ];

  if (options.canAdd && rubric.status === RubricStatus.Draft) {
    actions.push({
      id: 'edit',
      label: `Edit ${rubric.title}`,
      icon: GlobalIcons.edit,
      onClick: () => options.onEdit(rubric),
    });
  }

  if (options.canAdd) {
    actions.push({
      id: 'duplicate',
      label: `Duplicate ${rubric.title}`,
      icon: GlobalIcons.copy,
      onClick: () => options.onDuplicate(rubric),
    });
  }

  if (options.canAdd && rubric.status === RubricStatus.Draft) {
    actions.push({
      id: 'publish',
      label: 'Publish',
      icon: GlobalIcons.upload,
      onClick: () => options.onPublish(rubric),
    });
  }

  actions.push({
    id: 'usage',
    label: 'View usage',
    icon: GlobalIcons.usage,
    onClick: () => options.onUsage(rubric),
  });

  if (options.canDelete && rubric.status !== RubricStatus.Archived) {
    actions.push({
      id: 'archive',
      label: 'Archive',
      icon: GlobalIcons.archive,
      color: 'error.main',
      onClick: () => options.onArchive(rubric),
    });
  }

  return actions;
}
