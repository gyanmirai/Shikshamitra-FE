/* eslint-disable no-restricted-syntax -- Each viewport/theme combination is an independent browser test. */
import { test, expect } from '@playwright/test';

// Real feature components and clients with an in-page synthetic transport. This proves UI and
// request composition only, not authenticated backend document acceptance or upload persistence.
for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`document review at ${viewport.width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      const upload = page.getByRole('button', { name: 'Upload document for Address proof' });
      await expect(upload).toBeEnabled();
      await expect(
        page.getByRole('button', { name: 'View document for Address proof' })
      ).toBeDisabled();
      await upload.click();
      const uploadDialog = page.getByRole('dialog');
      await expect(
        uploadDialog.getByRole('button', { name: 'Document', exact: true })
      ).toBeVisible();
      await uploadDialog.getByRole('button', { name: 'Cancel' }).click();
      await page.getByRole('button', { name: 'View document for Birth certificate' }).click();
      const preview = page.getByRole('dialog', { name: 'Birth certificate · Document Review' });
      await expect(preview).toBeVisible();
      await expect(preview.getByRole('textbox')).toHaveCount(0);
      const image = preview.getByRole('img', { name: 'Birth certificate document preview' });
      await expect(image).toBeVisible();
      // Compare the actual preview region with the body's content box, not the image's
      // object-fit/padded bounds with the whole dialog (which is misleading on phones).
      const viewer = image.locator('..').locator('..');
      const viewerBox = (await viewer.boundingBox())!;
      const contentWidth = await preview.locator('.MuiDialogContent-root').evaluate((element) => {
        const style = getComputedStyle(element);
        return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      });
      expect(viewerBox.width).toBeCloseTo(contentWidth, 0);
      if (viewport.width === 1440 && theme === 'dark') {
        await page.screenshot({
          path: '.artifacts/document-review-20261028/preview-dark.png',
          fullPage: true,
        });
      }
      await expect(preview.getByRole('button', { name: 'Approve', exact: true })).toBeInViewport();
      await expect(preview.getByRole('button', { name: 'Reject', exact: true })).toBeInViewport();
      const approveBox = (await preview
        .getByRole('button', { name: 'Approve', exact: true })
        .boundingBox())!;
      const rejectBox = (await preview
        .getByRole('button', { name: 'Reject', exact: true })
        .boundingBox())!;
      expect(approveBox.height).toBeCloseTo(30, 0);
      expect(rejectBox.y).toBeCloseTo(approveBox.y, 0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBeTruthy();
      await preview.getByRole('button', { name: 'Zoom in', exact: true }).click();
      await expect(preview.getByText('125%', { exact: true })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBeTruthy();
      await preview.getByRole('button', { name: 'Fit to page' }).click();
      await preview.getByRole('button', { name: 'Reject', exact: true }).click();
      const rejection = page.getByRole('dialog', { name: 'Reject Document', exact: true });
      await expect(rejection.getByRole('textbox', { name: 'Rejection reason' })).toBeVisible();
      await rejection.getByRole('button', { name: 'Reject document', exact: true }).click();
      await expect(rejection.getByText('Give a reason for this decision')).toBeVisible();
      if (viewport.width === 390 && theme === 'dark') {
        await page.screenshot({
          path: '.artifacts/document-review-20261028/rejection-mobile-dark.png',
          fullPage: true,
        });
      }
      await rejection.getByRole('button', { name: 'Cancel' }).click();
      await expect(preview.getByRole('button', { name: 'Reject', exact: true })).toBeFocused();
      await expect(image).toBeVisible();
      await preview.getByRole('button', { name: 'Evidence history (1)' }).click();
      await expect(preview.getByRole('button', { name: 'Approve', exact: true })).toBeInViewport();
      await expect(preview.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
      await preview.getByRole('button', { name: 'Approve', exact: true }).dblclick();
      await expect(preview).not.toBeVisible();
      await expect(page.getByLabel('Review requests')).toHaveText(
        '[{"concurrencyStamp":"application-stamp","decision":"accepted"}]'
      );
      if (viewport.width === 1440 && theme === 'dark') {
        await page.screenshot({
          path: '.artifacts/document-review-20261028/table-dark.png',
          fullPage: true,
        });
      }
    });
  }
}

test('rejects the pinned evidence with a trimmed reason', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View document for Birth certificate' }).click();
  await page
    .getByRole('dialog', { name: 'Birth certificate · Document Review' })
    .getByRole('button', { name: 'Reject', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Reject Document', exact: true });
  await dialog
    .getByRole('textbox', { name: 'Rejection reason' })
    .fill('  Provide a clearer scan  ');
  await dialog.getByRole('button', { name: 'Reject document', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Birth certificate · Document Review' })
  ).not.toBeVisible();
  await expect(page.getByLabel('Review requests')).toHaveText(
    '[{"concurrencyStamp":"application-stamp","decision":"rejected","reason":"Provide a clearer scan"}]'
  );
});
