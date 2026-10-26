/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

import { hrPermissions } from '../../src/constants/hr-menus';

const permissionNames = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value, ...['View', 'Add', 'Edit', 'Delete'].map((action) => `${value}.${action}`)]
    : Object.values(value as Record<string, unknown>).flatMap(permissionNames);

const permissions = permissionNames(hrPermissions);
const year = {
  id: 'hr-ui-year',
  name: '2026-27',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T23:59:59Z',
};
const employee = { id: 'hr-ui-staff', fullName: 'HR UI Reviewer', status: 0 };

async function mockHr(page: Page) {
  await page.addInitScript(
    ({ academicYear, staff, grants }) => {
      localStorage.setItem(
        'persist:root',
        JSON.stringify({
          globalState: JSON.stringify({
            currentYear: academicYear,
            currentBoard: {},
            currentMedium: {},
          }),
          auth: JSON.stringify({
            user: { sub: staff.id, name: staff.fullName, role: 'admin' },
            isAuthenticated: true,
            loading: false,
            permissionsInitialized: true,
            employee: staff,
            permissions: grants.map((name) => ({ name, isGranted: true })),
            mainModuleVisibility: [false, false, false, false, true],
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
      localStorage.setItem('onboarding_completed', 'true');
    },
    { academicYear: year, staff: employee, grants: permissions }
  );

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = { items: [], totalCount: 0 };
    if (url.pathname.includes('/auth/session')) {
      body = {
        accessToken: 'local-hr-ui-fixture',
        expires: '2099-01-01T00:00:00Z',
        profile: { sub: employee.id, name: employee.fullName, role: 'admin' },
      };
    } else if (url.pathname.includes('/host/session-context')) {
      body = {
        accountMode: 'tenant',
        tenantId: 'hr-ui-tenant',
        setupCompleted: true,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      };
    } else if (url.pathname.includes('application-configuration')) {
      body = {
        currentUser: { isAuthenticated: true, id: employee.id, roles: ['admin'] },
        auth: { grantedPolicies: Object.fromEntries(permissions.map((name) => [name, true])) },
      };
    } else if (url.pathname.includes('/employees/me')) {
      body = employee;
    } else if (url.pathname.includes('academic-year')) {
      body = { items: [year], totalCount: 1 };
    } else if (url.pathname.includes('user-scope-hierarchy')) {
      body = { isAdmin: true, accessibleHierarchy: [] };
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  await page.route('**/permission-management/permissions?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        groups: [
          { name: 'HR UI', permissions: permissions.map((name) => ({ name, isGranted: true })) },
        ],
      }),
    })
  );
}

async function noOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);
}

test.describe('HR UI polish', () => {
  test.beforeEach(async ({ page }) => mockHr(page));

  for (const screen of [
    {
      route: '/hr/setting',
      heading: 'Document Types',
      action: 'Add Document',
      table: 'documents',
    },
    {
      route: '/hr/attendance-setting/shiftManagement',
      heading: 'Shift Management',
      action: 'Add Shift',
      table: 'hr-attendance-shift-management',
    },
  ]) {
    test(`${screen.heading} empty action supports keyboard @accessibility`, async ({ page }) => {
      await page.goto(screen.route);
      await expect(page.getByRole('heading', { name: screen.heading, exact: true })).toBeVisible();
      const action = page
        .getByTestId(screen.table)
        .getByRole('button', { name: screen.action, exact: true });
      await expect(action).toBeVisible();
      await action.focus();
      await action.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').locator('form')).toHaveCount(1);
      await noOverflow(page);
    });
  }

  test('populated shifts scroll inside the table @visual', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.route('**/api/app/shift-management', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: Array.from({ length: 25 }, (_, index) => ({
            id: `shift-${index}`,
            shiftName: `Morning shift ${index + 1}`,
            startTime: '08:00:00',
            endTime: '14:00:00',
          })),
          totalCount: 25,
        }),
      })
    );
    await page.goto('/hr/attendance-setting/shiftManagement');
    await expect(page.getByText('Morning shift 1', { exact: true })).toBeVisible();
    const table = page.getByTestId('hr-attendance-shift-management');
    const bounds = await table.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
    await expect(page.getByRole('button', { name: 'Add Shift', exact: true })).toHaveCount(1);
    const action = await page.getByRole('button', { name: 'Add Shift', exact: true }).boundingBox();
    expect(Math.round(action!.height)).toBe(30);
    await noOverflow(page);
  });

  test('dark mode keeps notification tabs contained and labelled @accessibility', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem('theme-mode', 'dark');
      localStorage.setItem('app-settings', JSON.stringify({ colorScheme: 'dark' }));
    });
    await page.goto('/hr/hr-notification');
    await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
    await expect(page.getByRole('tablist', { name: 'Notification settings' })).toBeVisible();
    await page.getByRole('tab', { name: 'Attendance Management' }).click();
    await expect(page).toHaveURL(/tab=attendanceLeave/);
    await expect(page.getByRole('tab', { name: 'Attendance Management' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await noOverflow(page);
  });

  for (const width of [390, 768, 1440]) {
    test(`HR workspaces fit ${width}px @visual`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      for (const screen of [
        { route: '/hr/employee', heading: 'Staff Directory' },
        { route: '/hr/setting', heading: 'Document Types' },
        { route: '/hr/attendance-setting/shiftManagement', heading: 'Shift Management' },
        { route: '/hr/attendance-tracking', heading: 'Attendance Register' },
        { route: '/hr/hr-notification', heading: 'Notification' },
        { route: '/hr/professional-management/reviews', heading: 'Performance Management' },
      ]) {
        await page.goto(screen.route);
        await expect(
          page.getByRole('heading', { name: screen.heading, exact: true }).first()
        ).toBeVisible();
        await expect(page.getByRole('main').getByText('HR/Staff', { exact: true })).toHaveCount(0);
        await noOverflow(page);
        await page.screenshot({
          path: testInfo.outputPath(`${screen.heading.replaceAll(' ', '-')}-${width}.png`),
        });
      }
    });
  }
});
