/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { createEmployeeFixture } from './employee/employee-fixtures';
import { employeeApiRequest, createEmployeeFromExistingDefaults } from './employee/employee-api';
import {
  searchEmployee,
  gotoEmployeeList,
  dismissAcademicYearTour,
} from './employee/employee-page';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';

const today = new Date();
const baseEarningAmount = 30_000;
const baseDeductionAmount = 1_500;
const changedEarningAmount = 45_000;
const changedDeductionAmount = 2_500;
const earningComponentName = 'E2E Basic Pay';
const deductionComponentName = 'E2E Payroll Deduction';

type PayrollSnapshot = {
  gross: number;
  deductions: number;
  net: number;
  payableDays: number;
  totalWorkingDays: number;
  prorationFactor: number;
  dayCalculationMode: string;
  payrollPolicyId: string;
  earnings: Array<{ name: string; amount: number; isTemp: boolean }>;
  deductionsList: Array<{ name: string; amount: number; isTemp: boolean }>;
};

const yyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const payslipMonth = (date: Date) =>
  `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${date.getFullYear()}`;

const firstWeekdayInMonth = (date: Date) => {
  const candidate = new Date(date.getFullYear(), date.getMonth(), 1);
  while ([0, 6].includes(candidate.getDay())) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
};

const testPayrollMonthOffset = () => 2 + (Math.floor(Date.now() / 1000) % 5);

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
  await expectOk(response, `GET ${path}`);
  return response.json();
}

async function openHrPage(page: Page, path: string, marker: RegExp) {
  const route = path.includes('?') || path.endsWith('/') ? path : `${path}/`;
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await dismissAcademicYearTour(page);
  await expect(page, `${route} should stay authenticated`).not.toHaveURL(/\/login|\/auth/i);
  await expect(page.getByText(marker).first()).toBeVisible({ timeout: 60_000 });
}

function asItems(body: any) {
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body)) return body;
  return [];
}

function componentLines(components: any[] | undefined) {
  return (components || []).map((item) => ({
    name: String(item?.name || item?.componentName || ''),
    amount: Number(item?.amount ?? 0),
    isTemp: Boolean(item?.isTemp),
  }));
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function isPayrollMonthBusy(details: string) {
  return (
    details.includes('HR:Payroll:030033') ||
    details.includes('PayrollMonthLockBusy') ||
    details.includes('Payroll Month Lock Busy')
  );
}

function expectLockedPayrollImpactBody(body: string, label: string) {
  expect(body, label).toContain('HrPolicyImpactBlocking');
  expect(body.toLowerCase(), label).toContain('locked payroll');
}

function snapshotPayrollRow(row: any): PayrollSnapshot {
  return {
    gross: Number(firstDefined(row.grossSalary, row.totalEarnings, 0)),
    deductions: Number(firstDefined(row.totalDeduction, row.totalDeductions, 0)),
    net: Number(firstDefined(row.netPay, row.netSalary, 0)),
    payableDays: Number(firstDefined(row.payableDays, row.paidDays, 0)),
    totalWorkingDays: Number(firstDefined(row.totalWorkingDays, row.workingDays, 0)),
    prorationFactor: Number(firstDefined(row.prorationFactor, row.prorateFactor, 0)),
    dayCalculationMode: String(row.dayCalculationMode || ''),
    payrollPolicyId: String(row.payrollPolicyId || ''),
    earnings: componentLines(row.earningComponents),
    deductionsList: componentLines(row.deductionComponents),
  };
}

function snapshotSalarySlip(slip: any): PayrollSnapshot {
  return {
    gross: Number(firstDefined(slip.totalEarning, slip.totalEarnings, 0)),
    deductions: Number(firstDefined(slip.totalDeduction, slip.totalDeductions, 0)),
    net: Number(firstDefined(slip.netPay, slip.netSalary, 0)),
    payableDays: Number(firstDefined(slip.payableDays, slip.paidDays, 0)),
    totalWorkingDays: Number(
      firstDefined(slip.totalWorkingDays, slip.workingDays, slip.payrollBasisDays, 0)
    ),
    prorationFactor: Number(firstDefined(slip.prorationFactor, slip.prorateFactor, 0)),
    dayCalculationMode: String(slip.payrollDayCalculationMode || ''),
    payrollPolicyId: String(slip.payrollPolicyId || ''),
    earnings: componentLines(slip.earnings),
    deductionsList: componentLines(slip.deductions),
  };
}

function expectSnapshotUnchanged(
  actual: PayrollSnapshot,
  expected: PayrollSnapshot,
  label: string,
  options: { comparePayrollPolicyId?: boolean } = {}
) {
  expect(actual.gross, `${label} gross`).toBeCloseTo(expected.gross, 2);
  expect(actual.deductions, `${label} deductions`).toBeCloseTo(expected.deductions, 2);
  expect(actual.net, `${label} net`).toBeCloseTo(expected.net, 2);
  expect(actual.payableDays, `${label} payable days`).toBeCloseTo(expected.payableDays, 2);
  expect(actual.totalWorkingDays, `${label} working days`).toBeCloseTo(
    expected.totalWorkingDays,
    2
  );
  expect(actual.prorationFactor, `${label} proration factor`).toBeCloseTo(
    expected.prorationFactor,
    2
  );
  expect(actual.dayCalculationMode, `${label} day calculation`).toBe(expected.dayCalculationMode);
  if (options.comparePayrollPolicyId ?? true) {
    expect(actual.payrollPolicyId, `${label} payroll policy`).toBe(expected.payrollPolicyId);
  }
  expect(actual.earnings, `${label} earnings`).toEqual(expected.earnings);
  expect(actual.deductionsList, `${label} deductions list`).toEqual(expected.deductionsList);
}

async function ensurePayrollComponent(page: Page, kind: 'earning' | 'deduction') {
  const isEarning = kind === 'earning';
  const name = isEarning ? earningComponentName : deductionComponentName;
  const path = isEarning ? '/payroll/earning-components' : '/payroll/deduction-components';
  const list = await getJson<any>(
    page,
    `${path}?page=1&pageSize=100&search=${encodeURIComponent(name)}`
  );
  const existing = asItems(list).find((item: any) =>
    String(item.earningComponentName || item.deductionComponentName || item.componentName || '')
      .toLowerCase()
      .includes(name.toLowerCase())
  );
  if (existing?.id) return existing;

  const response = await employeeApiRequest(page, path, {
    method: 'POST',
    body: JSON.stringify(
      isEarning
        ? {
            earningComponentName: name,
            description: 'E2E fixed earning component',
            earningType: 'Fixed',
            calculationType: 'Amount',
            amount: baseEarningAmount,
            percentage: 0,
            selectedEarningComponentId: null,
            visibleInPayslip: true,
          }
        : {
            deductionComponentName: name,
            description: 'E2E fixed deduction component',
            deductionType: 'Fixed',
            calculationType: 'Amount',
            amount: baseDeductionAmount,
            percentage: 0,
            selectedDeductionComponentId: null,
            visibleInPayslip: true,
          }
    ),
  });
  await expectOk(response, `create ${kind} component`);
  return response.json();
}

async function setEmployeeSalaryStructure(
  page: Page,
  employeeId: string,
  employeeName: string,
  earningAmount: number,
  deductionAmount: number
) {
  const earning = await ensurePayrollComponent(page, 'earning');
  const deduction = await ensurePayrollComponent(page, 'deduction');
  const earningLine = {
    componentId: earning.id,
    name: earning.earningComponentName || earning.componentName || earningComponentName,
    amount: earningAmount,
    isFixed: true,
    isTemp: false,
  };
  const deductionLine = {
    componentId: deduction.id,
    name: deduction.deductionComponentName || deduction.componentName || deductionComponentName,
    amount: deductionAmount,
    isFixed: true,
    isTemp: false,
  };

  await expectOk(
    await employeeApiRequest(page, `/employees/${employeeId}/payroll`, {
      method: 'PUT',
      body: JSON.stringify({
        bankDetails: {
          bankName: 'State Bank of India',
          branchName: 'Automation Branch',
          accountHolderName: employeeName,
          accountNumber: `12345${employeeId.replace(/\D/g, '').slice(-9).padStart(9, '0')}`,
          ifscCode: 'SBIN0001234',
        },
        salaryDetails: {
          pfRuleId: null,
          epfNumber: 'AP/12345/1234567',
          uanNumber: '123456789012',
          punchId: `E2E${employeeId.slice(0, 6)}`,
          totalWorkingHourPerMonth: 176,
        },
        earningComponents: [earningLine],
        deductionComponents: [deductionLine],
      }),
    }),
    'set employee payroll details'
  );

  await expectOk(
    await employeeApiRequest(page, `/payroll/employees/${employeeId}/salary-structure`, {
      method: 'PUT',
      body: JSON.stringify({
        earningComponents: [{ id: null, ...earningLine, description: '', componentType: 'Fixed' }],
        deductionComponents: [
          { id: null, ...deductionLine, description: '', componentType: 'Fixed' },
        ],
      }),
    }),
    'set employee salary structure'
  );
}

async function adjustAttendance(page: Page, employeeId: string, attendanceDate: string) {
  await expectOk(
    await employeeApiRequest(page, '/hr/attendance/register/adjust', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        attendanceDate,
        statusWire: 'PRESENT',
        inTime: '09:00:00',
        outTime: '16:00:00',
        reason: 'E2E locked payroll policy edge regression',
      }),
    }),
    'adjust attendance register'
  );
}

/* eslint-disable no-await-in-loop */
async function getPayrollRunRow(
  page: Page,
  employeeId: string,
  month: string,
  forceRefresh: boolean
) {
  const path = `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=${forceRefresh}`;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await employeeApiRequest(page, path, { timeout: 120_000 });
    if (response.ok()) {
      const body = await response.json();
      const row = asItems(body).find((item: any) => item.employeeId === employeeId);
      expect(row, `payroll row ${employeeId} for ${month}`).toBeTruthy();
      return row;
    }

    const details = await response.text();
    if (response.status() === 400 && isPayrollMonthBusy(details) && attempt < 2) {
      await page.waitForTimeout(2_000);
    } else {
      expect(response.ok(), `GET ${path}: ${response.status()} ${details}`).toBe(true);
    }
  }

  throw new Error(`GET ${path}: payroll month stayed busy after retries`);
}
/* eslint-enable no-await-in-loop */

async function lockPayroll(page: Page, employeeId: string, academicYearId: string, month: string) {
  await expectOk(
    await employeeApiRequest(page, '/payroll/run/reviews', {
      method: 'POST',
      body: JSON.stringify({ month, academicYearId, employeeIds: [employeeId] }),
      timeout: 120_000,
    }),
    'mark payroll reviewed'
  );

  await expectOk(
    await employeeApiRequest(page, '/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month, academicYearId, employeeIds: [employeeId] }),
      timeout: 120_000,
    }),
    'lock payroll'
  );
}

async function getSalarySlip(page: Page, employeeId: string, month: string) {
  return getJson<any>(
    page,
    `/payroll/salary-slips?monthYear=${encodeURIComponent(month)}&employeeId=${employeeId}`
  );
}

function payrollPolicyUpdatePayload(policy: any, overrides: Record<string, unknown> = {}) {
  return {
    academicYearId: policy.academicYearId,
    workCalendarPolicyId: policy.workCalendarPolicyId,
    name: policy.name,
    status: policy.status,
    isDefault: policy.isDefault,
    dayCalculationType: policy.dayCalculationType || 'working-days',
    manualDays: policy.manualDays ?? null,
    manualMonthDays: policy.manualMonthDays || [],
    saturdayWorkPolicy: policy.saturdayWorkPolicy || 'full-day',
    holidayOverrides: policy.holidayOverrides || [],
    ...overrides,
  };
}

async function createAlternatePayrollPolicy(page: Page, sourcePolicy: any, name: string) {
  const response = await employeeApiRequest(page, '/hr/payroll/policies', {
    method: 'POST',
    body: JSON.stringify(
      payrollPolicyUpdatePayload(sourcePolicy, {
        name,
        isDefault: false,
        dayCalculationType: 'manual-days',
        manualDays: 15,
        manualMonthDays: [],
      })
    ),
  });
  await expectOk(response, 'create alternate payroll policy');
  return response.json();
}

function buildEmployeeOverridePayload(
  employeeId: string,
  academicYearId: string,
  policies: any,
  payrollPolicyId: string,
  effectiveFrom: string,
  reason: string
) {
  return {
    academicYearId,
    targetType: 'employee',
    targetKey: employeeId,
    targetDisplayName: employeeId,
    payrollPolicyId,
    attendancePolicyId: policies.attendancePolicy.id,
    leavePolicyId: policies.leavePolicy.id,
    effectiveFrom,
    effectiveTo: null,
    priority: 100,
    assignmentReason: reason,
    isActive: true,
  };
}

async function previewEmployeeOverride(
  page: Page,
  assignment: ReturnType<typeof buildEmployeeOverridePayload>
) {
  return getJson<any>(page, '/hr/policy-assignments/impact-preview', {
    method: 'POST',
    body: JSON.stringify({
      action: 'employee-override-upsert',
      assignment,
    }),
  });
}

test.describe('HR policy payroll edge cases', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against local DDVS before running.');

  test('blocks locked-month policy changes and keeps locked payroll and payslip immutable', async ({
    page,
  }) => {
    test.setTimeout(900_000);
    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      const guard = attachRuntimeGuards(page);

      await page.goto('/dashboard/');
      await dismissAcademicYearTour(page);

      const targetMonthDate = firstWeekdayInMonth(
        new Date(today.getFullYear(), today.getMonth() + testPayrollMonthOffset(), 1)
      );
      const nextMonthDate = firstWeekdayInMonth(
        new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 1)
      );
      const attendanceDate = yyyyMmDd(targetMonthDate);
      const futureEffectiveDate = yyyyMmDd(nextMonthDate);
      const runMonth = monthKey(targetMonthDate);
      const slipMonth = payslipMonth(targetMonthDate);

      const employeeFixture = createEmployeeFixture('Policy Edge Employee');
      const employee = await createEmployeeFromExistingDefaults(page, employeeFixture, {
        dateOfJoining: yyyyMmDd(targetMonthDate),
      });
      const employeeId = employee.id as string;

      await gotoEmployeeList(page);
      await searchEmployee(page, employeeFixture.email);
      await expect(
        page.getByRole('row', { name: new RegExp(employeeFixture.email, 'i') })
      ).toBeVisible();

      const effectivePolicies = await getJson<any>(
        page,
        `/hr/employees/${employeeId}/effective-policies?date=${attendanceDate}`
      );
      expect(effectivePolicies?.payrollPolicy?.id, 'starting payroll policy').toBeTruthy();
      expect(effectivePolicies?.attendancePolicy?.id, 'starting attendance policy').toBeTruthy();
      expect(effectivePolicies?.leavePolicy?.id, 'starting leave policy').toBeTruthy();

      await setEmployeeSalaryStructure(
        page,
        employeeId,
        employeeFixture.fullName,
        baseEarningAmount,
        baseDeductionAmount
      );
      await openHrPage(page, '/hr/manual-attendance', /Mark Attendance/i);
      await adjustAttendance(page, employeeId, attendanceDate);

      const previewRow = await getPayrollRunRow(page, employeeId, runMonth, true);
      const previewSnapshot = snapshotPayrollRow(previewRow);
      expect(previewSnapshot.gross, 'initial gross').toBeGreaterThan(0);
      await openHrPage(page, '/hr/payroll/run-payroll', /Run Payroll/i);

      await lockPayroll(page, employeeId, effectivePolicies.academicYearId, runMonth);
      const lockedRow = await getPayrollRunRow(page, employeeId, runMonth, false);
      const lockedSnapshot = snapshotPayrollRow(lockedRow);
      expectSnapshotUnchanged(lockedSnapshot, previewSnapshot, 'locked payroll');

      await openHrPage(page, '/hr/payroll/payslip-generation', /Payslip|Salary/i);
      const lockedSlipSnapshot = snapshotSalarySlip(
        await getSalarySlip(page, employeeId, slipMonth)
      );
      expectSnapshotUnchanged(lockedSlipSnapshot, lockedSnapshot, 'locked salary slip', {
        comparePayrollPolicyId: false,
      });

      const sourcePayrollPolicy = await getJson<any>(
        page,
        `/hr/payroll/policies/${effectivePolicies.payrollPolicy.id}`
      );
      const blockedPolicyUpdate = await employeeApiRequest(
        page,
        `/hr/payroll/policies/${sourcePayrollPolicy.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(
            payrollPolicyUpdatePayload(sourcePayrollPolicy, {
              dayCalculationType: 'manual-days',
              manualDays: 12,
            })
          ),
        }
      );
      const blockedPolicyBody = await blockedPolicyUpdate.text();
      expect(
        blockedPolicyUpdate.ok(),
        `locked policy update should fail but returned ${blockedPolicyUpdate.status()} ${blockedPolicyBody}`
      ).toBe(false);
      expectLockedPayrollImpactBody(blockedPolicyBody, 'locked policy update response');

      const alternatePayrollPolicy = await createAlternatePayrollPolicy(
        page,
        sourcePayrollPolicy,
        `E2E Alt Payroll Policy ${Date.now()}`
      );
      const lockedMonthAssignment = buildEmployeeOverridePayload(
        employeeId,
        effectivePolicies.academicYearId,
        effectivePolicies,
        alternatePayrollPolicy.id,
        attendanceDate,
        'E2E locked-month override must be blocked'
      );
      const lockedMonthPreview = await previewEmployeeOverride(page, lockedMonthAssignment);
      expect(
        (lockedMonthPreview.blockingWarnings || []).map((warning: any) => warning.code),
        'locked-month employee override warnings'
      ).toContain('ShikshaMitra:LockedPayrollImpact');

      const lockedMonthOverride = await employeeApiRequest(
        page,
        '/hr/policy-assignments/direct-employee-override',
        {
          method: 'POST',
          body: JSON.stringify({
            employeeId,
            academicYearId: effectivePolicies.academicYearId,
            payrollPolicyId: alternatePayrollPolicy.id,
            attendancePolicyId: effectivePolicies.attendancePolicy.id,
            leavePolicyId: effectivePolicies.leavePolicy.id,
            effectiveFrom: attendanceDate,
            effectiveTo: null,
            assignmentReason: 'E2E locked-month override must be blocked',
            confirmationToken: lockedMonthPreview.confirmationToken ?? null,
          }),
        }
      );
      const lockedMonthOverrideBody = await lockedMonthOverride.text();
      expect(
        lockedMonthOverride.ok(),
        `locked-month override should fail but returned ${lockedMonthOverride.status()} ${lockedMonthOverrideBody}`
      ).toBe(false);
      expectLockedPayrollImpactBody(lockedMonthOverrideBody, 'locked employee override response');

      const futureAssignment = buildEmployeeOverridePayload(
        employeeId,
        effectivePolicies.academicYearId,
        effectivePolicies,
        alternatePayrollPolicy.id,
        futureEffectiveDate,
        'E2E future payroll policy override'
      );
      const futurePreview = await previewEmployeeOverride(page, futureAssignment);
      expect(futurePreview.blockingWarnings || [], 'future override blocking warnings').toEqual([]);
      await expectOk(
        await employeeApiRequest(page, '/hr/policy-assignments/direct-employee-override', {
          method: 'POST',
          body: JSON.stringify({
            employeeId,
            academicYearId: effectivePolicies.academicYearId,
            payrollPolicyId: alternatePayrollPolicy.id,
            attendancePolicyId: effectivePolicies.attendancePolicy.id,
            leavePolicyId: effectivePolicies.leavePolicy.id,
            effectiveFrom: futureEffectiveDate,
            effectiveTo: null,
            assignmentReason: 'E2E future payroll policy override',
            confirmationToken: futurePreview.confirmationToken ?? null,
          }),
        }),
        'save future employee policy override'
      );

      await openHrPage(
        page,
        `/hr/effective-preview?employeeId=${encodeURIComponent(employeeId)}&date=${encodeURIComponent(
          futureEffectiveDate
        )}`,
        /Policy Impact|Source:/i
      );
      const futureEffectivePolicies = await getJson<any>(
        page,
        `/hr/employees/${employeeId}/effective-policies?date=${futureEffectiveDate}`
      );
      expect(futureEffectivePolicies.payrollPolicy.id, 'future effective payroll policy').toBe(
        alternatePayrollPolicy.id
      );

      await setEmployeeSalaryStructure(
        page,
        employeeId,
        employeeFixture.fullName,
        changedEarningAmount,
        changedDeductionAmount
      );
      const refreshedLockedSnapshot = snapshotPayrollRow(
        await getPayrollRunRow(page, employeeId, runMonth, true)
      );
      expectSnapshotUnchanged(
        refreshedLockedSnapshot,
        lockedSnapshot,
        'locked payroll after changes'
      );

      const refreshedSlipSnapshot = snapshotSalarySlip(
        await getSalarySlip(page, employeeId, slipMonth)
      );
      expectSnapshotUnchanged(
        refreshedSlipSnapshot,
        lockedSlipSnapshot,
        'locked salary slip after changes',
        {
          comparePayrollPolicyId: false,
        }
      );

      guard.assertClean();
    });
  });
});
