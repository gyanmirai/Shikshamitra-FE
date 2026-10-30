import type { AcademicInsightsSectionKey } from 'src/redux/academicAPI/academicInsightsTypes';

export const academicInsightsSectionHelp: Record<AcademicInsightsSectionKey, string> = {
  classrooms: 'Filled green divisions have an active class teacher assignment. Grey divisions need a class teacher.',
  student360: 'Recorded attendance and published exam scores for authorized students.',
  calendar: 'Upcoming calendar entries, school closures and calendar history.',
  curriculum: 'Recorded syllabus progress and permitted subject allocation workflows.',
  lesson: 'Lesson plan states and teacher diary workflows within your read access.',
  timetable: 'Saved timetable entries grouped by weekday across the selected divisions. Open the links below for rooms and substitutions.',
  tasks: 'Published homework and assignment schedules grouped by due date.',
  evaluation: 'Received submissions grouped by their recorded review timestamps.',
  exams: 'Exam stages and permitted scheduling, seating, grading and result workflows.',
  reports: 'Completed Academic exports in the selected context and permitted report families.',
  notifications: 'The existing read-only Academic notification template categories.',
  audits: 'The five most recent Academic changes visible within your authorized scope.',
  settings: 'Configuration record availability for the active Academic setup settings.',
};
