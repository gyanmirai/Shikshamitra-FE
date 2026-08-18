/* eslint-disable import/no-extraneous-dependencies */
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

test.describe('Admission Offering setup', { tag: ['@student', '@critical'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('creates an inherited-date offering through cascading hierarchy selectors', async ({
    page,
  }) => {
    let createPayload: Record<string, unknown> | null = null;
    let createAttempts = 0;
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
    await page.route('**/api/student/enrollment/admissions/offerings*', async (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname.replace(/\/$/, '');
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
    });
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
    await page.route('**/api/student/enrollment/admissions/offerings/validate*', (route) =>
      route.fulfill({
        json: {
          data: {
            isValid: true,
            status: 2,
            errors: [],
          },
        },
      })
    );

    const completeOfferingForm = async () => {
      const dialog = page.getByRole('dialog', { name: 'Add Admission Offering' });
      await dialog.getByLabel('Board *').click();
      await page.getByRole('option', { name: 'CBSE' }).click();
      await dialog.getByLabel('Medium *').click();
      await page.getByRole('option', { name: 'English' }).click();
      await dialog.getByLabel('Stage *').click();
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
      await dialog.getByRole('switch', { name: 'Active' }).click();
      return dialog;
    };

    await page.goto('/student/admissions/settings/offerings');
    await expect(page.getByRole('heading', { name: 'Admission Offerings' })).toBeVisible();
    await page.getByRole('button', { name: 'Add offering' }).click();
    const dialog = await completeOfferingForm();
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => createPayload).not.toBeNull();
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
    await page.getByRole('button', { name: 'Add offering' }).click();
    const duplicateDialog = await completeOfferingForm();
    await duplicateDialog.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('An offering already exists for this cycle and academic hierarchy.')
    ).toBeVisible();
    expect(createAttempts).toBe(2);
  });
});
