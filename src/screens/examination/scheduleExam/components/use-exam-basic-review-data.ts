import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import type { IExamFormValues } from '../type';

export function useExamBasicReviewData(values: IExamFormValues) {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data: gradeScalingsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: { skip: !(medium as Medium)?.id },
  });

  const gradeScalings: any[] = gradeScalingsData?.data ?? [];
  const gradingScaleName = values.gradingScaleId
    ? gradeScalings.find((item: any) => item.id === values.gradingScaleId)?.name || '-'
    : '-';
  const classes =
    medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];
  const selectedClass = classes.find((schoolClass: any) => schoolClass.id === values.className);
  const divisions = (selectedClass?.divisions || []).filter((division: any) =>
    values.divisions.includes(division.id)
  );
  const statusConfig =
    values.status === 1
      ? { color: 'success', label: 'Active' }
      : values.status === 0
        ? { color: 'warning', label: 'Draft' }
        : { color: 'error', label: 'Cancelled' };

  return {
    className: selectedClass?.name || '',
    divisions,
    gradingScaleName,
    statusConfig,
  };
}
