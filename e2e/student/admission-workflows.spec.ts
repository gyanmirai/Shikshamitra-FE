/* eslint-disable import/no-extraneous-dependencies */
import type { Page, Route } from '@playwright/test';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { test, expect } from '@playwright/test';

const workflowId = '10000000-0000-0000-0000-000000000001';
const inquiryId = '20000000-0000-0000-0000-000000000001';
const admissionId = '20000000-0000-0000-0000-000000000002';

const draft: AdmissionWorkflow = {
  id: workflowId,
  name: 'Grade 5 Admission',
  code: 'GRADE5_ADMISSION',
  description: 'Sunrise Public School admission journey',
  version: 1,
  status: 0,
  parentVersionId: null,
  publishedAt: null,
  publishedBy: null,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp-1',
  creationTime: '2026-08-19T00:00:00Z',
  stages: [
    {
      id: inquiryId,
      code: 'INQUIRY',
      name: 'Inquiry',
      stageType: 0,
      displayOrder: 0,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
    },
    {
      id: admissionId,
      code: 'ADMISSION',
      name: 'Admission',
      stageType: 11,
      displayOrder: 1,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: false,
      isTerminalStage: true,
    },
  ],
  transitions: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      fromStageId: inquiryId,
      toStageId: admissionId,
      priority: 1,
      isDefault: true,
    },
  ],
};

const stageTypes = [
  {
    type: 0,
    displayName: 'Inquiry',
    description: 'Capture and qualify an inquiry.',
    icon: 'mdi:account-question-outline',
    defaultColor: '#0EA5E9',
    supportedConfiguration: [],
    runtimeHandler: 'InquiryStageHandler',
    nextRequiredAction: 'Review and qualify the inquiry',
    canBeEntryStage: true,
    canBeTerminalStage: false,
    supportsFormAttachment: false,
    supportsConditions: true,
    isRuntimeReady: true,
  },
];

const grantWorkflowPermissions = (page: Page) =>
  page.route('**/api/permission-management/permissions*', (route) =>
    route.fulfill({
      json: {
        groups: [
          {
            permissions: ['View', 'Create', 'Edit', 'Validate', 'Publish', 'ViewUsage'].map(
              (action) => ({
                name: `Students.Admissions.Workflows.${action}`,
                isGranted: true,
              })
            ),
          },
        ],
      },
    })
  );

test.describe('Admission workflow builder', { tag: ['@student', '@critical'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('creates an empty draft from the list and preserves the typed payload', async ({ page }) => {
    let createPayload: Record<string, unknown> | null = null;
    await grantWorkflowPermissions(page);
    const handleWorkflowRoute = async (route: Route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname.replace(/\/$/, '');
      if (request.method() === 'POST' && path.endsWith('/workflows')) {
        createPayload = request.postDataJSON() as Record<string, unknown>;
        await route.fulfill({ json: { data: draft } });
        return;
      }
      if (request.method() === 'GET' && path.endsWith(`/workflows/${workflowId}`)) {
        await route.fulfill({ json: { data: draft } });
        return;
      }
      if (path.endsWith('/stage-types')) {
        await route.fulfill({ json: { data: stageTypes } });
        return;
      }
      if (path.endsWith('/versions')) {
        await route.fulfill({ json: { data: [draft] } });
        return;
      }
      if (path.endsWith('/usage')) {
        await route.fulfill({
          json: {
            data: {
              workflowDefinitionId: workflowId,
              offeringCount: 0,
              applicationCount: 0,
              canDelete: true,
              offerings: [],
            },
          },
        });
        return;
      }
      await route.fulfill({ json: { data: { totalCount: 0, items: [] } } });
    };
    await page.route('**/api/student/enrollment/admissions/workflows*', handleWorkflowRoute);
    await page.route('**/api/student/enrollment/admissions/workflows/**', handleWorkflowRoute);
    await page.route('**/api/student/enrollment/admissions/forms*', (route) =>
      route.fulfill({ json: { data: { totalCount: 0, items: [] } } })
    );

    await page.goto('/student/admissions/settings/workflows');
    await expect(
      page.getByText('No admission workflows configured yet. Create a draft to begin.')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Create workflow' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create Workflow' });
    await dialog.getByLabel('Workflow name *').fill('Grade 5 Admission');
    await dialog.getByLabel('Workflow code *').fill('grade5_admission');
    await dialog.getByLabel('Description').fill('Sunrise Public School admission journey');
    await dialog.getByRole('button', { name: 'Create draft' }).click();

    await expect.poll(() => createPayload).not.toBeNull();
    expect(createPayload).toMatchObject({
      name: 'Grade 5 Admission',
      code: 'GRADE5_ADMISSION',
      stages: [],
      transitions: [],
    });
    await expect(page).toHaveURL(new RegExp(`/workflows/${workflowId}/?$`));
  });

  test('handles validation, concurrency recovery, publish, and read-only state', async ({
    page,
  }) => {
    let putAttempts = 0;
    let validateAttempts = 0;
    let publishStamp = '';
    let currentWorkflow = draft;
    await grantWorkflowPermissions(page);
    await page.route('**/api/student/enrollment/admissions/forms*', (route) =>
      route.fulfill({ json: { data: { totalCount: 0, items: [] } } })
    );
    const handleWorkflowRoute = async (route: Route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/\/$/, '');
      if (path.endsWith('/stage-types')) return route.fulfill({ json: { data: stageTypes } });
      if (path.endsWith('/versions')) return route.fulfill({ json: { data: [currentWorkflow] } });
      if (path.endsWith('/usage'))
        return route.fulfill({
          json: {
            data: {
              workflowDefinitionId: workflowId,
              offeringCount: 0,
              applicationCount: 0,
              canDelete: true,
              offerings: [],
            },
          },
        });
      if (request.method() === 'PUT') {
        putAttempts += 1;
        if (putAttempts === 1) {
          return route.fulfill({
            status: 409,
            json: {
              error: {
                message:
                  'This workflow was changed by another administrator. Reload and try again.',
              },
            },
          });
        }
        currentWorkflow = {
          ...draft,
          ...(request.postDataJSON() as Partial<AdmissionWorkflow>),
          concurrencyStamp: 'stamp-2',
        };
        return route.fulfill({ json: { data: currentWorkflow } });
      }
      if (path.endsWith('/validate')) {
        validateAttempts += 1;
        const invalid = validateAttempts === 1;
        return route.fulfill({
          json: {
            data: {
              isValid: !invalid,
              issues: invalid
                ? [
                    {
                      code: 'Admissions.Workflow.DeadEndStage',
                      message: 'Inquiry has no valid outgoing transition.',
                      severity: 0,
                      stageId: inquiryId,
                    },
                  ]
                : [],
              errors: invalid ? ['Inquiry has no valid outgoing transition.'] : [],
              warnings: [],
            },
          },
        });
      }
      if (path.endsWith('/publish')) {
        publishStamp = url.searchParams.get('concurrencyStamp') ?? '';
        currentWorkflow = { ...currentWorkflow, status: 1, publishedAt: '2026-08-19T10:00:00Z' };
        return route.fulfill({ json: { data: currentWorkflow } });
      }
      return route.fulfill({ json: { data: currentWorkflow } });
    };
    await page.route('**/api/student/enrollment/admissions/workflows*', handleWorkflowRoute);
    await page.route('**/api/student/enrollment/admissions/workflows/**', handleWorkflowRoute);

    await page.goto(`/student/admissions/settings/workflows/${workflowId}`);
    await expect(page.getByRole('button', { name: 'Edit Inquiry' })).toBeVisible();

    await page.getByRole('button', { name: 'Add stage' }).click();
    await page.getByLabel('Stage name *').fill('Campus Visit');
    await page.getByLabel('Stage code *').fill('CAMPUS_VISIT');
    await page.getByRole('button', { name: 'Save stage' }).click();
    await expect(page.getByText('Campus Visit')).toBeVisible();
    await page.getByRole('button', { name: 'Delete Campus Visit' }).click();
    await page.getByRole('button', { name: 'Remove stage' }).click();
    await expect(page.getByText('Campus Visit')).toBeHidden();

    await page.getByRole('button', { name: 'Edit transition' }).click();
    await page.getByRole('switch', { name: 'Use a condition' }).click();
    await page.getByLabel('Application field *').fill('application.score');
    await page.getByLabel('Value *').fill('60');
    await page.getByRole('button', { name: 'Save transition' }).click();
    await expect(page.getByText('Conditional route · Priority 1')).toBeVisible();

    await page.getByRole('button', { name: 'Edit Inquiry' }).click();
    await page.getByLabel('Description').fill('Qualified inquiry');
    await page.getByRole('button', { name: 'Save stage' }).click();
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(
      page.getByText('This workflow was changed by another administrator. Reload and try again.')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByText('Workflow draft saved')).toBeVisible();

    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.getByText('Inquiry has no valid outgoing transition.')).toBeVisible();
    await page.getByRole('button', { name: 'Close panel' }).click();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Workflow published')).toBeVisible();
    expect(publishStamp).toBe('stamp-2');
    await expect(
      page.getByText(
        'Published and archived versions are read-only. Create a new version to make changes.'
      )
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add stage' })).toBeHidden();
  });
});
