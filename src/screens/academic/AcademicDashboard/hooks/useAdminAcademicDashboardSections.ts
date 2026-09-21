import {
  useGetAdminAcademicDashboardTimetableQuery,
  useGetAdminAcademicDashboardCurriculumQuery,
  useGetAdminAcademicDashboardAssessmentQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

export function useAdminAcademicDashboardSections() {
  const curriculum = useGetAdminAcademicDashboardCurriculumQuery();
  const timetable = useGetAdminAcademicDashboardTimetableQuery();
  const assessment = useGetAdminAcademicDashboardAssessmentQuery();

  const refetchAll = () => {
    curriculum.refetch();
    timetable.refetch();
    assessment.refetch();
  };

  return {
    curriculum,
    timetable,
    assessment,
    refetchAll,
    isFetching: curriculum.isFetching || timetable.isFetching || assessment.isFetching,
  };
}
