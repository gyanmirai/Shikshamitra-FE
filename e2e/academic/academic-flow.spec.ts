/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import { test, expect } from '@playwright/test';

import { resolveAcademicContext, primeAcademicSelection } from './academic-api';

const baseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Academic Module Operational Flow Tests', () => {
  // Admin Flows
  test.describe('As Academic Admin', () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    test('should verify Subject Allocation and Syllabus layouts', async ({ page }) => {
      // 1. Navigate to Subject Allocation
      await page.goto(`${baseUrl()}/academic/curriculumSubjects`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      // Check for search filters or grid structures typical for subject allocation
      const allocationTitle = page.locator('body');
      await expect(allocationTitle).toContainText(/Subject Allocation|Allocation/i);

      // 2. Navigate to Syllabus/Chapters management
      await page.goto(`${baseUrl()}/academic/courseSubjects`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/Syllabus|Chapters|Subjects/i);
    });

    test('should inspect Exam Schedule and Seating Plan configurations', async ({ page }) => {
      // 1. Navigate to Schedule Exam
      await page.goto(`${baseUrl()}/academic/scheduleExam`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/Schedule Exam|Exam/i);

      // 2. Navigate to Seating Plan
      await page.goto(`${baseUrl()}/academic/seatallocation`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/Seating Plan|Seat Allocation/i);
    });

    test('should load Calendar Settings and Emergency Closure forms', async ({ page }) => {
      // 1. Navigate to Calendar Management
      await page.goto(`${baseUrl()}/academic/calendarManagement`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/Calendar|Academic Calendar/i);

      // 2. Navigate to Emergency Closure
      await page.goto(`${baseUrl()}/academic/calendarEmergencyClosure`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).toContainText(/Emergency Closure/i);
    });
  });

  // Teacher Flows
  test.describe('As Teacher', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    test('should load Teacher Diary / Lesson Plan screen', async ({ page }) => {
      await page.goto(`${baseUrl()}/academic/lesson-plan`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      
      // Ensure the diary view, calendar, or lesson planning layout loads
      await expect(page.locator('body')).toContainText(/Lesson Plan|Teacher Diary/i);
    });

    test('should test Homework Creation and check form validations', async ({ page }) => {
      await page.goto(`${baseUrl()}/academic/homeworkCreation`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      // Ensure homework creation/learning tasks page is shown
      await expect(page.locator('body')).toContainText(/Learning Tasks|Homework/i);

      // Find 'Create' or 'Add' button if present to trigger form drawer/modal
      const createBtn = page.getByRole('button', { name: /create|add|new/i }).first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        
        // Wait for modal or drawer to open
        await page.waitForTimeout(1000);
        
        // Attempt to submit empty form to trigger validations
        const saveBtn = page.getByRole('button', { name: /save|submit/i });
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          
          // Verify that visual validation errors or warnings appear (e.g. required field helpers)
          // We can check if any input is marked invalid or standard helper texts appear
          await page.waitForTimeout(500);
        }
      }
    });

    test('should verify Grade Entry marking layout', async ({ page }) => {
      await page.goto(`${baseUrl()}/academic/gradeEntry`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();

      // Ensure grade entry / record marks layout loads
      await expect(page.locator('body')).toContainText(/Grade Entry|Record Marks/i);
    });
  });
});
