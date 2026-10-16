import { test, expect, type Page } from '@playwright/test';

const permissionText = (operation: string) =>
  `Your account cannot ${operation}. Ask your administrator to review your permissions and assigned data access, then try again.`;
const notifications = (page: Page) => page.locator('[data-sonner-toast]');

async function openFixture(page: Page, query = '') {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Shared Permission Feedback' })).toBeVisible();
  return pageErrors;
}

(
  [
    ['Load HR policies (GET)', 'view payroll policies', 'GET', '/api/hr/payroll/policies'],
    ['Add transport fuel (POST)', 'add fuel types', 'POST', '/api/transport/fuel-types'],
    [
      'Update library section (PUT)',
      'update library sections',
      'PUT',
      '/api/library/sections/synthetic-section',
    ],
    [
      'Delete academic board (DELETE)',
      'delete academic boards',
      'DELETE',
      '/api/app/education-board/synthetic-board',
    ],
  ] as const
).forEach(([button, operation, method, path]) => {
  test(`${method} denial describes the ${operation} operation through its real feature client`, async ({
    page,
  }, testInfo) => {
    const errors = await openFixture(page);
    const request = page.waitForRequest(
      (item) => item.method() === method && new URL(item.url()).pathname === path
    );
    await page.getByRole('button', { name: button, exact: true }).click();
    await request;
    const notice = notifications(page);
    await expect(notice).toHaveCount(1);
    await expect(notice.getByText('Access required', { exact: true })).toBeVisible();
    await expect(notice).toContainText(permissionText(operation));
    await expect(page.getByTestId('last-error')).toContainText('"status": 403');
    await expect(page.getByTestId('last-error')).toContainText('Volo.Authorization:010002');
    await expect(
      notice.getByText("You don't have permission to access this resource.", { exact: true })
    ).toHaveCount(0);
    await expect(notice.locator('.MuiAlert-colorWarning')).toHaveCount(1);
    const bounds = await notice.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect
      .poll(async () => {
        const settledBounds = await notice.boundingBox();
        return Boolean(
          settledBounds &&
            settledBounds.y >= 0 &&
            settledBounds.y + settledBounds.height <= page.viewportSize()!.height
        );
      })
      .toBe(true);
    const closeBounds = await notice
      .getByRole('button', { name: 'Close', exact: true })
      .boundingBox();
    expect(closeBounds).not.toBeNull();
    expect(closeBounds!.width).toBeGreaterThanOrEqual(44);
    expect(closeBounds!.height).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
    if (method === 'POST')
      await page.screenshot({
        path: testInfo.outputPath('permission-feedback.png'),
        fullPage: true,
      });
  });
});

test('unknown endpoint uses a neutral action without exposing a route or endpoint name', async ({
  page,
}) => {
  const errors = await openFixture(page);
  await page.getByRole('button', { name: 'Load unknown resource', exact: true }).click();
  await expect(notifications(page)).toHaveCount(1);
  await expect(notifications(page)).toContainText(permissionText('complete this action'));
  await expect(notifications(page)).not.toContainText('/fixture/');
  await expect(notifications(page)).not.toContainText('sharedFeedbackUnknownProbe');
  expect(errors).toEqual([]);
});

test('three denied requests with the same permission message produce one notification', async ({
  page,
}) => {
  const errors = await openFixture(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/hr/payroll/policies')
      requests.push(request.url());
  });
  await page.getByRole('button', { name: 'Load three HR policy requests', exact: true }).click();
  await expect.poll(() => requests.length).toBe(3);
  await expect(notifications(page)).toHaveCount(1);
  await expect(notifications(page)).toContainText(permissionText('view payroll policies'));
  await page.getByRole('button', { name: 'Load three HR policy requests', exact: true }).click();
  await expect.poll(() => requests.length).toBe(6);
  await expect(notifications(page)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('different denied operations remain separate notifications', async ({ page }) => {
  await openFixture(page);
  await page.getByRole('button', { name: 'Load HR policies (GET)', exact: true }).click();
  await expect(notifications(page)).toHaveCount(1);
  await page.getByRole('button', { name: 'Add transport fuel (POST)', exact: true }).click();
  await expect(notifications(page)).toHaveCount(2);
  await expect(
    notifications(page).filter({ hasText: permissionText('view payroll policies') })
  ).toBeVisible();
  await expect(
    notifications(page).filter({ hasText: permissionText('add fuel types') })
  ).toBeVisible();
});

test('an inline error owner can suppress automatic permission toasts', async ({ page }) => {
  await openFixture(page, '?ownership=silent');
  await page.getByRole('button', { name: 'Update library section (PUT)', exact: true }).click();
  await expect(page.getByTestId('last-error')).toContainText('"status": 403');
  await expect(page.getByTestId('last-error')).toContainText(
    permissionText('update library sections')
  );
  await expect(notifications(page)).toHaveCount(0);
});

(
  [
    [
      'validation',
      400,
      'Fixture:InvalidValue',
      'The section name must contain at least three letters.',
    ],
    [
      'conflict',
      409,
      'Fixture:VersionConflict',
      'This record changed. Refresh its latest version before saving.',
    ],
    [
      'unavailable',
      503,
      'Fixture:Unavailable',
      'The service is temporarily unavailable. Try again shortly.',
    ],
    ['specific-forbidden', 403, 'HR:Employee:010043', 'Policy access is required to add staff.'],
  ] as const
).forEach(([scenario, status, code, message]) => {
  test(`${scenario} preserves its existing error details and code`, async ({ page }) => {
    await openFixture(page, `?response=${scenario}`);
    await page.getByRole('button', { name: 'Update library section (PUT)', exact: true }).click();
    await expect(notifications(page)).toHaveCount(1);
    await expect(notifications(page).getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByTestId('last-error')).toContainText(`"status": ${status}`);
    await expect(page.getByTestId('last-error')).toContainText(code);
    await expect(notifications(page).getByText('Access required', { exact: true })).toHaveCount(0);
  });
});

test('permission notification remains readable beyond the normal four-second lifetime and closes from the keyboard', async ({
  page,
}) => {
  await openFixture(page);
  await page.getByRole('button', { name: 'Delete academic board (DELETE)', exact: true }).click();
  const notice = notifications(page);
  await expect(notice).toHaveCount(1);
  await page.waitForTimeout(5500);
  await expect(notice).toBeVisible();
  await page.keyboard.press('Alt+t');
  await page.keyboard.press('Tab');
  await expect(notice).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(notice.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(notice).toHaveCount(0);
});
