import type {
  AdminAcademicDashboardTimetableData,
  AdminAcademicDashboardCurriculumData,
  AdminAcademicDashboardAssessmentData,
} from 'src/redux/academicAPI/academicDashboardApi';

export function getAcademicHealth(
  curriculum: Pick<AdminAcademicDashboardCurriculumData, 'curriculumCompletion'>,
  timetable: Pick<AdminAcademicDashboardTimetableData, 'timetableRate' | 'conflictsCount'>,
  assessment: Pick<
    AdminAcademicDashboardAssessmentData,
    'readinessRate' | 'pendingGradeEntries' | 'pendingEvaluations'
  >
) {
  const score = Math.round(
    (curriculum.curriculumCompletion + timetable.timetableRate + assessment.readinessRate) / 3
  );
  const ready =
    score === 100 &&
    timetable.conflictsCount === 0 &&
    assessment.pendingGradeEntries === 0 &&
    assessment.pendingEvaluations === 0;
  return { score, status: ready ? 'Healthy' : 'Needs Attention' };
}

export function getGradingStatus(
  data: Pick<
    AdminAcademicDashboardAssessmentData,
    'readinessRate' | 'pendingGradeEntries' | 'pendingEvaluations'
  >
) {
  if (data.pendingGradeEntries > 0) return 'Pending Grade Entry';
  if (data.pendingEvaluations > 0) return 'Pending Evaluation';
  return data.readinessRate >= 100 ? 'Compiled' : 'Not Compiled';
}
