import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { employeeApiRequest } from './hr/employee/employee-api';

type AcademicYear = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
};

type EmployeeListItem = {
  id: string;
  employeeName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  employeeIdentifier?: string;
  employeeCode?: string;
  status?: number;
};

const json = async <T>(response: APIResponse, label: string): Promise<T> => {
  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${label} failed: ${response.status()} ${text}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
};

const api = async <T>(page: Page, path: string, init: RequestInit = {}, label = path) =>
  json<T>(await employeeApiRequest(page, path, init), label);

const randomLetters = () =>
  Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join(
    ''
  );

const titleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');

const getAcademicYear = async (page: Page) => {
  const years = await api<{ items: AcademicYear[] }>(
    page,
    '/app/academic-year?Sorting=name',
    {},
    'academic year list'
  );
  const now = Date.now();
  const current =
    years.items.find((year) => {
      const start = year.startDate ? new Date(year.startDate).getTime() : 0;
      const end = year.endDate ? new Date(year.endDate).getTime() : 0;
      return start <= now && now <= end;
    }) || years.items.find((year) => year.name.includes(String(new Date().getFullYear())));

  if (!current?.id) {
    throw new Error('No academic year is available for Calendar Group UI E2E.');
  }

  return current;
};

const getEmployeeDisplayName = (employee: EmployeeListItem) =>
  employee.employeeName ||
  [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ');

const getActiveEmployee = async (page: Page) => {
  const employees = await api<{ items: EmployeeListItem[] }>(
    page,
    '/employees?page=1&pageSize=25',
    {},
    'employee list for UI group selection'
  );
  const employee = employees.items.find(
    (item) => item.status === 0 && (item.employeeIdentifier || item.employeeCode)
  );

  if (!employee) {
    throw new Error(
      'At least one active employee with a code is required for Calendar Group UI E2E.'
    );
  }

  return employee;
};

const searchGroupTable = async (page: Page, groupName: string) => {
  const search = page.getByPlaceholder('Search...').first();
  await search.fill(groupName);
  await expect(page.getByTestId('calendar-group-row').filter({ hasText: groupName })).toBeVisible({
    timeout: 30_000,
  });
};

test.describe('Calendar group management UI', () => {
  test.setTimeout(420_000);

  test('creates and reopens a direct HR employee group through the UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    const academicYear = await getAcademicYear(page);
    const employee = await getActiveEmployee(page);
    const employeeSearch = employee.employeeIdentifier || employee.employeeCode || '';
    const employeeName = getEmployeeDisplayName(employee);
    const groupName = titleCase(`Calendar Ui Group ${randomLetters()}`);
    let createdGroupId: string | undefined;

    try {
      await page.goto('/calendar/group-management', {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });
      await expect(page.getByRole('heading', { name: /Group Management/i })).toBeVisible({
        timeout: 60_000,
      });

      await page.getByRole('button', { name: /^Group$/i }).click();
      await expect(page.getByRole('heading', { name: /Add Group/i })).toBeVisible({
        timeout: 30_000,
      });

      await page.getByTestId('calendar-group-name-input').locator('input').fill(groupName);
      await page.getByRole('button', { name: /Save & Next/i }).click();
      await expect(page.getByRole('heading', { name: 'Audience Builder' })).toBeVisible({
        timeout: 30_000,
      });

      await page.getByTestId('calendar-group-member-search').locator('input').fill(employeeSearch);
      const employeeRow = page.locator('tr').filter({ hasText: employeeSearch }).first();
      await expect(employeeRow).toBeVisible({ timeout: 60_000 });
      await employeeRow.getByRole('checkbox').check();

      await expect(page.getByText(/Selected direct members \(1\)/i)).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(employeeSearch).last()).toBeVisible();

      await page.getByRole('button', { name: /Save & Next/i }).click();
      await expect(page.getByRole('button', { name: /^Create$/i })).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(groupName)).toBeVisible();
      await expect(page.getByText('Employees')).toBeVisible();

      await page.getByRole('button', { name: /^Create$/i }).click();

      await expect
        .poll(
          async () => {
            const groups = await api<{ items: Array<{ id: string; name: string }> }>(
              page,
              `/groups?academicYearId=${academicYear.id}&includeDetails=true&filter=${encodeURIComponent(
                groupName
              )}`,
              {},
              'poll created UI group'
            );
            const group = groups.items.find((item) => item.name === groupName);
            createdGroupId = group?.id;
            return Boolean(group?.id);
          },
          { timeout: 60_000 }
        )
        .toBe(true);

      await expect(page.getByRole('heading', { name: /Group Management/i })).toBeVisible({
        timeout: 30_000,
      });
      await searchGroupTable(page, groupName);

      const createdRow = page.getByTestId('calendar-group-row').filter({ hasText: groupName });
      await expect(createdRow).toContainText('1');
      await createdRow.getByTestId('table-action-edit').click();

      await expect(page.getByRole('heading', { name: /Update Group/i })).toBeVisible({
        timeout: 30_000,
      });
      await page.getByRole('button', { name: /Save & Next/i }).click();
      await expect(page.getByText(/Selected direct members \(1\)/i)).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(employeeSearch).last()).toBeVisible();
      if (employeeName) {
        await expect(page.getByText(employeeName)).toBeVisible();
      }
    } finally {
      if (createdGroupId) {
        await employeeApiRequest(page, `/groups/${createdGroupId}`, { method: 'DELETE' });
      }
    }
  });
});
