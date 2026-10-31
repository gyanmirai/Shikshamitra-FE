import { test, expect } from '@playwright/test';

// Real editor, recovery middleware and treatment dialog; all APIs are local synthetic fixtures.
[
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
].forEach((viewport) => {
  test(`Bug6534 retains the draft and corrects the preview month at ${viewport.width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize(viewport);
    await page.clock.install({ time: new Date('2026-10-31T06:00:00Z') });
    await request.post('/fixture/reset');
    await request.post('/fixture/seed', { data: { earnings: 1 } });
    await request.post('/fixture/control', { data: { classificationBlock: true } });
    await page.goto('/hr/payroll/setting/salary-templates/new?scenario=salary-template&recovery=1');
    await page.getByRole('textbox', { name: 'Template name' }).fill('Retained synthetic salary');
    await page.getByRole('button', { name: 'Add Earning', exact: true }).click();
    const picker = page.getByRole('dialog', { name: 'Add Earning Component', exact: true });
    await picker.getByRole('combobox', { name: 'Payroll component', exact: true }).click();
    await page.getByRole('option', { name: 'Earning 1', exact: true }).click();
    await picker.getByRole('button', { name: 'Submit', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Payroll purpose for Earning 1', exact: true })
      .click();
    await page.getByRole('option', { name: 'Basic', exact: true }).click();
    await page.getByRole('textbox', { name: 'Earning 1 amount', exact: true }).fill('10000');
    await page.getByRole('combobox', { name: /^Default salary basis/ }).click();
    await page.getByRole('option', { name: 'Monthly salary', exact: true }).click();
    await page.getByRole('textbox', { name: 'Monthly salary', exact: true }).fill('10000');
    await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
    await expect(page.locator('#salary-preview-error')).toContainText(
      'ESIC treatment is missing for this preview month.'
    );
    await page.screenshot({
      path: `.artifacts/salary-components/esic-preview-${viewport.width}.png`,
      fullPage: true,
    });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    const treatment = page.getByRole('dialog', { name: 'ESIC wage treatment', exact: true });
    await expect(treatment.getByLabel('Changes effective from')).toHaveValue('2026-10');
    await treatment.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Retained synthetic salary'
    );
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    await treatment.getByRole('combobox', { name: 'Earning', exact: true }).click();
    await page.getByRole('option', { name: /Earning 1/ }).click();
    await treatment.getByRole('combobox', { name: /^ESIC wage treatment/ }).click();
    await page.getByRole('option', { name: 'Included in ESIC wages', exact: true }).click();
    await treatment.getByRole('button', { name: 'Save treatment', exact: true }).click();
    await expect(treatment).toHaveCount(0);
    await expect(page.getByText('Preview needs refresh', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeEnabled();
    const state = await (await request.get('/fixture/state')).json();
    expect(state.treatmentSaves).toHaveLength(1);
    expect(state.treatmentSaves[0].effectiveMonth).toBe('2026-10');
    expect(state.previewRequests).toHaveLength(2);
    expect(state.previewRequests[1]).toEqual(state.previewRequests[0]);
    expect(state.templates).toHaveLength(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});
