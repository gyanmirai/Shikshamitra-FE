/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [390, 768, 1440]) {
    test(`sectioned setup and embedded editor at ${width}px in ${theme}`, async ({ page }) => {
      const height = width === 390 ? 844 : width === 768 ? 1024 : 900;
      await page.setViewportSize({ width, height });
      await page.goto(`/?theme=${theme}`);
      const wizard = page.getByRole('dialog', {
        name: 'Let’s Complete Your HR Setup',
        exact: true,
      });
      await expect(
        wizard.getByRole('heading', { name: 'Salary Template', exact: true, level: 2 })
      ).toBeVisible();
      await expect(wizard.getByText('1 of 2 complete', { exact: true })).toBeVisible();
      await expect(wizard.getByTestId('hr-setup-check-pf-coverage')).toContainText('Needs setup');
      await expect(wizard.getByTestId('hr-setup-check-salary-template')).toBeHidden();
      await wizard.getByText('View completed setup (1)', { exact: true }).click();
      await expect(wizard.getByRole('button', { name: 'Review Salary Template' })).toBeVisible();
      await wizard.getByText('View completed setup (1)', { exact: true }).click();
      const message = wizard.getByText(/Finish setup for attendance, leave and payroll/);
      await expect(message).toContainText('return to your saved progress');
      expect(await wizard.evaluate((node) => getComputedStyle(node).outlineWidth)).toBe('0px');
      const progress = wizard.getByRole('progressbar', { name: 'Saved HR setup completion' });
      await expect(progress).toHaveAttribute('aria-valuetext', '10 of 11 setup items complete');
      await expect(progress).toHaveCSS('height', '4px');
      await expect(wizard.getByText('1 item remaining', { exact: true })).toBeVisible();
      const stepper = wizard.getByRole('list', { name: 'HR setup steps' });
      if (width === 390) {
        await expect(stepper).toHaveCount(0);
        await expect(wizard.getByRole('status')).toHaveText('Step 4 of 5: Salary Template');
      } else {
        await expect(
          stepper.getByRole('button', { name: 'Staff Prerequisites' })
        ).toHaveAccessibleDescription('Completed');
        await expect(
          stepper.getByRole('button', { name: 'Salary Template' })
        ).toHaveAccessibleDescription('In progress');
        const stepGeometry = await stepper.getByRole('listitem').evaluateAll((steps) =>
          steps.map((item) => {
            const marker = item.querySelector('.MuiStepIcon-root')!.getBoundingClientRect();
            const line = item.querySelector('.MuiStepConnector-line');
            const lineBox = line?.getBoundingClientRect();
            const label = item.querySelector('.MuiStepLabel-label')!;
            return {
              markerY: marker.y + marker.height / 2,
              lineY: lineBox ? lineBox.y + lineBox.height / 2 : null,
              lineStyle: line ? getComputedStyle(line).borderTopStyle : null,
              columnWidth: item.getBoundingClientRect().width,
              labelLines: Math.round(
                label.getBoundingClientRect().height /
                  parseFloat(getComputedStyle(label).lineHeight)
              ),
            };
          })
        );
        expect(stepGeometry).toHaveLength(5);
        expect(stepGeometry.map(({ lineStyle }) => lineStyle)).toEqual([
          null,
          'solid',
          'solid',
          'solid',
          'dashed',
        ]);
        for (const { markerY, lineY, columnWidth } of stepGeometry) {
          expect(Math.abs(markerY - stepGeometry[0].markerY)).toBeLessThan(1);
          expect(Math.abs(columnWidth - stepGeometry[0].columnWidth)).toBeLessThan(1);
          if (lineY !== null) expect(Math.abs(lineY - markerY)).toBeLessThan(1);
        }
        expect(Math.max(...stepGeometry.map(({ labelLines }) => labelLines))).toBe(
          width === 768 ? 2 : 1
        );
      }
      for (const name of ['Close for now', 'Back', 'Review progress']) {
        await expect(wizard.getByRole('button', { name, exact: true })).toBeInViewport();
      }
      const footerButtonRows = await wizard
        .locator('.MuiDialogActions-root')
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().y));
      expect(new Set(footerButtonRows).size).toBe(1);
      expect(await wizard.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      const initialBox = await wizard.boundingBox();
      await wizard.getByTestId('hr-setup-next').press('Shift+Tab');
      const back = wizard.getByRole('button', { name: 'Back', exact: true });
      await expect(back).toBeFocused();
      expect(await back.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid');
      expect(initialBox!.height).toBeCloseTo(
        width < 600 ? height : Math.min(height * 0.88, 820),
        0
      );
      await page.screenshot({ path: `.artifacts/hr-setup-polish/salary-${theme}-${width}.png` });
      await wizard
        .getByTestId('hr-setup-check-pf-coverage')
        .getByRole('button', { name: /^Configure / })
        .click();
      await expect(
        wizard.getByRole('heading', { name: 'Configure PF Coverage', exact: true, level: 2 })
      ).toBeVisible();
      await expect(wizard.getByLabel(/PF coverage evidence reference/)).toBeVisible();
      const monthField = wizard.getByRole('group', { name: 'PF coverage effective month' });
      await monthField.getByRole('button', { name: /Choose date/ }).click();
      const monthPicker = page.getByRole('dialog', { name: 'PF coverage effective month' });
      await expect(monthPicker.getByRole('radio', { checked: true })).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(monthPicker).toHaveCount(0);
      await expect(monthField.getByRole('button', { name: /Choose date/ })).toBeFocused();
      const editorBox = await wizard.boundingBox();
      expect(editorBox!.height).toBeCloseTo(initialBox!.height, 0);
      expect(editorBox!.y).toBeCloseTo(initialBox!.y, 0);
      await expect(progress).toHaveAttribute('aria-valuetext', '10 of 11 setup items complete');
      await expect(
        wizard.getByRole('button', { name: 'Save and next', exact: true })
      ).toBeInViewport();
      await wizard.getByLabel(/PF coverage evidence reference/).fill('Synthetic unsaved evidence');
      await wizard.getByRole('button', { name: 'Back', exact: true }).click();
      const discard = page.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
      await discard.getByRole('button', { name: 'Keep Editing', exact: true }).click();
      await expect(wizard.getByLabel(/PF coverage evidence reference/)).toHaveValue(
        'Synthetic unsaved evidence'
      );
      await page.screenshot({ path: `.artifacts/hr-setup-polish/editor-${theme}-${width}.png` });
      await wizard.getByRole('button', { name: 'Back', exact: true }).click();
      await discard.getByRole('button', { name: 'Discard Changes', exact: true }).click();
      await expect(wizard.getByTestId('hr-setup-check-pf-coverage')).toContainText('Needs setup');
      await wizard.getByTestId('hr-setup-next').click();
      await expect(wizard.getByRole('alert')).toContainText('Some setup still needs attention');
      const completionBox = await wizard.boundingBox();
      expect(completionBox!.height).toBeCloseTo(initialBox!.height, 0);
      expect(completionBox!.y).toBeCloseTo(initialBox!.y, 0);
      await expect(progress).toHaveAttribute('aria-valuetext', '10 of 11 setup items complete');
      await wizard.getByRole('button', { name: 'Return to remaining setup', exact: true }).click();
      await expect(wizard.getByTestId('hr-setup-check-pf-coverage')).toBeVisible();
    });
  }
}

test.describe('touch month picker', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('accepts a month inside the setup wizard', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-15T12:00:00Z'));
    await page.goto('/?theme=dark');
    const wizard = page.getByRole('dialog', { name: 'Let’s Complete Your HR Setup', exact: true });
    await wizard.getByRole('button', { name: 'Configure PF Coverage' }).tap();
    const field = wizard.getByRole('group', { name: 'PF coverage effective month' });
    await field.getByRole('button', { name: /Choose date/ }).tap();
    const picker = page.getByRole('dialog', { name: 'Select date', exact: true });
    await picker.getByRole('radio', { name: 'November' }).tap();
    await picker.getByRole('button', { name: 'OK', exact: true }).tap();
    await expect(picker).toHaveCount(0);
    await expect(field.getByRole('spinbutton', { name: 'Month' })).toHaveText('November');
    await expect(wizard.getByRole('button', { name: 'Save and next' })).toBeVisible();
  });
});

test('all checklist steps retain saved statuses, optional deductions and accessible headings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const wizard = page.getByRole('dialog', { name: 'Let’s Complete Your HR Setup', exact: true });
  const initialBox = await wizard.boundingBox();
  for (const label of ['Staff Prerequisites', 'Policies and Calendar', 'Earning Components']) {
    const step = wizard.getByRole('button', { name: label, exact: true });
    await step.press('Enter');
    await expect(step).toHaveAttribute('aria-current', 'step');
    await expect(wizard.getByRole('heading', { name: label, level: 2, exact: true })).toBeVisible();
    const box = await wizard.boundingBox();
    expect(box!.height).toBeCloseTo(initialBox!.height, 0);
    expect(box!.y).toBeCloseTo(initialBox!.y, 0);
    await expect(wizard.getByTestId('hr-setup-next')).toBeInViewport();
    await expect(
      wizard.getByRole('progressbar', { name: 'Saved HR setup completion' })
    ).toHaveAttribute('aria-valuetext', '10 of 11 setup items complete');
    await page.screenshot({ path: `.artifacts/hr-setup-polish/${label.replaceAll(' ', '-')}.png` });
  }
  await expect(wizard.getByText('Optional', { exact: true })).toBeVisible();
  await expect(
    wizard.getByRole('button', { name: 'Set up deductions', exact: true })
  ).toBeVisible();
  await wizard.getByRole('button', { name: 'Close for now' }).click();
  await expect(wizard).toHaveCount(0);
  await page.getByRole('button', { name: 'Resume HR setup' }).click();
  await expect(wizard.getByTestId('hr-setup-check-pf-coverage')).toContainText('Needs setup');
});

test('read-only, missing-year, failure and genuinely complete states remain explicit', async ({
  page,
}) => {
  for (const scenario of ['read-only', 'no-year', 'error', 'states', 'complete']) {
    await page.goto(`/?scenario=${scenario}`);
    const wizard = page.getByRole('dialog', { name: 'Let’s Complete Your HR Setup', exact: true });
    if (scenario === 'read-only') {
      await expect(wizard.getByTestId('hr-setup-check-pf-coverage')).toContainText(
        'An administrator must complete this step.'
      );
      await expect(wizard.getByRole('button', { name: /^Configure / })).toHaveCount(0);
    } else if (scenario === 'no-year') {
      await expect(wizard.getByText('Waiting for academic year', { exact: true })).toBeVisible();
      await expect(wizard.getByRole('alert')).toContainText(
        'An administrator must create an academic year'
      );
    } else if (scenario === 'error') {
      await expect(wizard.getByRole('progressbar')).toHaveCount(0);
      await expect(wizard.getByRole('alert')).toContainText('Unable to check HR setup');
      await wizard.getByRole('button', { name: 'Retry' }).click();
      await expect(wizard.getByRole('alert')).toContainText('Unable to check HR setup');
    } else if (scenario === 'states') {
      for (const status of [
        'Inactive',
        'Needs review',
        'Conflicting setup',
        'Waiting for academic year',
      ]) {
        await expect(wizard.getByText(status, { exact: true })).toBeVisible();
      }
    } else {
      await expect(wizard.getByText('Ready to finish', { exact: true })).toBeVisible();
      await expect(wizard.getByRole('alert')).toContainText('Your school’s HR setup is ready');
      await wizard.getByRole('button', { name: 'Explore HR' }).click();
      await expect(wizard).toHaveCount(0);
    }
  }
});
