/* eslint-disable no-restricted-syntax, no-await-in-loop -- Theme and role cases share a synthetic fixture and execute sequentially. */
import { test, expect } from '@playwright/test';

import {
  login,
  prepare,
  snapshot,
  fixtureApi,
  expectHealthy,
} from './academic-module-setup.helpers';

test.describe('Academic Insights', { tag: ['@module-academic', '@submodule-dashboard'] }, () => {
  test('sparse dashboard keeps the header compact and fills each column without stretched cards', async ({ page, request }) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { populated: true } },
    });
    await prepare(page, request);
    await login(page);
    await page.route('**/api/academic/dashboard/insights*', async (route) => {
      const response = await route.fetch();
      const data = await response.json();
      const curriculum = data.sections.find((entry: { key: string }) => entry.key === 'curriculum');
      curriculum.series[0].points = curriculum.series[0].points.slice(0, 1);
      await route.fulfill({ response, json: data });
    });
    await page.goto('/academic/dashboard');
    const reminders = page.getByRole('complementary', { name: 'Classroom reminders' });
    await expect(reminders).toBeVisible();
    await expect(page.locator('main section[aria-label]')).toHaveCount(13);
    const title = (await page.getByRole('heading', { name: 'Academic Dashboard', exact: true }).boundingBox())!;
    const overview = (await page.getByRole('group', { name: 'Academic overview', exact: true }).boundingBox())!;
    expect((await reminders.boundingBox())!.height).toBeLessThanOrEqual(76);
    expect(overview.y - title.y).toBeLessThan(115);
    const curriculum = page.locator('main section[aria-label="Subject Allocation & Syllabus"]');
    const lesson = page.locator('main section[aria-label="Lesson Plans & Teacher Diary"]');
    await expect.poll(async () => {
      const previous = (await curriculum.boundingBox())!;
      const next = (await lesson.boundingBox())!;
      return Math.abs(next.y - previous.y - previous.height - 16);
    }).toBeLessThan(2);
    expect((await curriculum.boundingBox())!.height).toBeLessThan(280);
    const settings = (await page.locator('main section[aria-label="Academic Settings & Setup Guide"]').boundingBox())!;
    expect(settings.width).toBeGreaterThan(overview.width - 2);
    await expectHealthy(page);
  });

  for (const [theme, width, height] of [
    ['light', 1440, 900],
    ['light', 768, 1024],
    ['dark', 390, 844],
  ] as const) {
    test(`all implemented sections render with distinct graphs at ${width} in ${theme}`, async ({
      page,
      request,
    }, testInfo) => {
      await request.post(`${fixtureApi}/fixture/reset`, {
        data: { visited: true, insights: { populated: true } },
      });
      await page.setViewportSize({ width, height });
      await prepare(page, request, theme);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await login(page);
      await page.goto('/academic/dashboard');
      await expect(
        page.getByRole('heading', { name: 'Academic Dashboard', exact: true })
      ).toBeVisible();
      await expect(page.locator('main section[aria-label]')).toHaveCount(13);
      await expect(page.getByTestId('academic-image-dashboard')).toBeVisible();
      const reminders = page.getByRole('complementary', { name: 'Classroom reminders' });
      await expect(reminders).toContainText('SAME');
      await expect(reminders).toContainText('BRIGHTER');
      await expect(reminders).toContainText('TEACH');
      await expect(reminders).toContainText('BELONG');
      await expect(page.getByText('Academic insights and permitted workflows for your assigned responsibilities.', { exact: true })).toHaveCount(0);
      const overview = page.getByRole('group', { name: 'Academic overview', exact: true });
      await expect(overview.getByRole('definition')).toHaveCount(4);
      await expect(overview.getByRole('link')).toHaveCount(0);
      const sections = page.locator('main section[aria-label]');
      const sectionNotes = page.getByRole('note', { name: 'Section reminder' });
      await expect(sectionNotes).toHaveCount(5);
      const notePlacements = await sectionNotes.evaluateAll((notes) => notes.map((note) => {
        const card = note.closest('section')!.getBoundingClientRect();
        const paper = note.getBoundingClientRect();
        const heading = note.closest('section')!.querySelector('h2')!.getBoundingClientRect();
        return { rightInset: card.right - paper.right, topInset: paper.top - card.top,
          rightHalf: paper.left > card.left + card.width / 2,
          clearOfHeading: heading.right <= paper.left || heading.bottom <= paper.top };
      }));
      notePlacements.forEach(({ rightInset, topInset, rightHalf, clearOfHeading }) => {
        expect(rightInset).toBeGreaterThan(6);
        expect(topInset).toBeLessThan(80);
        expect(rightHalf).toBe(true);
        expect(clearOfHeading).toBe(true);
      });
      await expect(page.locator('section[aria-label="Weekly Timetable Overview"]').getByRole('note')).toHaveCount(0);
      const firstBox = (await sections.nth(0).boundingBox())!;
      const secondBox = (await sections.nth(1).boundingBox())!;
      if (width >= 1200) {
        expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(2);
        expect(secondBox.x).toBeGreaterThan(firstBox.x + firstBox.width);
      } else {
        expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
      }
      await expect(page.getByText('View chart data', { exact: true })).toHaveCount(0);
      await expect(page.locator('main').getByRole('button', { name: / information$/ })).toHaveCount(
        13
      );
      await expect(page.getByRole('region', { name: 'Weekly timetable entries' })).toBeVisible();
      await expect(page.getByRole('table', { name: 'Lesson plan states' })).toBeVisible();
      await expect(page.getByRole('table', { name: 'Notification template catalogue' })).toBeVisible();
      if (width >= 1200) {
        expect(firstBox.height).toBeLessThan(360);
        const names = await sections.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')));
        expect(names.slice(0, 8)).toEqual(['Class Teacher Assignments', 'Subject Allocation & Syllabus',
          'Weekly Timetable Overview', 'Lesson Plans & Teacher Diary', 'Homework & Assignments',
          'Evaluation & Feedback', 'Student Academic 360', 'Examination']);
      }
      await expect(
        page
          .getByRole('region', { name: 'Evaluation & Feedback', exact: true })
          .locator('svg.highcharts-root')
      ).toBeVisible();
      const chartDimensions = await page.locator('main svg.highcharts-root').evaluateAll((charts) =>
        charts.map((chart) => ({
          plot: chart.getBoundingClientRect().height,
          frame: chart.closest('[role="region"]')!.getBoundingClientRect().height,
        }))
      );
      expect(chartDimensions).toHaveLength(4);
      chartDimensions.forEach(({ plot, frame }) => expect(plot).toBeLessThanOrEqual(frame + 1));
      const evaluation = page.getByRole('region', { name: 'Evaluation & Feedback', exact: true });
      await expect(evaluation.getByText('23 (76.7%)', { exact: true })).toBeVisible();
      await expect(evaluation.getByText('7 (23.3%)', { exact: true })).toBeVisible();
      const students = page.getByRole('region', { name: 'Student Academic 360', exact: true });
      await expect(students.locator('.highcharts-markers path.highcharts-point')).toHaveCount(3);
      await expect(students.locator('.highcharts-series-group .highcharts-graph')).toHaveCount(0);
      await students.locator('.highcharts-markers path.highcharts-point').first().hover();
      await expect(students.locator('.highcharts-tooltip')).toContainText('Attendance:');
      await expect(students.locator('.highcharts-tooltip')).toContainText('Published score:');
      const slice = evaluation.locator('.highcharts-series path.highcharts-point').first();
      const sliceBox = (await slice.boundingBox())!;
      await slice.hover({ position: { x: sliceBox.width - 8, y: sliceBox.height / 2 } });
      await expect(evaluation.locator('.highcharts-tooltip')).toContainText('Submissions:');
      await page.getByRole('heading', { name: 'Academic Dashboard', exact: true }).hover();
      await page.keyboard.press('Escape');
      const curriculum = page.getByRole('region', {
        name: 'Subject Allocation & Syllabus',
        exact: true,
      });
      await expect(
        curriculum.getByRole('group', { name: 'Syllabus progress summary' })
      ).toContainText('66.3%');
      const timetableChart = page.getByRole('region', { name: 'Weekly timetable entries' });
      expect((await timetableChart.boundingBox())!.height).toBeLessThanOrEqual(181);
      await expect(
        curriculum.getByRole('heading', { name: 'Subject Allocation & Syllabus', level: 2 })
      ).toHaveCSS('font-weight', '600');
      await curriculum
        .getByRole('button', { name: 'Subject Allocation & Syllabus information' })
        .focus();
      await expect(page.getByRole('tooltip')).toContainText('academic scope');
      await page.keyboard.press('Escape');
      const alternative = curriculum.getByRole('group', { name: 'Chart data', exact: true });
      await expect(alternative).toContainText('Mathematics');
      expect((await alternative.boundingBox())?.width).toBe(1);
      await expect(curriculum.getByRole('paragraph').filter({ hasText: /^68%$/ })).toBeVisible();
      await expect(
        page.getByRole('region', { name: 'Notification Templates', exact: true }).getByRole('alert')
      ).toContainText('read-only');
      await expect(page.getByRole('link', { name: 'Schedule exam', exact: true })).toHaveAttribute(
        'href',
        '/academic/scheduleExam'
      );
      await expect(page.locator('main [role="tablist"]')).toHaveCount(0);
      await expect(page.locator('main .MuiChip-root')).toHaveCount(0);
      await expectHealthy(page);
      expect(errors).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), fullPage: true });
      if (width === 1440) {
        await page.getByRole('heading', { name: 'Academic Dashboard', exact: true }).click();
        const designHeight = await page.getByTestId('academic-image-dashboard').evaluate((node) =>
          Math.ceil(node.getBoundingClientRect().height));
        await page.setViewportSize({ width, height: Math.max(height, designHeight + 110) });
        await page.screenshot({ path: testInfo.outputPath('approved-image-full-dashboard.png'), fullPage: true });
        await page.setViewportSize({ width, height });
      }
      const calls = (await snapshot(request)).requests.filter(
        (entry: { path: string }) => entry.path === '/api/academic/dashboard/insights'
      );
      expect(calls.length).toBeGreaterThan(0);
      expect(
        calls.every((entry: { query: Record<string, string> }) => !('accessKey' in entry.query))
      ).toBe(true);
    });
  }

  test('teacher role never bypasses denied staff workflow permissions', async ({
    page,
    request,
  }) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { role: 'teacher', populated: true, restricted: true } },
    });
    await prepare(page, request);
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(page.locator('main')).toContainText('Subject Teacher');
    await expect(page.locator('main section[aria-label]')).toHaveCount(1);
    await expect(page.locator('main section[aria-label]')).toHaveAttribute(
      'aria-label',
      'Student Academic 360'
    );
    await expect(page.getByRole('link', { name: 'Schedule exam', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Subject allocation', exact: true })).toHaveCount(
      0
    );
    await expectHealthy(page);
  });

  test('teacher role prioritizes lessons, tasks and evaluation', async ({ page, request }) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { role: 'teacher', populated: true } },
    });
    await prepare(page, request);
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(page.locator('main section[aria-label]')).toHaveCount(13);
    expect(
      await page
        .locator('main section[aria-label]')
        .evaluateAll((sections) =>
          sections.slice(0, 3).map((section) => section.getAttribute('aria-label'))
        )
    ).toEqual(['Lesson Plans & Teacher Diary', 'Homework & Assignments', 'Evaluation & Feedback']);
    await expectHealthy(page);
  });

  test('parent chooses a verified linked student without exposing staff actions', async ({
    page,
    request,
  }, testInfo) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { role: 'parent', populated: true, restricted: true } },
    });
    await prepare(page, request);
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(
      page.getByText('Choose a linked student to view their academic information.')
    ).toBeVisible();
    await page.getByRole('combobox', { name: 'Student', exact: true }).click();
    await page.getByRole('option', { name: 'Anaya · Class 6 A' }).click();
    await expect(
      page.getByRole('region', { name: 'Attendance & Published Scores', exact: true })
    ).toBeVisible();
    await expect(page.locator('main section[aria-label]')).toHaveCount(6);
    await expect(page.getByRole('region', { name: 'Teacher Feedback', exact: true })).toHaveCount(
      0
    );
    await expect(
      page
        .getByRole('region', { name: 'Attendance & Published Scores', exact: true })
        .locator('.highcharts-markers path.highcharts-point')
    ).toHaveCount(1);
    await expect(page.locator('main').getByText('96%', { exact: true })).toBeVisible();
    await expect(page.locator('main section a')).toHaveCount(0);
    await page.getByRole('combobox', { name: 'Student', exact: true }).click();
    await page.getByRole('option', { name: 'Dev · Class 7 A' }).click();
    await expect(page.locator('main')).toContainText('Dev · Class 7 A · Synthetic school');
    await expect(page.locator('main').getByText('90%', { exact: true })).toBeVisible();
    await expect(page.locator('main').getByText('96%', { exact: true })).toHaveCount(0);
    const calls = (await snapshot(request)).requests.filter((entry: { path: string }) =>
      entry.path.endsWith('/insights')
    );
    expect(calls.at(-1).query.studentId).toBe('student-two');
    await expectHealthy(page);
    await page.screenshot({ path: testInfo.outputPath('parent.png'), fullPage: true });
    await page.route('**/api/academic/dashboard/insights?*', (route) =>
      new URL(route.request().url()).searchParams.get('studentId') === 'student-two'
        ? route.fulfill({ status: 503, json: { title: 'Synthetic student read unavailable' } })
        : route.continue()
    );
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Academic insights could not be loaded' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Choose another student', exact: true }).click();
    await page.getByRole('combobox', { name: 'Student', exact: true }).click();
    await page.getByRole('option', { name: 'Anaya · Class 6 A' }).click();
    await expect(
      page.getByRole('region', { name: 'Attendance & Published Scores', exact: true })
    ).toBeVisible();
  });

  test('changing medium removes old charts while the next context loads', async ({
    page,
    request,
  }) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { populated: true } },
    });
    const context = await (await request.get(`${fixtureApi}/fixture/context`)).json();
    const otherMediumId = '33333333-3333-4333-8333-444444444444';
    await page.route(/\/api\/app\/education-board(?:\?|$|\/hierarchy)/, (route) =>
      route.fulfill({
        json: {
          items: [
            {
              ...context.board,
              educationMediums: [
                context.medium,
                {
                  ...context.medium,
                  id: otherMediumId,
                  name: 'Gujarati',
                  educationMediumStages: [],
                },
              ],
            },
          ],
          totalCount: 1,
        },
      })
    );
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/academic/dashboard/insights?*', async (route) => {
      if (new URL(route.request().url()).searchParams.get('educationMediumId') === otherMediumId)
        await pending;
      await route.continue();
    });
    await prepare(page, request);
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(
      page.getByRole('region', { name: 'Subject Allocation & Syllabus', exact: true })
    ).toBeVisible();
    await page.getByRole('combobox', { name: 'Academic Year, Board and Medium' }).click();
    await page.getByRole('option', { name: /Gujarati/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Loading academic insights' })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Subject Allocation & Syllabus', exact: true })
    ).toHaveCount(0);
    release();
    await expect(
      page.getByRole('region', { name: 'Subject Allocation & Syllabus', exact: true })
    ).toBeVisible();
    const calls = (await snapshot(request)).requests.filter((entry: { path: string }) =>
      entry.path.endsWith('/insights')
    );
    expect(calls.at(-1).query.educationMediumId).toBe(otherMediumId);
    await expectHealthy(page);
  });
  test('remaining staff roles and student prioritize their assigned responsibilities', async ({
    page,
    request,
  }) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { populated: true } },
    });
    await prepare(page, request);
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(page.locator('main section[aria-label]')).toHaveCount(13);
    for (const [role, label, first] of [
      ['director', 'Director', 'Academic Reports'],
      ['principal', 'Principal', 'Student Academic 360'],
      ['vice', 'Vice Principal', 'Weekly Timetable Overview'],
      ['coordinator', 'Academic Coordinator', 'Lesson Plans & Teacher Diary'],
      ['hod', 'Head of Department', 'Subject Allocation & Syllabus'],
      ['classTeacher', 'Class Teacher', 'Student Academic 360'],
      ['exam', 'Examination Coordinator', 'Examination'],
      ['timetable', 'Timetable Coordinator', 'Weekly Timetable Overview'],
      ['student', 'Student', 'My Timetable'],
    ]) {
      await request.post(`${fixtureApi}/fixture/reset`, {
        data: { visited: true, insights: { role, populated: true } },
      });
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await expect(page.locator('main')).toContainText(`${label} ·`);
      await expect(page.locator('main section[aria-label]').first()).toHaveAttribute(
        'aria-label',
        first
      );
      await expect(page.locator('main section[aria-label]')).toHaveCount(
        role === 'student' ? 6 : 13
      );
      await expectHealthy(page);
    }
  });
});
