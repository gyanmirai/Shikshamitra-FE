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
const fixedEarningComponentName = 'E2E HR Bug Basic Pay';
const fixedDeductionComponentName = 'E2E HR Bug Fixed Deduction';
const tempEarningComponentName = 'E2E Temporary Month Earning';
const lateArrivalDeductionName = 'Late Arrival Salary Deduction';
const providentFundDeductionPrefix = 'Provident Fund -';

const today = new Date();

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

async function setSalaryStructureWithPfRule(
  page: Page,
  employeeId: string,
  employeeName: string,
  pfRuleId: string
) {
  const fixedEarning = await ensurePayrollComponent(
    page,
    'earning',
    fixedEarningComponentName,
    fixedEarningAmount
  );
  const fixedLine = {
    componentId: fixedEarning.id,
    name:
      fixedEarning.earningComponentName || fixedEarning.componentName || fixedEarningComponentName,
    amount: fixedEarningAmount,
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
          accountNumber: `98${Date.now()}`.slice(0, 16),
          ifscCode: 'SBIN0001234',
        },
        salaryDetails: {
          pfRuleId,
          epfNumber: 'AP/12345/7654321',
          uanNumber: '210987654321',
          punchId: `PF${employeeId.slice(0, 6)}`,
          totalWorkingHourPerMonth: 176,
        },
        earningComponents: [fixedLine],
        deductionComponents: [],
      }),
    }),
    'set employee payroll details with PF rule'
  );

  await expectOk(
    await employeeApiRequest(page, `/payroll/employees/${employeeId}/salary-structure`, {
      method: 'PUT',
      body: JSON.stringify({
        earningComponents: [{ id: null, ...fixedLine, description: '', componentType: 'Fixed' }],
        deductionComponents: [],
      }),
    }),
    'set employee salary structure with PF rule'
  );
}

function validPfCode(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    .toUpperCase()
    .split('')
    .map((character) => {
      if (/[A-Z_]/.test(character)) return character;
      if (/[0-9]/.test(character)) return String.fromCharCode('A'.charCodeAt(0) + Number(character));
      return '_';
    })
    .join('')
    .slice(0, 20);
}

async function createPfRule(page: Page) {
  const response = await employeeApiRequest(page, '/payroll/pf-rules', {
    method: 'POST',
    body: JSON.stringify({
      name: `E2E PF Rule ${Date.now()}`,
      code: validPfCode('PF'),
      employeePercentage: 12,
      employerPercentage: 12,
    }),
  });
  await expectOk(response, 'create PF rule');
  return response.json();
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
      graceTime: 0,
      maxLateAllowedPerMonth: 0,
      penaltyType: 'salary_deduction',
      penaltyCountThreshold: 1,
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

async function createWorkCalendarWithRemovedHoliday(
  page: Page,
  academicYearId: string,
  attendanceDate: string
) {
  const response = await employeeApiRequest(page, '/hr/work-calendar-policies', {
    method: 'POST',
    body: JSON.stringify({
      academicYearId,
      name: `E2E Removed Holiday Calendar ${Date.now()}`,
      status: 'active',
      effectiveFrom: attendanceDate,
      effectiveTo: null,
      weeklyOffPattern: 'saturday_sunday',
      customWeeklyOffs: [],
      holidaySyncMode: 'manual',
      holidays: [
        {
          academicYearId,
          date: attendanceDate,
          fromDate: attendanceDate,
          toDate: attendanceDate,
          dayCount: 1,
          holidayName: 'E2E Removed Attendance Holiday',
          source: 'manual',
          calendarHolidayId: null,
          isIncluded: false,
          notes: 'E2E regression for bug 5190',
        },
      ],
    }),
  });
  await expectOk(response, 'create work calendar with removed holiday');
  return response.json();
}

async function createAttendancePolicyForCalendar(
  page: Page,
  effectivePolicies: any,
  workCalendarPolicyId: string
) {
  const source = effectivePolicies.attendancePolicy || {};
  const response = await employeeApiRequest(page, '/hr/attendance/policies', {
    method: 'POST',
    body: JSON.stringify({
      academicYearId: effectivePolicies.academicYearId,
      workCalendarPolicyId,
      name: `E2E Removed Holiday Attendance ${Date.now()}`,
      status: 'active',
      isDefault: false,
      captureMode: source.captureMode || 'manual_with_time',
      fullDayThresholdPercentage: source.fullDayThresholdPercentage ?? 75,
      halfDayThresholdPercentage: source.halfDayThresholdPercentage ?? 50,
      absentThresholdPercentage: source.absentThresholdPercentage ?? 0,
      missingPunchBehavior: source.missingPunchBehavior || 'requires_review',
      manualCorrectionAllowed: true,
      graceTime: source.graceTime ?? 0,
      maxLateAllowedPerMonth: source.maxLateAllowedPerMonth ?? 0,
      penaltyType: source.penaltyType || 'none',
      penaltyCountThreshold: source.penaltyCountThreshold ?? 0,
      earlyExitEnabled: false,
      earlyExitGraceTime: 0,
      overtimeEnabled: false,
      overtimeRate: source.overtimeRate || '1.0x',
      minOvertimeMinutes: source.minOvertimeMinutes ?? 0,
      holidayWorkBehavior: source.holidayWorkBehavior || 'paid',
      payrollPreviewEnabled: true,
    }),
  });
  await expectOk(response, 'create attendance policy for removed holiday calendar');
  return response.json();
}

async function createLeavePolicy(
  page: Page,
  academicYearId: string,
  effectiveFrom: string,
  unpaidRequiresApproval: boolean
) {
  const response = await employeeApiRequest(
    page,
    `/leave-policies?academicYearId=${academicYearId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        policyTitle: `E2E Auto Approval Leave ${Date.now()}`,
        status: 'Active',
        effectiveFrom,
        description: 'E2E regression for bug 5202',
        rules: [
          {
            paidType: 'Paid',
            entitlementMode: 'Limited',
            accrualPolicyType: 'Yearly',
            leaveCount: 12,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: true,
          },
          {
            paidType: 'Unpaid',
            entitlementMode: 'Unlimited',
            accrualPolicyType: 'Yearly',
            leaveCount: null,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: unpaidRequiresApproval,
            allowNegativeBalance: true,
          },
        ],
      }),
    }
  );
  await expectOk(response, 'create leave policy');
  return response.json();
}

async function upsertEmployeePolicyOverride(
  page: Page,
  employeeId: string,
  effectivePolicies: any,
  attendancePolicyId: string,
  effectiveFrom: string
) {
  await upsertEmployeePolicyPackageOverride(page, employeeId, effectivePolicies, effectiveFrom, {
    attendancePolicyId,
  });
}

async function upsertEmployeePolicyPackageOverride(
  page: Page,
  employeeId: string,
  effectivePolicies: any,
  effectiveFrom: string,
  policyIds: { attendancePolicyId?: string; payrollPolicyId?: string; leavePolicyId?: string }
) {
  const assignmentReason = 'E2E current sprint HR bug regression';
  const attendancePolicyId =
    policyIds.attendancePolicyId || effectivePolicies.attendancePolicy?.id;
  const payrollPolicyId = policyIds.payrollPolicyId || effectivePolicies.payrollPolicy?.id;
  const leavePolicyId = policyIds.leavePolicyId || effectivePolicies.leavePolicy?.id;
  const previewResponse = await employeeApiRequest(page, '/hr/policy-assignments/impact-preview', {
    method: 'POST',
    body: JSON.stringify({
      action: 'employee-override-upsert',
      assignment: {
        academicYearId: effectivePolicies.academicYearId,
        targetType: 'employee',
        targetKey: employeeId,
        targetDisplayName: employeeId,
        payrollPolicyId,
        attendancePolicyId,
        leavePolicyId,
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
        payrollPolicyId,
        attendancePolicyId,
        leavePolicyId,
        effectiveFrom,
        effectiveTo: null,
        assignmentReason,
        confirmationToken: preview.confirmationToken ?? null,
      }),
    }
  );
  await expectOk(response, 'upsert employee policy override');
}

async function createLeaveRequest(
  page: Page,
  academicYearId: string,
  employeeId: string,
  leaveDate: string
) {
  const formData = new FormData();
  formData.append('forEmployeeId', employeeId);
  formData.append('paidType', 'Unpaid');
  formData.append('startDate', leaveDate);
  formData.append('endDate', leaveDate);
  formData.append('reason', 'E2E current sprint HR bug auto approval');

  const response = await employeeApiRequest(page, `/leave-management?academicYearId=${academicYearId}`, {
    method: 'POST',
    body: formData,
  });
  await expectOk(response, 'create leave request');
  return response.json();
}

async function createOnboardingInvite(page: Page, email: string) {
  const response = await employeeApiRequest(page, '/employee-applications', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Duplicate',
      middleName: '',
      lastName: 'Candidate',
      email,
      mobileNo: `98${Date.now().toString().slice(-8)}`,
      positionAppliedFor: 'Teacher',
      departmentAppliedFor: 'Primary',
    }),
  });
  await expectOk(response, 'create onboarding invite');
  return response.json();
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
        inTime,
        outTime,
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

  test('5181 future DOJ employee is shown as Upcoming instead of Active', async ({ page }) => {
    await gotoEmployeeList(page);

    const futureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    const futureDoj = yyyyMmDd(futureDate);
    const fixture = createEmployeeFixture('Future DOJ Employee');
    await createEmployeeFromExistingDefaults(page, fixture, { dateOfJoining: futureDoj });

    await page.getByPlaceholder('Search...').fill(fixture.email);
    await expect(page.getByText(fixture.email)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Upcoming')).toBeVisible();
    await expect(page.getByText('Active')).toHaveCount(0);
  });

  test('5182 onboarding invite rejects duplicate open-application email', async ({ page }) => {
    await page.goto('/dashboard/');
    await dismissAcademicYearTour(page);

    const email = `e2e.duplicate.onboarding.${Date.now()}@example.com`;
    await createOnboardingInvite(page, email);

    const duplicateResponse = await employeeApiRequest(page, '/employee-applications', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Duplicate',
        middleName: '',
        lastName: 'Candidate',
        email: email.toUpperCase(),
        mobileNo: `97${Date.now().toString().slice(-8)}`,
        positionAppliedFor: 'Teacher',
        departmentAppliedFor: 'Primary',
      }),
    });
    expect(duplicateResponse.status(), await duplicateResponse.text()).toBe(400);
    expect(await duplicateResponse.text()).toContain('already uses this email');
  });

  test('5196 payroll settings policy link routes to concrete payroll policy page', async ({
    page,
  }) => {
    await page.goto('/hr/payroll/setting', { waitUntil: 'domcontentloaded' });
    const link = page.getByRole('link', { name: 'Open Payroll Policies' });

    await expect(link).toHaveAttribute('href', /\/hr\/payrollPolicies$/);
    await link.click();
    await expect(page).toHaveURL(/\/hr\/payrollPolicies/);
    await expect(page.getByText(/404|not found/i)).toHaveCount(0);
  });

  test('5199 and 5190 employee policy package drives attendance and removed holidays stay editable', async ({
    page,
  }) => {
    await page.goto('/dashboard/');
    await dismissAcademicYearTour(page);

    const attendanceDate = yyyyMmDd(
      firstWeekdayInMonth(new Date(today.getFullYear(), today.getMonth() + 1, 1))
    );
    const fixture = createEmployeeFixture('Policy Removed Holiday Employee');
    const employee = await createEmployeeFromExistingDefaults(page, fixture, {
      dateOfJoining: attendanceDate,
    });
    const employeeId = employee.id as string;
    const effectivePolicies = await getJson<any>(
      page,
      `/hr/employees/${employeeId}/effective-policies?date=${attendanceDate}`
    );
    const workCalendar = await createWorkCalendarWithRemovedHoliday(
      page,
      effectivePolicies.academicYearId,
      attendanceDate
    );
    const attendancePolicy = await createAttendancePolicyForCalendar(
      page,
      effectivePolicies,
      workCalendar.id
    );

    await upsertEmployeePolicyPackageOverride(
      page,
      employeeId,
      effectivePolicies,
      attendanceDate,
      { attendancePolicyId: attendancePolicy.id }
    );

    const resolvedPolicies = await getJson<any>(
      page,
      `/hr/employees/${employeeId}/effective-policies?date=${attendanceDate}`
    );
    expect(resolvedPolicies.attendancePolicy?.id).toBe(attendancePolicy.id);
    expect(resolvedPolicies.attendanceWorkCalendarPolicy?.id).toBe(workCalendar.id);

    const register = await getJson<any>(
      page,
      `/hr/attendance/register?startDate=${attendanceDate}&endDate=${attendanceDate}&employeeId=${employeeId}&skipCount=0&maxResultCount=100`
    );
    const row = asItems(register).find((item: any) => item.employeeId === employeeId);
    expect(row, 'attendance register row').toBeTruthy();
    expect(row.isHoliday).toBe(false);
    expect(row.holidayName || null).toBeNull();
    expect(row.canEdit).toBe(true);
    expect(String(row.lockReason || '')).not.toContain('Holiday:');
  });

  test('5202 leave request auto-approves when resolved unpaid rule skips approval', async ({
    page,
  }) => {
    await page.goto('/dashboard/');
    await dismissAcademicYearTour(page);

    const leaveDate = yyyyMmDd(
      firstWeekdayInMonth(new Date(today.getFullYear(), today.getMonth() + 2, 1))
    );
    const fixture = createEmployeeFixture('Auto Approval Leave Employee');
    const employee = await createEmployeeFromExistingDefaults(page, fixture, {
      dateOfJoining: leaveDate,
    });
    const employeeId = employee.id as string;
    const effectivePolicies = await getJson<any>(
      page,
      `/hr/employees/${employeeId}/effective-policies?date=${leaveDate}`
    );
    const leavePolicy = await createLeavePolicy(
      page,
      effectivePolicies.academicYearId,
      leaveDate,
      false
    );

    await upsertEmployeePolicyPackageOverride(page, employeeId, effectivePolicies, leaveDate, {
      leavePolicyId: leavePolicy.id,
    });

    const created = await createLeaveRequest(
      page,
      effectivePolicies.academicYearId,
      employeeId,
      leaveDate
    );
    expect(created.status).toBe('APPROVED');

    const detail = await getJson<any>(page, `/leave-management/${created.id}`);
    expect(detail.status).toBe('APPROVED');
    expect(detail.leavePolicyId).toBe(leavePolicy.id);
    expect(detail.approvedLeaveUnits).toBe(1);
  });

  test('5192 assigned PF rule appears as payroll deduction in preview', async ({ page }) => {
    test.setTimeout(600_000);
    await withHrPayrollQaMutex(async () => {
      await page.goto('/dashboard/');
      await dismissAcademicYearTour(page);

      const payrollDate = firstWeekdayInMonth(
        new Date(today.getFullYear(), today.getMonth() + testPayrollMonthOffset() + 1, 1)
      );
      const attendanceDate = yyyyMmDd(payrollDate);
      const runMonth = monthKey(payrollDate);
      const fixture = createEmployeeFixture('PF Rule Payroll Employee');
      const employee = await createEmployeeFromExistingDefaults(page, fixture, {
        dateOfJoining: attendanceDate,
      });
      const employeeId = employee.id as string;
      const pfRule = await createPfRule(page);

      await setSalaryStructureWithPfRule(page, employeeId, fixture.fullName, pfRule.id);
      await adjustAttendance(page, employeeId, attendanceDate, '09:00:00', '17:00:00');

      const previewRow = await getPayrollRunRow(page, employeeId, runMonth);
      const pfDeduction = (previewRow.deductionComponents || []).find((component: any) =>
        String(component.name || '').startsWith(providentFundDeductionPrefix)
      );
      expect(pfDeduction, 'PF deduction line').toBeTruthy();
      expect(Number(pfDeduction.amount), 'PF deduction amount').toBeGreaterThan(0);
      expect(Number(previewRow.totalDeduction), 'payroll total deduction').toBeGreaterThan(0);
    });
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
      await adjustAttendance(page, employeeId, attendanceDate, '09:30:00', '17:00:00');

      const attendanceRegister = await getJson<any>(
        page,
        `/hr/attendance/register?startDate=${attendanceDate}&endDate=${attendanceDate}&employeeId=${employeeId}&skipCount=0&maxResultCount=100`
      );
      const attendanceRow = asItems(attendanceRegister).find(
        (item: any) => item.employeeId === employeeId
      );
      if (attendanceRow) {
        expect(['Present', '1']).toContain(String(attendanceRow.status));
      }

      const previewRow = await getPayrollRunRow(page, employeeId, runMonth);
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
      expect(
        Number(previewLateDeduction.amount),
        'payroll preview late deduction amount'
      ).toBeGreaterThan(0);

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
