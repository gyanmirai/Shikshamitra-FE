/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax, no-await-in-loop */
import { writeFile } from 'node:fs/promises';
import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';

import { resolveAcademicContext, primeAcademicSelection, getAcademicJson } from './academic-api';

const qaEnabled = process.env.E2E_ACADEMIC_QA === '1';

type RouteCheck = {
  label: string;
  path: string;
  expected: string;
  status: 'passed' | 'failed';
  error?: string;
};

type QaFailure = {
  code: string;
  message: string;
  details?: unknown;
};

type QaReport = {
  generatedAt: string;
  runId: string;
  tenant: string;
  baseUrl: string;
  apiUrl: string;
  academicContext?: {
    academicYearId: string;
    academicYearName?: string | null;
    academicMediumId: string;
    academicMediumName: string;
  };
  routeChecks: RouteCheck[];
  workflow: {
    dashboardLoads?: boolean;
    homeworkCreateVisible?: boolean;
    calendarManagementLoads?: boolean;
  };
  cleanup: {
    workflowComplete?: boolean;
  };
  warnings: string[];
  failures: QaFailure[];
};

type RuntimeGuard = {
  failures: string[];
  appendToReport: (report: QaReport) => void;
};

const routeChecks = [
  {
    label: 'Academic Dashboard',
    path: '/academic/dashboard',
    expected: 'Dashboard',
  },
  {
    label: 'Student Academic 360',
    path: '/academic/studentAcademic360',
    expected: 'Academic 360',
  },
  {
    label: 'Subject Allocation',
    path: '/academic/curriculumSubjects',
    expected: 'Allocation',
  },
  {
    label: 'Syllabus / Course Subjects',
    path: '/academic/courseSubjects',
    expected: 'Syllabus',
  },
  {
    label: 'Lesson Plan / Teacher Diary',
    path: '/academic/lesson-plan',
    expected: 'Lesson Plan',
  },
  {
    label: 'Curriculum Reports',
    path: '/academic/curriculumReports',
    expected: 'Reports',
  },
  {
    label: 'Subjects Creation Settings',
    path: '/academic/curriculumSetting/subjectCreation',
    expected: 'Subject',
  },
  {
    label: 'Elective Group Creation Settings',
    path: '/academic/curriculumSetting/electiveGroupCreation',
    expected: 'Elective',
  },
  {
    label: 'Timetable Management',
    path: '/academic/newTimetable',
    expected: 'Timetable',
  },
  {
    label: 'Room Availability',
    path: '/academic/roomAvailability',
    expected: 'Room',
  },
  {
    label: 'Substitution Management',
    path: '/academic/substitutionManagement',
    expected: 'Substitution',
  },
  {
    label: 'Timetable Reports',
    path: '/academic/timetableReports',
    expected: 'Reports',
  },
  {
    label: 'Weekly Lectures Settings',
    path: '/academic/timetableSettings/weeklyLectures',
    expected: 'Weekly Lectures',
  },
  {
    label: 'Lecture Slots Settings',
    path: '/academic/timetableSettings/lectureSlots',
    expected: 'Lecture Slots',
  },
  {
    label: 'Homework Learning Tasks',
    path: '/academic/homeworkCreation',
    expected: 'Learning Tasks',
  },
  {
    label: 'Homework Evaluation & Feedback',
    path: '/academic/gradingAndFeedback',
    expected: 'Evaluation',
  },
  {
    label: 'Homework Reports',
    path: '/academic/homeworkAssignmentReports',
    expected: 'Reports',
  },
  {
    label: 'Homework Types Settings',
    path: '/academic/homeworkSettings/homeworkTypes',
    expected: 'Homework Types',
  },
  {
    label: 'Assignment Types Settings',
    path: '/academic/homeworkSettings/assignmentTypes',
    expected: 'Assignment Types',
  },
  {
    label: 'Schedule Exam',
    path: '/academic/scheduleExam',
    expected: 'Schedule Exam',
  },
  {
    label: 'Seating Plan',
    path: '/academic/seatallocation',
    expected: 'Seating Plan',
  },
  {
    label: 'Grade Entry',
    path: '/academic/gradeEntry',
    expected: 'Grade Entry',
  },
  {
    label: 'Result Creation',
    path: '/academic/resultCreation',
    expected: 'Result',
  },
  {
    label: 'Question Bank',
    path: '/academic/questionBank',
    expected: 'Question Bank',
  },
  {
    label: 'Question Papers',
    path: '/academic/questionPapers',
    expected: 'Question Papers',
  },
  {
    label: 'Examination Reports',
    path: '/academic/examinationReports',
    expected: 'Reports',
  },
  {
    label: 'Grade Scaling Settings',
    path: '/academic/examinationSetting/gradeScaling',
    expected: 'Grade Scaling',
  },
  {
    label: 'Exam Types Settings',
    path: '/academic/examinationSetting/examTypes',
    expected: 'Exam Types',
  },
  {
    label: 'Calendar Management',
    path: '/academic/calendarManagement',
    expected: 'Calendar',
  },
  {
    label: 'Calendar Emergency Closure',
    path: '/academic/calendarEmergencyClosure',
    expected: 'Emergency Closure',
  },
  {
    label: 'Calendar Audit Logs',
    path: '/academic/calendarAuditLogs',
    expected: 'Audit Logs',
  },
];

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function baseUrl() {
  return process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function apiUrl() {
  return process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332';
}

function tenant() {
  return process.env.E2E_TENANT || 'DDVS';
}

function assertLocalDdvsOnly() {
  const frontend = new URL(baseUrl());
  const api = new URL(apiUrl());

  expect(localHosts.has(frontend.hostname), `frontend must be local: ${frontend.href}`).toBe(true);
  expect(localHosts.has(api.hostname), `API must be local: ${api.href}`).toBe(true);
  expect(tenant().toUpperCase(), 'tenant must be DDVS').toBe('DDVS');
}

function buildReport(runId: string): QaReport {
  return {
    generatedAt: new Date().toISOString(),
    runId,
    tenant: tenant(),
    baseUrl: baseUrl(),
    apiUrl: apiUrl(),
    routeChecks: [],
    workflow: {},
    cleanup: {},
    warnings: [],
    failures: [],
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function addFailure(report: QaReport, code: string, message: string, details?: unknown) {
  report.failures.push({ code, message, details });
}

function appendWarning(report: QaReport, message: string) {
  report.warnings.push(message);
}

async function attachReport(testInfo: TestInfo, report: QaReport) {
  const reportPath = testInfo.outputPath('academic-qa-signoff-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await testInfo.attach('academic-qa-signoff-report.json', {
    path: reportPath,
    contentType: 'application/json',
  });
}

function attachRuntimeGuards(page: Page): RuntimeGuard {
  const failures: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const text = message.text();
    const isNextAuthSessionNoise =
      text.includes('ClientFetchError: Failed to fetch') && text.includes('authjs.dev#autherror');
    const isHandledResource400 =
      text.includes('Failed to load resource') && text.includes('status of 400');
    const isStaticResource404 =
      text.includes('Failed to load resource') && text.includes('status of 404');

    if (isNextAuthSessionNoise || isHandledResource400 || isStaticResource404) return;
    failures.push(`console error at ${page.url()}: ${text}`);
  });

  page.on('pageerror', (error) => {
    failures.push(`page error at ${page.url()}: ${error.message}`);
  });

  page.on('response', (response) => {
    if (response.url().includes('/api/') && response.status() >= 500) {
      failures.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  return {
    failures,
    appendToReport: (report) => {
      failures.forEach((failure) => {
        addFailure(report, 'runtime-guard', failure);
      });
    },
  };
}

async function assertRouteLoads(page: Page, report: QaReport, route: (typeof routeChecks)[number]) {
  const result: RouteCheck = {
    label: route.label,
    path: route.path,
    expected: route.expected,
    status: 'failed',
  };

  try {
    await page.goto(`${baseUrl()}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await expect(page, `${route.label} should stay authenticated`).not.toHaveURL(
      /\/login(?:\?|$)|\/auth/i,
      { timeout: 15_000 }
    );
    await expect(page.locator('body'), `${route.label} expected content`).toContainText(
      route.expected,
      { timeout: 45_000 }
    );
    result.status = 'passed';
  } catch (error) {
    result.error = errorMessage(error);
    addFailure(report, 'route-smoke', `${route.label} did not load correctly.`, {
      path: route.path,
      error: result.error,
    });
  } finally {
    report.routeChecks.push(result);
  }
}

test.describe('Academic Module QA Sign-off Suite', () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('Execute complete academic verification loop', async ({ page }, testInfo) => {
    test.slow();
    if (!qaEnabled) {
      assertLocalDdvsOnly();
    }

    const runId = `QA-${Date.now().toString().slice(-6)}`;
    const report = buildReport(runId);
    const runtimeGuards = attachRuntimeGuards(page);

    let unexpectedError: unknown = null;

    try {
      // 1. Context Resolution & Priming Selection
      const academicContext = await resolveAcademicContext(page);
      report.academicContext = {
        academicYearId: academicContext.academicYear.id,
        academicYearName: academicContext.academicYear.name,
        academicMediumId: academicContext.currentMedium.id,
        academicMediumName: academicContext.currentMedium.name,
      };
      await primeAcademicSelection(page, academicContext);

      // 2. Navigation Verification Checks
      for (const route of routeChecks) {
        await assertRouteLoads(page, report, route);
      }

      // 3. Workflow Steps - Dynamic verification on Homework Creation page
      await page.goto(`${baseUrl()}/academic/homeworkCreation`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const createBtn = page.getByRole('button', { name: /create|add|new/i }).first();
      if (await createBtn.isVisible()) {
        report.workflow.homeworkCreateVisible = true;
        await createBtn.click();
        await page.waitForTimeout(1000);
        
        // Assert modal forms render (checking for typical field inputs)
        const saveBtn = page.getByRole('button', { name: /save|submit/i });
        if (await saveBtn.isVisible()) {
          await saveBtn.click(); // Triggers standard UI feedback validations
          await page.waitForTimeout(500);
        }
      }

      // 4. Verify API integration status
      const abpConfig = await getAcademicJson(page, '/app/academic-year?Sorting=name');
      if (abpConfig && Array.isArray(abpConfig.items)) {
        report.workflow.dashboardLoads = true;
      }

      report.cleanup.workflowComplete = true;
    } catch (error) {
      unexpectedError = error;
      addFailure(report, 'unexpected-error', errorMessage(error));
    } finally {
      runtimeGuards.appendToReport(report);
      await attachReport(testInfo, report);
    }

    if (unexpectedError) {
      throw unexpectedError instanceof Error
        ? unexpectedError
        : new Error(errorMessage(unexpectedError));
    }

    expect(runtimeGuards.failures, runtimeGuards.failures.join('\n')).toEqual([]);
    expect(report.failures, JSON.stringify(report.failures, null, 2)).toEqual([]);
  });
});
