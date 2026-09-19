import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useState, useEffect } from 'react';

export const useHomeworkRubricTemplateSelection = (
  homeworkId?: string,
  homeworkRubrics?: AssessmentRubricDto[]
) => {
  const [selectedRubricTemplateId, setSelectedRubricTemplateId] = useState('');
  const assignedRubric = homeworkId
    ? homeworkRubrics?.find((rubric) => rubric.homeworkId === homeworkId)
    : undefined;
  const assignedRubricTemplateId = assignedRubric?.sourceTemplateId ?? '';

  useEffect(() => {
    setSelectedRubricTemplateId(homeworkId ? assignedRubricTemplateId : '');
  }, [assignedRubricTemplateId, homeworkId]);

  return {
    assignedRubricTemplateId,
    selectedRubricTemplateId,
    setSelectedRubricTemplateId,
  };
};
