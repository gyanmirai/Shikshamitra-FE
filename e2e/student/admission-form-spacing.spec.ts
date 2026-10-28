/* eslint-disable no-await-in-loop, no-restricted-syntax -- Sequential geometry checks after each feedback transition. */
import { test, expect } from '@playwright/test';

for (const columns of [2, 3, 4]) {
  test(`keeps Aadhaar and PAN distinct and legible in ${columns}-column previews`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto(`/?columns=${columns}`);
    const controls = page.locator('[data-identity-field] [data-input-otp-container]');
    await expect(controls).toHaveCount(2);
    for (const control of await controls.all()) {
      const geometry = await control.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const slots = [...element.querySelectorAll('div')].filter(
          (child) =>
            child.children.length === 0 && getComputedStyle(child).borderTopStyle === 'solid'
        );
        return {
          minWidth: Math.min(...slots.map((slot) => slot.getBoundingClientRect().width)),
          contained: slots.every((slot) => {
            const bounds = slot.getBoundingClientRect();
            return bounds.left >= rect.left - 1 && bounds.right <= rect.right + 1;
          }),
        };
      });
      expect(geometry.minWidth).toBeGreaterThanOrEqual(24);
      expect(geometry.contained).toBeTruthy();
    }
  });
}

for (const width of [1440, 768, 390]) {
  for (const theme of ['light', 'dark']) {
    test(`equal input row pitch with empty, help and validation at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
      await page.goto(`/?theme=${theme}`);
      const pitch = () =>
        page.locator('[data-field]').evaluateAll((elements) => {
          const tops = elements.map(
            (element) =>
              element
                .querySelector('.MuiInputBase-root, .MuiPickersInputBase-root')!
                .getBoundingClientRect().top
          );
          const rows = [...new Set(tops.map((top) => Math.round(top)))];
          return rows.slice(1).map((top, index) => top - rows[index]);
        });
      const expectEvenRows = async () =>
        expect
          .poll(async () => {
            const gaps = await pitch();
            return Math.max(...gaps) - Math.min(...gaps);
          })
          .toBeLessThanOrEqual(1);
      await expectEvenRows();
      const original = await pitch();
      // A 40px small control plus one compact 28px field gap. Feedback is
      // included in that gap; it must not add another 24px of blank space.
      expect(Math.max(...original)).toBeLessThanOrEqual(68);
      const compositeDistance = () =>
        page
          .getByTestId('after-composite')
          .evaluate(
            (element) =>
              element.getBoundingClientRect().top -
              document.querySelector('[data-testid="composite-field"]')!.getBoundingClientRect().top
          );
      const originalCompositeDistance = await compositeDistance();
      for (const feedback of ['help', 'error', 'long', 'empty']) {
        await page.getByRole('button', { name: feedback, exact: true }).click();
        await expectEvenRows();
        await expect
          .poll(() =>
            page.locator('[data-field]').evaluateAll((elements) => {
              const controls = elements.map((element) => ({
                element,
                rect: element
                  .querySelector('.MuiInputBase-root, .MuiPickersInputBase-root')!
                  .getBoundingClientRect(),
              }));
              return controls.every(({ element, rect }) => {
                const message = element.querySelector('.MuiFormHelperText-root');
                const next = controls.find(
                  (control) =>
                    control.rect.top > rect.top + 1 && Math.abs(control.rect.left - rect.left) < 1
                );
                if (!message || !next) return true;
                const label = next.element.querySelector('.MuiInputLabel-root');
                return (
                  message.getBoundingClientRect().bottom <=
                  (label ?? next.element).getBoundingClientRect().top + 1
                );
              });
            })
          )
          .toBeTruthy();
        if (feedback !== 'long') {
          await expect.poll(pitch).toEqual(original);
          await expect.poll(compositeDistance).toBeCloseTo(originalCompositeDistance, 0);
        } else {
          const message = page.getByText('Preferred class must match', { exact: false });
          await expect(message).toBeVisible();
          expect(
            await message.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
          ).toBeTruthy();
          const messageBox = (await message.boundingBox())!;
          const nextInput = page.locator('[data-field="Class"] .MuiInputBase-root');
          expect((await nextInput.boundingBox())!.y).toBeGreaterThan(
            messageBox.y + messageBox.height
          );
        }
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
    });
  }
}
