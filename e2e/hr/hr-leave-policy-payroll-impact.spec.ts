/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Route } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const monthYear = '2026-07';

const previewRows = [
  {
    employeeId: 'employee-approved-paid-full',
    employeeCode: 'LP-PAY-001',
    employeeName: 'Approved Paid Full',
    grossSalary: 30000,
    netPay: 30000,
    leaveImpact: {
      paidLeaveDays: 1,
      unpaidLeaveDays: 0,
      payableDays: 31,
    },
  },
  {
    employeeId: 'employee-approved-paid-half',
    employeeCode: 'LP-PAY-002',
    employeeName: 'Approved Paid Half',
    grossSalary: 30000,
    netPay: 30000,
    leaveImpact: {
      paidLeaveDays: 0.5,
      unpaidLeaveDays: 0,
      payableDays: 31,
    },
  },
  {
    employeeId: 'employee-approved-unpaid-full',
    employeeCode: 'LP-PAY-003',
    employeeName: 'Approved Unpaid Full',
    grossSalary: 30000,
    netPay: 29032.26,
    leaveImpact: {
      paidLeaveDays: 0,
      unpaidLeaveDays: 1,
      payableDays: 30,
    },
  },
  {
    employeeId: 'employee-approved-unpaid-half',
    employeeCode: 'LP-PAY-004',
    employeeName: 'Approved Unpaid Half',
    grossSalary: 30000,
    netPay: 29516.13,
    leaveImpact: {
      paidLeaveDays: 0,
      unpaidLeaveDays: 0.5,
      payableDays: 30.5,
    },
  },
  {
    employeeId: 'employee-pending-rejected-cancelled',
    employeeCode: 'LP-PAY-005',
    employeeName: 'Ignored Pending Rejected Cancelled',
    grossSalary: 30000,
    netPay: 30000,
    leaveImpact: {
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      payableDays: 31,
      ignoredStatuses: ['Pending', 'Rejected', 'Cancelled'],
    },
  },
];

const salarySlipRows = [
  {
    employeeId: 'employee-approved-paid-full',
    monthYear,
    grossSalary: 30000,
    netPay: 30000,
    leaveImpact: {
      paidLeaveDays: 1,
      unpaidLeaveDays: 0,
    },
    deductionComponents: [],
  },
  {
    employeeId: 'employee-approved-unpaid-full',
    monthYear,
    grossSalary: 30000,
    netPay: 29032.26,
    leaveImpact: {
      paidLeaveDays: 0,
      unpaidLeaveDays: 1,
    },
    deductionComponents: [{ name: 'Loss of pay', amount: 967.74 }],
  },
];

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
    body: JSON.stringify(json),
  });
}

async function installPayrollRoutes(page: Page, state: { reviewPayload?: any; lockPayload?: any }) {
  await page.route('**/api/payroll/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
      return;
    }

    if (request.method() === 'GET' && url.pathname.endsWith('/payroll/run')) {
      await fulfillJson(route, {
        monthYear: url.searchParams.get('month') || monthYear,
        items: previewRows,
        totalCount: previewRows.length,
        totalPages: 1,
      });
      return;
    }

    if (request.method() === 'POST' && url.pathname.endsWith('/payroll/run/reviews')) {
      state.reviewPayload = request.postDataJSON();
      await fulfillJson(route, { reviewed: true, monthYear: state.reviewPayload?.monthYear });
      return;
    }

    if (request.method() === 'POST' && url.pathname.endsWith('/payroll/run')) {
      state.lockPayload = request.postDataJSON();
      await fulfillJson(route, { locked: true, monthYear: state.lockPayload?.monthYear });
      return;
    }

    if (request.method() === 'GET' && url.pathname.endsWith('/payroll/salary-slips')) {
      await fulfillJson(route, {
        items: salarySlipRows,
        totalCount: salarySlipRows.length,
      });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function browserFetch(page: Page, path: string, init?: RequestInit) {
  const url = new URL(path, baseURL).toString();
  return page.evaluate(
    async ({ targetUrl, requestInit }) => {
      const response = await fetch(targetUrl, requestInit);
      const text = await response.text();
      return {
        status: response.status,
        body: text ? JSON.parse(text) : null,
      };
    },
    { targetUrl: url, requestInit: init }
  );
}

test.describe('Leave policy payroll impact', () => {
  test('previews approved Paid and Unpaid leave impact and verifies lock/slip golden paths', async ({
    page,
  }) => {
    const state: { reviewPayload?: any; lockPayload?: any } = {};
    await installPayrollRoutes(page, state);
    await page.goto('about:blank');

    const preview = await browserFetch(
      page,
      `/api/payroll/run?month=${encodeURIComponent(monthYear)}&page=0&pageSize=100&forceRefresh=true`
    );
    expect(preview.status).toBe(200);
    expect(preview.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 'employee-approved-paid-full',
          leaveImpact: expect.objectContaining({ paidLeaveDays: 1, unpaidLeaveDays: 0 }),
        }),
        expect.objectContaining({
          employeeId: 'employee-approved-paid-half',
          leaveImpact: expect.objectContaining({ paidLeaveDays: 0.5, unpaidLeaveDays: 0 }),
        }),
        expect.objectContaining({
          employeeId: 'employee-approved-unpaid-full',
          leaveImpact: expect.objectContaining({ paidLeaveDays: 0, unpaidLeaveDays: 1 }),
        }),
        expect.objectContaining({
          employeeId: 'employee-approved-unpaid-half',
          leaveImpact: expect.objectContaining({ paidLeaveDays: 0, unpaidLeaveDays: 0.5 }),
        }),
        expect.objectContaining({
          employeeId: 'employee-pending-rejected-cancelled',
          leaveImpact: expect.objectContaining({ paidLeaveDays: 0, unpaidLeaveDays: 0 }),
        }),
      ])
    );

    await withHrPayrollQaMutex(async () => {
      const employeeIds = ['employee-approved-paid-full', 'employee-approved-unpaid-full'];
      const review = await browserFetch(page, '/api/payroll/run/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ monthYear, employeeIds }),
      });
      expect(review.status).toBe(200);

      const lock = await browserFetch(page, '/api/payroll/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ monthYear, employeeIds }),
      });
      expect(lock.status).toBe(200);
    });

    expect(state.reviewPayload).toMatchObject({
      monthYear,
      employeeIds: ['employee-approved-paid-full', 'employee-approved-unpaid-full'],
    });
    expect(state.lockPayload).toMatchObject({
      monthYear,
      employeeIds: ['employee-approved-paid-full', 'employee-approved-unpaid-full'],
    });

    const slips = await browserFetch(
      page,
      `/api/payroll/salary-slips?monthYear=${encodeURIComponent(monthYear)}`
    );
    expect(slips.status).toBe(200);
    expect(slips.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 'employee-approved-paid-full',
          netPay: 30000,
          leaveImpact: expect.objectContaining({ paidLeaveDays: 1, unpaidLeaveDays: 0 }),
        }),
        expect.objectContaining({
          employeeId: 'employee-approved-unpaid-full',
          netPay: 29032.26,
          leaveImpact: expect.objectContaining({ paidLeaveDays: 0, unpaidLeaveDays: 1 }),
          deductionComponents: expect.arrayContaining([
            expect.objectContaining({ name: 'Loss of pay', amount: 967.74 }),
          ]),
        }),
      ])
    );
  });
});
