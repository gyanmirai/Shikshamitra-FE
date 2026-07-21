/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import { test, expect } from '@playwright/test';

import { resolveAcademicContext, primeAcademicSelection } from './academic-api';

const baseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Academic Module Navigation Smoke Tests', () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test.beforeEach(async ({ page }) => {
    // Resolve academic context and prime local storage to bypass initial onboarding/selection modals
    const context = await resolveAcademicContext(page);
    await primeAcademicSelection(page, context);
  });

  const routes = [
    {
      label: 'Dashboard',
      path: '/academic/dashboard',
      expected: /Academic Dashboard|Overview|Dashboard/i,
    },
    {
      label: 'Student Academic 360',
      path: '/academic/studentAcademic360',
      expected: /Academic 360/i,
    },
    {
      label: 'Subject Allocation',
      path: '/academic/curriculumSubjects',
      expected: /Subject Allocation|Allocation/i,
    },
    {
      label: 'Syllabus / Course Subjects',
      path: '/academic/courseSubjects',
      expected: /Syllabus|Chapters|Subjects/i,
    },
    {
      label: 'Lesson Plan / Teacher Diary',
      path: '/academic/lesson-plan',
      expected: /Lesson Plan|Teacher Diary/i,
    },
    {
      label: 'Curriculum Reports',
      path: '/academic/curriculumReports',
      expected: /Reports|Curriculum/i,
    },
    {
      label: 'Subjects Creation Settings',
      path: '/academic/curriculumSetting/subjectCreation',
      expected: /Subject|Creation/i,
    },
    {
      label: 'Elective Group Creation Settings',
      path: '/academic/curriculumSetting/electiveGroupCreation',
      expected: /Elective|Group/i,
    },
    {
      label: 'Timetable Management',
      path: '/academic/newTimetable',
      expected: /Timetable/i,
    },
    {
      label: 'Room Availability',
      path: '/academic/roomAvailability',
      expected: /Room|Availability/i,
    },
    {
      label: 'Substitution Management',
      path: '/academic/substitutionManagement',
      expected: /Substitution/i,
    },
    {
      label: 'Timetable Reports',
      path: '/academic/timetableReports',
      expected: /Reports|Timetable/i,
    },
    {
      label: 'Weekly Lectures Settings',
      path: '/academic/timetableSettings/weeklyLectures',
      expected: /Weekly Lectures/i,
    },
    {
      label: 'Lecture Slots Settings',
      path: '/academic/timetableSettings/lectureSlots',
      expected: /Lecture Slots/i,
    },
    {
      label: 'Homework Learning Tasks',
      path: '/academic/homeworkCreation',
      expected: /Learning Tasks|Homework/i,
    },
    {
      label: 'Homework Evaluation & Feedback',
      path: '/academic/gradingAndFeedback',
      expected: /Evaluation|Feedback/i,
    },
    {
      label: 'Homework Reports',
      path: '/academic/homeworkAssignmentReports',
      expected: /Reports|Homework/i,
    },
    {
      label: 'Homework Types Settings',
      path: '/academic/homeworkSettings/homeworkTypes',
      expected: /Homework Types/i,
    },
    {
      label: 'Assignment Types Settings',
      path: '/academic/homeworkSettings/assignmentTypes',
      expected: /Assignment Types/i,
    },
    {
      label: 'Schedule Exam',
      path: '/academic/scheduleExam',
      expected: /Schedule Exam/i,
    },
    {
      label: 'Seating Plan',
      path: '/academic/seatallocation',
      expected: /Seating Plan|Seat Allocation/i,
    },
    {
      label: 'Grade Entry',
      path: '/academic/gradeEntry',
      expected: /Grade Entry|Record Marks/i,
    },
    {
      label: 'Result Creation',
      path: '/academic/resultCreation',
      expected: /Result/i,
    },
    {
      label: 'Question Bank',
      path: '/academic/questionBank',
      expected: /Question Bank/i,
    },
    {
      label: 'Question Papers',
      path: '/academic/questionPapers',
      expected: /Question Papers/i,
    },
    {
      label: 'Examination Reports',
      path: '/academic/examinationReports',
      expected: /Reports|Examination/i,
    },
    {
      label: 'Grade Scaling Settings',
      path: '/academic/examinationSetting/gradeScaling',
      expected: /Grade Scaling/i,
    },
    {
      label: 'Exam Types Settings',
      path: '/academic/examinationSetting/examTypes',
      expected: /Exam Types/i,
    },
    {
      label: 'Calendar Management',
      path: '/academic/calendarManagement',
      expected: /Calendar/i,
    },
    {
      label: 'Calendar Emergency Closure',
      path: '/academic/calendarEmergencyClosure',
      expected: /Emergency Closure/i,
    },
    {
      label: 'Calendar Audit Logs',
      path: '/academic/calendarAuditLogs',
      expected: /Audit Logs/i,
    },
  ];

  for (const route of routes) {
    test(`route: ${route.path} (${route.label}) should load without crash`, async ({ page }) => {
      await page.goto(`${baseUrl()}${route.path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      // Check for common error signatures
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('Application Error');
      expect(bodyText).not.toContain('Failed to load');
      expect(bodyText).not.toContain('Internal Server Error');

      // Verify page container or content matches expected pattern
      await expect(page.locator('body')).toContainText(route.expected, { timeout: 15000 });
    });
  }
});
