/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { createEmployeeFixture } from './employee/employee-fixtures';
import {
  searchEmployee,
  gotoEmployeeList,
  dismissAcademicYearTour,
} from './employee/employee-page';
import {
  employeeApiRequest,
  createEmployeeFromExistingDefaults,
  assignEmployeeToFirstAcademicScope,
} from './employee/employee-api';

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

type PolicyBundle = {
  payroll: any;
  attendance: any;
  leave: any;
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

const lastDayInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const testPayrollMonthOffset = () => 4 + (Math.floor(Date.now() / 1000) % 3);

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

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function componentLines(components: any[] | undefined) {
  return (components || []).map((item) => ({
    name: String(item?.name || item?.componentName || ''),
    amount: Number(item?.amount ?? 0),
    isTemp: Boolean(item?.isTemp),
  }));
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

function attendancePolicyUpdatePayload(policy: any, overrides: Record<string, unknown> = {}) {
  return {
    academicYearId: policy.academicYearId,
    workCalendarPolicyId: policy.workCalendarPolicyId,
    name: policy.name,
    status: policy.status,
    isDefault: policy.isDefault,
    captureMode: policy.captureMode || 'manual_with_time',
    fullDayThresholdPercentage: Number(firstDefined(policy.fullDayThresholdPercentage, 75)),
    halfDayThresholdPercentage: Number(firstDefined(policy.halfDayThresholdPercentage, 50)),
    absentThresholdPercentage: Number(firstDefined(policy.absentThresholdPercentage, 0)),
    missingPunchBehavior: policy.missingPunchBehavior || 'requires_review',
    manualCorrectionAllowed: Boolean(firstDefined(policy.manualCorrectionAllowed, true)),
    graceTime: Number(firstDefined(policy.graceTime, 0)),
    maxLateAllowedPerMonth: Number(firstDefined(policy.maxLateAllowedPerMonth, 0)),
    penaltyType: policy.penaltyType || 'none',
    penaltyCountThreshold: Number(firstDefined(policy.penaltyCountThreshold, 0)),
    earlyExitEnabled: Boolean(policy.earlyExitEnabled),
    earlyExitGraceTime: Number(firstDefined(policy.earlyExitGraceTime, 0)),
    overtimeEnabled: Boolean(policy.overtimeEnabled),
    overtimeRate: policy.overtimeRate ?? null,
    minOvertimeMinutes: policy.minOvertimeMinutes ?? null,
    holidayWorkBehavior: policy.holidayWorkBehavior || 'comp_off',
    payrollPreviewEnabled: Boolean(firstDefined(policy.payrollPreviewEnabled, true)),
    ...overrides,
  };
}

function leavePolicyCreatePayload(
  sourcePolicy: any,
  name: string,
  leaveCount: number,
  effectiveFrom: string
) {
  const sourceRule = (sourcePolicy.rules || sourcePolicy.Rules || []).find(
    (rule: any) => String(rule?.paidType || '').toLowerCase() === 'paid'
  );
  expect(sourceRule, 'source leave policy must have a paid rule').toBeTruthy();

  return {
    policyTitle: name,
    status: 'Active',
    effectiveFrom,
    effectiveTo: null,
    description: 'E2E policy precedence and payroll lock regression',
    isDefault: false,
    rules: [
      {
        paidType: 'Paid',
        entitlementMode: 'Limited',
        accrualPolicyType: 'Yearly',
        leaveCount,
        carryForward: false,
        carryForwardLimit: null,
        encashmentAllowed: false,
        encashmentTiming: null,
        requiresApproval: true,
        minNoticeDays: 0,
        maxDaysPerRequest: 30,
        allowHalfDay: true,
        attachmentRequiredAfterDays: null,
        allowNegativeBalance: false,
        isActive: true,
      },
      {
        paidType: 'Unpaid',
        entitlementMode: 'Unlimited',
        accrualPolicyType: 'Yearly',
        leaveCount: null,
        carryForward: false,
        carryForwardLimit: null,
        encashmentAllowed: false,
        encashmentTiming: null,
        requiresApproval: true,
        minNoticeDays: 0,
        maxDaysPerRequest: 30,
        allowHalfDay: true,
        attachmentRequiredAfterDays: null,
        allowNegativeBalance: true,
        isActive: true,
      },
    ],
  };
}

async function createAlternatePayrollPolicy(
  page: Page,
  sourcePolicy: any,
  name: string,
  manualDays: number
) {
  return getJson<any>(page, '/hr/payroll/policies', {
    method: 'POST',
    body: JSON.stringify(
      payrollPolicyUpdatePayload(sourcePolicy, {
        name,
        isDefault: false,
        dayCalculationType: 'manual-days',
        manualDays,
        manualMonthDays: [],
      })
    ),
  });
}

async function createAlternateAttendancePolicy(
  page: Page,
  sourcePolicy: any,
  name: string,
  fullDayThresholdPercentage: number
) {
  return getJson<any>(page, '/hr/attendance/policies', {
    method: 'POST',
    body: JSON.stringify(
      attendancePolicyUpdatePayload(sourcePolicy, {
        name,
        isDefault: false,
        captureMode: 'manual_with_time',
        fullDayThresholdPercentage,
        halfDayThresholdPercentage: 50,
        absentThresholdPercentage: 0,
        manualCorrectionAllowed: true,
        payrollPreviewEnabled: true,
      })
    ),
  });
}

async function createAlternateLeavePolicy(
  page: Page,
  sourcePolicy: any,
  academicYearId: string,
  name: string,
  leaveCount: number,
  effectiveFrom: string
) {
  return getJson<any>(page, `/leave-policies?academicYearId=${academicYearId}`, {
    method: 'POST',
    body: JSON.stringify(leavePolicyCreatePayload(sourcePolicy, name, leaveCount, effectiveFrom)),
  });
}

async function createNameBasedEmployeeGroup(
  page: Page,
  academicYearId: string,
  employeeId: string,
  name: string
) {
  return getJson<any>(page, `/groups?academicYearId=${academicYearId}`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description: 'E2E policy precedence group with one staff member',
      nameBased: {
        selectedMembers: [{ memberType: 1, memberId: employeeId, userId: null }],
        divisionIds: [],
        roleIds: [],
        studentFilters: [],
        employeeFilters: [],
      },
    }),
  });
}

function buildAssignment(
  academicYearId: string,
  targetType: 'group' | 'employee',
  targetKey: string,
  targetDisplayName: string,
  policies: PolicyBundle,
  effectiveFrom: string,
  effectiveTo: string | null,
  priority: number,
  reason: string
) {
  return {
    academicYearId,
    targetType,
    targetKey,
    targetDisplayName,
    payrollPolicyId: policies.payroll.id,
    attendancePolicyId: policies.attendance.id,
    leavePolicyId: policies.leave.id,
    effectiveFrom,
    effectiveTo,
    isActive: true,
    priority,
    assignmentReason: reason,
  };
}

async function previewAssignmentImpact(
  page: Page,
  action: 'create' | 'update' | 'employee-override-upsert',
  assignment: ReturnType<typeof buildAssignment>,
  assignmentId?: string
) {
  return getJson<any>(page, '/hr/policy-assignments/impact-preview', {
    method: 'POST',
    body: JSON.stringify({ action, assignmentId, assignment }),
  });
}

async function saveGroupAssignment(
  page: Page,
  assignment: ReturnType<typeof buildAssignment>,
  action: 'create' | 'update' = 'create',
  assignmentId?: string
) {
  const preview = await previewAssignmentImpact(page, action, assignment, assignmentId);
  expect(preview.blockingWarnings || [], `${action} group assignment blocking warnings`).toEqual(
    []
  );
  const token = preview.confirmationToken ?? null;
  const response = await employeeApiRequest(
    page,
    action === 'create' ? '/hr/policy-assignments' : `/hr/policy-assignments/${assignmentId}`,
    {
      method: action === 'create' ? 'POST' : 'PUT',
      headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      body: JSON.stringify({ ...assignment, confirmationToken: token }),
    }
  );
  await expectOk(response, `${action} group policy assignment`);
  return response.json();
}

async function saveEmployeeOverride(
  page: Page,
  employeeId: string,
  academicYearId: string,
  policies: PolicyBundle,
  effectiveFrom: string,
  effectiveTo: string | null,
  reason: string
) {
  const assignment = buildAssignment(
    academicYearId,
    'employee',
    employeeId,
    employeeId,
    policies,
    effectiveFrom,
    effectiveTo,
    100,
    reason
  );
  const preview = await previewAssignmentImpact(page, 'employee-override-upsert', assignment);
  expect(preview.blockingWarnings || [], 'staff override blocking warnings').toEqual([]);

  const response = await employeeApiRequest(
    page,
    '/hr/policy-assignments/direct-employee-override',
    {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        academicYearId,
        payrollPolicyId: policies.payroll.id,
        attendancePolicyId: policies.attendance.id,
        leavePolicyId: policies.leave.id,
        effectiveFrom,
        effectiveTo,
        assignmentReason: reason,
        confirmationToken: preview.confirmationToken ?? null,
      }),
    }
  );
  await expectOk(response, 'save staff policy override');
  return response.json();
}

async function expectEffectivePolicies(
  page: Page,
  employeeId: string,
  date: string,
  policies: PolicyBundle,
  source: 'default' | 'group' | 'employee'
) {
  const body = await getJson<any>(
    page,
    `/hr/employees/${employeeId}/effective-policies?date=${date}`
  );
  expect(String(body?.policySource || '').toLowerCase(), `${date} policy source`).toBe(source);
  expect(body?.payrollPolicy?.id, `${date} payroll policy`).toBe(policies.payroll.id);
  expect(body?.attendancePolicy?.id, `${date} attendance policy`).toBe(policies.attendance.id);
  expect(body?.leavePolicy?.id, `${date} leave policy`).toBe(policies.leave.id);
  return body;
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

  return getJson<any>(page, path, {
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
    'set staff payroll details'
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
    'set staff salary structure'
  );
}

async function adjustAttendance(
  page: Page,
  employeeId: string,
  attendanceDate: string,
  statusWire = 'PRESENT'
) {
  const response = await employeeApiRequest(page, '/hr/attendance/register/adjust', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      attendanceDate,
      statusWire,
      inTime: statusWire === 'ABSENT' ? '00:00:00' : '09:00:00',
      outTime: statusWire === 'ABSENT' ? '00:00:00' : '16:00:00',
      reason: 'E2E policy precedence and payroll lock regression',
    }),
  });
  await expectOk(response, `adjust attendance ${statusWire}`);
  return response.json();
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

test.describe('HR policy precedence and retroactive payroll locks', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against local DDVS before running.');

  test('keeps locked payroll immutable while group and staff policy precedence changes later', async ({
    page,
  }) => {
    test.setTimeout(900_000);
    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      const guard = attachRuntimeGuards(page);

      await page.goto('/dashboard/');
      await dismissAcademicYearTour(page);

      const lockedMonthDate = firstWeekdayInMonth(
        new Date(today.getFullYear(), today.getMonth() + testPayrollMonthOffset(), 1)
      );
      const overrideMonthDate = firstWeekdayInMonth(
        new Date(lockedMonthDate.getFullYear(), lockedMonthDate.getMonth() + 1, 1)
      );
      const fallbackMonthDate = firstWeekdayInMonth(
        new Date(lockedMonthDate.getFullYear(), lockedMonthDate.getMonth() + 2, 1)
      );
      const lockedDate = yyyyMmDd(lockedMonthDate);
      const overrideDate = yyyyMmDd(overrideMonthDate);
      const overrideEndDate = yyyyMmDd(lastDayInMonth(overrideMonthDate));
      const fallbackDate = yyyyMmDd(fallbackMonthDate);
      const runMonth = monthKey(lockedMonthDate);
      const slipMonth = payslipMonth(lockedMonthDate);
      const stamp = Date.now();

      const employeeFixture = createEmployeeFixture('Policy Precedence Staff');
      const employee = await createEmployeeFromExistingDefaults(page, employeeFixture, {
        dateOfJoining: lockedDate,
      });
      await assignEmployeeToFirstAcademicScope(page, employee);
      const employeeId = employee.id as string;

      await gotoEmployeeList(page);
      await searchEmployee(page, employeeFixture.email);
      await expect(
        page.getByRole('row', { name: new RegExp(employeeFixture.email, 'i') })
      ).toBeVisible();

      const defaultEffective = await getJson<any>(
        page,
        `/hr/employees/${employeeId}/effective-policies?date=${lockedDate}`
      );
      const academicYearId = defaultEffective.academicYearId as string;
      const defaultBundle = {
        payroll: defaultEffective.payrollPolicy,
        attendance: defaultEffective.attendancePolicy,
        leave: defaultEffective.leavePolicy,
      };
      expect(
        ['default', 'group'],
        `initial policy source can reflect seeded local DDVS group assignments: ${defaultEffective.policySource}`
      ).toContain(String(defaultEffective.policySource || '').toLowerCase());

      const [sourcePayroll, sourceAttendance, sourceLeave] = await Promise.all([
        getJson<any>(page, `/hr/payroll/policies/${defaultBundle.payroll.id}`),
        getJson<any>(page, `/hr/attendance/policies/${defaultBundle.attendance.id}`),
        getJson<any>(page, `/leave-policies/${defaultBundle.leave.id}`),
      ]);

      const groupBundle = {
        payroll: await createAlternatePayrollPolicy(
          page,
          sourcePayroll,
          `E2E Group Payroll ${stamp}`,
          20
        ),
        attendance: await createAlternateAttendancePolicy(
          page,
          sourceAttendance,
          `E2E Group Attendance ${stamp}`,
          80
        ),
        leave: await createAlternateLeavePolicy(
          page,
          sourceLeave,
          academicYearId,
          `E2E Group Leave ${stamp}`,
          6,
          lockedDate
        ),
      };
      const employeeBundle = {
        payroll: await createAlternatePayrollPolicy(
          page,
          sourcePayroll,
          `E2E Staff Payroll ${stamp}`,
          15
        ),
        attendance: await createAlternateAttendancePolicy(
          page,
          sourceAttendance,
          `E2E Staff Attendance ${stamp}`,
          70
        ),
        leave: await createAlternateLeavePolicy(
          page,
          sourceLeave,
          academicYearId,
          `E2E Staff Leave ${stamp}`,
          18,
          lockedDate
        ),
      };

      const group = await createNameBasedEmployeeGroup(
        page,
        academicYearId,
        employeeId,
        `E2E Policy Group ${stamp}`
      );
      await openHrPage(page, '/hr/assignments', /Policy Assignments|Policies & Rules/i);
      const groupAssignmentInput = buildAssignment(
        academicYearId,
        'group',
        group.id,
        group.name,
        groupBundle,
        lockedDate,
        null,
        90,
        'E2E group policy precedence regression'
      );
      const groupAssignment = await saveGroupAssignment(page, groupAssignmentInput);

      await expectEffectivePolicies(page, employeeId, lockedDate, groupBundle, 'group');
      await expectEffectivePolicies(page, employeeId, lockedDate, groupBundle, 'group');

      await setEmployeeSalaryStructure(
        page,
        employeeId,
        employeeFixture.fullName,
        baseEarningAmount,
        baseDeductionAmount
      );
      await openHrPage(page, '/hr/manual-attendance', /Mark Attendance/i);
      const attendanceResult = await adjustAttendance(page, employeeId, lockedDate);
      expect(Number(attendanceResult.updatedCount || 0), 'initial attendance update count').toBe(1);
      await openHrPage(page, '/hr/attendance-tracking', /Attendance Register/i);

      await openHrPage(page, '/hr/payroll/run-payroll', /Run Payroll/i);
      const previewRow = await getPayrollRunRow(page, employeeId, runMonth, true);
      expect(String(previewRow.payrollPolicyId), 'preview uses group payroll policy').toBe(
        groupBundle.payroll.id
      );
      const previewSnapshot = snapshotPayrollRow(previewRow);
      expect(previewSnapshot.gross, 'preview gross').toBeGreaterThan(0);
      expect(previewSnapshot.payableDays, 'preview payable days').toBeGreaterThan(0);
      expect(previewSnapshot.totalWorkingDays, 'preview total working days').toBeGreaterThan(0);

      await lockPayroll(page, employeeId, academicYearId, runMonth);
      const lockedSnapshot = snapshotPayrollRow(
        await getPayrollRunRow(page, employeeId, runMonth, false)
      );
      expectSnapshotUnchanged(lockedSnapshot, previewSnapshot, 'locked payroll');

      await openHrPage(page, '/hr/payroll/payslip-generation', /Payslip|Salary/i);
      const lockedSlipSnapshot = snapshotSalarySlip(
        await getSalarySlip(page, employeeId, slipMonth)
      );
      expectSnapshotUnchanged(lockedSlipSnapshot, lockedSnapshot, 'locked salary slip', {
        comparePayrollPolicyId: false,
      });

      const blockedPayrollPolicyUpdate = await employeeApiRequest(
        page,
        `/hr/payroll/policies/${groupBundle.payroll.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(
            payrollPolicyUpdatePayload(groupBundle.payroll, {
              manualDays: 12,
            })
          ),
        }
      );
      const blockedPayrollPolicyBody = await blockedPayrollPolicyUpdate.text();
      expect(blockedPayrollPolicyUpdate.ok(), blockedPayrollPolicyBody).toBe(false);
      expectLockedPayrollImpactBody(blockedPayrollPolicyBody, 'locked payroll policy update');

      const blockedAttendancePolicyUpdate = await employeeApiRequest(
        page,
        `/hr/attendance/policies/${groupBundle.attendance.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(
            attendancePolicyUpdatePayload(groupBundle.attendance, {
              fullDayThresholdPercentage: 85,
            })
          ),
        }
      );
      const blockedAttendancePolicyBody = await blockedAttendancePolicyUpdate.text();
      expect(blockedAttendancePolicyUpdate.ok(), blockedAttendancePolicyBody).toBe(false);
      expectLockedPayrollImpactBody(blockedAttendancePolicyBody, 'locked attendance policy update');

      const blockedGroupAssignmentInput = buildAssignment(
        academicYearId,
        'group',
        group.id,
        group.name,
        employeeBundle,
        lockedDate,
        null,
        90,
        'E2E locked group assignment update must be blocked'
      );
      const blockedAssignmentPreview = await previewAssignmentImpact(
        page,
        'update',
        blockedGroupAssignmentInput,
        groupAssignment.id
      );
      expect(
        (blockedAssignmentPreview.blockingWarnings || []).map((warning: any) => warning.code),
        'locked group assignment update preview'
      ).toContain('ShikshaMitra:LockedPayrollImpact');

      const blockedGroupAssignmentUpdate = await employeeApiRequest(
        page,
        `/hr/policy-assignments/${groupAssignment.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ ...blockedGroupAssignmentInput, confirmationToken: null }),
        }
      );
      const blockedGroupAssignmentBody = await blockedGroupAssignmentUpdate.text();
      expect(blockedGroupAssignmentUpdate.ok(), blockedGroupAssignmentBody).toBe(false);
      expectLockedPayrollImpactBody(blockedGroupAssignmentBody, 'locked group assignment update');

      const lockedAttendanceResult = await adjustAttendance(page, employeeId, lockedDate, 'ABSENT');
      expect(
        Number(lockedAttendanceResult.skippedCount || 0),
        'locked attendance skipped count'
      ).toBe(1);
      expect(
        JSON.stringify(lockedAttendanceResult).toLowerCase(),
        'locked attendance reason'
      ).toContain('payroll locked');
      expectSnapshotUnchanged(
        snapshotPayrollRow(await getPayrollRunRow(page, employeeId, runMonth, true)),
        lockedSnapshot,
        'locked payroll after blocked retro changes'
      );

      await saveEmployeeOverride(
        page,
        employeeId,
        academicYearId,
        employeeBundle,
        overrideDate,
        overrideEndDate,
        'E2E staff policy override after locked month'
      );
      await expectEffectivePolicies(page, employeeId, overrideDate, employeeBundle, 'employee');

      await expectEffectivePolicies(page, employeeId, lockedDate, groupBundle, 'group');
      await expectEffectivePolicies(page, employeeId, overrideDate, employeeBundle, 'employee');
      await expectEffectivePolicies(page, employeeId, fallbackDate, groupBundle, 'group');

      await setEmployeeSalaryStructure(
        page,
        employeeId,
        employeeFixture.fullName,
        changedEarningAmount,
        changedDeductionAmount
      );
      expectSnapshotUnchanged(
        snapshotPayrollRow(await getPayrollRunRow(page, employeeId, runMonth, true)),
        lockedSnapshot,
        'locked payroll after future policy and salary changes'
      );
      expectSnapshotUnchanged(
        snapshotSalarySlip(await getSalarySlip(page, employeeId, slipMonth)),
        lockedSlipSnapshot,
        'locked salary slip after future policy and salary changes',
        { comparePayrollPolicyId: false }
      );

      guard.assertClean();
    });
  });
});
