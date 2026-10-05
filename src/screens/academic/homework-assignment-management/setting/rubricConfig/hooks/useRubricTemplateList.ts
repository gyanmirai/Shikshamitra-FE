import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import {
  RubricStatus,
  useGetRubricsQuery,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export function useRubricTemplateList() {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const query = useGetRubricsQuery(
    { academicMediumId: currentMedium?.id },
    { skip: !currentMedium?.id }
  );
  // currentData prevents templates from the previous medium appearing during a context change.
  const allRubrics = query.currentData ?? [];
  const rubricData = allRubrics.filter((rubric) => rubric.isTemplate);
  const linkedRubrics = allRubrics.filter(
    (rubric) => !rubric.isTemplate && rubric.sourceTemplateId
  );
  const usageCountByTemplate: Record<string, number> = {};
  linkedRubrics.forEach((rubric) => {
    if (rubric.sourceTemplateId) {
      usageCountByTemplate[rubric.sourceTemplateId] =
        (usageCountByTemplate[rubric.sourceTemplateId] ?? 0) + 1;
    }
  });

  return {
    rubricData,
    linkedRubrics,
    usageCountByTemplate,
    tableData: rubricData.map((rubric) => ({
      ...rubric,
      usageCount: usageCountByTemplate[rubric.id] ?? 0,
    })),
    activeRubrics: rubricData.filter((rubric) => rubric.status === RubricStatus.Published),
    draftRubrics: rubricData.filter((rubric) => rubric.status === RubricStatus.Draft),
    archivedRubrics: rubricData.filter((rubric) => rubric.status === RubricStatus.Archived),
    hasMedium: Boolean(currentMedium?.id),
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    retry: query.refetch,
  };
}
