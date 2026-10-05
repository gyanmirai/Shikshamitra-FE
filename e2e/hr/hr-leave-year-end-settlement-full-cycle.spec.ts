/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { dismissAcademicYearTour } from './employee/employee-page';
import { createEmployeeFixture } from './employee/employee-fixtures';
import {
  employeeApiRequest,
  assignReportingManager,
  createEmployeeFromExistingDefaults,
  assignEmployeeToFirstAcademicScope,
} from './employee/employee-api';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';
const grossEarningAmount = 30_000;
const deductionAmount = 1_500;
const earningComponentName = 'E2E Basic Pay';
const deductionComponentName = 'E2E Payroll Deduction';

type AcademicYear = {
  id: string;
  name?: string;
  startDate: string;
  endDate: string;
};

type YearPair = {
  source: AcademicYear;
  target: AcademicYear;
};

function yyyyMmDd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function payrollMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function payslipMonth(date: Date) {
  return `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${date.getFullYear()}`;
}

function asItems<T = Record<string, any>>(body: any): T[] {
  if (Array.isArray(body?.items)) return body.items as T[];
  if (Array.isArray(body)) return body as T[];
  return [];
}

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

async function expectOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function jsonFrom<T = any>(response: APIResponse, label: string): Promise<T> {
  await expectOk(response, label);
  return response.json();
}

async function getJson<T = any>(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T> {
  return jsonFrom<T>(await employeeApiRequest(page, path, init), `GET ${path}`);
}

async function firstEmployeeIdBySearch(page: Page, search: string) {
  const employees = await getJson<any>(
    page,
    `/employees?page=1&pageSize=10&search=${encodeURIComponent(search)}`
  );
  const employee = asItems(employees).find(
    (item: any) => String(item.email || '').toLowerCase() === search.toLowerCase()
  );
  if (!employee?.id) {
    throw new Error(`Unable to resolve staff id for ${search}`);
  }

  return employee.id as string;
}

function rangeOverlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

function firstNonSunday(date: Date) {
  const candidate = new Date(date);
  while ([0, 6].includes(candidate.getDay())) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

async function createAcademicYear(page: Page, name: string, startDate: string, endDate: string) {
  return jsonFrom<AcademicYear>(
    await employeeApiRequest(page, '/app/academic-year', {
      method: 'POST',
      body: JSON.stringify({ name, startYear: startDate, endYear: endDate }),
    }),
    `create academic year ${name}`
  );
}

async function createIsolatedYearPair(page: Page, stamp: string): Promise<YearPair | null> {
  const existingYears = asItems<AcademicYear>(
    await getJson<any>(page, '/app/academic-year?Sorting=startDate&MaxResultCount=200')
  )
    .map((item: any) => item.academicYear || item)
    .filter((year: AcademicYear) => year.startDate && year.endDate);

  const candidate = Array.from({ length: 10 }, (_, index) => 1990 + index * 2).find((year) => {
    const sourceStart = `${year}-06-01`;
    const targetEnd = `${year + 2}-05-31`;
    return !existingYears.some((existing) =>
      rangeOverlaps(
        sourceStart,
        targetEnd,
        yyyyMmDd(new Date(existing.startDate)),
        yyyyMmDd(new Date(existing.endDate))
      )
    );
  });

  if (!candidate) return null;

  const source = await createAcademicYear(
    page,
    `LPYE-${stamp}-Source-${candidate}`,
    `${candidate}-06-01`,
    `${candidate + 1}-05-31`
  );
  const target = await createAcademicYear(
    page,
    `LPYE-${stamp}-Target-${candidate + 1}`,
    `${candidate + 1}-06-01`,
    `${candidate + 2}-05-31`
  );

  return { source, target };
}

async function createWorkCalendar(page: Page, academicYear: AcademicYear, name: string) {
  return jsonFrom<any>(
    await employeeApiRequest(page, '/hr/work-calendar-policies', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: academicYear.id,
        name,
        status: 'active',
        effectiveFrom: academicYear.startDate,
        effectiveTo: academicYear.endDate,
        weeklyOffPattern: 'saturday_sunday',
        customWeeklyOffs: [],
        holidaySyncMode: 'independent',
        holidays: [],
      }),
    }),
    `create work calendar ${name}`
  );
}

async function createAttendancePolicy(
  page: Page,
  academicYear: AcademicYear,
  calendarId: string,
  name: string
) {
  return jsonFrom<any>(
    await employeeApiRequest(page, '/hr/attendance/policies', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: academicYear.id,
        workCalendarPolicyId: calendarId,
        name,
        status: 'active',
        isDefault: true,
        captureMode: 'integrated',
        fullDayThresholdPercentage: 75,
        halfDayThresholdPercentage: 50,
        absentThresholdPercentage: 0,
        missingPunchBehavior: 'requires_review',
        manualCorrectionAllowed: true,
        graceTime: 0,
        maxLateAllowedPerMonth: 0,
        penaltyType: 'none',
        penaltyCountThreshold: 0,
        earlyExitEnabled: false,
        earlyExitGraceTime: 0,
        overtimeEnabled: false,
        overtimeRate: null,
        minOvertimeMinutes: null,
        holidayWorkBehavior: 'comp_off',
        payrollPreviewEnabled: true,
      }),
    }),
    `create attendance policy ${name}`
  );
}

async function createPayrollPolicy(
  page: Page,
  academicYear: AcademicYear,
  calendarId: string,
  name: string
) {
  return jsonFrom<any>(
    await employeeApiRequest(page, '/hr/payroll/policies', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: academicYear.id,
        workCalendarPolicyId: calendarId,
        name,
        status: 'active',
        isDefault: true,
        dayCalculationType: 'manual-days',
        manualDays: 30,
        manualMonthDays: [],
        saturdayWorkPolicy: 'full-day',
        holidayOverrides: [],
      }),
    }),
    `create payroll policy ${name}`
  );
}

function leavePolicyBody(
  name: string,
  effectiveFrom: string,
  options: { carryForward: boolean; encashmentAllowed: boolean }
) {
  return {
    policyTitle: name,
    status: 'Active',
    effectiveFrom,
    description: 'E2E year-end settlement policy',
    rules: [
      {
        paidType: 'Paid',
        entitlementMode: 'Limited',
        accrualPolicyType: 'Yearly',
        leaveCount: 12,
        carryForward: options.carryForward,
        carryForwardLimit: 4,
        encashmentAllowed: options.encashmentAllowed,
        encashmentTiming: options.encashmentAllowed ? 'next_payroll' : null,
        requiresApproval: true,
        minNoticeDays: 0,
        maxDaysPerRequest: 30,
        attachmentRequiredAfterDays: null,
        allowHalfDay: true,
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
        attachmentRequiredAfterDays: null,
        allowHalfDay: true,
        allowNegativeBalance: true,
        isActive: true,
      },
    ],
  };
}

async function createLeavePolicy(
  page: Page,
  academicYear: AcademicYear,
  name: string,
  options: { carryForward: boolean; encashmentAllowed: boolean }
) {
  return jsonFrom<any>(
    await employeeApiRequest(page, `/leave-policies?academicYearId=${academicYear.id}`, {
      method: 'POST',
      body: JSON.stringify(leavePolicyBody(name, academicYear.startDate, options)),
    }),
    `create leave policy ${name}`
  );
}

async function upsertEmployeePolicyOverride(
  page: Page,
  employeeId: string,
  academicYear: AcademicYear,
  policies: { attendance: any; payroll: any; leave: any },
  reason: string
) {
  const assignment = {
    academicYearId: academicYear.id,
    targetType: 'employee',
    targetKey: employeeId,
    targetDisplayName: employeeId,
    payrollPolicyId: policies.payroll.id,
    attendancePolicyId: policies.attendance.id,
    leavePolicyId: policies.leave.id,
    effectiveFrom: academicYear.startDate,
    effectiveTo: null,
    priority: 100,
    assignmentReason: reason,
    isActive: true,
  };
  const preview = await jsonFrom<any>(
    await employeeApiRequest(page, '/hr/policy-assignments/impact-preview', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', assignment }),
    }),
    `preview staff override for ${academicYear.name || academicYear.id}`
  );
  expect(preview?.blockingWarnings ?? [], 'staff override blocking warnings').toEqual([]);

  return jsonFrom<any>(
    await employeeApiRequest(page, '/hr/policy-assignments', {
      method: 'POST',
      body: JSON.stringify({
        ...assignment,
        confirmationToken: preview?.confirmationToken ?? null,
      }),
    }),
    `save staff override for ${academicYear.name || academicYear.id}`
  );
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

  return jsonFrom<any>(
    await employeeApiRequest(page, path, {
      method: 'POST',
      body: JSON.stringify(
        isEarning
          ? {
              earningComponentName: name,
              description: 'E2E fixed earning component',
              earningType: 'Fixed',
              calculationType: 'Amount',
              amount: grossEarningAmount,
              percentage: 0,
              selectedEarningComponentId: null,
              visibleInPayslip: true,
            }
          : {
              deductionComponentName: name,
              description: 'E2E fixed deduction component',
              deductionType: 'Fixed',
              calculationType: 'Amount',
              amount: deductionAmount,
              percentage: 0,
              selectedDeductionComponentId: null,
              visibleInPayslip: true,
            }
      ),
    }),
    `create ${kind} component`
  );
}

async function setEmployeeSalaryStructure(page: Page, employeeId: string, employeeName: string) {
  const earning = await ensurePayrollComponent(page, 'earning');
  const deduction = await ensurePayrollComponent(page, 'deduction');
  const earningLine = {
    componentId: earning.id,
    name: earning.earningComponentName || earning.componentName || earningComponentName,
    amount: grossEarningAmount,
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
          punchId: `LPYE${employeeId.slice(0, 6)}`,
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
        earningComponents: [
          {
            id: null,
            ...earningLine,
            description: earning.description || '',
            componentType: earning.componentType,
          },
        ],
        deductionComponents: [
          {
            id: null,
            ...deductionLine,
            description: deduction.description || '',
            componentType: deduction.componentType,
          },
        ],
      }),
    }),
    'set staff salary structure'
  );
}

async function createApprovedPaidLeave(
  page: Page,
  academicYear: AcademicYear,
  employeeId: string,
  date: string
) {
  const body = new FormData();
  body.append('paidType', 'Paid');
  body.append('employeeId', employeeId);
  body.append('startDate', date);
  body.append('endDate', date);
  body.append('halfDay', 'false');
  body.append('reason', 'E2E year-end settlement approved paid leave');

  const created = await jsonFrom<any>(
    await employeeApiRequest(page, `/leave-management?academicYearId=${academicYear.id}`, {
      method: 'POST',
      body,
    }),
    'create paid leave'
  );

  await expectOk(
    await employeeApiRequest(page, `/leave-management/${created.id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ remarks: 'Approved by year-end settlement E2E' }),
    }),
    'approve paid leave'
  );
}

async function adjustPayrollAttendance(page: Page, employeeId: string, attendanceDate: string) {
  await expectOk(
    await employeeApiRequest(page, '/hr/attendance/register/adjust', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        attendanceDate,
        statusWire: 'PRESENT',
        inTime: '09:00:00',
        outTime: '17:00:00',
        reason: 'E2E year-end settlement payroll attendance',
      }),
    }),
    'adjust target payroll attendance'
  );
}

async function getPayrollRunRow(page: Page, employeeId: string, month: string) {
  const response = await employeeApiRequest(
    page,
    `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=true`,
    { timeout: 120_000 }
  );
  await expectOk(response, `GET payroll run ${month}`);
  const body = await response.json();
  const row = asItems(body).find((item: any) => item.employeeId === employeeId);
  expect(row, `payroll row for generated staff ${employeeId}`).toBeTruthy();
  return row;
}

function findLeaveEncashmentLine(rowOrSlip: any) {
  return asItems(rowOrSlip?.earningComponents || rowOrSlip?.earnings).find((item: any) =>
    String(item.name || item.componentName || item.earningComponentName || '')
      .toLowerCase()
      .includes('leave encashment')
  );
}

function findLeaveEncashmentAdjustment(row: any) {
  return asItems(row?.payrollAdjustments || row?.adjustments).find((item: any) =>
    String(item.name || '')
      .toLowerCase()
      .includes('leave encashment')
  );
}

test.describe('leave year-end settlement full cycle', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against local DDVS before running.');

  test('carries paid leave into the target year and posts encashment into payroll', async ({
    page,
  }) => {
    test.setTimeout(900_000);
    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await dismissAcademicYearTour(page);

      const stamp = `${Date.now()}`;
      const yearPair = await createIsolatedYearPair(page, stamp);
      test.skip(!yearPair, 'No non-overlapping local academic-year slot available for LPYE smoke.');
      const { source, target } = yearPair!;
      const sourceEnd = new Date(source.endDate);
      const payrollDate = new Date(sourceEnd.getFullYear(), sourceEnd.getMonth() + 1, 1);
      const payrollMonthKey = payrollMonth(payrollDate);
      const payrollSlipMonth = payslipMonth(payrollDate);

      const sourceCalendar = await createWorkCalendar(
        page,
        source,
        `LPYE-${stamp}-Source-Calendar`
      );
      const targetCalendar = await createWorkCalendar(
        page,
        target,
        `LPYE-${stamp}-Target-Calendar`
      );
      const sourceAttendance = await createAttendancePolicy(
        page,
        source,
        sourceCalendar.id,
        `LPYE-${stamp}-Source-Attendance`
      );
      const targetAttendance = await createAttendancePolicy(
        page,
        target,
        targetCalendar.id,
        `LPYE-${stamp}-Target-Attendance`
      );
      const sourcePayroll = await createPayrollPolicy(
        page,
        source,
        sourceCalendar.id,
        `LPYE-${stamp}-Source-Payroll`
      );
      const targetPayroll = await createPayrollPolicy(
        page,
        target,
        targetCalendar.id,
        `LPYE-${stamp}-Target-Payroll`
      );
      const sourceLeave = await createLeavePolicy(page, source, `LPYE-${stamp}-Source-Leave`, {
        carryForward: true,
        encashmentAllowed: true,
      });
      const targetLeave = await createLeavePolicy(page, target, `LPYE-${stamp}-Target-Leave`, {
        carryForward: false,
        encashmentAllowed: false,
      });

      const fixture = createEmployeeFixture('LPYE Staff');
      const employee = await createEmployeeFromExistingDefaults(page, fixture, {
        dateOfBirth: '1965-01-01',
        dateOfJoining: yyyyMmDd(new Date(source.startDate)),
      });
      await assignEmployeeToFirstAcademicScope(page, employee);
      const employeeId = employee.id as string;
      const hrManagerEmployeeId = await firstEmployeeIdBySearch(page, 'hr-manager@ddvs.com');
      await expectOk(
        await assignReportingManager(page, employeeId, hrManagerEmployeeId),
        'assign HR manager as leave reporting manager'
      );
      await setEmployeeSalaryStructure(page, employeeId, fixture.fullName);

      await upsertEmployeePolicyOverride(
        page,
        employeeId,
        source,
        { attendance: sourceAttendance, payroll: sourcePayroll, leave: sourceLeave },
        'E2E source year leave settlement policies'
      );
      await upsertEmployeePolicyOverride(
        page,
        employeeId,
        target,
        { attendance: targetAttendance, payroll: targetPayroll, leave: targetLeave },
        'E2E target year leave settlement policies'
      );

      const leaveDate = yyyyMmDd(
        firstNonSunday(new Date(new Date(source.startDate).getTime() + 7 * 24 * 60 * 60 * 1000))
      );
      await createApprovedPaidLeave(page, source, employeeId, leaveDate);

      const preview = await jsonFrom<any>(
        await employeeApiRequest(page, '/leave-management/year-end-settlements/preview', {
          method: 'POST',
          body: JSON.stringify({ academicYearId: source.id }),
          timeout: 120_000,
        }),
        'preview year-end settlement'
      );
      const item = asItems(preview.items).find((entry: any) => entry.employeeId === employeeId);
      if (!item) {
        throw new Error(`Generated staff settlement item was not created for ${employeeId}`);
      }
      expect(item.issueCodes ?? [], 'generated staff item issues').toEqual([]);
      expect(Number(item.approvedUsedDays), 'approved leave reduces unused').toBeCloseTo(1, 2);
      expect(Number(item.carriedDays), 'carry-forward applies first').toBeCloseTo(4, 2);
      expect(Number(item.encashedDays), 'encashment applies after carry-forward').toBeCloseTo(7, 2);
      expect(item.payrollMonth, 'encashment payroll month').toBe(payrollMonthKey);
      expect(Number(item.amount), 'encashment amount').toBeCloseTo(7000, 2);

      const unrelatedIssueFreeItems = asItems(preview.items).filter(
        (entry: any) =>
          entry.employeeId !== employeeId &&
          !String(entry.employeeName || '').startsWith('LPYE Staff') &&
          String(entry.status).toLowerCase() === 'draft' &&
          asItems(entry.issueCodes).length === 0
      );
      expect(
        unrelatedIssueFreeItems,
        'refusing to finalize if unrelated DDVS staff would be settled'
      ).toEqual([]);

      const finalized = await jsonFrom<any>(
        await employeeApiRequest(
          page,
          `/leave-management/year-end-settlements/${preview.id}/finalize`,
          {
            method: 'POST',
            timeout: 120_000,
          }
        ),
        'finalize year-end settlement'
      );
      const finalizedItem = asItems(finalized.items).find(
        (entry: any) => entry.employeeId === employeeId
      );
      expect(String(finalized.status).toLowerCase(), 'run status').toBe('finalized');
      expect(String(finalizedItem?.status).toLowerCase(), 'item status').toBe('finalized');
      expect(finalizedItem?.payrollAdjustmentId, 'encashment adjustment id').toBeTruthy();

      const targetBalance = await getJson<any>(
        page,
        `/leave-management/balances?academicYearId=${target.id}&employeeId=${employeeId}`
      );
      const paidBalance = asItems(targetBalance.items).find(
        (entry: any) => entry.leavePolicyId === targetLeave.id && entry.paidType === 'Paid'
      );
      expect(Number(paidBalance?.carryForwardDays), 'target year carry-in balance').toBeCloseTo(
        4,
        2
      );

      const payrollAttendanceDate = yyyyMmDd(
        firstNonSunday(new Date(`${payrollMonthKey}-03T00:00:00`))
      );
      await adjustPayrollAttendance(page, employeeId, payrollAttendanceDate);

      const previewRow = await getPayrollRunRow(page, employeeId, payrollMonthKey);
      const encashmentLine = findLeaveEncashmentLine(previewRow);
      expect(encashmentLine, 'payroll preview contains leave encashment').toBeTruthy();
      expect(Number(encashmentLine?.amount), 'payroll preview encashment amount').toBeCloseTo(
        7000,
        2
      );
      const previewAdjustment = findLeaveEncashmentAdjustment(previewRow);
      expect(previewAdjustment, 'payroll preview exposes leave encashment adjustment').toBeTruthy();
      expect(
        Boolean(previewAdjustment?.isSystemGenerated),
        'preview adjustment is read-only source row'
      ).toBe(true);
      expect(previewAdjustment?.sourceType, 'preview adjustment source type').toBe(
        'leave_year_end_encashment'
      );

      await expectOk(
        await employeeApiRequest(page, '/payroll/run/reviews', {
          method: 'POST',
          body: JSON.stringify({
            month: payrollMonthKey,
            academicYearId: target.id,
            employeeIds: [employeeId],
          }),
          timeout: 120_000,
        }),
        'mark payroll reviewed'
      );
      await expectOk(
        await employeeApiRequest(page, '/payroll/run', {
          method: 'POST',
          body: JSON.stringify({
            month: payrollMonthKey,
            academicYearId: target.id,
            employeeIds: [employeeId],
          }),
          timeout: 120_000,
        }),
        'lock generated staff payroll'
      );

      const slip = await getJson<any>(
        page,
        `/payroll/salary-slips?monthYear=${encodeURIComponent(
          payrollSlipMonth
        )}&employeeId=${employeeId}`
      );
      const slipEncashmentLine = findLeaveEncashmentLine(slip);
      expect(slipEncashmentLine, 'salary slip contains leave encashment').toBeTruthy();
      expect(Number(slipEncashmentLine?.amount), 'salary slip encashment amount').toBeCloseTo(
        7000,
        2
      );
    });
  });
});
