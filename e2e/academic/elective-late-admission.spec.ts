import { test, expect } from '@playwright/test';

import { academicPaths } from '../../src/constants/academic-menu';
import { login, prepare, expectHealthy } from './academic-module-setup.helpers';

const fixture = 'http://127.0.0.1:4487';
const path = academicPaths.curriculum.electiveAssignment;

const viewports = [
  [1440, 'light'],
  [768, 'light'],
  [390, 'dark'],
] as const;
viewports.forEach(([width, theme]) => {
  test(`late admission preserves locks through save, discard and final lock at ${width}px ${theme}`, async ({
    page,
    request,
  }) => {
    await request.post(`${fixture}/fixture/reset`);
    await prepare(page, request, theme);
    await page.setViewportSize({ width, height: 900 });
    await login(page);
    await page.goto(path);
    await expect(page.getByRole('button', { name: 'Locked', exact: true })).toBeDisabled();
    await request.post(`${fixture}/fixture/admit`);
    await page.reload();
    const existing = page.getByRole('group', {
      name: 'Elective subject assignment for Existing Student',
      exact: true,
    });
    const admitted = page.getByRole('group', {
      name: 'Elective subject assignment for New Student',
      exact: true,
    });
    await expect(
      existing.getByRole('button', { name: 'Unassign PT from Existing Student' })
    ).toBeDisabled();
    await expect(
      existing.getByRole('button', { name: 'Assign Computer Science to Existing Student' })
    ).toBeDisabled();
    await expect(
      page.getByRole('checkbox', { name: 'Select Existing Student', exact: true })
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Review & Lock', exact: true })).toBeDisabled();
    await admitted.getByRole('button', { name: 'Assign Computer Science to New Student' }).click();
    await page.getByRole('button', { name: 'Discard', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Discard', exact: true }).click();
    await expect(
      admitted.getByRole('button', { name: 'Assign Computer Science to New Student' })
    ).toHaveAttribute('aria-pressed', 'false');
    await admitted.getByRole('button', { name: 'Assign Computer Science to New Student' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Review & Lock', exact: true })).toBeEnabled();
    const state = await (await request.get(`${fixture}/fixture/snapshot`)).json();
    expect(state.writes).toHaveLength(1);
    expect(state.writes[0].assignments).toEqual([
      { studentId: 'new-student', selectedSubjectId: '88888888-8888-4888-8888-888888888888' },
    ]);
    await expect(
      existing.getByRole('button', { name: 'Unassign PT from Existing Student' })
    ).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Review & Lock', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Lock Assignments', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toContainText(
      'Students added later can still be assigned electives'
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Lock', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Locked', exact: true })).toBeDisabled();
    await page.reload();
    await expect(
      admitted.getByRole('button', { name: 'Unassign Computer Science from New Student' })
    ).toBeDisabled();
    await expect(
      existing.getByRole('button', { name: 'Unassign PT from Existing Student' })
    ).toBeDisabled();
    await expectHealthy(page);
    await page.screenshot({
      path: `.artifacts/elective-late-admission/final-${width}-${theme}.png`,
    });
  });
});
