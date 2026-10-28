import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useAddRubricMutation, usePublishRubricMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type { RubricEvaluationPanelProps } from './rubricEvaluationTypes';

const defaultCriteria = [
  { title: 'Concept Understanding', isRequired: true, points: 10, displayOrder: 1 },
  { title: 'Accuracy', isRequired: true, points: 10, displayOrder: 2 },
  { title: 'Presentation', isRequired: true, points: 5, displayOrder: 3 },
];

export function useDefaultRubricCreation({ mode, standardId, subjectId, taskId, taskTitle }: RubricEvaluationPanelProps) {
  const [addRubric, { isLoading: isCreating }] = useAddRubricMutation();
  const [publishRubric, { isLoading: isPublishing }] = usePublishRubricMutation();
  const createDefaultRubric = async () => {
    try {
      const created = await addRubric({
        standardId, subjectId,
        homeworkId: mode === 'homework' ? taskId : null,
        assignmentId: mode === 'assignment' ? taskId : null,
        title: `${taskTitle || 'Task'} Rubric`, description: 'Default assessment rubric', criteria: defaultCriteria,
      }).unwrap();
      await publishRubric(created.id).unwrap();
      shikshaMitraToast.success({ message: 'Rubric created and published successfully.' });
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Failed to create rubric' });
    }
  };
  return { createDefaultRubric, isCreating, isPublishing };
}
