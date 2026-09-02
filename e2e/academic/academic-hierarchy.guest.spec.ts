/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const auditFields = {
  creationTime: '2026-06-01T00:00:00Z',
  creatorId: 'admin',
  lastModificationTime: '2026-06-01T00:00:00Z',
  lastModifierId: 'admin',
};

const academicYear = {
  ...auditFields,
  id: 'year-1',
  name: '2026-2027',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T00:00:00Z',
};

const boards = [
  {
    ...auditFields,
    id: 'board-1',
    type: 1,
    name: 'CBSE',
    academicYearId: academicYear.id,
    educationMediums: [
      {
        ...auditFields,
        id: 'medium-1',
        name: 'English',
        educationBoardId: 'board-1',
        educationMediumStages: [
          {
            ...auditFields,
            id: 'stage-1',
            name: 'Primary',
            educationMediumId: 'medium-1',
            standards: [
              {
                ...auditFields,
                id: 'standard-1',
                name: 'Standard 1',
                educationMediumStageId: 'stage-1',
                divisions: [
                  {
                    ...auditFields,
                    id: 'division-1',
                    name: 'A',
                    strength: 40,
                    standardId: 'standard-1',
                  },
                ],
              },
            ],
          },
          ...Array.from({ length: 3 }, (_, index) => ({
            ...auditFields,
            id: `stage-${index + 2}`,
            name: `Stage ${index + 2}`,
            educationMediumId: 'medium-1',
            standards: [],
          })),
        ],
      },
    ],
  },
  {
    ...auditFields,
    id: 'board-2',
    type: 1,
    name: 'GSEB',
    academicYearId: academicYear.id,
    educationMediums: [],
  },
];

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

async function mockHierarchy(page: Page) {
  await page.route('**/api/app/academic-year**', (route) =>
    route.fulfill(json({ items: [academicYear], totalCount: 1 }))
  );
  await page.route('**/api/app/education-board**', (route) =>
    route.fulfill(json({ items: boards, totalCount: boards.length }))
  );
}

async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);
}

test.describe('Academic hierarchy guided setup', () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('is readable, responsive, actionable, and theme aware @visual @accessibility', async ({
    page,
  }) => {
    await mockHierarchy(page);

    for (const viewport of [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'scaled-desktop', width: 1536, height: 742 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/setting/academic-setup', { waitUntil: 'domcontentloaded' });
      const screen = page.getByTestId('academic-hierarchy-screen');

      await expect(screen.getByRole('heading', { name: 'Academic hierarchy' })).toBeVisible();
      await expect(screen.getByText('Setup progress')).toBeVisible();
      await expect(screen.getByText('5 of 5 hierarchy levels are in use')).toBeVisible();
      await expect(screen.getByRole('button', { name: 'Add board' })).toBeVisible();
      await expect(screen.getByText('Hierarchy navigator')).toBeVisible();
      await expectNoPageOverflow(page);

      if (viewport.name === 'scaled-desktop') {
        const screenBounds = await screen.boundingBox();
        const workspaceBounds = await page
          .getByTestId('academic-hierarchy-workspace')
          .boundingBox();
        expect(workspaceBounds && screenBounds).toBeTruthy();
        expect(workspaceBounds?.height ?? 0).toBeGreaterThanOrEqual(
          (screenBounds?.height ?? 0) * 0.45
        );
      }

      await page.screenshot({
        path: `test-results/academic-setup/academic-hierarchy-${viewport.name}.png`,
        fullPage: false,
      });
    }

    await page.getByRole('button', { name: 'Open Board CBSE' }).click();
    await expect(page.getByRole('heading', { name: 'CBSE' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add medium' })).toBeVisible();
    await page.getByRole('button', { name: 'Open Medium English' }).click();
    await page.getByRole('button', { name: 'Open Stage Primary' }).click();

    const boardRow = page.getByRole('button', { name: 'View Board CBSE' });
    const mediumRow = page.getByRole('button', { name: 'View Medium English' });
    const stageRow = page.getByRole('button', { name: 'View Stage Primary' });
    await expect(boardRow).toHaveAttribute('aria-expanded', 'true');
    await expect(mediumRow).toHaveAttribute('aria-expanded', 'true');
    await expect(stageRow).toHaveAttribute('aria-expanded', 'false');

    const scrollRegion = page.getByTestId('academic-hierarchy-scroll-region');
    const screenBounds = await page.getByTestId('academic-hierarchy-screen').boundingBox();
    const explorerBounds = await page
      .getByRole('complementary', { name: 'Academic hierarchy explorer' })
      .boundingBox();
    expect(explorerBounds && screenBounds).toBeTruthy();
    expect((explorerBounds?.y ?? 0) + (explorerBounds?.height ?? 0)).toBeLessThanOrEqual(
      (screenBounds?.y ?? 0) + (screenBounds?.height ?? 0) + 1
    );
    await expect
      .poll(() => scrollRegion.evaluate((element) => element.scrollHeight > element.clientHeight))
      .toBe(true);
    await page.getByText('Hierarchy navigator').hover();
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => scrollRegion.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await scrollRegion.press('Home');
    await expect.poll(() => scrollRegion.evaluate((element) => element.scrollTop)).toBe(0);
    await scrollRegion.press('End');
    await expect
      .poll(() => scrollRegion.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await scrollRegion.press('Home');

    await stageRow.click();
    const standardRow = page.getByRole('button', { name: 'View Standard Standard 1' });
    await expect(standardRow).toBeVisible();
    await standardRow.click();
    await expect(page.getByRole('button', { name: 'View Division A' })).toBeVisible();

    const visibleTreeRows = await page
      .locator('[data-testid^="hierarchy-tree-row-"]:visible')
      .evaluateAll((rows) =>
        rows.map((row) => {
          const bounds = row.getBoundingClientRect();
          return { top: bounds.top, bottom: bounds.bottom };
        })
      );
    visibleTreeRows.slice(1).forEach((row, index) => {
      expect(row.top).toBeGreaterThanOrEqual(visibleTreeRows[index].bottom);
    });

    await page.waitForTimeout(250);

    await page.screenshot({
      path: 'test-results/academic-setup/academic-hierarchy-expanded-desktop.png',
      fullPage: false,
    });

    await page.getByRole('button', { name: 'Open Stage Primary' }).click();

    await expect(page.getByText('Stage', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add standard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit stage Primary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete stage Primary' })).toBeVisible();
    await expect(page.getByText('Organization', { exact: true })).toHaveCount(0);

    for (const label of [
      'Add board',
      'Add standard',
      'Edit stage Primary',
      'Delete stage Primary',
    ]) {
      const bounds = await page.getByRole('button', { name: label }).boundingBox();
      expect(bounds?.height).toBeGreaterThanOrEqual(32);
      expect(bounds?.height).toBeLessThanOrEqual(36);
    }

    await page.getByRole('button', { name: 'Collapse' }).click();
    await expect(mediumRow).toBeHidden();

    await page.getByRole('button', { name: 'settings' }).click();
    await page.getByRole('button', { name: /Dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
    await page.keyboard.press('Escape');
    await expectNoPageOverflow(page);
  });
});
