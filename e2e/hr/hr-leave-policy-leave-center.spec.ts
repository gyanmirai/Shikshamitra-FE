/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Route, type Locator } from '@playwright/test';

const academicYear = {
  id: 'year-leave-policy-center-e2e',
  name: '2026-27',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T23:59:59Z',
};

const employee = {
  id: 'employee-leave-policy-center-e2e',
  fullName: 'Leave Policy Teacher',
  employeeCode: 'EMP-LP-001',
  status: 0,
  employeeStatusType: 0,
};

const policy = {
  id: 'leave-policy-center-e2e',
  academicYearId: academicYear.id,
  policyTitle: 'E2E Leave Policy Matrix',
  name: 'E2E Leave Policy Matrix',
  status: 'Active',
  isDefault: true,
  effectiveFrom: academicYear.startDate,
  effectiveTo: null,
  rules: [
    {
      id: 'paid-rule-center-e2e',
      paidType: 'Paid',
      entitlementMode: 'Limited',
      leaveCount: 12,
      accruedDays: 3,
      accrualPolicyType: 'Monthly',
      maxDaysPerRequest: 3,
      minNoticeDays: 2,
      attachmentRequiredAfterDays: 2,
      requiresApproval: true,
      allowHalfDay: true,
      allowNegativeBalance: true,
      carryForward: true,
      carryForwardLimit: 5,
      encashmentAllowed: true,
      encashmentTiming: 'end_of_year',
      isActive: true,
    },
    {
      id: 'unpaid-rule-center-e2e',
      paidType: 'Unpaid',
      entitlementMode: 'Unlimited',
      leaveCount: null,
      accrualPolicyType: 'Yearly',
      requiresApproval: true,
      allowHalfDay: true,
      allowNegativeBalance: true,
      carryForward: false,
      encashmentAllowed: false,
      isUnlimited: true,
      isActive: true,
    },
  ],
};

const grantedPermissions = [
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.HR.Policies',
  'ShikshaMitra.Module.HR.AttendanceManagement',
  'HR.LeaveManagement.Setting.LeavePolicy',
  'HR.LeaveManagement.LeaveCenter',
  'HR.Policies.View',
  'HR.Policies.Create',
  'HR.Policies.Edit',
  'HR.Policies.SetDefault',
];

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(json),
  });
}

async function seedAcademicYear(page: Page) {
  await page.addInitScript(
    ({ year, authEmployee, permissions }) => {
      window.localStorage.setItem(
        'persist:root',
        JSON.stringify({
          globalState: JSON.stringify({
            currentYear: year,
            currentBoard: {},
            currentMedium: {},
          }),
          auth: JSON.stringify({
            user: {
              sub: 'leave-policy-center-user-e2e',
              name: 'Leave Policy HR User',
              role: 'hr-manager',
            },
            isAuthenticated: true,
            loading: false,
            permissionsInitialized: true,
            employee: authEmployee,
            permissions,
            mainModuleVisibility: [false, false, false, false, true],
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
      window.localStorage.setItem('onboarding_completed', 'true');
    },
    {
      year: academicYear,
      authEmployee: employee,
      permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
    }
  );
}

async function installPermissionRoutes(page: Page) {
  await page.route('**/api/auth/session**', (route) =>
    fulfillJson(route, {
      accessToken: 'leave-policy-center-token-e2e',
      expires: '2099-01-01T00:00:00.000Z',
      profile: {
        sub: 'leave-policy-center-user-e2e',
        name: 'Leave Policy HR User',
        role: 'hr-manager',
      },
    })
  );
  await page.route('**/api/employees/me**', (route) => fulfillJson(route, employee));
  await page.route('**/api/app/education-board**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/academic-organization-options**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/user-scope/user-scope-hierarchy**', (route) =>
    fulfillJson(route, { isAdmin: true, accessibleHierarchy: [] })
  );
  await page.route('**/permission-management/permissions?**', (route) =>
    fulfillJson(route, {
      groups: [
        {
          name: 'HR E2E',
          permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
        },
      ],
    })
  );
}

async function installLeavePolicyRoutes(
  page: Page,
  state: { createPayload?: any; updatePayload?: any }
) {
  await installPermissionRoutes(page);

  await page.route('**/api/hr-leave-types**', async (route) => {
    throw new Error(`Legacy leave-type endpoint should not be called: ${route.request().url()}`);
  });

  await page.route('**/api/app/academic-year**', (route) =>
    fulfillJson(route, { items: [academicYear], totalCount: 1 })
  );

  await page.route('**/api/leave-policies**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET') {
      const isSinglePolicy = /\/api\/leave-policies\/[^/?]+$/.test(url.pathname);
      await fulfillJson(route, isSinglePolicy ? policy : { items: [policy], totalCount: 1 });
      return;
    }

    if (request.method() === 'POST') {
      state.createPayload = request.postDataJSON();
      await fulfillJson(route, { ...policy, ...state.createPayload });
      return;
    }

    if (request.method() === 'PUT') {
      state.updatePayload = request.postDataJSON();
      await fulfillJson(route, { ...policy, ...state.updatePayload });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function installLeaveCenterRoutes(
  page: Page,
  state: { paidForm?: string; unpaidForm?: string }
) {
  await installPermissionRoutes(page);

  await page.route('**/api/hr-leave-types**', async (route) => {
    throw new Error(`Legacy leave-type endpoint should not be called: ${route.request().url()}`);
  });

  await page.route('**/api/app/academic-year**', (route) =>
    fulfillJson(route, { items: [academicYear], totalCount: 1 })
  );
  await page.route('**/api/employees/reporting-manager/my/employees', (route) =>
    fulfillJson(route, { employees: [employee] })
  );
  await page.route('**/api/employees?**', (route) =>
    fulfillJson(route, { items: [employee], totalCount: 1 })
  );
  await page.route('**/api/hr/policy-assignment-preview?**', (route) =>
    fulfillJson(route, {
      employeeId: employee.id,
      academicYearId: academicYear.id,
      date: '2026-07-15',
      leavePolicy: policy,
    })
  );
  const balancePayload = {
    items: [
      {
        paidType: 'Paid',
        entitlementMode: 'Limited',
        entitledDays: 12,
        accruedDays: 3,
        usedDays: 4,
        pendingDays: 0.5,
        remainingDays: -1,
        isUnlimited: false,
        allowNegativeBalance: true,
      },
      {
        paidType: 'Unpaid',
        entitlementMode: 'Unlimited',
        entitledDays: null,
        accruedDays: null,
        usedDays: 1,
        pendingDays: 0,
        remainingDays: null,
        isUnlimited: true,
        allowNegativeBalance: true,
      },
    ],
  };
  await page.route('**/api/leave-management/balances?**', (route) =>
    fulfillJson(route, balancePayload)
  );
  await page.route('**/api/leave-management/my/balances?**', (route) =>
    fulfillJson(route, balancePayload)
  );
  await page.route('**/api/leave-management/calendar?**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/leave-management**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET' && url.pathname.endsWith('/balances')) {
      await fulfillJson(route, balancePayload);
      return;
    }

    if (request.method() === 'GET' && url.pathname.endsWith('/calendar')) {
      await fulfillJson(route, { items: [], totalCount: 0 });
      return;
    }

    if (request.method() === 'POST') {
      const body = request.postData() || '';
      if (body.includes('name="paidType"\r\n\r\nUnpaid')) {
        state.unpaidForm = body;
      } else {
        state.paidForm = body;
      }

      await fulfillJson(route, {
        id: `leave-${state.unpaidForm ? 'unpaid' : 'paid'}-center-e2e`,
        employeeId: employee.id,
        paidType: state.unpaidForm ? 'Unpaid' : 'Paid',
        status: 'Pending',
      });
      return;
    }

    await fulfillJson(route, { items: [], totalCount: 0 });
  });
}

async function chooseComboboxOption(scope: Locator, index: number, option: RegExp) {
  await scope.getByRole('combobox').nth(index).click();
  await scope.page().getByRole('option', { name: option }).click();
}

async function fillSegmentedDate(dialog: Locator, label: RegExp, displayDate: string) {
  const [day, month, year] = displayDate.split('/');
  const group = dialog.getByRole('group', { name: label }).first();
  await group.getByRole('spinbutton', { name: /^Day$/i }).fill(day);
  await group.getByRole('spinbutton', { name: /^Month$/i }).fill(month);
  await group.getByRole('spinbutton', { name: /^Year$/i }).fill(year);
}

function leaveDate() {
  const date = new Date();
  date.setDate(date.getDate() + 21);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${date.getFullYear()}`;
}

test.describe('Leave policy and Leave Center matrix', () => {
  test.beforeEach(async ({ page }) => {
    await seedAcademicYear(page);
  });

  test('authors Paid and Unpaid policy rules with accrual and paid-only controls', async ({
    page,
  }) => {
    const state: { createPayload?: any; updatePayload?: any } = {};
    await installLeavePolicyRoutes(page, state);

    await page.goto('/hr/leave-policies', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Leave Policies/i })).toBeVisible();

    await page.getByRole('button', { name: /New Leave Policy/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: /Policy Name/i }).fill(policy.policyTitle);
    await dialog
      .getByRole('spinbutton', { name: /^Days \*$/i })
      .first()
      .fill('12');
    await chooseComboboxOption(dialog, 1, /^Monthly$/i);
    await dialog
      .getByRole('spinbutton', { name: /Max Per Request/i })
      .first()
      .fill('3');
    await dialog
      .getByRole('spinbutton', { name: /Min Notice/i })
      .first()
      .fill('2');
    await dialog
      .getByRole('spinbutton', { name: /Attachment After/i })
      .first()
      .fill('2');
    await dialog
      .getByRole('checkbox', { name: /Negative balance/i })
      .first()
      .check();
    await dialog.getByRole('checkbox', { name: /Carry forward/i }).check();
    await dialog.getByRole('spinbutton', { name: /Carry Limit/i }).fill('5');
    await dialog.getByRole('checkbox', { name: /Encashable/i }).check();
    await chooseComboboxOption(dialog, 2, /End of year/i);

    await chooseComboboxOption(dialog, 3, /^Limited$/i);
    await dialog
      .getByRole('spinbutton', { name: /^Days \*$/i })
      .nth(1)
      .fill('4');
    await dialog.getByRole('button', { name: /^Submit$/i }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(() => state.createPayload).toBeTruthy();
    expect(state.createPayload.rules).toHaveLength(2);
    expect(state.createPayload.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paidType: 'Paid',
          entitlementMode: 'Limited',
          leaveCount: 12,
          accrualPolicyType: 'Monthly',
          maxDaysPerRequest: 3,
          minNoticeDays: 2,
          attachmentRequiredAfterDays: 2,
          allowNegativeBalance: true,
          carryForward: true,
          carryForwardLimit: 5,
          encashmentAllowed: true,
          encashmentTiming: 'end_of_year',
        }),
        expect.objectContaining({
          paidType: 'Unpaid',
          entitlementMode: 'Limited',
          leaveCount: 4,
          carryForward: false,
          encashmentAllowed: false,
        }),
      ])
    );
    expect(JSON.stringify(state.createPayload)).not.toContain('leaveTypeId');
    expect(JSON.stringify(state.createPayload)).not.toContain('leaveTypeMasterId');

    await page
      .getByRole('button', { name: /^Edit$/i })
      .first()
      .click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByText(/Update Leave Policy/i)).toBeVisible();
    await editDialog
      .getByRole('textbox', { name: /Policy Name/i })
      .fill('E2E Leave Policy Matrix Updated');
    await editDialog
      .getByRole('spinbutton', { name: /^Days \*$/i })
      .first()
      .fill('14');
    await editDialog.getByRole('button', { name: /^Update$/i }).click();

    await expect.poll(() => state.updatePayload).toBeTruthy();
    expect(state.updatePayload).toEqual(
      expect.objectContaining({
        policyTitle: 'E2E Leave Policy Matrix Updated',
        rules: expect.arrayContaining([
          expect.objectContaining({
            paidType: 'Paid',
            leaveCount: 14,
            accrualPolicyType: 'Monthly',
          }),
          expect.objectContaining({
            paidType: 'Unpaid',
            entitlementMode: 'Unlimited',
            leaveCount: null,
            carryForward: false,
            encashmentAllowed: false,
          }),
        ]),
      })
    );
    expect(JSON.stringify(state.updatePayload)).not.toContain('leaveTypeId');
    expect(JSON.stringify(state.updatePayload)).not.toContain('leaveTypeMasterId');
  });

  test('shows accrued, unlimited, negative balances and submits Paid and Unpaid requests', async ({
    page,
  }) => {
    const state: { paidForm?: string; unpaidForm?: string } = {};
    await installLeaveCenterRoutes(page, state);

    await page.goto('/hr/leave-center?tab=balance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Leave Center' })).toBeVisible();
    await expect(page.getByText('Accrued').first()).toBeVisible();
    await expect(page.getByText('-1').first()).toBeVisible();
    const unpaidBalanceRow = page.getByRole('row', { name: /Unpaid .* Unlimited/i });
    await expect(unpaidBalanceRow).toBeVisible();
    await expect(unpaidBalanceRow.getByText('Unlimited')).toBeVisible();
    await page.getByRole('tab', { name: /My Requests/i }).click();

    const submitLeaveRequest = async (paidType: 'Paid' | 'Unpaid', reason: string) => {
      await page.getByRole('button', { name: /Leave Request/i }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('combobox', { name: /Employee \*/i }).fill(employee.fullName);
      await page.getByRole('option', { name: new RegExp(employee.fullName, 'i') }).click();
      await expect(dialog.getByText(/Effective leave policy/i)).toBeVisible();
      await chooseComboboxOption(dialog, 1, new RegExp(`^${paidType}$`, 'i'));
      await fillSegmentedDate(dialog, /Start Date/i, leaveDate());
      await fillSegmentedDate(dialog, /End Date/i, leaveDate());
      await dialog.getByLabel(/Reason for leave/i).fill(reason);
      await dialog.getByRole('button', { name: /^Submit$/i }).click();
      await expect
        .poll(() => (paidType === 'Paid' ? state.paidForm : state.unpaidForm))
        .toBeTruthy();
    };

    await submitLeaveRequest('Paid', 'Monthly accrued paid leave');
    await submitLeaveRequest('Unpaid', 'Unpaid leave fallback');

    expect(state.paidForm).toContain('name="paidType"\r\n\r\nPaid');
    expect(state.unpaidForm).toContain('name="paidType"\r\n\r\nUnpaid');
    expect(`${state.paidForm}${state.unpaidForm}`).not.toContain('leaveTypeId');
    expect(`${state.paidForm}${state.unpaidForm}`).not.toContain('leaveTypeMasterId');
  });
});
