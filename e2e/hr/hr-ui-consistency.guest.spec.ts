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
      body = { userId: employee.id, isAdmin: true, accessibleHierarchy: [] };
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

const calendar = {
  id: 'fixture-calendar',
  name: 'Synthetic school calendar',
  status: 'active',
  effectiveFrom: '2026-06-01T00:00:00Z',
  effectiveTo: '2027-05-31T00:00:00Z',
  version: 1,
  holidaySummary: { includedCount: 2 },
};

async function populate(page: Page) {
  await page.route('**/api/app/shift-management**', async (route) => {
    const url = new URL(route.request().url());
    const skip = Number(url.searchParams.get('skipCount') || 0);
    const size = Number(url.searchParams.get('maxResultCount') || 20);
    const rows = Array.from({ length: 25 }, (_, index) => ({
      id: `fixture-shift-${index}`,
      shiftName: `Synthetic shift ${index + 1}`,
      startTime: '08:00:00',
      endTime: '14:00:00',
    }));
    await route.fulfill({ json: { items: rows.slice(skip, skip + size), totalCount: 25 } });
  });
  await page.route('**/api/hr/work-calendar-policies?**', async (route) => {
    const url = new URL(route.request().url());
    const archived = url.searchParams.get('isArchived') === 'true';
    const search = url.searchParams.get('search') || '';
    const rows =
      !archived && (!search || calendar.name.toLowerCase().includes(search.toLowerCase()))
        ? [calendar]
        : [];
    await route.fulfill({ json: { items: rows, totalCount: rows.length } });
  });
}

test.describe('HR shared table consistency with synthetic readers', () => {
  test.beforeEach(async ({ page }) => {
    await mockHr(page);
    await populate(page);
    // No requests from these scenarios can write payroll, staff or document data.
    await page.route('**/api/**', async (route) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
        await route.fulfill({ status: 405, json: { error: 'Synthetic read-only test' } });
      } else await route.fallback();
    });
  });

  for (const theme of ['light', 'dark']) {
    for (const width of [390, 768, 1440]) {
      test(`${theme} shared workspaces at ${width}px @visual @accessibility`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((mode) => {
          localStorage.setItem('theme-mode', mode);
          localStorage.setItem('app-settings', JSON.stringify({ colorScheme: mode }));
        }, theme);
        for (const screen of [
          {
            route: '/hr/attendance-setting/shiftManagement',
            table: 'hr-attendance-shift-management',
            content: 'Synthetic shift 1',
          },
          {
            route: '/hr/calendars',
            table: 'hr-work-calendars',
            content: 'Synthetic school calendar',
          },
          { route: '/hr/setting', table: 'hr-document-settings', content: '' },
          { route: '/hr/employee', table: 'employee-table', content: '' },
        ]) {
          await page.goto(screen.route);
          const table = page.getByTestId(screen.table);
          await expect(table).toBeVisible();
          if (screen.content)
            await expect(table.getByText(screen.content, { exact: true })).toBeVisible();
          if (width === 390 && screen.table === 'hr-work-calendars') {
            const record = table.getByText(calendar.name, { exact: true });
            await record.scrollIntoViewIfNeeded();
            await expect(record).toBeInViewport();
            const pageSize = table.getByRole('combobox', { name: /Rows per page/ });
            await pageSize.scrollIntoViewIfNeeded();
            await expect(pageSize).toBeInViewport();
            await expect(record).toBeInViewport();
          }
          await expect(table.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
          await expect(table.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
          await expect(
            table.getByRole('button', { name: 'Full screen', exact: true })
          ).toBeVisible();
          await expect(
            table.getByRole('button', { name: 'Sort by Actions', exact: true })
          ).toHaveCount(0);
          await expect(
            table.getByRole('button', { name: 'Filter Actions', exact: true })
          ).toHaveCount(0);
          await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
          await noOverflow(page);
          // Capture the settled layout instead of the header's entrance opacity animation.
          await page.screenshot({
            animations: 'disabled',
            path: testInfo.outputPath(`${screen.table}-${theme}-${width}.png`),
          });
        }
      });
    }
  }

  test('calendar read error occupies the table body and retry recovers @regression', async ({
    page,
  }) => {
    let failed = true;
    await page.route('**/api/hr/work-calendar-policies?**', (route) =>
      route.fulfill(
        failed
          ? { status: 500, json: { error: { message: 'Synthetic calendar reader unavailable' } } }
          : { json: { items: [calendar], totalCount: 1 } }
      )
    );
    await page.goto('/hr/calendars');
    const table = page.getByTestId('hr-work-calendars');
    await expect(table.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
    await expect(table.getByText('No work calendars.', { exact: true })).toHaveCount(0);
    failed = false;
    await table.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(table.getByText(calendar.name, { exact: true })).toBeVisible();
  });

  test('calendar search resets and full screen keeps one table @regression', async ({ page }) => {
    await page.goto('/hr/calendars');
    const table = page.getByTestId('hr-work-calendars');
    await expect(table.getByText(calendar.name, { exact: true })).toBeVisible();
    await table
      .getByRole('textbox', { name: 'Search table', exact: true })
      .fill('No matching fixture');
    await expect(table.getByText(calendar.name, { exact: true })).toHaveCount(0);
    await table.getByLabel('Clear search', { exact: true }).click();
    await expect(table.getByText(calendar.name, { exact: true })).toBeVisible();
    await table.getByRole('button', { name: 'Full screen', exact: true }).press('Enter');
    await expect(
      page.getByRole('table', { name: 'Work calendars table', exact: true })
    ).toHaveCount(1);
    await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
    await expect(
      page.getByRole('table', { name: 'Work calendars table', exact: true })
    ).toHaveCount(1);
  });
});
