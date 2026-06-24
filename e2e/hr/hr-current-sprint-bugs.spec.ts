/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { createEmployeeFixture } from './employee/employee-fixtures';
import { employeeApiRequest, createEmployeeFromExistingDefaults } from './employee/employee-api';
import {
  gotoEmployeeList,
  clickAddEmployee,
  dismissAcademicYearTour,
} from './employee/employee-page';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';

const fixedEarningAmount = 30_000;
const fixedDeductionAmount = 500;
const tempEarningAmount = 1_750;
const lateArrivalDeductionAmount = 250;
const fixedEarningComponentName = 'E2E HR Bug Basic Pay';
const fixedDeductionComponentName = 'E2E HR Bug Fixed Deduction';
const tempEarningComponentName = 'E2E Temporary Month Earning';
const lateArrivalDeductionName = 'Late arrival deduction';

const today = new Date();

const yyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const standardOffsetTime = (date: string, time: string) => `${date}T${time}-08:00`;

const clockMinutes = (dateTimeOffset: string) => {
  const match = dateTimeOffset.match(/T(\d{2}):(\d{2}):/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
};

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

async function expectOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson<T = any>(page: Page, path: string): Promise<T> {
  const response = await employeeApiRequest(page, path, { timeout: 120_000 });
  await expectOk(response, `GET ${path}`);
  return response.json();
}

function asItems(body: any) {
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body)) return body;
  return [];
}

function componentByName(components: any[] | undefined, name: string) {
  return (components || []).find(
    (component) => String(component?.name || component?.componentName || '') === name
  );
}

function toDateOnly(value: unknown) {
  return String(value || '').slice(0, 10);
}

function createNamedEmployeeFixture(firstName: string, middleName: string, lastNamePrefix: string) {
  const fixture = createEmployeeFixture(`${firstName} ${middleName}`);
  const lastName = `${lastNamePrefix}${fixture.lastName.slice(0, 6)}`;

  return {
    ...fixture,
    firstName,
    middleName,
    lastName,
    fullName: `${firstName} ${middleName} ${lastName}`,
  };
}

function buildProfilePersonalInfoPayload(details: any, overrides: Record<string, unknown> = {}) {
  return {
    firstName: details.firstName,
    middleName: details.middleName || '',
    lastName: details.lastName,
    shortName: details.shortName || details.firstName,
    dob: toDateOnly(details.dob),
    gender: details.gender,
    religion: details.religion,
    casteType: details.casteType,
    familyCaste: details.familyCaste,
    maritalStatus: details.maritalStatus,
    bloodGroup: details.bloodGroup,
    email: details.email,
    mobileNo: details.mobileNo,
    secondaryMobileNo: details.secondaryMobileNo || null,
    doj: toDateOnly(details.doj),
    isTeaching: details.isTeaching,
    department: details.department,
    roleId: details.roleId,
    shiftId: details.shiftId,
    address1: details.address1,
    address2: details.address2,
    address3: details.address3,
    country: details.country,
    state: details.state,
    city: details.city,
    pinCode: details.pinCode,
    ...overrides,
  };
}

async function ensurePayrollComponent(
  page: Page,
  kind: 'earning' | 'deduction',
  name: string,
  amount: number
) {
  const isEarning = kind === 'earning';
  const path = isEarning ? '/payroll/earning-components' : '/payroll/deduction-components';
  const list = await getJson(
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
            description: 'E2E HR bug regression earning',
            earningType: 'Fixed',
            calculationType: 'Amount',
            amount,
            percentage: 0,
            selectedEarningComponentId: null,
            visibleInPayslip: true,
          }
        : {
            deductionComponentName: name,
            description: 'E2E HR bug regression deduction',
            deductionType: 'Fixed',
            calculationType: 'Amount',
            amount,
            percentage: 0,
            selectedDeductionComponentId: null,
            visibleInPayslip: true,
          }
    ),
  });
  await expectOk(response, `create ${kind} component`);
  return response.json();
}

async function setSalaryStructureWithTemporaryEarning(
  page: Page,
  employeeId: string,
  employeeName: string,
  applicableMonth: string
) {
  const fixedEarning = await ensurePayrollComponent(
    page,
    'earning',
    fixedEarningComponentName,
    fixedEarningAmount
  );
  const fixedDeduction = await ensurePayrollComponent(
    page,
    'deduction',
    fixedDeductionComponentName,
    fixedDeductionAmount
  );
  const fixedLine = {
    componentId: fixedEarning.id,
    name:
      fixedEarning.earningComponentName || fixedEarning.componentName || fixedEarningComponentName,
    amount: fixedEarningAmount,
    isFixed: true,
    isTemp: false,
  };
  const tempLine = {
    componentId: null,
    name: tempEarningComponentName,
    amount: tempEarningAmount,
    isFixed: true,
    isTemp: true,
    applicableMonth,
  };
  const fixedDeductionLine = {
    componentId: fixedDeduction.id,
    name:
      fixedDeduction.deductionComponentName ||
      fixedDeduction.componentName ||
      fixedDeductionComponentName,
    amount: fixedDeductionAmount,
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
        earningComponents: [fixedLine, tempLine],
        deductionComponents: [fixedDeductionLine],
      }),
    }),
    'set employee payroll details'
  );

  await expectOk(
    await employeeApiRequest(page, `/payroll/employees/${employeeId}/salary-structure`, {
      method: 'PUT',
      body: JSON.stringify({
        earningComponents: [
          { id: null, ...fixedLine, description: '', componentType: 'Fixed' },
          { id: null, ...tempLine, description: '', componentType: 'Fixed' },
        ],
        deductionComponents: [
          { id: null, ...fixedDeductionLine, description: '', componentType: 'Fixed' },
        ],
      }),
    }),
    'set employee salary structure'
  );

  return tempLine;
}

async function createShift(page: Page, startTime: string, endTime: string) {
  const response = await employeeApiRequest(page, '/app/shift-management', {
    method: 'POST',
    body: JSON.stringify({
      shiftName: `E2E Late Arrival Shift ${Date.now()}`,
      startTime,
      endTime,
    }),
  });
  await expectOk(response, 'create late arrival shift');
  return response.json();
}

async function createLateArrivalSalaryDeductionPolicy(page: Page, effectivePolicies: any) {
  const { attendancePolicy } = effectivePolicies;
  const workCalendarPolicyId =
    attendancePolicy?.workCalendarPolicyId || effectivePolicies.attendanceWorkCalendarPolicy?.id;
  expect(workCalendarPolicyId, 'effective attendance work calendar policy').toBeTruthy();

  const response = await employeeApiRequest(page, '/hr/attendance/policies', {
    method: 'POST',
    body: JSON.stringify({
      academicYearId: effectivePolicies.academicYearId,
      workCalendarPolicyId,
      name: `E2E Late Salary Deduction ${Date.now()}`,
      status: 'active',
      isDefault: false,
      captureMode: attendancePolicy?.captureMode || 'manual_with_time',
      fullDayThresholdPercentage: attendancePolicy?.fullDayThresholdPercentage ?? 75,
      halfDayThresholdPercentage: attendancePolicy?.halfDayThresholdPercentage ?? 50,
      absentThresholdPercentage: attendancePolicy?.absentThresholdPercentage ?? 0,
      missingPunchBehavior: attendancePolicy?.missingPunchBehavior || 'requires_review',
      manualCorrectionAllowed: true,
      graceTime: 30,
      maxLateAllowedPerMonth: 0,
      penaltyType: 'salary_deduction',
      penaltyCountThreshold: 1,
      penaltyDeductionAmount: lateArrivalDeductionAmount,
      earlyExitEnabled: false,
      earlyExitGraceTime: 0,
      overtimeEnabled: false,
      overtimeRate: attendancePolicy?.overtimeRate || '1.0x',
      minOvertimeMinutes: attendancePolicy?.minOvertimeMinutes ?? 0,
      holidayWorkBehavior: attendancePolicy?.holidayWorkBehavior || 'paid',
      payrollPreviewEnabled: true,
    }),
  });
  await expectOk(response, 'create late-arrival salary deduction policy');
  return response.json();
}

async function upsertEmployeePolicyOverride(
  page: Page,
  employeeId: string,
  effectivePolicies: any,
  attendancePolicyId: string,
  effectiveFrom: string
) {
  const assignmentReason = 'E2E current sprint HR bug regression';
  const previewResponse = await employeeApiRequest(page, '/hr/policy-assignments/impact-preview', {
    method: 'POST',
    body: JSON.stringify({
      action: 'employee-override-upsert',
      assignment: {
        academicYearId: effectivePolicies.academicYearId,
        targetType: 'employee',
        targetKey: employeeId,
        targetDisplayName: employeeId,
        payrollPolicyId: effectivePolicies.payrollPolicy?.id,
        attendancePolicyId,
        leavePolicyId: effectivePolicies.leavePolicy?.id,
        effectiveFrom,
        effectiveTo: null,
        priority: 100,
        assignmentReason,
        isActive: true,
      },
    }),
  });
  await expectOk(previewResponse, 'preview employee policy override impact');
  const preview = await previewResponse.json();
  expect(preview.blockingWarnings || [], 'employee override blocking warnings').toEqual([]);

  const response = await employeeApiRequest(
    page,
    '/hr/policy-assignments/direct-employee-override',
    {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        academicYearId: effectivePolicies.academicYearId,
        payrollPolicyId: effectivePolicies.payrollPolicy?.id,
        attendancePolicyId,
        leavePolicyId: effectivePolicies.leavePolicy?.id,
        effectiveFrom,
        effectiveTo: null,
        assignmentReason,
        confirmationToken: preview.confirmationToken ?? null,
      }),
    }
  );
  await expectOk(response, 'upsert employee policy override');
}

async function adjustAttendance(
  page: Page,
  employeeId: string,
  attendanceDate: string,
  inTime: string,
  outTime: string
) {
  await expectOk(
    await employeeApiRequest(page, '/hr/attendance/register/adjust', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        attendanceDate,
        statusWire: 'PRESENT',
        inTime: standardOffsetTime(attendanceDate, inTime),
        outTime: standardOffsetTime(attendanceDate, outTime),
        reason: 'E2E current sprint HR bug regression',
      }),
    }),
    'adjust attendance register'
  );
}

async function getPayrollRunRow(page: Page, employeeId: string, month: string) {
  const path = `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=true`;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await employeeApiRequest(page, path, { timeout: 120_000 });
    if (response.ok()) {
      const body = await response.json();
      const row = asItems(body).find((item: any) => item.employeeId === employeeId);
      expect(row, `payroll row ${employeeId} for ${month}`).toBeTruthy();
      return row;
    }

    const details = await response.text();
    const isBusy =
      response.status() === 400 &&
      (details.includes('HR:Payroll:030033') || details.includes('PayrollMonthLockBusy'));
    if (!isBusy || attempt >= 2) {
      expect(response.ok(), `GET ${path}: ${response.status()} ${details}`).toBe(true);
    }
    await page.waitForTimeout(2_000);
  }

  throw new Error(`GET ${path}: payroll month stayed busy after retries`);
}

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

test.describe('HR current sprint bug regressions', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against local DDVS before running.');

  test('4927 employee list searches multi-word full names with whitespace and case folding', async ({
    page,
  }) => {
    await page.goto('/dashboard/');
    await dismissAcademicYearTour(page);

    const target = createNamedEmployeeFixture('Akshay', 'Kumar', 'Patel');
    const unrelated = createNamedEmployeeFixture('Ramesh', 'Kumar', 'Shah');
    await createEmployeeFromExistingDefaults(page, target);
    await createEmployeeFromExistingDefaults(page, unrelated);

    const searchResponse = await employeeApiRequest(
      page,
      `/employees?page=1&pageSize=20&search=${encodeURIComponent(
        `  aKsHaY    ${target.lastName.toUpperCase()}  `
      )}`
    );
    await expectOk(searchResponse, 'search employees by full name');
    const results = asItems(await searchResponse.json());
    const emails = results.map((item: any) => item.email);

    expect(emails).toContain(target.email);
    expect(emails).not.toContain(unrelated.email);
  });

  test('4975 employee creation shows assigned system policies with all policy chips', async ({
    page,
  }) => {
    await gotoEmployeeList(page);
    await clickAddEmployee(page);

    await expect(page.getByText('Assigned System Policies')).toBeVisible();
    await expect(page.getByText('Leave Policy Assignment')).toHaveCount(0);
    await expect(page.getByText(/^Payroll:/)).toBeVisible();
    await expect(page.getByText(/^Attendance:/)).toBeVisible();
    await expect(page.getByText(/^Leave:/)).toBeVisible();
  });

  test('4980 profile edit payload can omit PAN and Aadhaar without validation failures', async ({
    page,
  }) => {
    await page.goto('/dashboard/');
    await dismissAcademicYearTour(page);

    const fixture = createEmployeeFixture('Profile Identity Employee');
    const employee = await createEmployeeFromExistingDefaults(page, fixture);
    const employeeId = employee.id as string;
    const before = await getJson<any>(page, `/employees/${employeeId}/personal-info`);
    const updatedDepartment = `Identity Regression ${Date.now()}`;
    const payload = buildProfilePersonalInfoPayload(before, { department: updatedDepartment });

    expect(payload).not.toHaveProperty('panNo');
    expect(payload).not.toHaveProperty('adharNo');
    await expectOk(
      await employeeApiRequest(page, `/employees/${employeeId}/personal-info`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
      'update personal info without identity fields'
    );

    const after = await getJson<any>(page, `/employees/${employeeId}/personal-info`);
    expect(after.department).toBe(updatedDepartment);
    expect(after.panNo).toBe(before.panNo);
    expect(after.adharNo).toBe(before.adharNo);
  });

  test('4976 and 4982 payroll preview and payslip include late deduction and temp earning', async ({
    page,
  }) => {
    test.setTimeout(600_000);
    await withHrPayrollQaMutex(async () => {
      await page.goto('/dashboard/');
      await dismissAcademicYearTour(page);

      const targetMonthDate = firstWeekdayInMonth(
        new Date(today.getFullYear(), today.getMonth() + testPayrollMonthOffset(), 1)
      );
      const attendanceDate = yyyyMmDd(targetMonthDate);
      const runMonth = monthKey(targetMonthDate);
      const slipMonth = payslipMonth(targetMonthDate);
      const applicableMonth = `${runMonth}-01`;

      const shift = await createShift(page, '09:00:00', '17:00:00');
      const fixture = createEmployeeFixture('Late Temp Payroll Employee');
      const employee = await createEmployeeFromExistingDefaults(page, fixture, {
        dateOfJoining: attendanceDate,
        shiftId: shift.id,
      });
      const employeeId = employee.id as string;

      const tempLine = await setSalaryStructureWithTemporaryEarning(
        page,
        employeeId,
        fixture.fullName,
        applicableMonth
      );

      const effectivePolicies = await getJson<any>(
        page,
        `/hr/employees/${employeeId}/effective-policies?date=${attendanceDate}`
      );
      const salaryDeductionPolicy = await createLateArrivalSalaryDeductionPolicy(
        page,
        effectivePolicies
      );
      await upsertEmployeePolicyOverride(
        page,
        employeeId,
        effectivePolicies,
        salaryDeductionPolicy.id,
        attendanceDate
      );
      await adjustAttendance(page, employeeId, attendanceDate, '09:31:00', '17:00:00');

      const attendanceRegister = await getJson<any>(
        page,
        `/hr/attendance/register?startDate=${attendanceDate}&endDate=${attendanceDate}&employeeId=${employeeId}&skipCount=0&maxResultCount=100`
      );
      const attendanceRow = asItems(attendanceRegister).find(
        (item: any) => item.employeeId === employeeId
      );
      if (attendanceRow) {
        expect(['Present', '1']).toContain(String(attendanceRow.status));
        expect(
          clockMinutes(String(attendanceRow.inTime || '')),
          'stored late in-time'
        ).toBeGreaterThan(9 * 60 + 30);
      }

      const previewRow = await getPayrollRunRow(page, employeeId, runMonth);
      expect(String(previewRow.attendancePolicyId || ''), 'payroll preview attendance policy').toBe(
        String(salaryDeductionPolicy.id)
      );
      const previewTempEarning = componentByName(previewRow.earningComponents, tempLine.name);
      const previewLateDeduction = componentByName(
        previewRow.deductionComponents,
        lateArrivalDeductionName
      );
      expect(previewTempEarning, 'payroll preview temporary earning').toBeTruthy();
      expect(Number(previewTempEarning.amount), 'payroll preview temporary earning amount').toBe(
        tempEarningAmount
      );
      expect(previewLateDeduction, 'payroll preview late-arrival deduction').toBeTruthy();
      expect(Number(previewLateDeduction.amount), 'payroll preview late deduction amount').toBe(
        lateArrivalDeductionAmount
      );

      await lockPayroll(page, employeeId, effectivePolicies.academicYearId, runMonth);
      const slip = await getJson<any>(
        page,
        `/payroll/salary-slips?monthYear=${encodeURIComponent(slipMonth)}&employeeId=${employeeId}`
      );
      const slipTempEarning = componentByName(slip.earnings, tempLine.name);
      const slipLateDeduction = componentByName(slip.deductions, lateArrivalDeductionName);
      expect(slipTempEarning, 'payslip temporary earning').toBeTruthy();
      expect(Number(slipTempEarning.amount), 'payslip temp earning amount').toBe(tempEarningAmount);
      expect(slipLateDeduction, 'payslip late-arrival deduction').toBeTruthy();
      expect(Number(slipLateDeduction.amount), 'payslip late deduction').toBeCloseTo(
        Number(previewLateDeduction.amount),
        2
      );
    });
  });
});
