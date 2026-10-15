import { expect, test } from '@playwright/test';

import { field, fixture, fixtureOrigin, login } from './helpers';

async function fillBoardDates(page: import('@playwright/test').Page) {
  const start = page.getByRole('group', { name: /^Start Date/ });
  await start.getByRole('spinbutton', { name: 'Month', exact: true }).fill('Jun');
  await start.getByRole('spinbutton', { name: 'Day', exact: true }).fill('01');
  await start.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2026');
  const end = page.getByRole('group', { name: /^End Date/ });
  await end.getByRole('spinbutton', { name: 'Month', exact: true }).fill('May');
  await end.getByRole('spinbutton', { name: 'Day', exact: true }).fill('31');
  await end.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2027');
}

test.beforeEach(async ({ request }) => {
  await request.post(fixture, { data: {} });
});
[
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
]
  .flatMap((viewport) => ['light', 'dark'].map((theme) => ({ viewport, theme })))
  .forEach(({ viewport, theme }) => {
    test(`welcome heading stays separated and footer stays reachable at ${viewport.width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((mode) => {
        localStorage.setItem('theme-mode', mode);
        localStorage.setItem('app-settings', JSON.stringify({ colorScheme: mode }));
      }, theme);
      await login(page, 'SCHOOL_01');
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      await expect
        .poll(async () => {
          const label = await page
            .locator('[data-setup-heading]')
            .getByText('Welcome', { exact: true })
            .boundingBox();
          const heading = await page
            .getByRole('heading', {
              name: 'Let’s get your institute ready',
            })
            .boundingBox();
          return label && heading ? heading.y - (label.y + label.height) : 0;
        })
        .toBeGreaterThanOrEqual(7.5);
      await expect(page.getByRole('button', { name: 'Get started', exact: true })).toBeVisible();
      const footer = await page.getByRole('contentinfo').boundingBox();
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
    });
  });
test('first institute login opens setup and returns to the saved draft after reopening', async ({
  page,
  request,
}) => {
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make it your institute' })).toBeVisible();
  await field(page, 'City').fill('Saved draft city');
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await request.get(`${fixtureOrigin}/fixture/setup-snapshot`)).json()).draft.profile
          .city
    )
    .toBe('Saved draft city');
  await page.reload();
  await expect(field(page, 'City')).toHaveValue('Saved draft city');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await expect(field(page, 'City')).toHaveValue('Saved draft city');
});
test('already completed institutes log in to the dashboard and cannot reopen setup', async ({
  page,
  request,
}) => {
  await request.post(fixture, { data: { setupCompleted: true } });
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/initial-setup');
  await expect(page).toHaveURL(/\/dashboard$/);
});
test('users without setup permission receive the setup-pending screen', async ({
  page,
  request,
}) => {
  await request.post(fixture, { data: { canSetup: false } });
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await expect(
    page.getByRole('heading', { name: 'Your institute is getting ready' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get started' })).toHaveCount(0);
});

async function verifyAcademicOnboarding(page: import('@playwright/test').Page) {
  const lookupRequests: string[] = [];
  page.on('request', (outgoing) => {
    if (/\/api\/app\/(shift-management|room)(?:\?|$)/.test(outgoing.url()))
      lookupRequests.push(outgoing.url());
  });
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByRole('button', { name: 'Save and continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Start with your academic year' })).toBeVisible();
  await field(page, 'Academic year name').fill('2026-2027');
  const start = page.getByRole('group', { name: 'Start date', exact: true });
  await start.getByRole('spinbutton', { name: 'Month', exact: true }).fill('06');
  await start.getByRole('spinbutton', { name: 'Day', exact: true }).fill('01');
  await start.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2026');
  const end = page.getByRole('group', { name: 'End date', exact: true });
  await end.getByRole('spinbutton', { name: 'Month', exact: true }).fill('05');
  await end.getByRole('spinbutton', { name: 'Day', exact: true }).fill('31');
  await end.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2027');
  await page.getByRole('button', { name: 'Save and continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Build your academic foundation' })).toBeVisible();
  await expect(field(page, 'Room number')).toHaveCount(0);
  await field(page, 'Board').click();
  await page.getByRole('option', { name: 'CBSE', exact: true }).click();
  await field(page, 'Medium').fill('English');
  await field(page, 'Stage').fill('Primary');
  await field(page, 'Class name').fill('Class 1');
  await field(page, 'Minimum age').fill('6');
  await field(page, 'Division name').fill('A');
  await field(page, 'Division capacity').fill('30');
  const structureRequest = page.waitForRequest(
    (outgoing) =>
      outgoing.url().endsWith('/api/institute-setup/initial/structure') &&
      outgoing.method() === 'PUT'
  );
  await page.getByRole('button', { name: 'Save and continue', exact: true }).click();
  expect((await structureRequest).postDataJSON().draft).not.toHaveProperty('roomNumber');
  await expect(page.getByRole('heading', { name: 'Bring your team on board' })).toBeVisible();
  await page
    .getByRole('button', { name: 'Configure more classes and divisions', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Academic structure', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Academic hierarchy', exact: true })).toHaveCount(
    0
  );
  await expect(
    page.getByRole('button', { name: 'Academic structure information', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add board', exact: true }).click();
  await field(page, 'Board Name').click();
  await expect(page.getByRole('option', { name: /CBSE.*Already added/ })).toBeDisabled();
  await expect(page.getByRole('option', { name: 'GSEB', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'ICSE', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'IB', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'State Board', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'IGCSE', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: /^Search Board Name/ }).fill('gseb');
  await expect(page.getByRole('option', { name: 'ICSE', exact: true })).toHaveCount(0);
  await page.getByRole('option', { name: 'GSEB', exact: true }).click();
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await page.getByRole('button', { name: 'Add board', exact: true }).click();
  await expect(field(page, 'Board Name')).not.toContainText('GSEB');
  await field(page, 'Board Name').click();
  await page.getByRole('option', { name: 'GSEB', exact: true }).click();
  await fillBoardDates(page);
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Submit', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Open Board GSEB', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add board', exact: true }).click();
  await field(page, 'Board Name').click();
  await expect(page.getByRole('option', { name: /GSEB.*Already added/ })).toBeDisabled();
  await page.getByRole('option', { name: '+ Add Custom Board', exact: true }).click();
  await field(page, 'Custom board name').fill('Regional Education Council');
  await fillBoardDates(page);
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Submit', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Open Board Regional Education Council', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Open Board CBSE', exact: true }).click();
  await page.getByRole('button', { name: 'Open Medium English', exact: true }).click();
  await page.getByRole('button', { name: 'Open Stage Primary', exact: true }).click();
  await page.getByRole('button', { name: 'Add standard', exact: true }).click();
  await expect(field(page, 'Shift (optional)')).toHaveCount(0);
  await field(page, 'Class Name').fill('Class 2');
  await field(page, 'Limit Of Age').fill('7');
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Submit', exact: true })
    .click();
  const standardRequest = page.waitForRequest(
    (outgoing) => outgoing.url().endsWith('/api/app/standard') && outgoing.method() === 'POST'
  );
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click();
  expect((await standardRequest).postDataJSON()).not.toHaveProperty('shiftId');
  await expect(
    page.getByRole('button', { name: 'Open Standard Class 2', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Open Standard Class 2', exact: true }).click();
  await page.getByRole('button', { name: 'Add division', exact: true }).click();
  await expect(field(page, 'Room (optional)')).toHaveCount(0);
  await field(page, 'Division Name').fill('B');
  await field(page, 'Strength').fill('25');
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Submit', exact: true })
    .click();
  const divisionRequest = page.waitForRequest(
    (outgoing) => outgoing.url().endsWith('/api/app/division') && outgoing.method() === 'POST'
  );
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click();
  const divisionBody = (await divisionRequest).postDataJSON();
  expect(divisionBody).not.toHaveProperty('roomId');
  expect(divisionBody).not.toHaveProperty('roomNumber');
  await expect(page.getByRole('button', { name: 'Open Division B', exact: true })).toBeVisible();
  expect(lookupRequests).toEqual([]);
  await page.getByRole('button', { name: 'Back to setup', exact: true }).click();
}

test('onboarding board options, standard, division and header regressions', async ({ page }) => {
  await verifyAcademicOnboarding(page);
});

test('academic setup and staff creation finish the guided flow and preserve completed login', async ({
  page,
  request,
}) => {
  await verifyAcademicOnboarding(page);
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
  await field(page, 'User name').fill('teacher.one');
  await field(page, 'Email').fill('teacher@example.test');
  await field(page, 'Initial password').fill('Fixture-Staff-29!');
  await field(page, 'Roles').click();
  await page.getByRole('option', { name: 'Teacher', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('teacher.one', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save and continue', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Everything ready for your school' })
  ).toBeVisible();
  const userToast = page
    .getByRole('region', { name: 'Notifications alt+T' })
    .getByRole('alert')
    .filter({ hasText: 'User added' });
  if (await userToast.isVisible()) {
    await userToast.getByRole('button', { name: 'Close', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Finish setup', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const snapshot = await (await request.get(`${fixtureOrigin}/fixture/setup-snapshot`)).json();
  expect(snapshot.isCompleted).toBe(true);
  expect(snapshot.createdUsers).toHaveLength(1);
  expect(JSON.stringify(snapshot)).not.toContain('Fixture-Staff-29!');
  await expect
    .poll(async () => {
      const persisted = await page.evaluate(() => localStorage.getItem('persist:root'));
      return persisted ? JSON.parse(JSON.parse(persisted).globalState).currentYear.id : null;
    })
    .toBe(snapshot.academicYearId);
  await page.goto('/initial-setup');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('mobile setup saves and exits, then resumes the institute profile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await field(page, 'City').fill('Mobile saved city');
  await page.getByRole('button', { name: 'Save and exit', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('School Code', { exact: true }).fill('SCHOOL_01');
  await page.getByLabel('Email / Username', { exact: true }).fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('Fixture-Password-29!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/initial-setup$/);
  await expect(field(page, 'City')).toHaveValue('Mobile saved city');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('a concurrent setup edit retains entered values until explicit reload', async ({
  page,
  request,
}) => {
  await login(page, 'SCHOOL_01');
  await expect(page).toHaveURL(/\/initial-setup$/);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await request.post(`${fixtureOrigin}/fixture/setup-conflict`);
  await field(page, 'City').fill('My retained city');
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Another administrator changed this setup' })
  ).toBeVisible();
  await expect(field(page, 'City')).toHaveValue('My retained city');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reload', exact: true }).click();
  await expect(field(page, 'City')).toHaveValue('Changed by another administrator');
});

test('setup keeps its chrome fixed and supports day-first dates with month and year selection', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  await login(page, 'SCHOOL_01');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  const body = page.getByRole('main', { name: 'Setup content' });
  const footer = page.getByRole('contentinfo');
  const before = await footer.boundingBox();
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await footer.boundingBox()).toEqual(before);
  expect((await page.getByRole('banner').boundingBox())?.y).toBe(0);
  const next = page.getByRole('button', { name: 'Save and continue', exact: true });
  expect((await next.boundingBox())?.height).toBeLessThanOrEqual(36);
  await next.click();
  await expect(page.getByRole('heading', { name: 'Start with your academic year' })).toBeVisible();
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
  const start = page.getByRole('group', { name: 'Start date', exact: true });
  await expect(start.getByRole('spinbutton').first()).toHaveAccessibleName('Day');
  await start.getByRole('spinbutton', { name: 'Day', exact: true }).fill('01');
  await start.getByRole('spinbutton', { name: 'Month', exact: true }).fill('06');
  await start.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2026');
  await start.getByRole('button', { name: /Choose date/ }).click();
  await page.getByRole('button', { name: 'Choose month', exact: true }).click();
  await page.getByRole('radio', { name: 'March', exact: true }).click();
  await page.getByRole('button', { name: 'Choose year', exact: true }).click();
  await page.getByRole('radio', { name: '2027', exact: true }).click();
  await page.getByRole('radio', { name: 'April', exact: true }).click();
  await page.getByRole('gridcell', { name: '15', exact: true }).click();
  await expect(start.getByRole('spinbutton', { name: 'Day', exact: true })).toHaveText('15');
  await expect(start.getByRole('spinbutton', { name: 'Month', exact: true })).toHaveText('04');
  await expect(start.getByRole('spinbutton', { name: 'Year', exact: true })).toHaveText('2027');
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await request.get(`${fixtureOrigin}/fixture/setup-snapshot`)).json()).draft
          .startDate
    )
    .toBe('2027-04-15T00:00:00Z');
});

test('setup motion preserves focus and saved values and honors reduced motion', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'SCHOOL_01');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  const heading = page.getByRole('heading', { name: 'Make it your institute' });
  await expect(heading).toBeFocused();
  const body = page.getByRole('main', { name: 'Setup content' });
  expect(
    await body
      .locator('section')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName)
  ).not.toBe('none');
  await field(page, 'City').fill('Motion saved city');
  await expect(field(page, 'City')).toBeFocused();
  await page.getByRole('button', { name: 'Save progress', exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await request.get(`${fixtureOrigin}/fixture/setup-snapshot`)).json()).draft.profile
          .city
    )
    .toBe('Motion saved city');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      body
        .locator('section, [data-setup-heading]')
        .evaluateAll((elements) =>
          elements.every((element) => getComputedStyle(element).animationName === 'none')
        )
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(heading).toBeFocused();
  await expect(field(page, 'City')).toHaveValue('Motion saved city');
  expect(
    await body
      .locator('section')
      .first()
      .evaluate((element) => getComputedStyle(element).transform)
  ).toBe('none');
  expect(
    await page
      .getByRole('progressbar', { name: 'Setup progress' })
      .evaluate((element) => getComputedStyle(element.firstElementChild!).transitionDuration)
  ).toBe('0s');
});
