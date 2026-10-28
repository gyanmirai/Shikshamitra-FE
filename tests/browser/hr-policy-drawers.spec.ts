/* eslint-disable no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

async function expectDrawer(page: Page, title: string) {
  const drawer = page.locator('.MuiDrawer-paper').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });
  await expect(drawer).toBeVisible();
  await expect(page.locator('.MuiDialog-paper')).toHaveCount(0);
  await expect
    .poll(() =>
      drawer.evaluate((element) =>
        Math.abs(element.getBoundingClientRect().right - window.innerWidth)
      )
    )
    .toBeLessThan(1);
  const bounds = await drawer.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(bounds.top).toBe(0);
  expect(Math.abs(bounds.right - bounds.viewportWidth)).toBeLessThan(1);
  expect(bounds.height).toBe(bounds.viewportHeight);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await expect(drawer.getByRole('button', { name: 'close', exact: true })).toBeInViewport();
  return drawer;
}

for (const surface of [
  { id: 'calendars', action: 'New Calendar', title: 'New Work Calendar' },
  { id: 'attendance', action: 'New Standard Policy', title: 'New Attendance Policy' },
  { id: 'payroll', action: 'New Policy', title: 'New Payroll Policy' },
  { id: 'assignments', action: 'New Assignment', title: 'New Assignment' },
  { id: 'leave', action: 'New Leave Policy', title: 'Add Leave Policy' },
]) {
  test(`${surface.id} policy creation uses a right-side drawer`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/?surface=${surface.id}`);
    await page.getByRole('button', { name: surface.action, exact: true }).click();
    await expectDrawer(page, surface.title);
  });
}

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`leave editing preserves its draft and fixed actions at ${viewport.width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize(viewport);
      await page.goto(`/?surface=leave&theme=${theme}`);
      await page.getByRole('button', { name: 'Edit Synthetic leave', exact: true }).click();
      const drawer = await expectDrawer(page, 'Update Leave Policy');
      await expect(drawer.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await drawer
        .getByRole('textbox', { name: 'Policy Name *', exact: true })
        .fill('Unsaved leave draft');
      await drawer.getByText('Unpaid leave rule', { exact: true }).scrollIntoViewIfNeeded();
      await expect(
        drawer.getByRole('heading', { name: 'Update Leave Policy', exact: true })
      ).toBeInViewport();
      await expect(drawer.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await drawer.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
      await expect(drawer.getByRole('textbox', { name: 'Policy Name *', exact: true })).toHaveValue(
        'Unsaved leave draft'
      );
      await page.screenshot({
        path: info.outputPath(`leave-drawer-${theme}-${viewport.width}.png`),
      });
      await drawer.getByRole('button', { name: 'close', exact: true }).click();
      await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
      await expect(drawer).not.toBeVisible();
      await page.getByRole('button', { name: 'Edit Synthetic leave', exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Policy Name *', exact: true })).toHaveValue(
        'Synthetic leave'
      );
      await page.getByRole('textbox', { name: 'Policy Name *', exact: true }).press('Escape');
      await expect(page.locator('.MuiDrawer-paper')).not.toBeVisible();
    });
  }
}

test('duplicate leave policies use the same drawer without changing their source', async ({
  page,
}) => {
  await page.goto('/?surface=leave');
  await page.getByRole('button', { name: 'More actions for Synthetic leave', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click();
  const drawer = await expectDrawer(page, 'Add Leave Policy');
  await expect(drawer.getByRole('textbox', { name: 'Policy Name *', exact: true })).toHaveValue(
    'Copy of Synthetic leave'
  );
  await drawer.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'View Synthetic leave', exact: true }).click();
  await expectDrawer(page, 'Synthetic leave');
  await expect(page.getByText('Leave allocation: 0', { exact: true })).toBeVisible();
});

test('manual holiday editing uses a supporting drawer and retains the calendar draft', async ({
  page,
}) => {
  await page.goto('/?surface=calendars');
  await page.getByRole('button', { name: 'New Calendar', exact: true }).click();
  const calendar = await expectDrawer(page, 'New Work Calendar');
  await calendar.getByRole('textbox', { name: 'Name *', exact: true }).fill('Unsaved calendar');
  await calendar.getByRole('button', { name: 'Add Manual Holiday', exact: true }).click();
  const holiday = await expectDrawer(page, 'Add Manual Holiday');
  await expect(holiday.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
  await holiday.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(holiday).not.toBeVisible();
  await expect(calendar.getByRole('textbox', { name: 'Name *', exact: true })).toHaveValue(
    'Unsaved calendar'
  );
});

test('version restoration opens a draft drawer and returns to history on cancel', async ({
  page,
}) => {
  await page.goto('/?surface=payroll');
  await page
    .getByRole('button', { name: 'More actions for Synthetic payroll', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Version History', exact: true }).click();
  await expectDrawer(page, 'Policy Versions');
  await page.getByRole('button', { name: 'More actions for version 1', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Restore as draft', exact: true }).click();
  const restore = await expectDrawer(page, 'Restore Version As Draft');
  await expect(restore.getByRole('button', { name: 'Create Draft', exact: true })).toBeDisabled();
  await restore
    .getByRole('textbox', { name: 'Restore reason', exact: false })
    .fill('Review historical configuration');
  await expect(restore.getByRole('button', { name: 'Create Draft', exact: true })).toBeEnabled();
  await restore.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(restore).not.toBeVisible();
  await expectDrawer(page, 'Policy Versions');
});

test('assignment-conflict details use a drawer and return to the impact review', async ({
  page,
}) => {
  await page.goto('/?surface=payroll');
  await page.getByRole('button', { name: 'View Synthetic payroll', exact: true }).click();
  await page.getByRole('button', { name: 'View conflict', exact: true }).click();
  const conflict = await expectDrawer(page, 'Conflicting Assignment');
  await expect(conflict.getByText('Synthetic staff', { exact: true })).toBeVisible();
  await conflict.getByRole('button', { name: 'Return to impact', exact: true }).click();
  await expect(conflict).not.toBeVisible();
  await expectDrawer(page, 'Policy Impact');
});

test('leave saving locks the drawer and preserves entered values after failure', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let releaseSave!: () => void;
  const saveResponse = new Promise<void>((resolve) => {
    releaseSave = resolve;
  });
  let saveRequests = 0;
  await page.route(/\/api\/leave-policies(?:\?|$)/, async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    saveRequests += 1;
    await saveResponse;
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Synthetic save failure' } }),
    });
  });
  await page.goto('/?surface=leave');
  await page.getByRole('button', { name: 'New Leave Policy', exact: true }).click();
  const drawer = await expectDrawer(page, 'Add Leave Policy');
  await drawer
    .getByRole('textbox', { name: 'Policy Name *', exact: true })
    .fill('Unsaved new policy');
  const request = page.waitForRequest(
    (item) => new URL(item.url()).pathname === '/api/leave-policies' && item.method() === 'POST'
  );
  await drawer.getByRole('button', { name: 'Submit', exact: true }).click();
  await request;
  try {
    await expect(drawer.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
    await expect(drawer.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
    await expect(drawer.locator('form > fieldset')).toHaveAttribute('inert', '');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeVisible();
    expect(saveRequests).toBe(1);
  } finally {
    releaseSave();
  }
  await expect(drawer.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  await expect(drawer.getByRole('textbox', { name: 'Policy Name *', exact: true })).toHaveValue(
    'Unsaved new policy'
  );
  await expect(drawer.getByRole('button', { name: 'close', exact: true })).toBeEnabled();
});
