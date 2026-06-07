/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { createEmployeeFixture } from './employee/employee-fixtures';
import { searchEmployee, gotoEmployeeList } from './employee/employee-page';
import { employeeApiRequest, createEmployeeFromExistingDefaults } from './employee/employee-api';

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

async function expectOk(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson(page: Parameters<typeof employeeApiRequest>[0], path: string) {
  const response = await employeeApiRequest(page, path);
  await expectOk(response, `GET ${path}`);
  return response.json();
}

function itemsOf(body: any) {
  return Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : [];
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

test.describe('HR module full cycle', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against a seeded local backend.');

  test('creates employee context, marks attendance, runs payroll, and verifies salary slip', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    await page.goto('/dashboard/');

    const employee = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Full Cycle Employee')
    );
    const employeeId = employee.id;
    const attendanceDate = yyyyMmDd(firstElapsedWeekdayInMonth(today));
    const month = payrollMonth(today);

    await setEmployeeSalaryStructure(page, employeeId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await expect(page.getByRole('row', { name: new RegExp(employee.email, 'i') })).toBeVisible();

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Mark Attendance/i })).toBeVisible();

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

    await page.goto('/hr/attendance-tracking', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Attendance Register/i })).toBeVisible();

    await page.goto('/hr/payroll/run-payroll', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await expect(page.getByRole('heading', { name: /Run Payroll/i })).toBeVisible({
      timeout: 60_000,
    });

    const preview = await getJson(
      page,
      `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=true`
    );
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
});
