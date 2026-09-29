import {
  useGetPrincipalAcademicDashboardQuery,
  useGetPrincipalAcademicDashboardCurriculumQuery,
  useGetPrincipalAcademicDashboardOperationsQuery,
  useGetPrincipalAcademicDashboardPerformanceQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

export function usePrincipalAcademicDashboardSections(supportsSections: boolean) {
  const legacy = useGetPrincipalAcademicDashboardQuery(undefined, {
    skip: supportsSections,
  });
  const performance = useGetPrincipalAcademicDashboardPerformanceQuery(undefined, {
    skip: !supportsSections,
  });
  const curriculum = useGetPrincipalAcademicDashboardCurriculumQuery(undefined, {
    skip: !supportsSections,
  });
  const operations = useGetPrincipalAcademicDashboardOperationsQuery(undefined, {
    skip: !supportsSections,
  });

  const performanceData = supportsSections ? performance.data : legacy.data;
  const curriculumData = supportsSections ? curriculum.data : legacy.data;
  const operationsData = supportsSections ? operations.data : legacy.data;
  const data =
    performanceData && curriculumData && operationsData
      ? { ...performanceData, ...curriculumData, ...operationsData }
      : undefined;
  const isFetching = supportsSections
    ? performance.isFetching || curriculum.isFetching || operations.isFetching
    : legacy.isFetching;
  const retryAll = () => {
    if (supportsSections) {
      performance.refetch();
      curriculum.refetch();
      operations.refetch();
    } else {
      legacy.refetch();
    }
  };

  return {
    legacy,
    performance,
    curriculum,
    operations,
    performanceData,
    curriculumData,
    operationsData,
    data,
    isFetching,
    retryAll,
  };
}
