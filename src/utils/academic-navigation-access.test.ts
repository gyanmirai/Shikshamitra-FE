import type { NavItemBaseProps } from 'src/components/nav-section';

import { it, expect, describe } from 'vitest';
import academicModule, { academicSetupViewPermissions } from 'src/constants/academic-menu';

import {
  getFirstAcademicPath,
  canAccessAcademicRoute,
  filterAcademicNavigation,
  filterAcademicMainNavigation,
} from './academic-navigation-access';

const ROOT = 'ShikshaMitra.Module.Academics';
const CALENDAR = `${ROOT}.AcademicCalendar`;
const CURRICULUM = `${ROOT}.Curriculum`;
const TIMETABLE = `${ROOT}.Timetable`;
const HOMEWORK = `${ROOT}.HomeworkAssignment`;
const EXAMINATION = `${ROOT}.Examination`;

type RouteCase = { path: string; view: string; visibility: string[] };

const route = (path: string, view: string, ...visibility: string[]): RouteCase => ({
  path: `/academic/${path}`,
  view,
  visibility: [ROOT, ...visibility],
});

const activeRoutes: RouteCase[] = [
  route('dashboard', 'Academics.Dashboard.View', `${ROOT}.Dashboard`),
  route(
    'assignClassTeacher',
    'ClassManagement.ClassTeacherAssignment.View',
    'ShikshaMitra.Module.ClassManagement.ClassTeacherAssignment'
  ),
  route('studentAcademic360', 'Academics.Dashboard.View', `${ROOT}.Dashboard`),
  route('calendarManagement', 'Academics.AcademicCalendar.CalendarManagement.View', CALENDAR),
  route('calendarAuditLogs', 'Academics.AcademicCalendar.AuditLogs.View', CALENDAR),
  route('curriculumSubjects', 'Academics.CurriculumManagement.SubjectAssignment.View', CURRICULUM),
  route('assign-elective-subject', 'ClassManagement.StudentElectiveAssignment.View', CURRICULUM),
  route('courseSubjects', 'Academics.CurriculumManagement.ChapterManagement.View', CURRICULUM),
  route('lesson-plan', 'Academics.CurriculumManagement.LessonPlan.View', CURRICULUM),
  route('curriculumReports', 'Academics.CurriculumManagement.Reports.View', CURRICULUM),
  route(
    'curriculumSetting/subjectCreation',
    'Academics.CurriculumManagement.Settings.SubjectCreation.View',
    CURRICULUM,
    `${CURRICULUM}.Settings`
  ),
  route(
    'curriculumSetting/electiveGroupCreation',
    'Academics.CurriculumManagement.Settings.ElectiveGroupCreation.View',
    CURRICULUM,
    `${CURRICULUM}.Settings`
  ),
  route('newTimetable', 'Academics.Timetable.TimetableManagement.View', TIMETABLE),
  route('roomAvailability', 'Academics.Timetable.TimetableManagement.View', TIMETABLE),
  route('substitutionManagement', 'Academics.Timetable.TimetableManagement.View', TIMETABLE),
  route('timetableReports', 'Academics.Timetable.Reports.View', TIMETABLE),
  route(
    'timetableSettings/weeklyLectures',
    'Academics.Timetable.Settings.WeeklyLectures.View',
    TIMETABLE,
    `${TIMETABLE}.Settings`
  ),
  route(
    'timetableSettings/lectureSlots',
    'Academics.Timetable.Settings.LectureSlots.View',
    TIMETABLE,
    `${TIMETABLE}.Settings`
  ),
  route('homeworkCreation', 'Academics.HomeworkAndAssignment.LearningTasks.View', HOMEWORK),
  route('gradingAndFeedback', 'Academics.HomeworkAndAssignment.AssessmentAndFeedback.View', HOMEWORK),
  route('homeworkAssignmentReports', 'Academics.HomeworkAndAssignment.Reports.View', HOMEWORK),
  route(
    'homeworkSettings/homeworkTypes',
    'Academics.HomeworkAndAssignment.Settings.HomeworkTypes.View',
    HOMEWORK,
    `${HOMEWORK}.Settings`
  ),
  route(
    'homeworkSettings/assignmentTypes',
    'Academics.HomeworkAndAssignment.Settings.AssignmentTypes.View',
    HOMEWORK,
    `${HOMEWORK}.Settings`
  ),
  route(
    'homeworkSettings/rubricConfig',
    'Academics.HomeworkAndAssignment.Settings.RubricConfig.View',
    HOMEWORK,
    `${HOMEWORK}.Settings`
  ),
  route('scheduleExam', 'Academics.Examination.ScheduleExam.View', EXAMINATION),
  route('seatallocation', 'Academics.Examination.SeatAllocation.View', EXAMINATION),
  route('gradeEntry', 'Academics.Examination.RecordMarks.View', EXAMINATION),
  route('resultCreation', 'Academics.Examination.ResultCreation.View', EXAMINATION),
  route('examinationReports', 'Academics.Examination.Reports.View', EXAMINATION),
  route(
    'examinationSetting/gradeScaling',
    'Academics.Examination.Settings.GradeScaling.View',
    EXAMINATION,
    `${EXAMINATION}.Settings`
  ),
  route(
    'examinationSetting/examTypes',
    'Academics.Examination.Settings.ExamTypes.View',
    EXAMINATION,
    `${EXAMINATION}.Settings`
  ),
  route('audits', 'Academics.Audits.View'),
  route('notification', 'Academics.Notification.View', `${ROOT}.Notification`),
  route('setup', 'Academics.CurriculumManagement.Settings.SubjectCreation.View'),
];

const grants = (...names: string[]) => names.map((name) => ({ name, isGranted: true }));
const items: NavItemBaseProps[] = academicModule()['/academic'].flatMap((group) => group.items);
const leafPaths = (nodes: NavItemBaseProps[]): string[] =>
  nodes.flatMap((node) =>
    node.children?.length ? leafPaths(node.children) : node.path ? [node.path] : []
  );

describe('Academic navigation and direct route permissions', () => {
  it('requires an exact configuration View and module root for the manual setup route', () => {
    const view = 'Academics.CurriculumManagement.Settings.SubjectCreation.View';
    expect(canAccessAcademicRoute('/academic/setup', grants(ROOT))).toBe(false);
    expect(canAccessAcademicRoute('/academic/setup?source=automatic#start', grants(ROOT))).toBe(false);
    expect(canAccessAcademicRoute('/academic/setup/', grants(ROOT, view))).toBe(true);
    expect(canAccessAcademicRoute('/academic/setup', grants(view))).toBe(false);
    expect(canAccessAcademicRoute('/academic/setup', grants(ROOT, view.replace('.View', '.Add')))).toBe(false);
    expect(leafPaths(filterAcademicNavigation(items, grants(ROOT, view)))).toContain('/academic/setup');
  });

  it.each(academicSetupViewPermissions)('allows the setup guide with only module visibility and %s', (view) => {
    expect(canAccessAcademicRoute('/academic/setup', grants(ROOT, view))).toBe(true);
    expect(leafPaths(filterAcademicNavigation(items, grants(ROOT, view)))).toContain('/academic/setup');
    expect(canAccessAcademicRoute('/academic/setup', grants(ROOT, view.replace('.View', '.Add')))).toBe(false);
  });

  it('covers every active Academic menu leaf', () => {
    expect(leafPaths(items).sort()).toEqual(activeRoutes.map(({ path }) => path).sort());
  });

  it.each(activeRoutes)('allows $path only with its View and visibility grants', (entry) => {
    const permissions = grants(...entry.visibility, entry.view);

    expect(canAccessAcademicRoute(entry.path, permissions)).toBe(true);
    expect(leafPaths(filterAcademicNavigation(items, permissions))).toContain(entry.path);

    const withoutView = grants(...entry.visibility);
    expect(canAccessAcademicRoute(entry.path, withoutView)).toBe(false);
    expect(leafPaths(filterAcademicNavigation(items, withoutView))).not.toContain(entry.path);
  });

  it.each(activeRoutes)('requires every visibility ancestor for $path', (entry) => {
    entry.visibility.forEach((missing) => {
      const permissions = grants(
        ...entry.visibility.filter((permission) => permission !== missing),
        entry.view
      );
      expect(canAccessAcademicRoute(entry.path, permissions), missing).toBe(false);
      expect(leafPaths(filterAcademicNavigation(items, permissions)), missing).not.toContain(entry.path);
    });
  });

  it('hides the entire Academic tree before permissions arrive or with visibility alone', () => {
    expect(filterAcademicNavigation(items, [])).toEqual([]);
    expect(filterAcademicNavigation(items, grants(ROOT))).toEqual([]);
    expect(getFirstAcademicPath([])).toBeUndefined();
    expect(canAccessAcademicRoute('/academic/calendarManagement', [])).toBe(false);
  });

  it('keeps only the authorized nested group and chooses its first page as the landing', () => {
    const permissions = grants(
      ROOT,
      CURRICULUM,
      `${CURRICULUM}.Settings`,
      'Academics.CurriculumManagement.Settings.SubjectCreation.View'
    );
    const filtered = filterAcademicNavigation(items, permissions);

    expect(filtered.map(({ title }) => title)).toEqual(['Curriculum', 'Setup guide']);
    expect(filtered[0].children.map((item: NavItemBaseProps) => item.title)).toEqual(['Settings']);
    expect(leafPaths(filtered)).toEqual(['/academic/curriculumSetting/subjectCreation', '/academic/setup']);
    expect(getFirstAcademicPath(filtered)).toBe('/academic/curriculumSetting/subjectCreation');
    expect(leafPaths(items)).toHaveLength(activeRoutes.length);
  });

  it('filters Academic search links and landing without modifying other modules', () => {
    const student = { title: 'Student', _action: 'student', path: '/student/dashboard' };
    const groups = [{ items: [student, {
      title: 'Academics', _action: 'academic', path: '/academic/dashboard', submodule: items,
    }] }];
    const result = filterAcademicMainNavigation(groups, grants(
      ROOT, CALENDAR, 'Academics.AcademicCalendar.CalendarManagement.View'
    ));

    expect(result[0].items[0]).toBe(student);
    expect(result[0].items[1].path).toBe('/academic/calendarManagement');
    expect(leafPaths(result[0].items[1].submodule)).toEqual(['/academic/calendarManagement']);
    expect(filterAcademicMainNavigation(groups, [])[0].items).toEqual([student]);
    expect(groups[0].items[1].path).toBe('/academic/dashboard');
  });

  it.each(['Add', 'Delete', 'Edit', 'Publish'])('does not treat %s as permission to view a page', (action) => {
    const permissions = grants(ROOT, EXAMINATION, `Academics.Examination.SeatAllocation.${action}`);
    expect(canAccessAcademicRoute('/academic/seatallocation', permissions)).toBe(false);
    expect(filterAcademicNavigation(items, permissions)).toEqual([]);
  });

  it('rejects namespace grants, old action aliases, and explicit denied View entries', () => {
    const namespaceOnly = grants(ROOT, CURRICULUM, 'Academics.CurriculumManagement.SubjectAssignment');
    expect(canAccessAcademicRoute('/academic/curriculumSubjects', namespaceOnly)).toBe(false);
    expect(filterAcademicNavigation(items, namespaceOnly)).toEqual([]);
    expect(
      canAccessAcademicRoute(
        '/academic/assign-elective-subject',
        grants(ROOT, CURRICULUM, 'Academics.CurriculumManagement.ElectiveAssignment.View')
      )
    ).toBe(false);
    expect(
      canAccessAcademicRoute(
        '/academic/resultCreation',
        grants(ROOT, EXAMINATION, 'Academics.Examination.Result.View')
      )
    ).toBe(false);
    expect(
      canAccessAcademicRoute('/academic/seatallocation', [
        ...grants(ROOT, EXAMINATION),
        { name: 'Academics.Examination.SeatAllocation.View', isGranted: false },
      ])
    ).toBe(false);
  });

  it('applies seating permission to nested pages and respects URL segment boundaries', () => {
    const permissions = grants(ROOT, EXAMINATION, 'Academics.Examination.SeatAllocation.View');
    ['/', '/exam-123/setup', '/exam-123/allocate', '/exam-123/review'].forEach((suffix) => {
      expect(canAccessAcademicRoute(`/academic/seatallocation${suffix}`, permissions)).toBe(true);
      expect(canAccessAcademicRoute(`/academic/seatallocation${suffix}`, grants(ROOT, EXAMINATION))).toBe(false);
    });
    expect(canAccessAcademicRoute('/academic/seatallocation-other', grants(ROOT))).toBe(true);
  });

  it.each(['/academic/assignTeacher', '/academic/teacher'])(
    'guards the existing Class Teacher Assignment alias %s',
    (path) => {
      const visibility = 'ShikshaMitra.Module.ClassManagement.ClassTeacherAssignment';
      expect(canAccessAcademicRoute(path, grants(ROOT, visibility))).toBe(false);
      expect(
        canAccessAcademicRoute(path, grants(ROOT, CURRICULUM, visibility, 'ClassManagement.ClassTeacherAssignment.View'))
      ).toBe(true);
    }
  );

  it('guards the existing feedback alias and leaves inactive routes to their existing layouts', () => {
    expect(canAccessAcademicRoute('/academic/studentSubmissions', grants(ROOT, HOMEWORK))).toBe(false);
    expect(
      canAccessAcademicRoute(
        '/academic/studentSubmissions',
        grants(ROOT, HOMEWORK, 'Academics.HomeworkAndAssignment.AssessmentAndFeedback.View')
      )
    ).toBe(true);
    expect(canAccessAcademicRoute('/academic/lmsDashboard', grants(ROOT))).toBe(true);
    expect(canAccessAcademicRoute('/academic/lmsDashboard', [])).toBe(false);
  });
});
