import type { AcademicInsightsSectionKey } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';
import { academicPaths as p, academicPermissions as v } from 'src/constants/academic-menu';

export type AcademicInsightsLink = { label: string; href: string; permission: string };
export type AcademicInsightsArea = { key: AcademicInsightsSectionKey; title: string; icon: string; links: AcademicInsightsLink[] };
const link = (label: string, href: string, permission: string): AcademicInsightsLink =>
  ({ label, href, permission: permission.endsWith('.View') ? permission : `${permission}.View` });

export const academicInsightsAreas: AcademicInsightsArea[] = [
  { key: 'classrooms', title: 'Class Teacher Assignments', icon: GlobalIcons.family, links: [
    link('Class teacher assignment', p.classTeacherAssignment, 'ClassManagement.ClassTeacherAssignment.View'),
    link('Elective assignment', p.curriculum.electiveAssignment, v.curriculum.electiveAssignment),
  ] },
  { key: 'student360', title: 'Student Academic 360', icon: GlobalIcons.admissionStudent, links: [
    link('Student Academic 360', p.studentAcademic360, 'Academics.Dashboard.View'),
  ] },
  { key: 'calendar', title: 'Academic Calendar', icon: GlobalIcons.calendar, links: [
    link('Calendar management', p.academicCalendar.management, v.academicCalendar.management),
    link('Emergency closures', p.academicCalendar.emergencyClosure, v.academicCalendar.emergencyClosure),
    link('Calendar audit logs', p.academicCalendar.auditLogs, v.academicCalendar.auditLogs),
  ] },
  { key: 'curriculum', title: 'Subject Allocation & Syllabus', icon: GlobalIcons.notebook, links: [
    link('Subject allocation', p.curriculum.subjectsAssignment, v.curriculum.subjectsAssignment),
    link('Syllabus', p.curriculum.chaptersManagement, v.curriculum.chaptersManagement),
  ] },
  { key: 'lesson', title: 'Lesson Plans & Teacher Diary', icon: GlobalIcons.notebook, links: [
    link('Lesson plans and diary', p.curriculum.lessonPlan, v.curriculum.lessonPlan),
  ] },
  { key: 'timetable', title: 'Weekly Timetable Overview', icon: GlobalIcons.clock, links: [
    link('Timetable management', p.timetable.management, v.timetable.management),
    link('Room availability', p.timetable.roomAvailability, v.timetable.roomAvailability),
    link('Substitution management', p.timetable.substitutionManagement, v.timetable.substitutionManagement),
  ] },
  { key: 'tasks', title: 'Homework & Assignments', icon: GlobalIcons.documentIcon, links: [
    link('Learning tasks', p.homework.learningTasks, v.homework.learningTasks),
  ] },
  { key: 'evaluation', title: 'Evaluation & Feedback', icon: GlobalIcons.tick, links: [
    link('Evaluation and feedback', p.homework.assessment, v.homework.assessment),
  ] },
  { key: 'exams', title: 'Examination', icon: GlobalIcons.rubricFile, links: [
    link('Schedule exam', p.examination.schedule, v.examination.schedule),
    link('Seating plan', p.examination.seatAllocation, v.examination.seatAllocation),
    link('Grade entry', p.examination.recordMarks, v.examination.recordMarks),
    link('Result creation', p.examination.resultCreation, v.examination.resultCreation),
  ] },
  { key: 'reports', title: 'Academic Reports', icon: GlobalIcons.report, links: [
    link('Curriculum reports', p.curriculum.reports, v.curriculum.reports),
    link('Timetable reports', p.timetable.reports, v.timetable.reports),
    link('Homework and assignment reports', p.homework.reports, v.homework.reports),
    link('Examination reports', p.examination.reports, v.examination.reports),
  ] },
  { key: 'notifications', title: 'Notification Templates', icon: GlobalIcons.bell, links: [
    link('View templates', p.notification, 'Academics.Notification.View'),
  ] },
  { key: 'audits', title: 'Academic Audits', icon: GlobalIcons.history, links: [
    link('Academic audits', p.audits, v.audits),
  ] },
  { key: 'settings', title: 'Academic Settings & Setup Guide', icon: GlobalIcons.academicFieldSettings, links: [
    link('Subjects creation', p.curriculum.settings.subjectsCreation, v.curriculum.settings.subjectsCreation),
    link('Elective groups', p.curriculum.settings.electiveGroupCreation, v.curriculum.settings.electiveGroupCreation),
    link('Weekly lectures', p.timetable.settings.weeklyLectures, v.timetable.settings.weeklyLectures),
    link('Lecture slots', p.timetable.settings.lectureSlots, v.timetable.settings.lectureSlots),
    link('Homework types', p.homework.settings.homeworkTypes, v.homework.settings.homeworkTypes),
    link('Assignment types', p.homework.settings.assignmentTypes, v.homework.settings.assignmentTypes),
    link('Rubric templates', p.homework.settings.rubricConfig, v.homework.settings.rubricConfig),
    link('Grade scaling', p.examination.settings.gradeScaling, v.examination.settings.gradeScaling),
    link('Exam types', p.examination.settings.examTypes, v.examination.settings.examTypes),
  ] },
];
