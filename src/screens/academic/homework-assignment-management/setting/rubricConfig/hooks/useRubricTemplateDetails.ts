import type { RootState } from 'src/redux/store';
import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useLazyGetRubricByIdQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

export function useRubricTemplateDetails() {
  const mediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const currentMedium = useRef(mediumId);
  currentMedium.current = mediumId;
  const [getDetail, state] = useLazyGetRubricByIdQuery();
  const openDetail = async (id: string, onLoaded: (detail: AssessmentRubricDto) => unknown) => {
    try {
      const detail = await getDetail(id, true).unwrap();
      if (currentMedium.current !== mediumId) return;
      await onLoaded(detail);
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Unable to load rubric template.' });
    }
  };
  return { openDetail, isDetailLoading: state.isFetching };
}
