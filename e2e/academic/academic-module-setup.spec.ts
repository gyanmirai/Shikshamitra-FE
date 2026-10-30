/* eslint-disable no-restricted-syntax, no-await-in-loop -- Each manager uses the same browser and synthetic school, so navigation and assertions must run sequentially. */
import { test, expect } from '@playwright/test';

import {
  login,
  prepare,
  snapshot,
  openGuide,
  fixtureApi,
  ordinaryPath,
  expectHealthy,
} from './academic-module-setup.helpers';

test.describe(
  'Academic setup guide',
  { tag: ['@module-academic', '@submodule-setup', '@critical'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post(`${fixtureApi}/fixture/reset`, { data: {} });
      await prepare(page, request);
    });

    test('Save & exit opens the empty Academic dashboard without NaN', async ({ page }) => {
      const runtimeErrors: string[] = [];
      page.on('pageerror', (error) => runtimeErrors.push(error.message));
      page.on('console', (message) => {
        if (/NaN/.test(message.text())) runtimeErrors.push(message.text());
      });
      await login(page);
      await openGuide(page);
      await page
        .getByRole('contentinfo')
        .getByRole('button', { name: 'Save & exit', exact: true })
        .click();
      await expect(page).toHaveURL(/\/academic\/dashboard$/);
      await expect(
        page.getByRole('heading', { name: 'Academic Dashboard', exact: true })
      ).toBeVisible();
      expect(runtimeErrors).toEqual([]);
      const insight = page.getByRole('region', { name: 'Student Academic 360', exact: true });
      await expect(insight.locator('svg image')).toHaveAttribute('href', /shikshamitra-student\.png$/);
      await expect(
        insight.getByText('No comparable student samples are available.', { exact: true })
      ).toBeVisible();
      await expect(page.getByText('Academic Health', { exact: true })).toHaveCount(0);
      await expect(page.getByText('Needs Attention', { exact: true })).toHaveCount(0);
      await expectHealthy(page);
      expect(runtimeErrors).toEqual([]);
    });

    test('Academic dashboard rejects a malformed section and retries valid zero data', async ({
      page,
      request,
    }) => {
      const runtimeErrors: string[] = [];
      page.on('pageerror', (error) => runtimeErrors.push(error.message));
      page.on('console', (message) => {
        if (/NaN/.test(message.text())) runtimeErrors.push(message.text());
      });
      const curriculumEndpoint = '**/api/academic/dashboard/insights?*';
      await page.route(curriculumEndpoint, (route) =>
        route.fulfill({ status: 200, json: { items: [], totalCount: 0 } })
      );
      await request.post(`${fixtureApi}/fixture/mark-visited`);
      await login(page);
      await page.goto('/academic/dashboard');
      await expect(
        page.getByRole('alert').filter({ hasText: 'Academic insights could not be loaded' })
      ).toBeVisible();
      await expect(
        page.getByRole('region', { name: 'Student Academic 360', exact: true })
      ).toHaveCount(0);
      await expect(page.getByText('Academic Health', { exact: true })).toHaveCount(0);
      await expectHealthy(page);
      expect(runtimeErrors).toEqual([]);
      await page.unroute(curriculumEndpoint);
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      const recovered = page.getByRole('region', { name: 'Student Academic 360', exact: true });
      await expect(
        recovered.getByText('No comparable student samples are available.', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Academic insights could not be loaded' })
      ).toHaveCount(0);
      await expectHealthy(page);
      expect(runtimeErrors).toEqual([]);
    });

    test('first school entry opens once, reload resumes and a second visitor continues normally', async ({
      page,
      request,
      browser,
    }) => {
      await login(page);
      await page.goto(ordinaryPath);
      await expect(page.getByRole('heading', { name: 'Let’s set up Academics' })).toBeVisible();
      await expect(page).toHaveURL(/\/academic\/setup\?/);
      await expect.poll(async () => (await snapshot(request)).visitRequests.length).toBe(1);
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Let’s set up Academics' })).toBeVisible();
      const second = await browser.newContext();
      const secondPage = await second.newPage();
      await prepare(secondPage, request);
      await login(secondPage, 'admin2');
      await secondPage.goto(ordinaryPath);
      await expect(secondPage).toHaveURL(/\/academic\/audits\?source=setup-smoke$/);
      await expect(secondPage.getByRole('heading', { name: 'Academic Audits' })).toBeVisible();
      await second.close();
      await expectHealthy(page);
    });

    test('direct configuration records its exact key and a stale automatic guide returns safely', async ({
      page,
      request,
    }) => {
      await login(page);
      await page.goto('/academic/curriculumSetting/subjectCreation');
      await expect(page.getByRole('button', { name: /Add Subject/i }).first()).toBeVisible();
      await expect
        .poll(async () => (await snapshot(request)).visitRequests[0]?.settingKey)
        .toBe('subjects');
      await page.goto(
        `/academic/setup?source=automatic&returnTo=${encodeURIComponent(ordinaryPath)}`
      );
      await expect(page).toHaveURL(/\/academic\/audits\?source=setup-smoke$/);
      await expectHealthy(page);
    });

    test('manual setup defers, saves and resumes its cursor before recording review', async ({
      page,
      request,
    }) => {
      await request.post(`${fixtureApi}/fixture/mark-visited`);
      await login(page);
      await openGuide(page);
      await page.getByRole('button', { name: 'Get started', exact: true }).click();
      await expect(page).toHaveURL(/stage=curriculum.*setting=subjects/);
      await page.getByRole('button', { name: 'Do this later', exact: true }).click();
      await expect(page).toHaveURL(/setting=elective-groups/);
      await expect
        .poll(async () => (await snapshot(request)).progress.deferredSettingKeys)
        .toEqual(['subjects']);
      await page.reload();
      await expect(page.getByRole('tab', { name: 'Elective Group Creation' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 2500 } });
      const save = page
        .getByRole('contentinfo')
        .getByRole('button', { name: 'Save progress', exact: true })
        .click();
      await expect(
        page.getByRole('contentinfo').getByRole('button', { name: 'Saving…', exact: true })
      ).toBeDisabled();
      await save;
      await expect(
        page.getByRole('contentinfo').getByRole('button', { name: 'Save & continue', exact: true })
      ).toBeEnabled();
      await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 0 } });
      await page.getByRole('button', { name: 'Review & Finish', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Review your Academic setup' })).toBeVisible();
      await page.getByRole('button', { name: 'Finish review', exact: true }).click();
      await expect.poll(async () => (await snapshot(request)).progress.reviewedAt).toBeTruthy();
    });

    test('all nine production setting panels load and Subject creation persists its production payload', async ({
      page,
      request,
    }) => {
      await request.post(`${fixtureApi}/fixture/mark-visited`);
      await login(page);
      const panels = [
        ['curriculum', 'subjects', 'Subjects Creation', '/subjects'],
        ['curriculum', 'elective-groups', 'Elective Group Creation', '/elective-groups'],
        ['timetable', 'weekly-lectures', 'Weekly Lectures', '/weekly-lecture-slots'],
        ['timetable', 'lecture-slots', 'Lecture Slots', '/lecture-slots'],
        ['homework', 'homework-types', 'Homework Types', '/homework-type'],
        ['homework', 'assignment-types', 'Assignment Types', '/assignment-type'],
        ['homework', 'rubrics', 'Rubric Templates', '/rubrics/templates/paged'],
        ['examination', 'grading-scales', 'Grade Scaling', '/grading-scales'],
        ['examination', 'exam-types', 'Exam Types', '/exam-type'],
      ];
      for (const [stage, setting, title, endpoint] of panels) {
        await openGuide(page, `stage=${stage}&setting=${setting}`);
        await expect(page.getByRole('tab', { name: title, exact: true })).toHaveAttribute(
          'aria-selected',
          'true'
        );
        await expect
          .poll(async () =>
            (await snapshot(request)).requests.some(
              (item: { method: string; path: string }) =>
                item.method === 'GET' && item.path.endsWith(endpoint)
            )
          )
          .toBe(true);
        await expect(page.getByText('Loading setting')).toHaveCount(0);
        await expectHealthy(page);
      }
      await openGuide(page, 'stage=curriculum&setting=subjects');
      await page
        .getByRole('button', { name: /Add Subject/i })
        .first()
        .click();
      const dialog = page.getByRole('dialog', { name: 'Add Subject' });
      await dialog.getByLabel(/^Subject name/).fill('Synthetic Science');
      await dialog.getByRole('button', { name: 'Green (#00B96B)', exact: true }).click();
      await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect
        .poll(async () => (await snapshot(request)).settings.subjects?.[0]?.name)
        .toBe('Synthetic Science');
      const data = await snapshot(request);
      const context = await (await request.get(`${fixtureApi}/fixture/context`)).json();
      expect(
        data.requests.find(
          (item: { method: string; path: string }) =>
            item.method === 'POST' && item.path.endsWith('/subjects')
        ).body
      ).toMatchObject({
        name: 'Synthetic Science',
        category: 'General',
        color: '#00B96B',
        educationMediumId: context.ids.medium,
      });
      await expect(
        page.getByRole('row', { name: 'View subject Synthetic Science', exact: true })
      ).toBeVisible();
    });

    test('peer setting tabs keep stage headings, navigation and footer stable during saved navigation', async ({
      page,
      request,
    }) => {
      await request.post(`${fixtureApi}/fixture/mark-visited`);
      await login(page);
      const stages = [
        [
          'curriculum',
          'subjects',
          'Subjects Creation',
          'Elective Group Creation',
          'elective-groups',
        ],
        ['timetable', 'weekly-lectures', 'Weekly Lectures', 'Lecture Slots', 'lecture-slots'],
        ['homework', 'homework-types', 'Homework Types', 'Assignment Types', 'assignment-types'],
        ['examination', 'grading-scales', 'Grade Scaling', 'Exam Types', 'exam-types'],
      ];
      for (const [stage, firstSetting, firstTitle, nextTitle, nextSetting] of stages) {
        await test.step(`${stage} peer tabs`, async () => {
          await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 0 } });
          await openGuide(page, `stage=${stage}&setting=${firstSetting}`);
          await expect(page.getByRole('tab', { name: firstTitle, exact: true })).toHaveAttribute(
            'aria-selected',
            'true'
          );
          await expect(page.getByLabel('Loading setting', { exact: true })).toHaveCount(0);
          const footer = page.getByRole('contentinfo');
          await footer.getByRole('button', { name: 'Save progress', exact: true }).click();
          await expect(
            footer.getByRole('button', { name: 'Save & continue', exact: true })
          ).toBeEnabled();
          await expect
            .poll(async () => (await snapshot(request)).progress.currentSettingKey)
            .toBe(firstSetting);
          const geometry = async () => {
            const [heading, tabs, footerBox] = await Promise.all([
              page.getByRole('heading', { level: 1 }).boundingBox(),
              page.getByRole('tablist', { name: 'Settings in this step' }).boundingBox(),
              footer.boundingBox(),
            ]);
            expect(heading).not.toBeNull();
            expect(tabs).not.toBeNull();
            expect(footerBox).not.toBeNull();
            return {
              headingY: heading!.y,
              tabsY: tabs!.y,
              footerY: footerBox!.y,
              footerHeight: footerBox!.height,
              scrollTop: await page
                .getByRole('main', { name: 'Setup content' })
                .evaluate((node) => node.scrollTop),
            };
          };
          const before = await geometry();
          await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 800 } });
          await page.getByRole('tab', { name: nextTitle, exact: true }).click();
          await expect(footer.getByRole('button', { name: 'Saving…', exact: true })).toBeDisabled();
          const during = await geometry();
          for (const key of [
            'headingY',
            'tabsY',
            'footerY',
            'footerHeight',
            'scrollTop',
          ] as const) {
            expect
              .soft(Math.abs(during[key] - before[key]), `${stage}: ${key} while saving`)
              .toBeLessThanOrEqual(1);
          }
          await expect(page.getByRole('tab', { name: nextTitle, exact: true })).toHaveAttribute(
            'aria-selected',
            'true'
          );
          await expect(
            footer.getByRole('button', { name: 'Save & continue', exact: true })
          ).toBeEnabled();
          await expect
            .poll(async () => (await snapshot(request)).progress.currentSettingKey)
            .toBe(nextSetting);
          await expect(page.getByLabel('Loading setting', { exact: true })).toHaveCount(0);
          const after = await geometry();
          for (const key of [
            'headingY',
            'tabsY',
            'footerY',
            'footerHeight',
            'scrollTop',
          ] as const) {
            expect
              .soft(Math.abs(after[key] - before[key]), `${stage}: ${key} after navigation`)
              .toBeLessThanOrEqual(1);
          }
          await expectHealthy(page);
        });
      }
    });

    test('dirty inline Rubric form blocks guide navigation and scope without relying on a dialog backdrop', async ({
      page,
      request,
    }) => {
      await request.post(`${fixtureApi}/fixture/mark-visited`);
      await login(page);
      await openGuide(page, 'stage=homework&setting=rubrics');
      await page.getByRole('button', { name: 'Add Rubric Template', exact: true }).click();
      await page.getByLabel(/^Rubric name/).fill('Unsaved synthetic rubric');
      await expect(
        page.getByText('Save or cancel the open form before moving to another setting.')
      ).toBeVisible();
      const footer = page.getByRole('contentinfo');
      for (const name of ['Save progress', 'Save & continue', 'Do this later', 'Save & exit'])
        await expect(footer.getByRole('button', { name, exact: true })).toBeDisabled();
      await expect(page.getByRole('tab', { name: 'Homework Types', exact: true })).toBeDisabled();
      expect(
        await page
          .locator('[data-onboarding="academic-year"]')
          .evaluate((node) => Boolean(node.closest('[inert]')))
      ).toBe(true);
      await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
      await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
      await expect(
        footer.getByRole('button', { name: 'Save & continue', exact: true })
      ).toBeEnabled();
    });
  }
);

for (const { width, height } of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
])
  for (const theme of ['light', 'dark']) {
    test(
      `setup footer and layout stay reachable at ${width}px in ${theme}`,
      { tag: ['@module-academic', '@submodule-setup', '@responsive'] },
      async ({ page, request }) => {
        await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true } });
        await page.setViewportSize({ width, height });
        await prepare(page, request, theme);
        await login(page);
        await openGuide(page);
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
        await expect(page.getByRole('heading', { name: 'Let’s set up Academics' })).toBeVisible();
        const footer = await page.getByRole('contentinfo').boundingBox();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(height + 1);
        await expectHealthy(page);
        await page.screenshot({
          path: `.artifacts/academic-module-setup/guide-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    );
  }
