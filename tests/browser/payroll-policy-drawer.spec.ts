/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { test, expect } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const optionNames = ['Working Days', 'Total Month Days', 'Manual Days'];

for (const theme of ['light', 'dark']) {
  for (const viewport of viewports) {
    test(`payroll option cards stay contained and selectable at ${viewport.width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize(viewport);
      await page.goto(`/?surface=payroll&theme=${theme}`);
      await page.getByRole('button', { name: 'Edit Synthetic payroll', exact: true }).click();
      const group = page.getByRole('radiogroup', { name: 'Payroll day calculation' });
      const cards = group.locator('label');
      await expect(cards).toHaveCount(3);

      // A label must paint one complete card around its radio, title and description.
      // Inline labels fragment into several border boxes around these block descendants.
      for (const card of await cards.all()) {
        expect(await card.evaluate((element) => element.getClientRects().length)).toBe(1);
        const bounds = await card.evaluate((element) => {
          const outer = element.getBoundingClientRect();
          return {
            width: outer.width,
            height: outer.height,
            containsContent: Array.from(
              element.querySelectorAll('input, .MuiTypography-root')
            ).every((child) => {
              const inner = child.getBoundingClientRect();
              return (
                inner.left >= outer.left &&
                inner.right <= outer.right &&
                inner.top >= outer.top &&
                inner.bottom <= outer.bottom
              );
            }),
          };
        });
        expect(bounds.width).toBeGreaterThan(180);
        expect(bounds.height).toBeGreaterThanOrEqual(84);
        expect(bounds.containsContent).toBe(true);
      }

      const boxes = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { x: rect.x, y: rect.y, height: rect.height };
        })
      );
      if (viewport.width < 600) {
        expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
        expect(boxes[2].y).toBeGreaterThanOrEqual(boxes[1].y + boxes[1].height);
      } else {
        expect(boxes[1].y).toBe(boxes[0].y);
        expect(boxes[2].y).toBe(boxes[0].y);
        expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
      }

      for (const name of optionNames) {
        const card = cards.filter({ has: page.getByRole('radio', { name, exact: true }) });
        // Click the card padding as well as its text, rather than only the tiny radio.
        await card.click({ position: { x: 5, y: 5 } });
        await expect(page.getByRole('radio', { name, exact: true })).toBeChecked();
        await expect(group.locator('input:checked')).toHaveCount(1);
      }
      await page.getByRole('button', { name: 'Copy calendar days', exact: true }).click();
      await expect(
        page.getByRole('spinbutton', { name: 'Payroll basis days for Apr 2026' })
      ).toHaveValue('30');
      await page.getByRole('radio', { name: 'Manual Days', exact: true }).press('ArrowLeft');
      await expect(
        page.getByRole('radio', { name: 'Total Month Days', exact: true })
      ).toBeChecked();
      await page.getByRole('radio', { name: 'Total Month Days', exact: true }).press('ArrowLeft');
      await expect(page.getByRole('radio', { name: 'Working Days', exact: true })).toBeChecked();
      await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({ path: info.outputPath(`payroll-${theme}-${viewport.width}.png`) });
    });
  }
}
