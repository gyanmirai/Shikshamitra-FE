/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-continue */
import { test, expect, type Page } from '@playwright/test';

import { createEmployeeFixture } from './employee/employee-fixtures';
import { searchEmployee, gotoEmployeeList } from './employee/employee-page';
import {
  employeeApiRequest,
  createEmployeeFromExistingDefaults,
  assignEmployeeToFirstAcademicScope,
} from './employee/employee-api';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';

const today = new Date();
const yyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const payrollMonth = (date: Date) =>
  `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${date.getFullYear()}`;

const firstElapsedWeekdayInMonth = (date: Date) => {
  const candidate = new Date(date.getFullYear(), date.getMonth(), 1);

  while (candidate <= date) {
    const day = candidate.getDay();
    if (day >= 1 && day <= 5) return candidate;
    candidate.setDate(candidate.getDate() + 1);
  }

  return date;
};

const grossEarningAmount = 30_000;
const deductionAmount = 1_500;
const earningComponentName = 'E2E Basic Pay';
const deductionComponentName = 'E2E Payroll Deduction';
const overtimeComponentName = 'Overtime Pay';
const moneyTolerance = 0.02;

async function expectOk(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson(
  page: Parameters<typeof employeeApiRequest>[0],
  path: string,
  init: RequestInit & { timeout?: number } = {}
) {
  const response = await employeeApiRequest(page, path, init);
  await expectOk(response, `GET ${path}`);
  return response.json();
}

function itemsOf(body: any) {
  return Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : [];
}

function componentByName(components: any[] | undefined, name: string) {
  return (components || []).find((component) => component?.name === name);
}

function sumComponentAmounts(components: any[] | undefined) {
  return (components || []).reduce((total, component) => total + Number(component?.amount ?? 0), 0);
}

function expectMoneyClose(actual: unknown, expected: unknown, label: string) {
  expect(Number(actual), label).toBeCloseTo(Number(expected), 2);
}

function isPayrollMonthBusy(details: string) {
  return (
    details.includes('HR:Payroll:030033') ||
    details.includes('PayrollMonthLockBusy') ||
    details.includes('Payroll Month Lock Busy')
  );
}

async function getPayrollRunPreview(page: Page, month: string) {
  const path = `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=true`;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await employeeApiRequest(page, path, { timeout: 120_000 });
    if (response.ok()) {
      return response.json();
    }

    const details = await response.text();
    if (response.status() !== 400 || !isPayrollMonthBusy(details) || attempt >= 11) {
      expect(response.ok(), `GET ${path}: ${response.status()} ${details}`).toBe(true);
    }
    await page.waitForTimeout(5_000);
  }

  throw new Error(`GET ${path}: payroll month stayed busy after retries`);
}

async function gotoAndExpectHeading(page: Page, path: string, headingName: RegExp) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 180_000 });

    const errorHeading = page.getByRole('heading', { name: /Something went wrong/i });
    if (await errorHeading.isVisible({ timeout: 1_000 }).catch(() => false)) {
      lastError = new Error(`Route ${path} rendered the Next.js error boundary`);
      continue;
    }

    try {
      await expect(page.getByRole('heading', { name: headingName })).toBeVisible({
        timeout: 120_000,
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function ensurePayrollComponent(
  page: Parameters<typeof employeeApiRequest>[0],
  kind: 'earning' | 'deduction'
) {
  const isEarning = kind === 'earning';
  const name = isEarning ? earningComponentName : deductionComponentName;
  const path = isEarning ? '/payroll/earning-components' : '/payroll/deduction-components';
  const list = await getJson(
    page,
    `${path}?page=1&pageSize=100&search=${encodeURIComponent(name)}`
  );
  const existing = itemsOf(list).find((item: any) =>
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
  });
  await expectOk(response, `create ${kind} component`);
  return response.json();
}

async function setEmployeeSalaryStructure(
  page: Parameters<typeof employeeApiRequest>[0],
  employeeId: string
) {
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

  const payrollResponse = await employeeApiRequest(page, `/employees/${employeeId}/payroll`, {
    method: 'PUT',
    body: JSON.stringify({
      bankDetails: {
        bankName: 'State Bank of India',
        branchName: 'Automation Branch',
        accountHolderName: 'Full Cycle Employee',
        accountNumber: '123456789012',
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
  });
  await expectOk(payrollResponse, 'set employee payroll details');

  const response = await employeeApiRequest(
    page,
    `/payroll/employees/${employeeId}/salary-structure`,
    {
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
    }
  );
  await expectOk(response, 'set employee salary structure');
}

async function createShift(
  page: Parameters<typeof employeeApiRequest>[0],
  startTime: string,
  endTime: string
) {
  const response = await employeeApiRequest(page, '/app/shift-management', {
    method: 'POST',
    body: JSON.stringify({
      shiftName: `E2E Overtime Shift ${Date.now()}`,
      startTime,
      endTime,
    }),
  });
  await expectOk(response, 'create overtime shift');
  return response.json();
}

async function getEffectivePolicies(
  page: Parameters<typeof employeeApiRequest>[0],
  employeeId: string,
  effectiveDate: string
) {
  return getJson(page, `/hr/employees/${employeeId}/effective-policies?date=${effectiveDate}`);
}

async function createOvertimeAttendancePolicy(
  page: Parameters<typeof employeeApiRequest>[0],
  effectivePolicies: any
) {
  const { attendancePolicy } = effectivePolicies;
  const workCalendarPolicyId =
    attendancePolicy?.workCalendarPolicyId || effectivePolicies.attendanceWorkCalendarPolicy?.id;
  expect(workCalendarPolicyId, 'effective attendance work calendar policy').toBeTruthy();

  const response = await employeeApiRequest(page, '/hr/attendance/policies', {
    method: 'POST',
    body: JSON.stringify({
      academicYearId: effectivePolicies.academicYearId,
      workCalendarPolicyId,
      name: `E2E Overtime Attendance ${Date.now()}`,
      status: 'active',
      isDefault: false,
      captureMode: attendancePolicy?.captureMode || 'manual_with_time',
      fullDayThresholdPercentage: attendancePolicy?.fullDayThresholdPercentage ?? 75,
      halfDayThresholdPercentage: attendancePolicy?.halfDayThresholdPercentage ?? 50,
      absentThresholdPercentage: attendancePolicy?.absentThresholdPercentage ?? 0,
      missingPunchBehavior: attendancePolicy?.missingPunchBehavior || 'requires_review',
      manualCorrectionAllowed: true,
      graceTime: attendancePolicy?.graceTime ?? 0,
      maxLateAllowedPerMonth: attendancePolicy?.maxLateAllowedPerMonth ?? 0,
      penaltyType: attendancePolicy?.penaltyType || 'none',
      penaltyCountThreshold: attendancePolicy?.penaltyCountThreshold ?? 0,
      earlyExitEnabled: attendancePolicy?.earlyExitEnabled ?? false,
      earlyExitGraceTime: attendancePolicy?.earlyExitGraceTime ?? 0,
      overtimeEnabled: true,
      overtimeRate: '2.0x',
      minOvertimeMinutes: 30,
      holidayWorkBehavior: attendancePolicy?.holidayWorkBehavior || 'paid',
      payrollPreviewEnabled: true,
    }),
  });
  await expectOk(response, 'create overtime attendance policy');
  return response.json();
}

async function upsertEmployeePolicyOverride(
  page: Parameters<typeof employeeApiRequest>[0],
  employeeId: string,
  effectivePolicies: any,
  attendancePolicyId: string,
  effectiveFrom: string
) {
  const payload = {
    employeeId,
    academicYearId: effectivePolicies.academicYearId,
    payrollPolicyId: effectivePolicies.payrollPolicy?.id,
    attendancePolicyId,
    leavePolicyId: effectivePolicies.leavePolicy?.id,
    effectiveFrom,
    effectiveTo: null,
    assignmentReason: 'E2E payroll overtime regression',
  };
  expect(payload.payrollPolicyId, 'effective payroll policy').toBeTruthy();
  expect(payload.leavePolicyId, 'effective leave policy').toBeTruthy();

  const impactPreview = await getJson(page, '/hr/policy-assignments/impact-preview', {
    method: 'POST',
    body: JSON.stringify({
      action: 'employee-override-upsert',
      assignment: {
        academicYearId: payload.academicYearId,
        targetType: 'employee',
        targetKey: employeeId,
        targetDisplayName: employeeId,
        payrollPolicyId: payload.payrollPolicyId,
        attendancePolicyId,
        leavePolicyId: payload.leavePolicyId,
        effectiveFrom,
        effectiveTo: null,
        priority: 100,
        assignmentReason: payload.assignmentReason,
        isActive: true,
      },
    }),
  });
  expect(impactPreview?.blockingWarnings ?? [], 'employee override blocking warnings').toEqual([]);

  const response = await employeeApiRequest(
    page,
    '/hr/policy-assignments/direct-employee-override',
    {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        confirmationToken: impactPreview?.confirmationToken ?? null,
      }),
    }
  );
  await expectOk(response, 'upsert employee overtime policy override');
  return response.json();
}

test.describe('HR module full cycle', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against a seeded local backend.');

  test('creates employee context, marks attendance, runs payroll, and verifies salary slip', async ({
    page,
  }) => {
    test.setTimeout(420_000);

    await page.goto('/dashboard/');

    const employee = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Full Cycle Employee')
    );
    await assignEmployeeToFirstAcademicScope(page, employee);
    const employeeId = employee.id;
    const attendanceDate = yyyyMmDd(firstElapsedWeekdayInMonth(today));
    const month = payrollMonth(today);

    await setEmployeeSalaryStructure(page, employeeId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await expect(page.getByRole('row', { name: new RegExp(employee.email, 'i') })).toBeVisible();

    await gotoAndExpectHeading(page, '/hr/manual-attendance', /Mark Attendance/i);

    const attendanceResponse = await employeeApiRequest(page, '/hr/attendance/register/adjust', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        attendanceDate,
        statusWire: 'PRESENT',
        inTime: '09:00:00',
        outTime: '16:00:00',
        reason: 'E2E full-cycle present day',
      }),
    });
    await expectOk(attendanceResponse, 'adjust attendance register');
    const attendanceAdjustment = await attendanceResponse.json();
    expect(Number(attendanceAdjustment.updatedCount ?? 0)).toBeGreaterThanOrEqual(1);

    const attendanceRegister = await getJson(
      page,
      `/hr/attendance/register?startDate=${attendanceDate}&endDate=${attendanceDate}&employeeId=${employeeId}&search=${encodeURIComponent(
        employee.email
      )}&skipCount=0&maxResultCount=100`
    );
    const attendanceRow = itemsOf(attendanceRegister).find(
      (item: any) => item.employeeId === employeeId
    );
    if (attendanceRow) {
      expect(attendanceRow.status).toBe('Present');
    }

    await gotoAndExpectHeading(page, '/hr/attendance-tracking', /Attendance Register/i);

    await gotoAndExpectHeading(page, '/hr/payroll/run-payroll', /Run Payroll/i);

    const preview = await getPayrollRunPreview(page, month);
    const payrollRow = preview.items?.find((item: any) => item.employeeId === employeeId);
    expect(payrollRow, `payroll row for ${employee.email}`).toBeTruthy();
    const previewGross = Number(payrollRow.grossSalary ?? payrollRow.totalEarnings ?? 0);
    const previewNet = Number(payrollRow.netPay ?? payrollRow.netSalary ?? 0);
    expect(previewGross).toBeGreaterThan(0);
    expect(previewGross).toBeLessThanOrEqual(grossEarningAmount);
    expect(previewNet).toBeGreaterThan(0);
    expect(previewNet).toBeLessThanOrEqual(previewGross);

    const reviewResponse = await employeeApiRequest(page, '/payroll/run/reviews', {
      method: 'POST',
      body: JSON.stringify({ month, employeeIds: [employeeId] }),
    });
    await expectOk(reviewResponse, 'mark payroll reviewed');

    const lockResponse = await employeeApiRequest(page, '/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month, employeeIds: [employeeId] }),
    });
    await expectOk(lockResponse, 'lock payroll');

    const slip = await getJson(
      page,
      `/payroll/salary-slips?monthYear=${encodeURIComponent(month)}&employeeId=${employeeId}`
    );
    const slipNet = Number(slip.netSalary ?? slip.netPay ?? 0);
    const slipGross = Number(slip.totalEarning ?? slip.totalEarnings ?? 0);
    expect(slipGross).toBeGreaterThan(0);
    expect(slipGross).toBeLessThanOrEqual(grossEarningAmount);
    expect(slipNet).toBeGreaterThan(0);
    expect(slipNet).toBeLessThanOrEqual(slipGross);
  });

  test('includes overtime earning in run payroll preview, lock, and salary slip', async ({
    page,
  }) => {
    test.setTimeout(300_000);

    await page.goto('/dashboard/');

    const shift = await createShift(page, '07:00:00', '17:30:00');
    const employee = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Payroll Overtime Employee'),
      { shiftId: shift.id }
    );
    await assignEmployeeToFirstAcademicScope(page, employee);
    const employeeId = employee.id;
    const attendanceDate = yyyyMmDd(firstElapsedWeekdayInMonth(today));
    const month = payrollMonth(today);

    await setEmployeeSalaryStructure(page, employeeId);

    const effectivePolicies = await getEffectivePolicies(page, employeeId, attendanceDate);
    const overtimePolicy = await createOvertimeAttendancePolicy(page, effectivePolicies);
    await upsertEmployeePolicyOverride(
      page,
      employeeId,
      effectivePolicies,
      overtimePolicy.id,
      attendanceDate
    );

    const attendanceResponse = await employeeApiRequest(page, '/hr/attendance/register/adjust', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        attendanceDate,
        statusWire: 'PRESENT',
        inTime: '07:00:00',
        outTime: '19:00:00',
        reason: 'E2E overtime payroll regression',
      }),
    });
    await expectOk(attendanceResponse, 'adjust overtime attendance register');

    await gotoAndExpectHeading(page, '/hr/payroll/run-payroll', /Run Payroll/i);

    const preview = await getPayrollRunPreview(page, month);
    const payrollRow = preview.items?.find((item: any) => item.employeeId === employeeId);
    expect(payrollRow, `payroll row for ${employee.email}`).toBeTruthy();

    const overtimeLine = componentByName(payrollRow.earningComponents, overtimeComponentName);
    expect(overtimeLine, 'run payroll overtime earning line').toBeTruthy();
    expect(Number(overtimeLine.amount)).toBeGreaterThan(moneyTolerance);
    expect(String(overtimeLine.description || '')).toContain('90');
    expectMoneyClose(
      payrollRow.grossSalary,
      sumComponentAmounts(payrollRow.earningComponents),
      'run payroll gross matches earning components'
    );

    const previewGross = Number(payrollRow.grossSalary ?? 0);
    const previewNet = Number(payrollRow.netPay ?? 0);
    expect(previewGross).toBeGreaterThan(Number(overtimeLine.amount));
    expect(previewNet).toBeGreaterThan(0);

    const reviewResponse = await employeeApiRequest(page, '/payroll/run/reviews', {
      method: 'POST',
      body: JSON.stringify({ month, employeeIds: [employeeId] }),
    });
    await expectOk(reviewResponse, 'mark overtime payroll reviewed');

    const lockResponse = await employeeApiRequest(page, '/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month, employeeIds: [employeeId] }),
    });
    await expectOk(lockResponse, 'lock overtime payroll');

    const slip = await getJson(
      page,
      `/payroll/salary-slips?monthYear=${encodeURIComponent(month)}&employeeId=${employeeId}`
    );
    const slipOvertimeLine = componentByName(slip.earnings, overtimeComponentName);
    expect(slipOvertimeLine, 'salary slip overtime earning line').toBeTruthy();
    expect(slipOvertimeLine.isTemp).toBe(true);
    expectMoneyClose(
      slipOvertimeLine.amount,
      overtimeLine.amount,
      'salary slip overtime matches run payroll overtime'
    );
    expectMoneyClose(
      slip.totalEarning,
      previewGross,
      'salary slip earnings match run payroll gross'
    );
    expectMoneyClose(
      slip.netPay ?? slip.netSalary,
      previewNet,
      'salary slip net matches run payroll net'
    );
  });
});
