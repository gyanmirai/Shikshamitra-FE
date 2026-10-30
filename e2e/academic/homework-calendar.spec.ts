import { test, expect, type Page } from '@playwright/test';

import { login, prepare, expectHealthy } from './academic-module-setup.helpers';

const fixture = 'http://127.0.0.1:4497';
const message =
  'Due Date 30/10/2026 for A is blocked by the academic calendar entry "Diwali vacation". Choose another due date.';

async function schedule(page: Page, label: RegExp, day: string, hour: string, minute: string) {
  const field = page.getByRole('group', { name: label });
  await field.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2026');
  await field.getByRole('spinbutton', { name: 'Month', exact: true }).fill('10');
  await field.getByRole('spinbutton', { name: 'Day', exact: true }).fill(day);
  await field.getByRole('spinbutton', { name: 'Hours', exact: true }).fill(hour);
  await field.getByRole('spinbutton', { name: 'Minutes', exact: true }).fill(minute);
}

async function fillHomework(page: Page) {
  await page.goto('/academic/homeworkCreation');
  await page.getByRole('button', { name: 'Homework', exact: true }).click();
  const form = page.getByRole('dialog');
  await form.getByRole('combobox', { name: /^Division/ }).click();
  await page.getByRole('option', { name: 'A', exact: true }).click();
  await page.keyboard.press('Escape');
  await form.getByRole('combobox', { name: /^Subject/ }).click();
  await page.getByRole('option', { name: 'Mathematics', exact: true }).click();
  await form.getByRole('textbox', { name: /^Homework title/ }).fill('Midnight Homework');
  await form.getByRole('combobox', { name: /^Homework type/ }).click();
  await page.getByRole('option', { name: 'Revision', exact: true }).click();
  await form.locator('.tiptap[contenteditable="true"]').fill('Read the chapter and summarize it.');
  await schedule(page, /^Publish date \(IST\)/, '29', '17', '36');
  await schedule(page, /^Due date \(IST\)/, '30', '00', '00');
}

test.beforeEach(async ({ page, request }) => {
  await request.post(`${fixture}/fixture/reset`);
  await page.clock.setFixedTime(new Date('2026-10-29T12:06:00Z'));
});

const cases = [
  { width: 1440, timezoneId: 'Asia/Kolkata' },
  { width: 768, timezoneId: 'UTC' },
  { width: 390, timezoneId: 'America/Los_Angeles' },
];
cases.forEach(({ width, timezoneId }) => {
  test.describe(`${width}px ${timezoneId}`, () => {
    test.use({ timezoneId, viewport: { width, height: 1000 } });
    test('saves and publishes the selected midnight without shifting the school date', async ({
      page,
      request,
    }) => {
      await prepare(page, request, width === 390 ? 'dark' : 'light');
      await login(page);
      await fillHomework(page);
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Publish now', exact: true })
        .click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const state = await (await request.get(`${fixture}/fixture/snapshot`)).json();
      expect(state.writes[0]['DivisionSchedules[0].DueAt']).toBe('2026-10-30T00:00:00+05:30');
      expect(state.writes[0]['DivisionSchedules[0].PublishAt']).toBe('2026-10-29T17:36:00+05:30');
      expect(state.tasks[0].status).toBe(1);
      await expect(page.getByText('Midnight Homework', { exact: true })).toBeVisible();
      await expectHealthy(page);
      await page.screenshot({ path: `.artifacts/homework-calendar/published-${width}.png` });
    });
  });
});

test('a calendar rejection shows the selected date once and preserves the entered homework', async ({
  page,
  request,
}) => {
  await prepare(page, request);
  await login(page);
  await fillHomework(page);
  await request.post(`${fixture}/fixture/mode`, { data: { blockedDate: '2026-10-30' } });
  await page.getByRole('dialog').getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByText(message, { exact: true })).toHaveCount(1);
  await expect(page.getByRole('textbox', { name: /^Homework title/ })).toHaveValue(
    'Midnight Homework'
  );
  await expect(
    page
      .getByRole('group', { name: /^Due date \(IST\)/ })
      .getByRole('spinbutton', { name: 'Day', exact: true })
  ).toHaveText('30');
  await page.screenshot({ path: '.artifacts/homework-calendar/rejected-once.png' });
});

test('division vacation blocks the due-date picker while publish remains allowed', async ({
  page,
  request,
}) => {
  await prepare(page, request);
  await login(page);
  await fillHomework(page);
  const due = page.getByRole('group', { name: /^Due date \(IST\)/ });
  await due.getByRole('button', { name: /Choose date/ }).click();
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(
    page
      .getByLabel('Diwali vacation (Vacation)', { exact: true })
      .getByRole('gridcell', { name: '7', exact: true })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  const publish = page.getByRole('group', { name: /^Publish date \(IST\)/ });
  await publish.getByRole('button', { name: /Choose date/ }).click();
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(
    page
      .getByLabel('Diwali vacation (Vacation)', { exact: true })
      .getByRole('gridcell', { name: '7', exact: true })
  ).toBeEnabled();
  await page.keyboard.press('Escape');
});
