/* eslint-disable no-await-in-loop, no-restricted-syntax -- Measure each stage only after its sequential browser interaction has settled. */
import { test, expect } from '@playwright/test';

// Geometry regression against the real Scrollbar, SimpleBar stylesheet and photo/field components.
// Synthetic stage bodies isolate layout; this does not certify real backend workflow transitions.
for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`drawer body fills its panel and retains bounded scrolling at ${viewport.width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      const drawer = page.getByRole('dialog', { name: 'Synthetic applicant' });
      const scroll = page.getByTestId('drawer-scrollbar');
      const panel = page.getByTestId('stage-panel');
      await expect(panel).toBeVisible();
      const drawerBox = (await drawer.boundingBox())!;
      for (const stage of [
        'Entrance assessment',
        'Admission form',
        'Document verification',
        'Payment',
        'Admission finalization',
      ]) {
        await page.getByRole('button', { name: stage, exact: true }).click();
        await expect(panel.getByRole('heading', { name: stage })).toBeVisible();
        const panelBox = (await panel.boundingBox())!;
        expect(panelBox.width, `${stage} must fill the drawer body`).toBeGreaterThan(
          drawerBox.width - 40
        );
        expect(panelBox.x).toBeGreaterThanOrEqual(drawerBox.x);
        expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(drawerBox.x + drawerBox.width);
      }
      await page.getByRole('button', { name: 'Admission form', exact: true }).click();
      const photo = page.getByRole('button', { name: 'Choose student profile photo', exact: true });
      const photoBox = (await photo.boundingBox())!;
      const fieldBox = (await page
        .getByRole('textbox', { name: 'First name', exact: true })
        .boundingBox())!;
      const photosBox = (await page.getByLabel('Profile photos', { exact: true }).boundingBox())!;
      expect(photoBox.x).toBeGreaterThanOrEqual(photosBox.x - 1);
      expect(photoBox.x + photoBox.width).toBeLessThanOrEqual(photosBox.x + photosBox.width + 1);
      expect(
        photoBox.y + photoBox.height <= fieldBox.y || photoBox.x + photoBox.width <= fieldBox.x
      ).toBeTruthy();
      await page
        .getByRole('textbox', { name: 'Middle name', exact: true })
        .fill('Unsaved layout check');
      const originalWidth = (await panel.boundingBox())!.width;
      await page.getByRole('checkbox', { name: 'Simulate saving' }).check();
      await expect(page.getByRole('textbox', { name: 'Middle name', exact: true })).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Continue admission', exact: true })
      ).toBeDisabled();
      expect((await panel.boundingBox())!.width).toBeCloseTo(originalWidth, 0);
      await page.getByRole('checkbox', { name: 'Simulate saving' }).uncheck();
      await expect(page.getByRole('textbox', { name: 'Middle name', exact: true })).toHaveValue(
        'Unsaved layout check'
      );
      await page.getByRole('button', { name: 'Focus mode', exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Middle name', exact: true })).toHaveValue(
        'Unsaved layout check'
      );
      expect((await drawer.boundingBox())!.width).toBeCloseTo(viewport.width, 0);
      const footer = drawer.locator('footer');
      await expect(footer).toBeInViewport();
      const content = scroll.locator(
        ':scope > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper'
      );
      await content.focus();
      await page.keyboard.press('End');
      await expect(page.getByText('End of stage details', { exact: true })).toBeInViewport();
      await expect(footer).toBeInViewport();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
      expect(
        await content.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)
      ).toBeTruthy();
    });
  }
}
