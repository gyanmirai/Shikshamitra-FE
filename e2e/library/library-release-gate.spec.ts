/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import type {
  LibraryCopyLookup,
  LibraryIssuePlan,
  LibraryLoanCommandResult,
  LibraryReturnLookup,
} from '../../src/redux/library/circulation-types';
import type {
  LibraryReservation,
  ReservationPreview,
} from '../../src/redux/library/reservation-types';

import {
  todayIso,
  listItems,
  addDaysIso,
  getLibraryJson,
  putLibraryJson,
  postLibraryJson,
  expectLibraryOk,
  libraryE2EEnabled,
  uniqueLibraryText,
  libraryApiRequest,
  getAcademicYearId,
  ensureLibraryFixture,
  deleteLibraryResource,
  requireLocalLibraryUrl,
} from './library-api';

type RouteSmoke = { path: string } & ({ testId: string } | { heading: string });

const activeRoutes: RouteSmoke[] = [
  { path: '/library/dashboard', testId: 'library-dashboard-page' },
  { path: '/library/book-list', testId: 'library-books-page' },
  { path: '/library/receiving', heading: 'Stock Receiving' },
  { path: '/library/receiving/imports', heading: 'Stock Imports' },
  { path: '/library/custody', heading: 'Classroom Custody' },
  { path: '/library/campus-transfers', heading: 'Campus Transfers' },
  { path: '/library/stock-verification', heading: 'Stock Verification' },
  { path: '/library/issued-books', testId: 'library-issue-return-page' },
  { path: '/library/member-management', testId: 'library-members-page' },
  { path: '/library/charges-management', testId: 'library-charges-page' },
  { path: '/library/reports', testId: 'library-reports-page' },
  { path: '/library/notification', testId: 'library-notification-page' },
  { path: '/library/notification/settings', heading: 'Notification Settings' },
  { path: '/library/settings/book-category', testId: 'library-settings-book-categories-page' },
  { path: '/library/settings/charge-type', testId: 'library-settings-charge-categories-page' },
  { path: '/library/settings/library-timing', testId: 'library-settings-library-hours-page' },
  {
    path: '/library/settings/borrowing-and-return-rules',
    testId: 'library-settings-borrowing-rules-page',
  },
  { path: '/library/settings/calendar', heading: 'Library Calendar' },
  { path: '/library/settings/catalogue-configuration', heading: 'Catalogue Configuration' },
  { path: '/library/settings/sectionManagement', testId: 'library-settings-sections-page' },
];

async function expectActiveRoute(page: Page, route: RouteSmoke) {
  await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page, `${route.path} should stay authenticated`).not.toHaveURL(/\/login|\/auth/i);
  const content =
    'testId' in route
      ? page.getByTestId(route.testId)
      : page.getByRole('heading', { name: route.heading, exact: true });
  await expect(content).toBeVisible({ timeout: 60_000 });
}

const expectActiveRoutes = (page: Page, routes: RouteSmoke[]) =>
  routes.reduce(async (previous, route) => {
    await previous;
    await expectActiveRoute(page, route);
  }, Promise.resolve());

test.describe('Library release gate E2E', () => {
  test.skip(!libraryE2EEnabled, 'Set E2E_LIBRARY=1 against a seeded local backend.');
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(({ baseURL }) => {
    if (!baseURL) throw new Error('The disposable Library suite requires a frontend base URL.');
    requireLocalLibraryUrl(baseURL, 'frontend URL');
  });

  test('renders active Library staff entry routes without Library API failures', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const browserErrors: string[] = [];
    const libraryApiFailures: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        browserErrors.push(message.text());
      }
    });
    page.on('response', (response) => {
      if (response.url().includes('/api/library/') && response.status() >= 400) {
        libraryApiFailures.push(`${response.status()} ${response.url()}`);
      }
    });

    await expectActiveRoutes(page, activeRoutes);

    expect(browserErrors, 'Browser console errors on active Library routes').toEqual([]);
    expect(libraryApiFailures, 'Failed /api/library requests on active routes').toEqual([]);
  });

  test('covers book reservation cancellation and issue-return with charge', async ({ page }) => {
    test.setTimeout(180_000);
    const fixture = await ensureLibraryFixture(page);

    await expectActiveRoute(page, { path: '/library/book-list', testId: 'library-books-page' });

    const copy = await getLibraryJson<LibraryCopyLookup>(
      page,
      `/library/circulation/lookups/copy?scan=${encodeURIComponent(fixture.accessionOne)}`
    );
    expect(copy.bookId).toBe(fixture.bookId);
    const schoolDate = copy.schoolContext.schoolToday || process.env.E2E_LIBRARY_SCHOOL_DATE;
    if (!schoolDate) throw new Error('Confirm the school timezone or set E2E_LIBRARY_SCHOOL_DATE.');
    const reservationInput = {
      bookId: fixture.bookId,
      academicYearId: fixture.academicYearId,
      memberId: fixture.member.id,
      requestedDate: schoolDate,
      requestExpiryDate: addDaysIso(3, schoolDate),
    };
    const reservationPreview = await postLibraryJson<ReservationPreview>(
      page,
      '/library/reservations/preview',
      reservationInput
    );
    expect(reservationPreview.canCreate, reservationPreview.blockedReasons.join(' ')).toBe(true);
    const reservation = await postLibraryJson<LibraryReservation>(
      page,
      '/library/reservations',
      reservationInput
    );
    expect(reservation.id).toBeTruthy();
    const cancelled = await postLibraryJson<LibraryReservation>(
      page,
      `/library/reservations/${reservation.id}/cancel`,
      {
        academicYearId: fixture.academicYearId,
        revision: reservation.revision,
        reason: 'Release gate reservation cancellation.',
      }
    );
    expect(cancelled).toMatchObject({ id: reservation.id, state: 3 });

    const issueInput = {
      copyId: copy.copyId,
      memberId: fixture.member.id,
      academicYearId: fixture.academicYearId,
      issueDate: schoolDate,
    };
    const previewPath = '/library/circulation/issues/preview';
    const initialPlan = await postLibraryJson<LibraryIssuePlan>(page, previewPath, issueInput);
    const reviewedInput = initialPlan.dueDate
      ? issueInput
      : {
          ...issueInput,
          requestedDueDate: addDaysIso(7, schoolDate),
        };
    const issuePlan = initialPlan.dueDate
      ? initialPlan
      : await postLibraryJson<LibraryIssuePlan>(page, previewPath, reviewedInput);
    expect(issuePlan.canIssue, issuePlan.blockedReasons.join(' ')).toBe(true);
    const loansPath = '/library/circulation/loans';
    const checkout = {
      ...reviewedInput,
      revision: issuePlan.revision,
      idempotencyKey: randomUUID(),
    };
    const issue = await postLibraryJson<LibraryLoanCommandResult>(page, loansPath, checkout);
    expect(issue.loan).toMatchObject({ copyId: copy.copyId, schoolDueDate: issuePlan.dueDate });
    const replayedIssue = await postLibraryJson<LibraryLoanCommandResult>(
      page,
      loansPath,
      checkout
    );
    expect(replayedIssue).toMatchObject({ wasReplay: true, loan: { id: issue.loan.id } });

    const receiving = await getLibraryJson<LibraryReturnLookup>(
      page,
      `/library/circulation/lookups/return?scan=${encodeURIComponent(fixture.accessionOne)}`
    );
    expect(receiving.loan.id).toBe(issue.loan.id);
    const returnPath = `${loansPath}/${receiving.loan.id}/return`;
    const receipt = {
      copyId: receiving.copy.copyId,
      revision: receiving.loan.revision,
      idempotencyKey: randomUUID(),
      schoolReturnDate: schoolDate,
      copyStatus: 4,
      remarks: 'E2E damaged return charge',
      assessments: [
        {
          chargeCategoryId: fixture.chargeCategory.id,
          academicYearId: fixture.academicYearId,
          amount: Number(fixture.chargeCategory.amount),
          schoolChargeDate: schoolDate,
          schoolDueDate: addDaysIso(7, schoolDate),
          reason: 'Damaged cover observed at the desk.',
        },
      ],
    };
    const returnResult = await postLibraryJson<LibraryLoanCommandResult>(page, returnPath, receipt);
    expect(returnResult.loan).toMatchObject({ id: issue.loan.id, schoolReturnDate: schoolDate });
    expect(returnResult.assessmentIds).toHaveLength(1);
    const replayedReceipt = await postLibraryJson<LibraryLoanCommandResult>(
      page,
      returnPath,
      receipt
    );
    expect(replayedReceipt).toMatchObject({
      wasReplay: true,
      assessmentIds: returnResult.assessmentIds,
    });

    const copies = listItems(
      await getLibraryJson(page, `/library/books/${fixture.bookId}/copies?page=1&pageSize=20`)
    );
    expect(copies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accessionNumber: fixture.accessionOne,
          status: 'Damaged',
        }),
      ])
    );
  });

  test('covers member tabs and charge create-update-delete contracts', async ({ page }) => {
    test.setTimeout(120_000);
    const fixture = await ensureLibraryFixture(page);

    await expectActiveRoute(page, {
      path: '/library/member-management',
      testId: 'library-members-page',
    });
    await expectActiveRoute(page, {
      path: '/library/charges-management',
      testId: 'library-charges-page',
    });

    await getLibraryJson(page, `/library/members/${fixture.member.id}`);
    await getLibraryJson(
      page,
      `/library/members/${fixture.member.id}/borrowed-books?page=1&pageSize=5`
    );
    await getLibraryJson(
      page,
      `/library/members/${fixture.member.id}/reserved-books?page=1&pageSize=5`
    );
    await getLibraryJson(page, `/library/members/${fixture.member.id}/charges?page=1&pageSize=5`);
    await getLibraryJson(
      page,
      `/library/members/${fixture.member.id}/borrow-history?page=1&pageSize=5`
    );

    const charge = await postLibraryJson(page, '/library/charges', {
      memberId: fixture.member.id,
      chargeCategoryId: fixture.chargeCategory.id,
      amount: 19,
      chargeDate: todayIso(),
      dueDate: addDaysIso(10),
      remarks: 'E2E charge create',
    });
    expect(charge.id).toBeTruthy();

    await putLibraryJson(page, `/library/charges/${charge.id}`, {
      amount: 21,
      dueDate: addDaysIso(11),
      paymentStatus: 0,
      remarks: 'E2E charge update',
    });
    const chargeDetails = await getLibraryJson(page, `/library/charges/${charge.id}`);
    expect(Number(chargeDetails.amount)).toBe(21);

    await deleteLibraryResource(page, `/library/charges/${charge.id}`);
  });

  test('covers report preview/export and notification send/history', async ({ page }) => {
    test.setTimeout(120_000);
    const academicYearId = await getAcademicYearId(page);

    await expectActiveRoute(page, { path: '/library/reports', testId: 'library-reports-page' });
    const options = await getLibraryJson(page, '/library/reports/options');
    expect(listItems(options.reportTypes)).not.toEqual([]);

    const reportRequest = {
      reportType: 'Book Master Report',
      format: 'excel',
      page: 1,
      pageSize: 10,
      filters: { academicYearId },
    };
    const preview = await postLibraryJson(page, '/library/reports/preview', reportRequest);
    expect(preview.reportType).toBe('Book Master Report');
    expect(preview.columns.length).toBeGreaterThan(0);

    const exportJob = await postLibraryJson(page, '/library/reports/exports', reportRequest);
    expect(exportJob.jobId).toBeTruthy();
    await getLibraryJson(page, `/library/reports/exports/${exportJob.jobId}`);

    await expectActiveRoute(page, {
      path: '/library/notification',
      testId: 'library-notification-page',
    });
    const settings = await getLibraryJson(page, '/library/notifications/settings');
    expect(settings.items.length).toBeGreaterThan(0);

    const sendResult = await postLibraryJson(page, '/library/notifications/send', {
      eventType: 'fineDueReminder',
      channel: 'InApp',
      subject: 'E2E Library notification',
      message: 'E2E release gate notification.',
      recipients: [
        {
          recipientRole: 'Member',
          recipientName: 'E2E Library Member',
        },
      ],
    });
    expect(sendResult.attempted).toBe(1);
    await getLibraryJson(page, '/library/notifications/history?page=1&pageSize=5');
  });

  test('covers active Library settings write paths', async ({ page }) => {
    test.setTimeout(120_000);
    const academicYearId = await getAcademicYearId(page);

    const categoryName = uniqueLibraryText('E2E Temp Category');
    const category = await postLibraryJson(
      page,
      `/library/book-categories?academicYearId=${academicYearId}`,
      {
        categoryName,
        description: 'Temporary E2E category',
      }
    );
    await putLibraryJson(page, `/library/book-categories/${category.id}`, {
      categoryName: `${categoryName} Updated`,
      description: 'Temporary E2E category updated',
    });
    await deleteLibraryResource(page, `/library/book-categories/${category.id}`);

    const chargeType = uniqueLibraryText('E2E Temp Charge');
    const chargeCategory = await postLibraryJson(
      page,
      `/library/charge-categories?academicYearId=${academicYearId}`,
      {
        chargeType,
        amount: 11,
        isFixed: true,
        description: 'Temporary E2E charge category',
      }
    );
    await putLibraryJson(page, `/library/charge-categories/${chargeCategory.id}`, {
      chargeType: `${chargeType} Updated`,
      amount: 12,
      isFixed: true,
      description: 'Temporary E2E charge category updated',
    });
    await deleteLibraryResource(page, `/library/charge-categories/${chargeCategory.id}`);

    await postLibraryJson(page, `/library/library-hours?academicYearId=${academicYearId}`, {
      hours: [
        { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', status: 1 },
        { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', status: 1 },
        { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', status: 1 },
        { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', status: 1 },
        { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', status: 1 },
        { day: 'Saturday', startTime: '10:00 AM', endTime: '02:00 PM', status: 1 },
        { day: 'Sunday', startTime: '12:00 AM', endTime: '12:00 AM', status: 0 },
      ],
    });

    await postLibraryJson(page, `/library/borrowing-rules?academicYearid=${academicYearId}`, {
      rules: [
        { role: 0, maxBooksAtTime: 3, reservationLimit: 2 },
        { role: 1, maxBooksAtTime: 5, reservationLimit: 3 },
      ],
    });

    const sectionName = uniqueLibraryText('E2E Temp Section');
    const section = await postLibraryJson(
      page,
      `/library/sections?academicYearId=${academicYearId}`,
      {
        sectionName,
        numberOfShelf: 1,
        shelfItems: ['E2E Temp Shelf'],
      }
    );
    await putLibraryJson(page, `/library/sections/${section.id}?academicYearId=${academicYearId}`, {
      sectionName: `${sectionName} Updated`,
      numberOfShelf: 1,
      shelfItems: ['E2E Temp Shelf Updated'],
    });
    await deleteLibraryResource(
      page,
      `/library/sections/${section.id}?academicYearId=${academicYearId}`
    );

    await expectActiveRoutes(
      page,
      activeRoutes.filter((item) => item.path.includes('/library/settings/'))
    );

    const invalidReservation = await libraryApiRequest(
      page,
      `/library/books/00000000-0000-0000-0000-000000000001/reservations/00000000-0000-0000-0000-000000000002`,
      { method: 'DELETE' }
    );
    expect(invalidReservation.status()).toBe(400);
    const problem = await invalidReservation.json();
    expect(problem.errorCode).toBeTruthy();
    await expectLibraryOk(
      await libraryApiRequest(page, '/library/notifications/history?page=1&pageSize=1'),
      'notification history remains available after settings writes'
    );
  });
});
