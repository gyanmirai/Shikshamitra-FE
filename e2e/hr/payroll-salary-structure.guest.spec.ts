/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect } from '@playwright/test';

test.describe('Payroll salary structure with the real local API', () => {
  test.skip(
    process.env.E2E_SALARY_PREVIEW_QA !== '1',
    'Requires an isolated seeded loopback backend and a disposable employee fixture.'
  );
  test('preview, save, return context and pending registration across screen sizes', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(240_000);
    page.setDefaultTimeout(20_000);
    expect(['localhost', '127.0.0.1']).toContain(new URL(baseURL!).hostname);
    const apiURL = process.env.E2E_API_URL!;
    expect(['localhost', '127.0.0.1']).toContain(new URL(apiURL).hostname);
    const employeeId = process.env.E2E_SALARY_EMPLOYEE_ID!;
    expect(employeeId).toBeTruthy();
    const month = process.env.E2E_SALARY_MONTH || '2026-10';
    await page.setViewportSize({ width: 1440, height: 900 });
    // Start as a returning user so the unrelated first-login tour does not cover salary controls.
    await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('School code').fill(process.env.E2E_TENANT || 'DDVS');
    await page.getByLabel('Email or username').fill(process.env.E2E_ADMIN_EMAIL || 'admin-ddvs');
    await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD || 'Temp@123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 60_000 });
    const session = await (await page.request.get('/api/auth/session')).json();
    expect(session.accessToken).toBeTruthy();
    const headers = { Authorization: `Bearer ${session.accessToken}` };
    const profileURL = `${apiURL}/api/employees/${employeeId}/payroll/statutory-profile`;
    const profile = await (await page.request.get(profileURL, { headers })).json();
    const registration = await page.request.put(profileURL, {
      headers,
      data: {
        profile: {
          ...profile.profile,
          applyPf: true,
          applyEsic: true,
          pfNumber: '',
          uanNumber: '',
          esicInsuranceNumber: '',
          pfDisabledReason: null,
          esicDisabledReason: null,
        },
        effectiveMonth: month,
        concurrencyStamp: profile.concurrencyStamp,
        idempotencyKey: crypto.randomUUID(),
        updatePf: true,
        updateEsic: true,
      },
    });
    expect(registration.ok(), await registration.text()).toBeTruthy();
    const overview = `/hr/payroll/structure?employeeId=${employeeId}&month=${month}`;
    await page.goto(overview, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Payroll Structure', exact: true })).toBeVisible(
      { timeout: 60_000 }
    );
    await expect(page.getByText('Estimated take-home', { exact: true })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText('Professional tax', { exact: true })).toBeVisible();
    await expect(page.getByText(/Registration pending\. Contributions still apply/)).toHaveCount(2);
    await page.getByRole('link', { name: /Edit salary/ }).click();
    await expect(page.getByLabel('Effective month', { exact: true })).toHaveValue(month, {
      timeout: 60_000,
    });
    const upgrade = page.getByRole('button', { name: 'Use current template', exact: true });
    if (await upgrade.isVisible()) await upgrade.click();
    await page.getByRole('combobox', { name: 'Amount basis', exact: true }).click();
    await page.getByRole('option', { name: 'Monthly salary', exact: true }).click();
    await page.getByLabel('Monthly salary', { exact: true }).fill('18000');
    await page.getByRole('combobox', { name: 'Previous PF membership' }).click();
    await page.getByRole('option', { name: 'Existing PF member', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'PF registration details', exact: true }).click();
    await expect(page.getByLabel('PF number', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('UAN', { exact: true })).toHaveValue('');
    await page.getByRole('button', { name: 'PF registration details', exact: true }).click();
    const previewResponse = page.waitForResponse(
      (response) => response.url().endsWith('/calculate') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /^(Preview salary|Update preview)$/ }).click();
    const previewHTTP = await previewResponse;
    expect(previewHTTP.ok(), await previewHTTP.text()).toBeTruthy();
    const preview = await previewHTTP.json();
    expect(preview.grossSalary).toBe(18000);
    expect(preview.employeeStateInsurance.employeeContribution).toBeGreaterThan(0);
    expect(
      preview.statutorySummary
        .filter((scheme: any) => scheme.scheme !== 'PT')
        .every((scheme: any) => scheme.registrationPending && scheme.employeeAmount > 0)
    ).toBeTruthy();
    await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeEnabled();
    const savedResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/compensation') && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save salary', exact: true }).click();
    const saved = await savedResponse;
    expect(saved.ok(), await saved.text()).toBeTruthy();
    await expect(page.getByRole('status')).toHaveText(/Saved/);
    await page
      .getByRole('region', { name: 'Notifications alt+T' })
      .getByRole('button', { name: /^(Close toast|Close)$/ })
      .first()
      .click();
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update preview/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeVisible();
      expect(
        await page
          .getByTestId('salary-editor-content')
          .evaluate((element) => element.scrollWidth <= element.clientWidth)
      ).toBeTruthy();
      await page.screenshot({ path: `.codex/salary-editor-${width}.png` });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`employeeId=${employeeId}.*month=${month}`));
    await expect(page.getByText('Estimated take-home', { exact: true })).toBeVisible();
    const summaryHTTP = await page.request.get(
      `${apiURL}/api/payroll/employees/${employeeId}/salary-summary?month=${month}`,
      { headers }
    );
    expect(summaryHTTP.ok(), await summaryHTTP.text()).toBeTruthy();
    const summary = await summaryHTTP.json();
    expect(summary.isComplete).toBeTruthy();
    expect(summary.netSalary).toBe(preview.netSalary);
    expect(summary.employerCost).toBe(preview.employerCost);
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(
        page.getByRole('heading', { name: 'Payroll Structure', exact: true })
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
      await page.screenshot({
        path: `.codex/salary-overview-${viewport.width}.png`,
        fullPage: true,
      });
    }
    await page.reload();
    await expect(page.getByLabel('Preview month', { exact: true })).toHaveValue(month);
    await expect(page.getByText('Estimated take-home', { exact: true })).toBeVisible();
  });
});
