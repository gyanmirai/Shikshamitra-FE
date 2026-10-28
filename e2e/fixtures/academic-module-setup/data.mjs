export const ids = {
  year: '11111111-1111-4111-8111-111111111111',
  board: '22222222-2222-4222-8222-222222222222',
  medium: '33333333-3333-4333-8333-333333333333',
  stage: '44444444-4444-4444-8444-444444444444',
  standard: '55555555-5555-4555-8555-555555555555',
  division: '66666666-6666-4666-8666-666666666666',
};
export const year = {
  id: ids.year,
  name: '2026-2027',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T00:00:00Z',
};
export const standard = {
  id: ids.standard,
  name: 'Class 6',
  ageLowerLimit: 11,
  educationMediumStageId: ids.stage,
  divisions: [{ id: ids.division, name: 'A', standardId: ids.standard, strength: 30 }],
};
export const medium = {
  id: ids.medium,
  name: 'English',
  educationBoardId: ids.board,
  educationMediumStages: [
    { id: ids.stage, name: 'Middle school', educationMediumId: ids.medium, standards: [standard] },
  ],
};
export const board = {
  id: ids.board,
  name: 'CBSE',
  type: 0,
  academicYearId: ids.year,
  educationMediums: [medium],
};
export const settings = [
  ['subjects', 'Academics.CurriculumManagement.Settings.SubjectCreation'],
  ['elective-groups', 'Academics.CurriculumManagement.Settings.ElectiveGroupCreation'],
  ['weekly-lectures', 'Academics.Timetable.Settings.WeeklyLectures'],
  ['lecture-slots', 'Academics.Timetable.Settings.LectureSlots'],
  ['homework-types', 'Academics.HomeworkAndAssignment.Settings.HomeworkTypes'],
  ['assignment-types', 'Academics.HomeworkAndAssignment.Settings.AssignmentTypes'],
  ['rubrics', 'Academics.HomeworkAndAssignment.Settings.RubricConfig'],
  ['grading-scales', 'Academics.Examination.Settings.GradeScaling'],
  ['exam-types', 'Academics.Examination.Settings.ExamTypes'],
];
const root = 'ShikshaMitra.Module.Academics';
export const permissionNames = [
  root,
  `${root}.Dashboard`,
  `${root}.Curriculum`,
  `${root}.Curriculum.Settings`,
  `${root}.Timetable`,
  `${root}.Timetable.Settings`,
  `${root}.HomeworkAssignment`,
  `${root}.HomeworkAssignment.Settings`,
  `${root}.Examination`,
  `${root}.Examination.Settings`,
  'ShikshaMitra.Module.Dashboard',
  'Academics.Dashboard.View',
  'Academics.Audits.View',
  ...settings.flatMap(([, permission]) =>
    ['View', 'Add', 'Delete'].map((action) => `${permission}.${action}`)
  ),
];
export const paged = (items) => ({ items, totalCount: items.length });
