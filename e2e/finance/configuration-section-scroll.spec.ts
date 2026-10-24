/* eslint-disable import/no-extraneous-dependencies -- Playwright is a test dependency. */
import { test, expect, type Page, type Locator } from '@playwright/test';

async function revealSection(heading: Locator) {
  await heading.evaluate((element) => {
    let parent = element.parentElement;
    while (parent) {
      if (
        parent.scrollHeight > parent.clientHeight + 1 &&
        ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
      ) {
        parent.scrollTop +=
          element.getBoundingClientRect().top - parent.getBoundingClientRect().top - 16;
        return;
      }
      parent = parent.parentElement;
    }
  });
}

async function bounds(items: Locator[]) {
  return Promise.all(
    items.map(async (item) => {
      await expect(item).toBeVisible();
      const rect = await item.boundingBox();
      expect(rect).not.toBeNull();
      return rect!;
    })
  );
}

async function verifyIndependentScroll(page: Page, region: Locator, controls: Locator[]) {
  const before = await bounds(controls);
  const outerBefore = await region.evaluate((element) => {
    const ancestors: number[] = [];
    let parent = element.parentElement;
    while (parent) {
      ancestors.push(parent.scrollTop);
      parent = parent.parentElement;
    }
    return ancestors;
  });
  await expect(region).toHaveCSS('overflow-y', /^(auto|scroll)$/);
  await region.evaluate((element) => {
    element.scrollTop = 0;
  });
  await region.hover();
  await page.mouse.wheel(0, 400);
  await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await region.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const after = await bounds(controls);
  after.forEach((rect, index) => {
    expect(Math.abs(rect.y - before[index].y)).toBeLessThan(1);
    expect(Math.abs(rect.x - before[index].x)).toBeLessThan(1);
  });
  expect(
    await region.evaluate((element) => {
      const ancestors: number[] = [];
      let parent = element.parentElement;
      while (parent) {
        ancestors.push(parent.scrollTop);
        parent = parent.parentElement;
      }
      return ancestors;
    })
  ).toEqual(outerBefore);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  const viewport = page.viewportSize()!;
  after.forEach((rect) => {
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height + 1);
  });
  const regionBounds = (await region.boundingBox())!;
  const footerBounds = after[after.length - 1];
  expect(regionBounds.y + regionBounds.height).toBeLessThanOrEqual(footerBounds.y);
}

[
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
].forEach((viewport) => {
  test(`${viewport.width}px fee heads: internal scrolling preserves controls, footer and expanded state`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4186/?scroll=long', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open create drawer', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Create Proration Policy', exact: true });
    const heading = drawer.getByText('Fee Head Configuration', { exact: true });
    const region = drawer.getByRole('region', { name: 'Configured fee heads', exact: true });
    const search = drawer.getByRole('textbox', { name: 'Search fee heads', exact: true });
    const cancel = drawer.getByRole('button', { name: 'Cancel', exact: true });
    const submit = drawer.getByRole('button', { name: 'Submit', exact: true });
    await expect(region.getByRole('button', { name: /^Configure / })).toHaveCount(36);
    await revealSection(heading);
    await region.getByRole('button', { name: 'Configure Tuition fee', exact: true }).click();
    await expect(
      region.getByRole('button', { name: 'Collapse Tuition fee', exact: true })
    ).toHaveAttribute('aria-expanded', 'true');
    await revealSection(heading);
    await verifyIndependentScroll(page, region, [
      heading,
      search,
      drawer.getByRole('button', { name: 'All Daily', exact: true }),
      cancel,
      submit,
    ]);
    const last = region.getByRole('button', { name: 'Configure Synthetic Fee 36', exact: true });
    await expect(last).toBeInViewport();
    expect((await last.boundingBox())!.y + (await last.boundingBox())!.height).toBeLessThan(
      (await cancel.boundingBox())!.y
    );
    await region.evaluate((element) => {
      element.scrollTop = 0;
    });
    await search.fill('Transport');
    await expect(
      region.getByRole('button', { name: 'Configure Transport fee', exact: true })
    ).toBeVisible();
    await search.fill('Tuition');
    await expect(
      region.getByRole('button', { name: 'Collapse Tuition fee', exact: true })
    ).toHaveAttribute('aria-expanded', 'true');
    await search.clear();
    await revealSection(heading);
    await page.screenshot({ path: testInfo.outputPath('fee-heads.png') });
    await submit.click({ trial: true });
    await cancel.click();
    await expect(drawer).not.toBeVisible();
  });

  test(`${viewport.width}px fee heads: short list stays inside section`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4186/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open create drawer', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Create Proration Policy', exact: true });
    await revealSection(drawer.getByText('Fee Head Configuration', { exact: true }));
    const region = drawer.getByRole('region', { name: 'Configured fee heads', exact: true });
    await expect(region.getByRole('button', { name: /^Configure / })).toHaveCount(2);
    const metrics = await region.evaluate((element) => ({
      height: element.clientHeight,
      content: element.scrollHeight,
    }));
    expect(metrics.height).toBeGreaterThan(0);
    expect(metrics.content).toBeLessThanOrEqual(metrics.height + 1);
    await expect(drawer.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test(`${viewport.width}px installments: list scrolls independently and new row becomes visible`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4185/?scroll=long', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open copied draft', exact: true }).click();
    const drawer = page
      .locator('.MuiDrawer-paper')
      .filter({ has: page.getByText('Installment Schedule', { exact: true }) });
    const heading = drawer.getByText('Installment Schedule', { exact: true });
    const region = drawer.getByRole('region', { name: 'Installments', exact: true });
    await expect(region.getByRole('listitem')).toHaveCount(12);
    await revealSection(heading);
    const apply = drawer.getByRole('button', { name: 'Apply Template', exact: true });
    const add = drawer.getByRole('button', { name: 'Add Installment', exact: true });
    const cancel = drawer.getByRole('button', { name: 'Cancel', exact: true });
    const submit = drawer.getByRole('button', { name: 'Submit', exact: true });
    await verifyIndependentScroll(page, region, [heading, apply, add, cancel, submit]);
    await expect(
      region.getByRole('button', { name: 'Delete installment 12', exact: true })
    ).toBeInViewport();
    await add.click();
    const newName = region.locator('input[name="installments[12].installmentName"]');
    await expect(newName).toBeFocused();
    await expect(newName).toBeInViewport();
    await expect(region.getByRole('listitem')).toHaveCount(13);
    await expect(apply).toBeInViewport();
    await expect(add).toBeInViewport();
    await expect(cancel).toBeInViewport();
    await expect(submit).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('installments.png') });
    await apply.click();
    await expect(
      page.getByRole('dialog', { name: 'Generate Installment Schedule', exact: true })
    ).toBeVisible();
  });

  test(`${viewport.width}px installments: short schedule has no clipped footer or final fields`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4185/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open copied draft', exact: true }).click();
    const drawer = page
      .locator('.MuiDrawer-paper')
      .filter({ has: page.getByText('Installment Schedule', { exact: true }) });
    await revealSection(drawer.getByText('Installment Schedule', { exact: true }));
    const region = drawer.getByRole('region', { name: 'Installments', exact: true });
    await expect(region.getByRole('listitem')).toHaveCount(1);
    await region.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(
      region.getByRole('button', { name: 'Delete installment 1', exact: true })
    ).toBeInViewport();
    const cancel = drawer.getByRole('button', { name: 'Cancel', exact: true });
    await expect(cancel).toBeInViewport();
    await expect(drawer.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await cancel.click();
    await expect(
      page.getByRole('dialog', { name: 'Discard unsaved changes?', exact: true })
    ).toBeVisible();
  });
});
