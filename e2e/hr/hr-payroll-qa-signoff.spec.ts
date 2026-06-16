/* eslint-disable import/no-extraneous-dependencies */
import { writeFile } from 'node:fs/promises';
import { test, expect, type Page, type TestInfo, type APIResponse } from '@playwright/test';

import { employeeApiRequest } from './employee/employee-api';
import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { dismissAcademicYearTour } from './employee/employee-page';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';
const today = new Date();

type AcademicYear = {
  id: string;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type AcademicYearListItem = AcademicYear & {
  academicYear?: AcademicYear;
};

type AuditFailure = {
  code: string;
  message: string;
  details?: unknown;
};

type PolicyAuditSummary = {
  id: string;
  name: string;
  status?: string | null;
  isDefault?: boolean | null;
  workCalendarPolicyId?: string | null;
};

type EmployeeAuditSummary = {
  id: string;
  name: string;
  email?: string | null;
  status?: unknown;
  policySource?: string | null;
  payrollPolicyId?: string | null;
  attendancePolicyId?: string | null;
  leavePolicyId?: string | null;
};

type QaAuditReport = {
  generatedAt: string;
  tenant: string;
  baseUrl: string;
  apiUrl: string;
  academicYear: AcademicYear | null;
  counts: {
    workCalendars: number;
    payrollPolicies: number;
    attendancePolicies: number;
    leavePolicies: number;
    activePolicyAssignments: number;
    sampledActiveEmployees: number;
  };
  defaults: {
    payroll: PolicyAuditSummary[];
    attendance: PolicyAuditSummary[];
    leave: PolicyAuditSummary[];
  };
  referencedWorkCalendarIds: string[];
  assignmentIssues: AuditFailure[];
  sampledEmployees: EmployeeAuditSummary[];
  warnings: string[];
  failures: AuditFailure[];
};

const yyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

function assertLocalDdvsOnly() {
  const frontend = new URL(
    process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  );
  const api = new URL(
    process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332'
  );
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

  expect(localHosts.has(frontend.hostname), `frontend must be local: ${frontend.href}`).toBe(true);
  expect(localHosts.has(api.hostname), `API must be local: ${api.href}`).toBe(true);
  expect((process.env.E2E_TENANT || 'DDVS').toUpperCase(), 'tenant must be DDVS').toBe('DDVS');
}

function attachRuntimeGuards(page: Page) {
  const failures: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    const isNextAuthSessionNoise =
      text.includes('ClientFetchError: Failed to fetch') && text.includes('authjs.dev#autherror');
    const isHandledResource400 =
      text.includes('Failed to load resource') && text.includes('status of 400');
    if (isNextAuthSessionNoise || isHandledResource400) return;
    failures.push(`console error at ${page.url()}: ${text}`);
  });

  page.on('pageerror', (error) => {
    failures.push(`page error: ${error.message}`);
  });

  page.on('response', (response) => {
    const url = response.url();
    const isHrPayrollApi =
      url.includes('/api/hr/') ||
      url.includes('/api/payroll/') ||
      url.includes('/api/leave-policies') ||
      url.includes('/api/groups') ||
      url.includes('/api/employees');
    if (isHrPayrollApi && response.status() >= 500) {
      failures.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });

  return {
    assertClean: () => expect(failures, failures.join('\n')).toEqual([]),
  };
}

async function expectOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson<T = any>(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const response = await employeeApiRequest(page, path, init);
  await expectOk(response, `${init.method || 'GET'} ${path}`);
  return response.json();
}

function asItems<T = Record<string, any>>(body: any): T[] {
  if (Array.isArray(body?.items)) return body.items as T[];
  if (Array.isArray(body)) return body as T[];
  return [];
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function isActivePolicy(item: any) {
  const status = String(item?.status || '').toLowerCase();
  return status === 'active' || item?.isActive === true;
}

function isActiveAssignment(item: any) {
  const status = String(item?.status || '').toLowerCase();
  return item?.isActive !== false && status !== 'archived' && status !== 'inactive';
}

function isActiveEmployee(item: any) {
  const status = firstDefined(
    item?.employeeStatusType,
    item?.status,
    item?.statusName,
    item?.employeeStatus
  );
  if (status === undefined || status === null || status === '') return true;
  if (typeof status === 'number') return status === 0;

  const normalized = String(status).toLowerCase();
  return normalized === 'active' || normalized === '0';
}

function policyName(item: any) {
  return String(item?.name || item?.policyTitle || item?.title || item?.id || 'Unknown policy');
}

function employeeName(item: any) {
  const parts = [item?.firstName, item?.middleName, item?.lastName]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);
  return String(
    item?.fullName ||
      item?.employeeName ||
      (parts.length > 0 ? parts.join(' ') : '') ||
      item?.email ||
      item?.id ||
      'Unknown employee'
  );
}

function toPolicySummary(item: any): PolicyAuditSummary {
  return {
    id: String(item?.id || ''),
    name: policyName(item),
    status: item?.status ?? null,
    isDefault: item?.isDefault ?? null,
    workCalendarPolicyId: item?.workCalendarPolicyId ?? null,
  };
}

function buildActivePolicyLookup(items: any[]) {
  return new Map(
    items
      .filter((item) => item?.id && isActivePolicy(item))
      .map((item) => [String(item.id).toLowerCase(), item])
  );
}

function recordFailure(
  report: QaAuditReport,
  code: string,
  message: string,
  details?: unknown,
  target?: AuditFailure[]
) {
  const failure = { code, message, details };
  report.failures.push(failure);
  target?.push(failure);
}

async function getCurrentAcademicYear(page: Page): Promise<AcademicYear> {
  const body = await getJson<any>(page, '/app/academic-year?Sorting=name');
  const years = asItems<AcademicYearListItem>(body).map(
    (item): AcademicYear => item.academicYear || item
  );
  const todayIso = yyyyMmDd(today);
  const current =
    years.find(
      (year: AcademicYear) =>
        year.id &&
        (!year.startDate || year.startDate <= todayIso) &&
        (!year.endDate || year.endDate >= todayIso)
    ) || years.find((year: AcademicYear) => year.id);

  if (!current?.id) {
    throw new Error('Unable to resolve current academic year');
  }
  return current;
}

async function attachReport(testInfo: TestInfo, report: QaAuditReport) {
  const reportPath = testInfo.outputPath('hr-payroll-qa-signoff-data-health.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await testInfo.attach('hr-payroll-qa-signoff-data-health.json', {
    path: reportPath,
    contentType: 'application/json',
  });
}

test.describe('HR payroll QA sign-off data health', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 to run payroll QA sign-off checks.');

  test('audits DDVS policy defaults, assignments, and effective employee policies', async ({
    page,
  }, testInfo) => {
    test.setTimeout(900_000);
    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      const runtimeGuards = attachRuntimeGuards(page);
      const todayIso = yyyyMmDd(today);
      const report: QaAuditReport = {
        generatedAt: new Date().toISOString(),
        tenant: process.env.E2E_TENANT || 'DDVS',
        baseUrl:
          process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        apiUrl:
          process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332',
        academicYear: null,
        counts: {
          workCalendars: 0,
          payrollPolicies: 0,
          attendancePolicies: 0,
          leavePolicies: 0,
          activePolicyAssignments: 0,
          sampledActiveEmployees: 0,
        },
        defaults: {
          payroll: [],
          attendance: [],
          leave: [],
        },
        referencedWorkCalendarIds: [],
        assignmentIssues: [],
        sampledEmployees: [],
        warnings: [],
        failures: [],
      };

      try {
        await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await dismissAcademicYearTour(page);
        await expect(page, 'dashboard should stay authenticated').not.toHaveURL(/\/login|\/auth/i);

        const academicYear = await getCurrentAcademicYear(page);
        report.academicYear = academicYear;
        const academicYearId = academicYear.id;

        const [
          workCalendarsBody,
          payrollPoliciesBody,
          attendancePoliciesBody,
          leavePoliciesBody,
          assignmentsBody,
          employeesBody,
        ] = await Promise.all([
          getJson<any>(
            page,
            `/hr/work-calendar-policies?academicYearId=${academicYearId}&maxResultCount=500`
          ),
          getJson<any>(
            page,
            `/hr/payroll/policies?academicYearId=${academicYearId}&maxResultCount=500`
          ),
          getJson<any>(
            page,
            `/hr/attendance/policies?academicYearId=${academicYearId}&maxResultCount=500`
          ),
          getJson<any>(
            page,
            `/leave-policies?academicYearId=${academicYearId}&page=1&pageSize=500`
          ),
          getJson<any>(
            page,
            `/hr/policy-assignments?academicYearId=${academicYearId}&maxResultCount=1000`
          ),
          getJson<any>(page, '/employees?page=1&pageSize=25'),
        ]);

        const workCalendars = asItems(workCalendarsBody);
        const payrollPolicies = asItems(payrollPoliciesBody);
        const attendancePolicies = asItems(attendancePoliciesBody);
        const leavePolicies = asItems(leavePoliciesBody);
        const activeAssignments = asItems(assignmentsBody).filter(isActiveAssignment);
        const activeEmployees = asItems(employeesBody).filter(isActiveEmployee).slice(0, 25);
        const activeCalendars = buildActivePolicyLookup(workCalendars);
        const activePayrollPolicies = buildActivePolicyLookup(payrollPolicies);
        const activeAttendancePolicies = buildActivePolicyLookup(attendancePolicies);
        const activeLeavePolicies = buildActivePolicyLookup(leavePolicies);

        report.counts = {
          workCalendars: workCalendars.length,
          payrollPolicies: payrollPolicies.length,
          attendancePolicies: attendancePolicies.length,
          leavePolicies: leavePolicies.length,
          activePolicyAssignments: activeAssignments.length,
          sampledActiveEmployees: activeEmployees.length,
        };

        const activeDefaults = (items: any[]) =>
          items.filter((item) => item?.isDefault === true && isActivePolicy(item));
        report.defaults.payroll = activeDefaults(payrollPolicies).map(toPolicySummary);
        report.defaults.attendance = activeDefaults(attendancePolicies).map(toPolicySummary);
        report.defaults.leave = activeDefaults(leavePolicies).map(toPolicySummary);

        (
          [
            ['payroll', report.defaults.payroll],
            ['attendance', report.defaults.attendance],
            ['leave', report.defaults.leave],
          ] as const
        ).forEach(([policyType, defaults]) => {
          if (defaults.length !== 1) {
            recordFailure(
              report,
              'default-policy-count',
              `Expected one active default ${policyType} policy.`,
              {
                count: defaults.length,
                defaults,
              }
            );
          }
        });

        const referencedCalendarIds = [
          report.defaults.payroll[0]?.workCalendarPolicyId,
          report.defaults.attendance[0]?.workCalendarPolicyId,
        ].filter(Boolean) as string[];
        report.referencedWorkCalendarIds = referencedCalendarIds;
        referencedCalendarIds.forEach((calendarId) => {
          if (!activeCalendars.has(calendarId.toLowerCase())) {
            recordFailure(
              report,
              'default-policy-calendar',
              'Default policy references a missing or inactive work calendar.',
              {
                calendarId,
              }
            );
          }
        });

        activeAssignments.forEach((assignment: any) => {
          const assignmentId = String(assignment?.id || 'unknown-assignment');
          const checks = [
            {
              field: 'payrollPolicyId',
              lookup: activePayrollPolicies,
              value: assignment?.payrollPolicyId,
            },
            {
              field: 'attendancePolicyId',
              lookup: activeAttendancePolicies,
              value: assignment?.attendancePolicyId,
            },
            {
              field: 'leavePolicyId',
              lookup: activeLeavePolicies,
              value: assignment?.leavePolicyId,
            },
          ];

          checks.forEach(({ field, lookup, value }) => {
            if (!value || !lookup.has(String(value).toLowerCase())) {
              recordFailure(
                report,
                'assignment-reference',
                `Active assignment references a missing or inactive ${field}.`,
                {
                  assignmentId,
                  targetType: assignment?.targetType,
                  targetKey: assignment?.targetKey,
                  field,
                  value,
                },
                report.assignmentIssues
              );
            }
          });
        });

        if (activeEmployees.length === 0) {
          recordFailure(
            report,
            'employee-sample-empty',
            'No active employees were available for effective-policy sampling.'
          );
        }

        await Promise.all(
          activeEmployees.map(async (employee: any) => {
            const employeeId = String(employee?.id || '');
            if (!employeeId) {
              recordFailure(
                report,
                'employee-id-missing',
                'Sampled employee row has no id.',
                employee
              );
              return;
            }

            const summary: EmployeeAuditSummary = {
              id: employeeId,
              name: employeeName(employee),
              email: employee?.email ?? employee?.emailId ?? null,
              status: firstDefined(
                employee?.employeeStatusType,
                employee?.status,
                employee?.statusName,
                employee?.employeeStatus
              ),
            };
            report.sampledEmployees.push(summary);

            const response = await employeeApiRequest(
              page,
              `/hr/employees/${employeeId}/effective-policies?date=${todayIso}`
            );
            if (!response.ok()) {
              recordFailure(
                report,
                'effective-policy-request',
                'Effective-policy resolution request failed.',
                {
                  employeeId,
                  status: response.status(),
                  body: await response.text(),
                }
              );
              return;
            }

            const effective = await response.json();
            summary.policySource = effective?.policySource ?? null;
            summary.payrollPolicyId = effective?.payrollPolicy?.id ?? null;
            summary.attendancePolicyId = effective?.attendancePolicy?.id ?? null;
            summary.leavePolicyId = effective?.leavePolicy?.id ?? null;

            if (!summary.payrollPolicyId || !summary.attendancePolicyId || !summary.leavePolicyId) {
              recordFailure(
                report,
                'effective-policy-missing',
                'Employee did not resolve all required policy types.',
                {
                  employeeId,
                  employeeName: summary.name,
                  policySource: summary.policySource,
                  payrollPolicyId: summary.payrollPolicyId,
                  attendancePolicyId: summary.attendancePolicyId,
                  leavePolicyId: summary.leavePolicyId,
                }
              );
            }
          })
        );
      } finally {
        await attachReport(testInfo, report);
      }

      runtimeGuards.assertClean();
      expect(report.failures, JSON.stringify(report.failures, null, 2)).toEqual([]);
    });
  });
});
