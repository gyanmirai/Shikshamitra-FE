/* eslint-disable import/extensions -- Vite and Playwright share the executable .mjs fixture. */
import type { Page, APIRequestContext } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import {
  hrNames,
  mappedNames,
  payrollNames,
  academicNames,
  eligibleNames,
  settingsNames,
  runPayrollNames,
} from '../fixtures/permission-bulk/catalogue.mjs';

type PermissionWrite = {
  provider: string;
  key: string;
  permissions: { name: string; state?: string; isGranted?: boolean }[];
};

test.beforeEach(async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) =>
    route.fulfill({ json: { icons: {} } })
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

async function openActions(page: Page, target = 'Role HOD') {
  await page.getByRole('button', { name: `${target} Module Permission`, exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'All modules permissions', exact: true })
  ).toBeVisible();
}

async function selectPayroll(page: Page) {
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
  await expect(page.getByTestId('permission-Run Payroll')).toBeVisible();
}

async function bulk(
  page: Page,
  scope: string,
  action: 'Grant all' | 'Revoke all' | 'Follow role',
  keyboard = false
) {
  const button = page
    .getByRole('group', { name: `${scope} permissions`, exact: true })
    .getByRole('button', { name: `${action} ${scope} permissions`, exact: true });
  if (keyboard) {
    await button.focus();
    await expect(button).toBeFocused();
    await button.press('Enter');
  } else await button.click();
}

async function save(page: Page) {
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function expectStickyRowActions(page: Page, user: boolean) {
  const table = page.getByRole('table', { name: 'Permissions table', exact: true });
  const header = table.getByRole('columnheader', { name: 'Bulk actions', exact: true });
  const row = table.getByTestId('permission-Run Payroll');
  const featureCell = row.getByRole('cell').first();
  const bulkCell = row.getByRole('cell').last();
  const view = row.getByRole('group', { name: 'Run Payroll View editor', exact: true });
  await expect(featureCell).toHaveText('Run Payroll');
  await expect(featureCell.getByRole('button', { name: /(?:Grant|Revoke) all/ })).toHaveCount(0);
  await expect(
    bulkCell.getByRole('group', { name: 'Run Payroll permissions', exact: true })
  ).toBeVisible();
  await expect(header).toBeInViewport();
  const verticalScroll = await table.evaluate((element) => {
    const scroll = element.closest<HTMLElement>('.simplebar-content-wrapper')!;
    scroll.scrollTop = Math.min(96, scroll.scrollHeight - scroll.clientHeight);
    return scroll.scrollTop;
  });
  expect(verticalScroll).toBeGreaterThan(0);
  await Promise.all(
    [header, table.getByRole('columnheader', { name: 'View', exact: true })].map(
      async (heading) => {
        await expect(heading).toBeInViewport();
        await expect
          .poll(() =>
            heading.evaluate((element) => {
              const bounds = element.getBoundingClientRect();
              return element.contains(
                document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
              );
            })
          )
          .toBe(true);
      }
    )
  );
  await table.evaluate((element) => {
    element.closest<HTMLElement>('.simplebar-content-wrapper')!.scrollTop = 0;
  });
  const before = {
    headerX: (await header.boundingBox())!.x,
    featureX: (await featureCell.boundingBox())!.x,
    bulkX: (await bulkCell.boundingBox())!.x,
    actionX: await view.evaluate((element) => element.closest('td')!.getBoundingClientRect().x),
  };
  const scrollDistance = await table.evaluate((element) => {
    const scroll = element.closest<HTMLElement>('.simplebar-content-wrapper')!;
    scroll.scrollLeft = scroll.scrollWidth - scroll.clientWidth;
    return scroll.scrollLeft;
  });
  expect(scrollDistance).toBeGreaterThan(100);
  await expect.poll(async () => (await header.boundingBox())!.x).toBeCloseTo(before.headerX, 0);
  await expect
    .poll(async () => (await featureCell.boundingBox())!.x)
    .toBeCloseTo(before.featureX, 0);
  await expect.poll(async () => (await bulkCell.boundingBox())!.x).toBeCloseTo(before.bulkX, 0);
  expect(
    await view.evaluate((element) => element.closest('td')!.getBoundingClientRect().x)
  ).toBeLessThan(before.actionX - 100);
  await expect(bulkCell).toBeInViewport();
  await expect(featureCell).toBeInViewport();
  await bulk(page, 'Run Payroll', 'Revoke all');
  await expect(
    view.getByRole('radio', { name: user ? 'Deny' : 'Revoke', exact: true })
  ).toBeChecked();
  await expect(
    table
      .getByRole('group', { name: 'Overview View editor', exact: true })
      .getByRole('radio', { name: user ? 'Follow role' : 'Allow', exact: true })
  ).toBeChecked();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review permission changes', exact: true });
  await expect(review).toContainText(`${runPayrollNames.length} permission changes`);
  await Promise.all(
    runPayrollNames.map((name) => expect(review.getByText(name, { exact: true })).toBeVisible())
  );
  await review.getByRole('button', { name: 'Back to editing', exact: true }).click();
  await bulk(page, 'Run Payroll', 'Grant all');
  await expect(view.getByRole('radio', { name: 'Allow', exact: true })).toBeChecked();
  if (user) await bulk(page, 'Run Payroll', 'Follow role');
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  await table.evaluate((element) => {
    element.closest<HTMLElement>('.simplebar-content-wrapper')!.scrollLeft = 0;
  });
}

async function expectUserTableBreakpoint(page: Page) {
  const originalViewport = page.viewportSize()!;
  await page.setViewportSize({ width: 900, height: originalViewport.height });
  const cards = page.getByTestId('permission-matrix-mobile');
  await expect(cards).toBeVisible();
  const row = cards.getByTestId('permission-Run Payroll');
  const radio = row
    .getByRole('group', { name: 'Run Payroll View editor', exact: true })
    .getByRole('radio', { name: 'Follow role', exact: true });
  expect(
    await radio.evaluate((element) => element.closest('label')!.getBoundingClientRect().height)
  ).toBe(44);
  await Promise.all(
    ['Grant all', 'Revoke all', 'Follow role'].map(async (action) => {
      const button = row.getByRole('button', {
        name: `${action} Run Payroll permissions`,
        exact: true,
      });
      expect((await button.boundingBox())!.height).toBe(44);
    })
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.setViewportSize({ width: 1200, height: originalViewport.height });
  const table = page.getByRole('table', { name: 'Permissions table', exact: true });
  await expect(table).toBeVisible();
  const tableRow = table.getByTestId('permission-Run Payroll');
  const featureBounds = (await tableRow.getByRole('cell').first().boundingBox())!;
  const bulkBounds = (await tableRow.getByRole('cell').last().boundingBox())!;
  const editorBounds = (await tableRow
    .getByRole('group', {
      name: 'Run Payroll View editor',
      exact: true,
    })
    .boundingBox())!;
  expect(editorBounds.x).toBeGreaterThanOrEqual(featureBounds.x + featureBounds.width);
  expect(editorBounds.x + editorBounds.width).toBeLessThanOrEqual(bulkBounds.x);
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  await page.setViewportSize(originalViewport);
}

async function expectWrite(
  request: APIRequestContext,
  index: number,
  provider: string,
  scope: string[],
  state: string
) {
  const writes = (await (await request.get('/fixture/writes')).json()) as PermissionWrite[];
  expect(writes).toHaveLength(index + 1);
  expect(writes[index]).toEqual({
    provider,
    key: provider === 'R' ? 'HOD' : 'synthetic-user',
    permissions: expect.any(Array),
  });
  expect(writes[index].permissions.toSorted((a, b) => a.name.localeCompare(b.name))).toEqual(
    eligibleNames(scope, provider)
      .map((name: string) => ({
        name,
        ...(provider === 'R' ? { isGranted: state === 'allow' } : { state }),
      }))
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
  );
}

test('role module grant and revoke save only eligible action permissions across submodules', async ({
  page,
  request,
}) => {
  await openActions(page);
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'HR/Staff', exact: true })).toBeVisible();
  const allowBackground = await page
    .getByRole('group', { name: 'Run Payroll View editor', exact: true })
    .getByRole('radio', { name: 'Allow', exact: true })
    .evaluate((radio) => getComputedStyle(radio.closest('label')!).backgroundColor);
  expect(allowBackground).toMatch(/,\s*0\.12\)$/);
  await bulk(page, 'HR/Staff', 'Revoke all');
  await save(page);
  await expectWrite(request, 0, 'R', hrNames, 'inherit');
  await openActions(page);
  await selectPayroll(page);
  const revoke = page
    .getByRole('group', { name: 'Run Payroll View editor', exact: true })
    .getByRole('radio', { name: 'Revoke', exact: true });
  await expect(revoke).toBeChecked();
  const revokeStyle = await revoke.evaluate((radio) => {
    const style = getComputedStyle(radio.closest('label')!);
    return {
      background: style.backgroundColor,
      errorChannel: style.getPropertyValue('--palette-error-mainChannel').trim(),
    };
  });
  expect(revokeStyle.background).toBe(
    `rgba(${revokeStyle.errorChannel.split(/\s+/).join(', ')}, 0.12)`
  );
  expect(revokeStyle.background).not.toBe(allowBackground);
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await bulk(page, 'HR/Staff', 'Grant all');
  await save(page);
  await expectWrite(request, 1, 'R', hrNames, 'allow');
});

test('submodule bulk includes filtered and collapsed descendants without editing other submodules', async ({
  page,
  request,
}) => {
  await openActions(page);
  await selectPayroll(page);
  await page.getByRole('button', { name: 'Collapse Settings', exact: true }).click();
  await expect(page.getByTestId('permission-Earning Component')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search permissions' }).fill('Run Payroll');
  await bulk(page, 'Payroll Management', 'Revoke all');
  await save(page);
  await expectWrite(request, 0, 'R', payrollNames, 'inherit');
  await openActions(page);
  await selectPayroll(page);
  await expect(
    page
      .getByRole('group', { name: 'Earning Component View editor', exact: true })
      .getByRole('radio', { name: 'Revoke', exact: true })
  ).toBeChecked();
  await bulk(page, 'Payroll Management', 'Grant all');
  await save(page);
  await expectWrite(request, 1, 'R', payrollNames, 'allow');
});

test('nested group and feature bulk controls have exact role boundaries', async ({
  page,
  request,
}) => {
  await openActions(page);
  await selectPayroll(page);
  await page.getByRole('button', { name: 'Collapse Settings', exact: true }).click();
  await bulk(page, 'Settings', 'Revoke all');
  await save(page);
  await expectWrite(request, 0, 'R', settingsNames, 'inherit');
  await openActions(page);
  await selectPayroll(page);
  await bulk(page, 'Run Payroll', 'Revoke all');
  await save(page);
  await expectWrite(request, 1, 'R', runPayrollNames, 'inherit');
});

test('user bulk Allow, Deny and Follow role persist at all-module and module scopes', async ({
  page,
  request,
}) => {
  await openActions(page, 'User');
  await bulk(page, 'All modules', 'Grant all', true);
  await save(page);
  await expectWrite(request, 0, 'U', mappedNames, 'allow');
  await openActions(page, 'User');
  await selectPayroll(page);
  await expect(
    page
      .getByRole('group', { name: 'Run Payroll View editor', exact: true })
      .getByRole('radio', { name: 'Allow', exact: true })
  ).toBeChecked();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await bulk(page, 'HR/Staff', 'Revoke all', true);
  await save(page);
  await expectWrite(request, 1, 'U', hrNames, 'deny');
  await openActions(page, 'User');
  await selectPayroll(page);
  await expect(
    page
      .getByRole('group', { name: 'Run Payroll View editor', exact: true })
      .getByRole('radio', { name: 'Deny', exact: true })
  ).toBeChecked();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await bulk(page, 'HR/Staff', 'Follow role', true);
  await save(page);
  await expectWrite(request, 2, 'U', hrNames, 'inherit');
  await openActions(page, 'User');
  await selectPayroll(page);
  await expect(
    page
      .getByRole('group', { name: 'Run Payroll View editor', exact: true })
      .getByRole('radio', { name: 'Follow role', exact: true })
  ).toBeChecked();
  await bulk(page, 'All modules', 'Follow role');
  await save(page);
  await expectWrite(request, 3, 'U', academicNames, 'inherit');
});

test('user submodule revoke ignores filters and feature Follow role restores inherited access', async ({
  page,
  request,
}) => {
  await openActions(page, 'User');
  await selectPayroll(page);
  await page.getByRole('button', { name: 'Collapse Settings', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Overrides only' }).check();
  await expect(page.getByText('No matching permissions', { exact: true })).toBeVisible();
  await bulk(page, 'Payroll Management', 'Revoke all');
  await save(page);
  await expectWrite(request, 0, 'U', payrollNames, 'deny');
  await openActions(page, 'User');
  await selectPayroll(page);
  await bulk(page, 'Run Payroll', 'Follow role');
  await save(page);
  await expectWrite(request, 1, 'U', runPayrollNames, 'inherit');
  await openActions(page, 'User');
  await selectPayroll(page);
  await bulk(page, 'Settings', 'Grant all');
  await save(page);
  await expectWrite(request, 2, 'U', settingsNames, 'allow');
});

test('bulk actions and permission details remain readable and accessible in both themes', async ({
  page,
  request,
}, testInfo) => {
  await ['light', 'dark'].reduce(async (previousTheme, theme) => {
    await previousTheme;
    if (theme === 'dark')
      await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
    await ['Role HOD', 'User'].reduce(async (previousTarget, target) => {
      await previousTarget;
      await openActions(page, target);
      await selectPayroll(page);
      const dialog = page.getByRole('dialog');
      const actions = dialog.getByRole('group', {
        name: 'Payroll Management permissions',
        exact: true,
      });
      const segmentHeight = await dialog
        .getByRole('group', { name: 'Run Payroll View editor', exact: true })
        .getByRole('radio', { name: 'Allow', exact: true })
        .evaluate((radio) => radio.closest('label')!.getBoundingClientRect().height);
      await expect(actions).toBeInViewport();
      await Promise.all(
        ['Grant all', 'Revoke all', ...(target === 'User' ? ['Follow role'] : [])].map(
          async (action) => {
            const button = actions.getByRole('button', {
              name: `${action} Payroll Management permissions`,
              exact: true,
            });
            await expect(button).toBeInViewport();
            await expect(button).toHaveCSS('font-weight', '400');
            await expect(button).toHaveCSS('font-size', '12px');
            expect((await button.boundingBox())!.height).toBeCloseTo(segmentHeight, 0);
          }
        )
      );
      if (page.viewportSize()!.width >= 1200) await expectStickyRowActions(page, target === 'User');
      if (target === 'Role HOD') {
        const viewEditor = dialog.getByRole('group', {
          name: 'Run Payroll View editor',
          exact: true,
        });
        await expect(viewEditor.getByRole('radiogroup')).toHaveAccessibleDescription(
          /^Allowed\. Direct grant\./
        );
        await expect(viewEditor.getByText(/^Allowed\. Direct grant\./)).toBeHidden();
        await viewEditor.getByRole('radio', { name: 'Allow', exact: true }).hover();
        await expect(page.getByRole('tooltip')).toContainText('Allowed. Direct grant.');
        await page.mouse.move(0, 0);
        await expect(page.getByRole('tooltip')).toHaveCount(0);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await expect(
        page.getByRole('button', { name: 'Review changes', exact: true })
      ).toBeInViewport();
      expect(
        (
          await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze()
        ).violations
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${target === 'User' ? 'user' : 'role'}-payroll-${theme}.png`),
      });
      if (page.viewportSize()!.width < 1200) {
        const details = page.getByRole('region', { name: 'Permission details', exact: true });
        const overview = details.getByTestId('permission-Overview');
        await details.evaluate((element) => {
          const row = element.querySelector('[data-testid="permission-Overview"]')!;
          element.scrollTop +=
            row.getBoundingClientRect().top - element.getBoundingClientRect().top;
        });
        await expect(overview.getByText('Overview', { exact: true })).toBeInViewport();
        const viewEditor = overview.getByRole('group', {
          name: 'Overview View editor',
          exact: true,
        });
        const panelBounds = (await details.boundingBox())!;
        const editorBounds = (await viewEditor.boundingBox())!;
        expect(editorBounds.y).toBeGreaterThanOrEqual(panelBounds.y);
        expect(editorBounds.y + editorBounds.height).toBeLessThanOrEqual(
          panelBounds.y + panelBounds.height
        );
        expect(await details.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
        await expect(
          page.getByRole('button', { name: 'Review changes', exact: true })
        ).toBeInViewport();
        await page.screenshot({
          path: testInfo.outputPath(
            `${target === 'User' ? 'user' : 'role'}-payroll-${theme}-scrolled.png`
          ),
        });
      }
      if (target === 'User' && theme === 'light' && page.viewportSize()!.width >= 1200)
        await expectUserTableBreakpoint(page);
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }, Promise.resolve());
  }, Promise.resolve());
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});

test('module and nested feature hierarchy remains readable without changing grants', async ({
  page,
  request,
}) => {
  await openActions(page);
  await page.getByRole('button', { name: 'Academics', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const calendar = dialog.getByRole('button', { name: 'Collapse Academic Calendar', exact: true });
  const curriculum = dialog.getByRole('button', { name: 'Collapse Curriculum', exact: true });
  const settings = dialog.getByRole('button', { name: 'Collapse Settings', exact: true }).first();
  const subject = dialog
    .getByTestId('permission-Subjects Creation')
    .getByText('Subjects Creation', { exact: true });
  const siblingIcons = await Promise.all(
    [calendar, curriculum].map(async (button) =>
      button.locator('.MuiButton-startIcon').evaluate((icon) => icon.getBoundingClientRect().x)
    )
  );
  expect(siblingIcons[0]).toBeCloseTo(siblingIcons[1], 0);
  const textPositions = await Promise.all(
    [
      { locator: curriculum, text: 'Curriculum' },
      { locator: settings, text: 'Settings' },
      { locator: subject, text: 'Subjects Creation' },
    ].map(({ locator, text }) =>
      locator.evaluate((element, label) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node && node.textContent?.trim() !== label) node = walker.nextNode();
        if (!node) throw new Error(`Missing hierarchy label: ${label}`);
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().x;
      }, text)
    )
  );
  expect(textPositions[1]).toBeGreaterThan(textPositions[0]);
  expect(textPositions[2]).toBeGreaterThan(textPositions[1]);
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  await settings.click();
  await expect(dialog.getByTestId('permission-Subjects Creation')).toHaveCount(0);
  await expect(dialog.getByTestId('permission-Subject Allocation')).toBeAttached();
  await dialog.getByRole('button', { name: 'Expand Settings', exact: true }).first().click();
  await expect(subject).toBeAttached();
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});
