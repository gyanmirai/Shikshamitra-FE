/* eslint-disable import/no-extraneous-dependencies */
import type { Page } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const cycle = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Admissions 2027-28',
  code: 'ADM-2728',
  academicYearId: '22222222-2222-2222-2222-222222222222',
  startDate: '2027-10-01T00:00:00Z',
  endDate: '2028-03-31T00:00:00Z',
  status: 1,
};

const targetCycle = {
  ...cycle,
  id: '12121212-1212-1212-1212-121212121212',
  name: 'Admissions 2028-29',
  code: 'ADM-2829',
  academicYearId: '23232323-2323-2323-2323-232323232323',
  startDate: '2028-10-01T00:00:00Z',
  endDate: '2029-03-31T00:00:00Z',
};

const hierarchyIds = {
  board: '33333333-3333-3333-3333-333333333333',
  medium: '44444444-4444-4444-4444-444444444444',
  stage: '55555555-5555-5555-5555-555555555555',
  standard: '66666666-6666-6666-6666-666666666666',
};

const configurationIds = {
  workflow: '88888888-8888-8888-8888-888888888888',
  inquiryForm: '99999999-9999-9999-9999-999999999999',
  applicationForm: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
};

const campus = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  name: 'North Campus',
  code: 'NC',
  isActive: true,
};

async function seriousAccessibilityViolations(page: Page, include: string) {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
}

test.describe('Admission Offering setup', { tag: ['@student', '@critical'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        json: {
          user: { id: 'academic-admin', email: 'academic-admin@example.test' },
          expires: '2099-01-01T00:00:00.000Z',
          accessToken: 'admission-offering-e2e-token',
          profile: {
            sub: 'academic-admin',
            exp: 4070908800,
          },
        },
      })
    );
    await page.route('**/api/permission-management/permissions*', (route) =>
      route.fulfill({
        json: {
          groups: [
            {
              permissions: [
                { name: 'ShikshaMitra.Module.Students', isGranted: true },
                { name: 'Students.Admissions.Offerings.View', isGranted: true },
                { name: 'Students.Admissions.Offerings.Add', isGranted: true },
                { name: 'Students.Admissions.Offerings.Delete', isGranted: true },
              ],
            },
          ],
        },
      })
    );
  });

  test('creates an inherited-date offering through cascading hierarchy selectors', async ({
    page,
  }) => {
    let createPayload: Record<string, unknown> | null = null;
    let clonePayload: Record<string, unknown> | null = null;
    let createAttempts = 0;
    let validationAttempts = 0;
    const optionRequestUrls: string[] = [];
    await page.route('**/api/app/admission-campus*', (route) => {
      optionRequestUrls.push(route.request().url());
      return route.fulfill({ json: { data: { totalCount: 1, items: [campus] } } });
    });
    await page.route('**/api/student/enrollment/admissions/cycles*', (route) =>
      route.fulfill({ json: { data: { totalCount: 2, items: [cycle, targetCycle] } } })
    );
    await page.route('**/api/app/academic-organization-options*', (route) => {
      const academicYearId = new URL(route.request().url()).searchParams.get('academicYearId');
      return route.fulfill({
        json: {
          items: [
            {
              id: hierarchyIds.stage,
              label: 'Primary',
              stageName: 'Primary',
              mediumId: hierarchyIds.medium,
              mediumName: 'English',
              boardId: hierarchyIds.board,
              boardName: 'CBSE',
              academicYearId,
            },
          ],
        },
      });
    });
    await page.route(`**/api/education-medium/${hierarchyIds.medium}/standards*`, (route) =>
      route.fulfill({
        json: [
          {
            id: hierarchyIds.standard,
            name: 'Grade 5',
            educationMediumStageId: hierarchyIds.stage,
            divisions: [],
          },
        ],
      })
    );
    await page.route('**/api/student/enrollment/admissions/workflows*', (route) => {
      optionRequestUrls.push(route.request().url());
      return route.fulfill({
        json: {
          data: {
            totalCount: 1,
            items: [
              {
                id: configurationIds.workflow,
                name: 'Grade 5 Admission v1',
                code: 'GRADE-5-V1',
                version: 1,
                status: 1,
                stages: [],
                transitions: [],
              },
            ],
          },
        },
      });
    });
    await page.route('**/api/student/enrollment/admissions/forms*', (route) => {
      optionRequestUrls.push(route.request().url());
      return route.fulfill({
        json: {
          data: {
            totalCount: 2,
            items: [
              {
                id: configurationIds.inquiryForm,
                name: 'Grade 5 Inquiry v1',
                code: 'GRADE-5-INQUIRY-V1',
                version: 1,
                status: 1,
                layoutType: 0,
                sections: [],
              },
              {
                id: configurationIds.applicationForm,
                name: 'Grade 5 Registration v1',
                code: 'GRADE-5-APPLICATION-V1',
                version: 1,
                status: 1,
                layoutType: 0,
                sections: [],
              },
            ],
          },
        },
      });
    });
    await page.route(
      /\/api\/student\/enrollment\/admissions\/offerings(?:\/.*)?(?:\?.*)?$/,
      async (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname.replace(/\/$/, '');
        const offeringDetail = {
          id: '77777777-7777-7777-7777-777777777777',
          admissionCycleId: cycle.id,
          admissionCycleName: cycle.name,
          boardId: hierarchyIds.board,
          boardName: 'CBSE',
          mediumId: hierarchyIds.medium,
          mediumName: 'English',
          stageId: hierarchyIds.stage,
          stageName: 'Primary',
          standardId: hierarchyIds.standard,
          standardName: 'Grade 5',
          code: 'GRADE-5',
          effectiveOpenDate: cycle.startDate,
          effectiveCloseDate: cycle.endDate,
          workflowName: 'Grade 5 Admission v1',
          workflowVersion: 1,
          inquiryFormName: 'Grade 5 Inquiry v1',
          inquiryFormVersion: 1,
          applicationFormName: 'Grade 5 Registration v1',
          applicationFormVersion: 1,
          isActive: true,
          availabilityStatus: 2,
          configurationStatus: 1,
          applicationCount: 0,
          canEditIdentity: true,
          canDelete: true,
          useCycleDates: true,
          workflowDefinitionId: configurationIds.workflow,
          inquiryFormDefinitionId: configurationIds.inquiryForm,
          applicationFormDefinitionId: configurationIds.applicationForm,
          configuration: { isValid: true, status: 1, errors: [] },
          concurrencyStamp: 'stamp',
          creationTime: cycle.startDate,
        };
        if (request.method() === 'GET') {
          if (pathname.endsWith(`/${offeringDetail.id}`)) {
            await route.fulfill({ json: { data: offeringDetail } });
            return;
          }
          await route.fulfill({
            json: {
              data: {
                totalCount: createAttempts > 0 ? 1 : 0,
                items: createAttempts > 0 ? [offeringDetail] : [],
              },
            },
          });
          return;
        }
        if (request.method() === 'POST' && pathname.endsWith(`/${offeringDetail.id}/clone`)) {
          clonePayload = request.postDataJSON() as Record<string, unknown>;
          await route.fulfill({
            json: {
              data: {
                ...offeringDetail,
                id: 'cloned-offering-grade-5',
                admissionCycleId: targetCycle.id,
                admissionCycleName: targetCycle.name,
                isActive: clonePayload.isActive,
              },
            },
          });
          return;
        }
        if (request.method() === 'POST' && pathname.endsWith('/validate')) {
          await route.fulfill({
            json: {
              data: {
                isValid: true,
                status: 2,
                errors: [],
              },
            },
          });
        } else if (request.method() === 'POST' && request.url().includes(`/cycles/${cycle.id}`)) {
          createPayload = request.postDataJSON() as Record<string, unknown>;
          await route.fulfill({
            json: {
              data: {
                id: 'offering-grade-5',
                admissionCycleId: cycle.id,
                admissionCycleName: cycle.name,
                boardId: hierarchyIds.board,
                boardName: 'CBSE',
                mediumId: hierarchyIds.medium,
                mediumName: 'English',
                stageId: hierarchyIds.stage,
                stageName: 'Primary',
                standardId: hierarchyIds.standard,
                standardName: 'Grade 5',
                code: 'GRADE-5',
                effectiveOpenDate: cycle.startDate,
                effectiveCloseDate: cycle.endDate,
                isActive: true,
                availabilityStatus: 2,
                configurationStatus: 2,
                applicationCount: 0,
                canEditIdentity: true,
                canDelete: true,
                useCycleDates: true,
                workflowDefinitionId: configurationIds.workflow,
                inquiryFormDefinitionId: configurationIds.inquiryForm,
                applicationFormDefinitionId: configurationIds.applicationForm,
                configuration: { isValid: true, status: 2, errors: [] },
                concurrencyStamp: 'stamp',
                creationTime: cycle.startDate,
              },
            },
          });
        } else {
          await route.fulfill({ json: { data: { totalCount: 0, items: [] } } });
        }
      }
    );
    await page.route(
      `**/api/student/enrollment/admissions/offerings/cycles/${cycle.id}*`,
      async (route) => {
        createAttempts += 1;
        if (createAttempts > 1) {
          await route.fulfill({
            status: 409,
            json: {
              error: {
                code: 'Admissions.OfferingDuplicate',
                message: 'An Admission Offering already exists for this hierarchy.',
              },
            },
          });
          return;
        }
        createPayload = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          json: {
            data: {
              id: '77777777-7777-7777-7777-777777777777',
              admissionCycleId: cycle.id,
              admissionCycleName: cycle.name,
              boardId: hierarchyIds.board,
              boardName: 'CBSE',
              mediumId: hierarchyIds.medium,
              mediumName: 'English',
              stageId: hierarchyIds.stage,
              stageName: 'Primary',
              standardId: hierarchyIds.standard,
              standardName: 'Grade 5',
              code: 'GRADE-5',
              effectiveOpenDate: cycle.startDate,
              effectiveCloseDate: cycle.endDate,
              isActive: true,
              availabilityStatus: 2,
              configurationStatus: 2,
              applicationCount: 0,
              canEditIdentity: true,
              canDelete: true,
              useCycleDates: true,
              workflowDefinitionId: configurationIds.workflow,
              inquiryFormDefinitionId: configurationIds.inquiryForm,
              applicationFormDefinitionId: configurationIds.applicationForm,
              configuration: { isValid: true, status: 2, errors: [] },
              concurrencyStamp: 'stamp',
              creationTime: cycle.startDate,
            },
          },
        });
      }
    );
    await page.route('**/api/student/enrollment/admissions/offerings/validate*', async (route) => {
      validationAttempts += 1;
      if (validationAttempts === 1) {
        await route.fulfill({
          status: 503,
          json: { error: { message: 'Validation is temporarily unavailable. Try again.' } },
        });
        return;
      }
      await route.fulfill({
        json: {
          data: {
            isValid: true,
            status: 2,
            errors: [],
          },
        },
      });
    });

    const completeOfferingForm = async () => {
      const dialog = page.getByRole('dialog', { name: 'Add Admission Offering' });
      await dialog.getByLabel('Board *').click();
      await page.getByRole('option', { name: 'CBSE' }).click();
      await dialog.getByLabel('Medium *').click();
      await page.getByRole('option', { name: 'English' }).click();
      await dialog.getByLabel('School level *').click();
      await page.getByRole('option', { name: 'Primary' }).click();
      await dialog.getByLabel('Standard *').click();
      await page.getByRole('option', { name: 'Grade 5' }).click();
      await dialog.getByLabel('Offering code *').fill('GRADE-5');
      await dialog.getByLabel('Published workflow').click();
      await page.getByRole('option', { name: 'Grade 5 Admission v1' }).click();
      await dialog.getByLabel('Published inquiry form').click();
      await page.getByRole('option', { name: 'Grade 5 Inquiry v1' }).click();
      await dialog.getByLabel('Published application form').click();
      await page.getByRole('option', { name: 'Grade 5 Registration v1' }).click();
      return dialog;
    };

    await page.goto('/student/admissions/settings/offerings');
    await expect(page.getByRole('heading', { name: 'Admission Offerings' })).toBeVisible();
    const breadcrumbs = page.getByRole('navigation', { name: 'breadcrumb' });
    await expect(breadcrumbs.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'href',
      '/student/dashboard'
    );
    await expect(breadcrumbs.getByRole('link', { name: 'Admissions' })).toHaveAttribute(
      'href',
      '/student/admissions'
    );
    await expect(breadcrumbs.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/cycles'
    );
    await expect(breadcrumbs).toContainText('Admission Offerings');
    await expect(page.getByRole('button', { name: 'Add offering' })).toBeEnabled();
    expect(await seriousAccessibilityViolations(page, 'main')).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    const availabilityFilter = page.getByRole('combobox', { name: 'Availability' });
    await availabilityFilter.click();
    await page.getByRole('option', { name: 'Open', exact: true }).click();
    await expect(page.getByText('No offerings match the current filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByText('No offerings match the current filters.')).toBeHidden();
    await expect(availabilityFilter).toContainText('All availability statuses');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    ).toBe(true);
    await expect
      .poll(
        () =>
          optionRequestUrls.filter(
            (url) => new URL(url).searchParams.get('maxResultCount') === '25'
          ).length
      )
      .toBeGreaterThanOrEqual(1);

    await [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ].reduce(async (previous, viewport) => {
      await previous;
      await page.setViewportSize(viewport);
      await expect(page.getByRole('heading', { name: 'Admission Offerings' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add offering' })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
        )
      ).toBe(true);
    }, Promise.resolve());

    await page.getByRole('button', { name: 'Add offering' }).click();
    const dialog = await completeOfferingForm();
    expect(
      ['admission-campus', '/admissions/workflows', '/admissions/forms'].every((path) =>
        optionRequestUrls.some(
          (url) => url.includes(path) && new URL(url).searchParams.get('maxResultCount') === '25'
        )
      )
    ).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog.getByRole('button', { name: 'Save as inactive' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Validate and activate' })).toBeVisible();
    await expect(dialog.getByRole('progressbar')).toHaveCount(0);
    expect(await seriousAccessibilityViolations(page, '[role="dialog"]')).toEqual([]);
    page.once('dialog', (confirmation) => confirmation.dismiss());
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Offering code *')).toHaveValue('GRADE-5');
    await dialog.getByRole('button', { name: 'Validate and activate' }).click();
    await expect(page.getByText('Validation is temporarily unavailable. Try again.')).toBeVisible();
    await expect(dialog.getByLabel('Offering code *')).toHaveValue('GRADE-5');
    await expect(dialog.getByLabel('Published workflow')).toHaveValue('Grade 5 Admission v1');
    await dialog.getByRole('button', { name: 'Validate and activate' }).click();

    await expect.poll(() => createPayload).not.toBeNull();
    expect(validationAttempts).toBe(2);
    expect(createPayload).toMatchObject({
      code: 'GRADE-5',
      useCycleDates: true,
      openDate: null,
      closeDate: null,
      workflowDefinitionId: configurationIds.workflow,
      inquiryFormDefinitionId: configurationIds.inquiryForm,
      applicationFormDefinitionId: configurationIds.applicationForm,
      isActive: true,
    });

    await expect(dialog).toBeHidden();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: 'Add offering' }).click();
    const duplicateDialog = await completeOfferingForm();
    await duplicateDialog.getByRole('button', { name: 'Validate and activate' }).click();
    await expect(
      page.getByText('An offering already exists for this cycle and academic hierarchy.')
    ).toBeVisible();
    expect(createAttempts).toBe(2);

    page.once('dialog', (confirmation) => confirmation.accept());
    await duplicateDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(duplicateDialog).toBeHidden();
    await expect(page.getByText('GRADE-5', { exact: true })).toBeVisible();
    const rowActions = page.getByRole('button', { name: 'Actions for GRADE-5' });
    const cloneAction = page.getByRole('menuitem', { name: 'Clone' });
    await expect(async () => {
      await rowActions.click();
      await expect(cloneAction).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 10_000 });
    await cloneAction.click();

    const cloneDialog = page.getByRole('dialog', { name: 'Clone Admission Offering' });
    await cloneDialog.getByLabel('Target admission cycle *').click();
    await page.getByRole('option', { name: targetCycle.name }).click();
    await cloneDialog.getByLabel('Campus (optional)').click();
    await page.getByRole('option', { name: 'North Campus · NC' }).click();
    await cloneDialog.getByLabel('Board *').click();
    await page.getByRole('option', { name: 'CBSE' }).click();
    await cloneDialog.getByLabel('Medium *').click();
    await page.getByRole('option', { name: 'English' }).click();
    await cloneDialog.getByLabel('School level *').click();
    await page.getByRole('option', { name: 'Primary' }).click();
    await cloneDialog.getByLabel('Standard *').click();
    await page.getByRole('option', { name: 'Grade 5' }).click();
    await cloneDialog.getByRole('button', { name: 'Clone as inactive' }).click();

    await expect.poll(() => clonePayload).not.toBeNull();
    expect(clonePayload).toMatchObject({
      admissionCycleId: targetCycle.id,
      campusId: campus.id,
      boardId: hierarchyIds.board,
      mediumId: hierarchyIds.medium,
      stageId: hierarchyIds.stage,
      standardId: hierarchyIds.standard,
      isActive: false,
    });
  });

  test('previews and commits five standards atomically through bulk creation', async ({ page }) => {
    const standards = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map(
      (name, index) => ({
        id: `standard-${index + 1}`,
        name,
        educationMediumStageId: hierarchyIds.stage,
        divisions: [],
      })
    );
    const bulkPayloads: Record<string, unknown>[] = [];
    await page.route('**/api/student/enrollment/admissions/offerings*', (route) =>
      route.fulfill({ json: { data: { totalCount: 0, items: [] } } })
    );

    await page.route('**/api/student/enrollment/admissions/cycles*', (route) =>
      route.fulfill({ json: { data: { totalCount: 1, items: [cycle] } } })
    );
    await page.route('**/api/app/academic-organization-options*', (route) =>
      route.fulfill({
        json: {
          items: [
            {
              id: hierarchyIds.stage,
              label: 'Primary',
              stageName: 'Primary',
              mediumId: hierarchyIds.medium,
              mediumName: 'English',
              boardId: hierarchyIds.board,
              boardName: 'CBSE',
              academicYearId: cycle.academicYearId,
            },
          ],
        },
      })
    );
    await page.route(`**/api/education-medium/${hierarchyIds.medium}/standards*`, (route) =>
      route.fulfill({ json: standards })
    );
    await page.route('**/api/student/enrollment/admissions/workflows*', (route) =>
      route.fulfill({
        json: {
          data: {
            totalCount: 1,
            items: [
              {
                id: configurationIds.workflow,
                name: 'Grade 5 Admission v1',
                code: 'GRADE-5-V1',
                version: 1,
                status: 1,
                stages: [],
                transitions: [],
              },
            ],
          },
        },
      })
    );
    await page.route('**/api/student/enrollment/admissions/forms*', (route) =>
      route.fulfill({
        json: {
          data: {
            totalCount: 2,
            items: [
              {
                id: configurationIds.inquiryForm,
                name: 'Grade 5 Inquiry v1',
                code: 'GRADE-5-INQUIRY-V1',
                version: 1,
                status: 1,
                layoutType: 0,
                sections: [],
              },
              {
                id: configurationIds.applicationForm,
                name: 'Grade 5 Registration v1',
                code: 'GRADE-5-APPLICATION-V1',
                version: 1,
                status: 1,
                layoutType: 0,
                sections: [],
              },
            ],
          },
        },
      })
    );
    await page.route('**/api/student/enrollment/admissions/offerings/**', async (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname.replace(/\/$/, '');
      if (request.method() === 'GET') {
        await route.fulfill({ json: { data: { totalCount: 0, items: [] } } });
        return;
      }
      if (request.method() === 'POST' && pathname.endsWith(`/cycles/${cycle.id}/bulk`)) {
        const payload = request.postDataJSON() as Record<string, unknown>;
        bulkPayloads.push(payload);
        const previewOnly = payload.previewOnly === true;
        const configurationReady = Boolean(
          payload.workflowDefinitionId &&
          payload.inquiryFormDefinitionId &&
          payload.applicationFormDefinitionId
        );
        await route.fulfill({
          json: {
            data: {
              isPreview: previewOnly,
              canCommit: true,
              createdCount: previewOnly ? 0 : standards.length,
              items: standards.map((standard) => ({
                standardId: standard.id,
                code: `ADM-${standard.name.replace(' ', '-').toUpperCase()}`,
                isValid: true,
                canSaveInactive: true,
                canActivate: configurationReady,
                errors: configurationReady
                  ? []
                  : [{ code: 'Admissions.OfferingWorkflowMissing', message: 'Workflow required.' }],
                offeringId: previewOnly ? null : `offering-${standard.id}`,
              })),
            },
          },
        });
        return;
      }
      await route.fulfill({ json: { data: { totalCount: 0, items: [] } } });
    });

    await page.goto('/student/admissions/settings/offerings');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.getByRole('button', { name: 'Bulk create' }).click();
    const dialog = page.getByRole('dialog', { name: 'Bulk Create Admission Offerings' });
    await dialog.getByLabel('Board *').click();
    await page.getByRole('option', { name: 'CBSE' }).click();
    await dialog.getByLabel('Medium *').click();
    await page.getByRole('option', { name: 'English' }).click();
    await dialog.getByLabel('School level *').click();
    await page.getByRole('option', { name: 'Primary' }).click();
    await dialog.getByLabel('Standards *').click();
    await standards.reduce(
      (previous, standard) =>
        previous.then(() => page.getByRole('option', { name: standard.name }).click()),
      Promise.resolve()
    );
    await page.keyboard.press('Escape');
    await dialog.getByLabel('Code prefix *').fill('ADM');

    await dialog.getByRole('button', { name: 'Preview Offerings' }).click();
    await expect.poll(() => bulkPayloads.length).toBe(1);
    await expect(dialog.getByText('Can be saved as inactive').first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create as inactive' })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Create and activate' })).toBeDisabled();

    await dialog.getByLabel('Published workflow').click();
    await page.getByRole('option', { name: 'Grade 5 Admission v1' }).click();
    await dialog.getByLabel('Inquiry form').click();
    await page.getByRole('option', { name: 'Grade 5 Inquiry v1' }).click();
    await dialog.getByLabel('Application form').click();
    await page.getByRole('option', { name: 'Grade 5 Registration v1' }).click();

    await dialog.getByRole('button', { name: 'Preview Offerings' }).click();
    await expect.poll(() => bulkPayloads.length).toBe(2);
    await expect(dialog.getByText('ADM-GRADE-1')).toBeVisible();
    await expect(dialog.getByText('ADM-GRADE-5')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create and activate' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Create and activate' }).click();

    await expect(page.getByText('5 offerings created')).toBeVisible();
    expect(bulkPayloads).toHaveLength(3);
    expect(bulkPayloads[0]).toMatchObject({
      previewOnly: true,
      isActive: false,
      items: standards.map((item) => ({ standardId: item.id })),
    });
    expect(bulkPayloads[1]).toMatchObject({
      previewOnly: true,
      isActive: false,
      workflowDefinitionId: configurationIds.workflow,
      inquiryFormDefinitionId: configurationIds.inquiryForm,
      applicationFormDefinitionId: configurationIds.applicationForm,
      items: standards.map((item) => ({ standardId: item.id })),
    });
    expect(bulkPayloads[2]).toMatchObject({
      previewOnly: false,
      isActive: true,
      items: standards.map((item) => ({ standardId: item.id })),
    });
  });
});
