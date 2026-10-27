/* eslint-disable no-await-in-loop, no-restricted-syntax -- Sequential geometry checks after each feedback transition. */
import { test, expect } from '@playwright/test';

for (const width of [1440, 768, 390]) {
  for (const theme of ['light', 'dark']) {
    test(`equal input row pitch with empty, help and validation at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
      await page.goto(`/?theme=${theme}`);
      const pitch = () => page.locator('[data-field]').evaluateAll((elements) => {
        const tops = elements.map((element) => element.querySelector('.MuiInputBase-root, .MuiPickersInputBase-root')!.getBoundingClientRect().top);
        const rows = [...new Set(tops.map((top) => Math.round(top)))];
        return rows.slice(1).map((top, index) => top - rows[index]);
      });
      const expectEvenRows = async () => expect.poll(async () => {
        const gaps = await pitch();
        return Math.max(...gaps) - Math.min(...gaps);
      }).toBeLessThanOrEqual(1);
      await expectEvenRows();
      const original = await pitch();
      for (const feedback of ['help', 'error', 'long', 'empty']) {
        await page.getByRole('button', { name: feedback, exact: true }).click();
        await expectEvenRows();
        if (feedback !== 'long') {
          await expect.poll(pitch).toEqual(original);
        } else {
          const message = page.getByText('Preferred class must match', { exact: false });
          await expect(message).toBeVisible();
          expect(await message.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBeTruthy();
          const messageBox = (await message.boundingBox())!;
          const nextInput = page.locator('[data-field="Class"] .MuiInputBase-root');
          expect((await nextInput.boundingBox())!.y).toBeGreaterThan(messageBox.y + messageBox.height);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    });
  }
}
