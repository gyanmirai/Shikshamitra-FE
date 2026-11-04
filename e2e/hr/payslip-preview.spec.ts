import { test, expect } from '@playwright/test';

[390, 768, 1440].forEach((width) => {
  ['light', 'dark'].forEach((theme) => {
    test(`PDF owns scrolling and retains its toolbar at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      let previewRequests = 0;
      page.on('request', (request) => {
        if (request.url().endsWith('/payslip-settings/preview')) previewRequests += 1;
      });
      await page.goto(`/?theme=${theme}`);
      const viewer = page.getByRole('region', { name: 'Payslip PDF viewer' });
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit page');
      await viewer.scrollIntoViewIfNeeded();
      const initial = await viewer.boundingBox();
      expect(initial!.height).toBeLessThan(720);
      const firstPage = await viewer.locator('canvas').first().boundingBox();
      expect(firstPage!.height).toBeLessThan(initial!.height);
      if (width === 1440) {
        const save = await page.getByRole('button', { name: 'Save', exact: true }).boundingBox();
        expect(firstPage!.y + firstPage!.height).toBeLessThan(save!.y);
      }
      await page.getByRole('combobox', { name: 'PDF zoom' }).click();
      await page.getByRole('option', { name: '150%', exact: true }).click();
      const zoomed = await viewer.boundingBox();
      const toolbar = await page
        .getByRole('button', { name: 'Zoom in', exact: true })
        .boundingBox();
      await viewer.focus();
      await viewer.press('End');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await viewer.boundingBox()).toEqual(zoomed);
      expect(
        await page.getByRole('button', { name: 'Zoom in', exact: true }).boundingBox()
      ).toEqual(toolbar);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      expect(previewRequests).toBe(1);
      await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('125%');
      const download = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Download sample PDF' }).click();
      expect((await download).suggestedFilename()).toBe('synthetic-payslip-preview.pdf');
      await page.getByRole('switch', { name: 'Bank details', exact: true }).click();
      await expect.poll(() => previewRequests).toBe(2);
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit page');
    });
  });
});
