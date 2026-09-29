import {
  useGetTeacherAcademicDashboardQuery,
  useGetTeacherAcademicDashboardAttentionQuery,
  useGetTeacherAcademicDashboardAssessmentQuery,
  useGetTeacherAcademicDashboardAssignmentsQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

export function useTeacherAcademicDashboardSections(supportsSections: boolean) {
  const legacy = useGetTeacherAcademicDashboardQuery(undefined, {
    skip: supportsSections,
  });
  const assignments = useGetTeacherAcademicDashboardAssignmentsQuery(undefined, {
    skip: !supportsSections,
  });
  const assessment = useGetTeacherAcademicDashboardAssessmentQuery(undefined, {
    skip: !supportsSections,
  });
  const attention = useGetTeacherAcademicDashboardAttentionQuery(undefined, {
    skip: !supportsSections,
  });

  const assignmentData = supportsSections ? assignments.data : legacy.data;
  const assessmentData = supportsSections ? assessment.data : legacy.data;
  const attentionData = supportsSections ? attention.data : legacy.data;
  const actionData =
    assessmentData && attentionData ? { ...assessmentData, ...attentionData } : undefined;
  const data =
    assignmentData && assessmentData && attentionData
      ? { ...assignmentData, ...assessmentData, ...attentionData }
      : undefined;
  const isFetching = supportsSections
    ? assignments.isFetching || assessment.isFetching || attention.isFetching
    : legacy.isFetching;
  const retryAll = () => {
    if (supportsSections) {
      assignments.refetch();
      assessment.refetch();
      attention.refetch();
    } else {
      legacy.refetch();
    }
  };

  return {
    legacy,
    assignments,
    assessment,
    attention,
    assignmentData,
    assessmentData,
    attentionData,
    actionData,
    data,
    isFetching,
    retryAll,
  };
}
