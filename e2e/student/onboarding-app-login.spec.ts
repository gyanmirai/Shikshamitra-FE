import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    // Surface fixture startup errors instead of presenting a blank page as a feature failure.
    console.error('App Login fixture:', error.message);
  });
});

test('selects both recipients and uses each returned case stamp without duplicate sending', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Student Setup · App Login' })).toBeVisible();
  await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
  await page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i }).check();
  await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
  await page.getByRole('button', { name: 'Send selected login details', exact: true }).click();
  const requests = page.getByTestId('fixture-requests');
  await expect(requests).toContainText('student:stamp-1');
  await expect(requests).toContainText('guardian:stamp-2');
  await expect(
    page.getByRole('form', { name: 'Send credentials' }).getByText('Queued', { exact: true })
  ).toHaveCount(2);
});

test('sends only the selected student', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
  await page.getByRole('button', { name: 'Send selected login details', exact: true }).click();
  await expect(page.getByTestId('fixture-requests')).toHaveText('student:stamp-1');
});

test('reads an uncertain committed send before continuing and never sends that recipient twice', async ({
  page,
}) => {
  await page.goto('/?scenario=uncertain');
  await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
  await page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i }).check();
  await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
  await page.getByRole('button', { name: 'Send selected login details', exact: true }).click();
  await expect(page.getByTestId('fixture-requests')).toHaveText(
    'student:stamp-1, guardian:stamp-2'
  );
  const form = page.getByRole('form', { name: 'Send credentials' });
  await expect(form.getByText('Queued', { exact: true })).toHaveCount(2);
  await expect(form.getByRole('button', { name: 'Retry student email' })).toHaveCount(0);
});

test('sends only the selected parent after access confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i }).check();
  const send = page.getByRole('button', { name: 'Send selected login details', exact: true });
  await expect(send).toBeDisabled();
  await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
  await send.click();
  await expect(page.getByTestId('fixture-requests')).toHaveText('guardian:stamp-1');
});

test('adds a missing student email without sending automatically', async ({ page }) => {
  await page.goto('/?scenario=missing');
  await page.getByRole('button', { name: /Add email/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: /^Email/ }).fill('vinay.new@example.test');
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Student email' })).toHaveValue(
    'vinay.new@example.test'
  );
  await expect(page.getByTestId('fixture-requests')).toHaveText('email:self');
});

test('keeps a duplicate email correction in the dialog without sending or clearing the draft', async ({
  page,
}) => {
  await page.goto('/?scenario=missing');
  await page.getByRole('button', { name: /Add email/i }).click();
  const dialog = page.getByRole('dialog');
  const email = dialog.getByRole('textbox', { name: /^Email/ });
  await email.fill('office@example.test');
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(email).toHaveValue('office@example.test');
  await expect(
    dialog.getByText('This email already belongs to another account. Use a different email.')
  ).toBeVisible();
  await expect(page.getByTestId('fixture-requests')).toHaveText('No requests');
});

test('keeps sending and email editing unavailable without management permission', async ({
  page,
}) => {
  await page.goto('/?scenario=permission');
  await expect(page.getByRole('checkbox', { name: /^Send to student$/i })).toBeDisabled();
  await expect(
    page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Send selected login details', exact: true })
  ).toBeDisabled();
  await expect(page.getByRole('button', { name: /Update email|Add email/i })).toHaveCount(0);
  await expect(page.getByTestId('fixture-requests')).toHaveText('No requests');
});

test('shows the owning empty state without inventing a recipient', async ({ page }) => {
  await page.goto('/?scenario=empty');
  await expect(page.getByText(/No saved account-owner profiles are available/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Send selected login details', exact: true })
  ).toHaveCount(0);
  await expect(page.getByTestId('fixture-requests')).toHaveText('No requests');
});

test('shows a scoped loading state before the saved recipient data arrives', async ({ page }) => {
  await page.goto('/?scenario=loading');
  await expect(page.getByRole('status', { name: 'Loading credentials' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /^Send to student$/i })).toHaveCount(0);
  await expect(page.getByTestId('fixture-requests')).toHaveText('No requests');
});

test('does not send from retained data after a failed workspace refresh', async ({ page }) => {
  await page.goto('/?scenario=error');
  await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
  await expect(
    page.getByRole('button', { name: 'Send selected login details', exact: true })
  ).toBeDisabled();
  await expect(page.getByTestId('fixture-requests')).toHaveText('No requests');
});

test('retries only the failed parent email', async ({ page }) => {
  await page.goto('/?scenario=partial');
  await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
  await page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i }).check();
  await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
  await page.getByRole('button', { name: 'Send selected login details', exact: true }).click();
  await expect(
    page.getByRole('form', { name: 'Send credentials' }).getByText('Failed', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: /Retry parent email/i }).click();
  await expect(page.getByTestId('fixture-requests')).toContainText(
    'student:stamp-1, guardian:stamp-2, guardian:stamp-2'
  );
});

test('links a reviewed existing parent without an Admission confirmation', async ({ page }) => {
  await page.goto('/?scenario=existing');
  await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
  await page.getByRole('button', { name: /Confirm & link parent/i }).click();
  await expect(page.getByTestId('fixture-requests')).toContainText('link:true');
  await expect(
    page.getByText(/uses.*existing login|existing login.*linked|parent linked/i).first()
  ).toBeVisible();
});

[1440, 768, 390].forEach((width) => {
  ['light', 'dark'].forEach((mode) => {
    test(`keeps recipient fields and actions within the viewport at ${width}px in ${mode}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
      await page.goto(`/?theme=${mode}`);
      await expect(page.getByRole('textbox', { name: 'Student email' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Parent / guardian email' })).toBeVisible();
      const send = page.getByRole('button', { name: 'Send selected login details', exact: true });
      await expect(send).toBeDisabled();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);
      await page.getByRole('checkbox', { name: /^Send to student$/i }).check();
      await page.getByRole('checkbox', { name: /^Send to parent \/ guardian$/i }).check();
      await page.getByRole('checkbox', { name: /I confirm.*access/i }).check();
      await expect(send).toBeEnabled();
      await page.screenshot({
        path: `.artifacts/onboarding-app-login/screenshots/ready-${width}-${mode}.png`,
        fullPage: true,
      });
    });
  });
});
