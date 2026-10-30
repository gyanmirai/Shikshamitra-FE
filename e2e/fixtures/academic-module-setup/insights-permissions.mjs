import { permissionNames } from './data.mjs';

const moduleRoot = 'ShikshaMitra.Module.Academics';
const actions = [
  'ClassManagement.ClassTeacherAssignment',
  'ClassManagement.StudentElectiveAssignment',
  'Academics.AcademicCalendar.CalendarManagement',
  'Academics.AcademicCalendar.EmergencyClosure',
  'Academics.AcademicCalendar.AuditLogs',
  'Academics.CurriculumManagement.SubjectAssignment',
  'Academics.CurriculumManagement.ChapterManagement',
  'Academics.CurriculumManagement.LessonPlan',
  'Academics.CurriculumManagement.Reports',
  'Academics.Timetable.TimetableManagement',
  'Academics.Timetable.Reports',
  'Academics.HomeworkAndAssignment.LearningTasks',
  'Academics.HomeworkAndAssignment.AssessmentAndFeedback',
  'Academics.HomeworkAndAssignment.Reports',
  'Academics.Examination.ScheduleExam',
  'Academics.Examination.SeatAllocation',
  'Academics.Examination.RecordMarks',
  'Academics.Examination.ResultCreation',
  'Academics.Examination.Reports',
  'Academics.Notification',
];
export function insightsPermissions(options = {}) {
  if (options.restricted)
    return [moduleRoot, `${moduleRoot}.Dashboard`, 'Academics.Dashboard.View'];
  return [
    ...permissionNames,
    `${moduleRoot}.AcademicCalendar`,
    `${moduleRoot}.Notification`,
    'ShikshaMitra.Module.ClassManagement.ClassTeacherAssignment',
    'ClassManagement.ClassTeacherAssignment.View',
    ...actions.map((name) => `${name}.View`),
  ];
}
