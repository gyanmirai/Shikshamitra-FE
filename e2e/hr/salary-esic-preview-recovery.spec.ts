import { test, expect } from '@playwright/test';

// Real editor, recovery middleware and treatment dialog; all APIs are local synthetic fixtures.
[
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
].forEach((viewport) => {
  test(`Bug6539 keeps HRA blocked after Basic-only correction at ${viewport.width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize(viewport);
    await page.clock.install({ time: new Date('2026-10-31T06:00:00Z') });
    await request.post('/fixture/reset');
    await request.post('/fixture/seed', {
      data: {
        earnings: 2,
        earningNames: ['Basic', 'HRA'],
        treatments: [
          {
            effectiveMonth: '2026-11',
            treatments: [
              { componentId: 'earning-1', treatment: 'Included' },
              { componentId: 'earning-2', treatment: 'Included' },
            ],
          },
        ],
      },
    });
    await request.post('/fixture/control', { data: { classificationBlock: true } });
    await page.goto('/hr/payroll/setting/salary-templates/new?scenario=salary-template&recovery=1');
    await page.getByRole('textbox', { name: 'Template name' }).fill('Retained two-earning salary');
    const add = async (name: string, amount: string) => {
      await page.getByRole('button', { name: 'Add Earning', exact: true }).click();
      const picker = page.getByRole('dialog', { name: 'Add Earning Component', exact: true });
      await picker.getByRole('combobox', { name: 'Payroll component', exact: true }).click();
      await page.getByRole('option', { name, exact: true }).click();
      await picker.getByRole('button', { name: 'Submit', exact: true }).click();
      await page.getByRole('textbox', { name: `${name} amount`, exact: true }).fill(amount);
    };
    await add('Basic', '6000');
    await page.getByRole('combobox', { name: 'Payroll purpose for Basic', exact: true }).click();
    await page.getByRole('option', { name: 'Basic', exact: true }).click();
    await add('HRA', '4000');
    await page.getByRole('combobox', { name: /^Default salary basis/ }).click();
    await page.getByRole('option', { name: 'Monthly salary', exact: true }).click();
    await page.getByRole('textbox', { name: 'Monthly salary', exact: true }).fill('10000');
    await page.getByRole('combobox', { name: /^ESIC policy/ }).click();
    await page.getByRole('option', { name: 'Synthetic ESIC', exact: true }).click();
    await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
    await expect(page.locator('#salary-preview-error')).toContainText(
      'ESIC treatment needed: Basic and HRA (Oct 2026).'
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'ESIC wage treatment', exact: true });
    await expect(dialog.getByRole('combobox', { name: /^Earning / })).toHaveText(/Basic/);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Retained two-earning salary'
    );
    await expect(page.getByRole('textbox', { name: 'Basic amount', exact: true })).toHaveValue(
      /6,000/
    );
    const classify = async () => {
      await dialog.getByRole('combobox', { name: /^ESIC wage treatment/ }).click();
      await page.getByRole('option', { name: 'Included in ESIC wages', exact: true }).click();
      await dialog.getByRole('button', { name: 'Save treatment', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await page
        .getByRole('region', { name: 'Notifications alt+T' })
        .getByRole('button', { name: 'Close', exact: true })
        .click();
    };
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    await classify();
    await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
    await expect(page.locator('#salary-preview-error')).toContainText(
      'ESIC treatment needed: HRA (Oct 2026).'
    );
    await expect(page.locator('#salary-preview-error')).not.toContainText('Basic');
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeDisabled();
    await page.screenshot({
      path: `.artifacts/salary-components/esic-hra-preview-${viewport.width}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    await expect(dialog.getByRole('combobox', { name: /^Earning / })).toHaveText(/HRA/);
    await dialog.getByLabel('Changes effective from').fill('2026-11');
    await expect(dialog.getByRole('combobox', { name: /^ESIC wage treatment/ })).toHaveText(
      'Included in ESIC wages'
    );
    await expect(
      dialog.getByRole('button', { name: 'Save treatment', exact: true })
    ).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
    await expect(page.locator('#salary-preview-error')).toContainText(
      'ESIC treatment needed: HRA (Oct 2026).'
    );
    await page.getByRole('button', { name: 'Review ESIC treatment', exact: true }).click();
    await expect(dialog.getByLabel('Changes effective from')).toHaveValue('2026-10');
    await classify();
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create Template', exact: true })).toBeEnabled();
    const state = await (await request.get('/fixture/state')).json();
    expect(state.treatmentSaves.map((save: any) => save.treatments)).toEqual([
      [{ componentId: 'earning-1', treatment: 'Included' }],
      [{ componentId: 'earning-2', treatment: 'Included' }],
    ]);
    expect(state.previewRequests).toHaveLength(4);
    state.previewRequests.forEach((input: unknown) =>
      expect(input).toEqual(state.previewRequests[0])
    );
    expect(state.templates).toHaveLength(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

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
    await page.getByRole('combobox', { name: /^ESIC policy/ }).click();
    await page.getByRole('option', { name: 'Synthetic ESIC', exact: true }).click();
    await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
    await expect(page.locator('#salary-preview-error')).toContainText(
      'ESIC treatment needed: Earning 1 (Oct 2026).'
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
    await expect(treatment.getByRole('combobox', { name: /^Earning / })).toHaveText(/Earning 1/);
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
