import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { LibraryBookStatus } from 'src/enums/library-book-status';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';

import {
  mapBookDto,
  mapIssueStatus,
  mapBookCopyDto,
  mapChargeListItemDto,
  buildReturnBookPayload,
  toLibraryPaginatedList,
  buildCreateChargePayload,
  mapLibraryReportOptionsDto,
  mapLibraryReportPreviewDto,
  mapLibraryCopyLabelBatchDto,
  mapLibraryDashboardOverviewDto,
  buildLibraryReportRequestPayload,
  mapLibraryNotificationHistoryDto,
  mapLibraryNotificationSettingsDto,
  buildLibraryManualNotificationPayload,
  buildLibraryNotificationSettingsPayload,
} from './library-adapters';

describe('library adapters', () => {
  it('keeps paginated Library lists usable as arrays and as items metadata', () => {
    const result = toLibraryPaginatedList(
      {
        items: [{ id: 'book-1', title: 'Physics' }],
        totalCount: 9,
        currentPage: 2,
        pageSize: 1,
        totalPages: 9,
      },
      mapBookDto
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].title).toBe('Physics');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(result[0]);
    expect(result.totalCount).toBe(9);
    expect(result.currentPage).toBe(2);
  });

  it('maps backend copy statuses to FE display statuses explicitly', () => {
    expect(mapBookCopyDto({ status: 3 }).status).toBe(LibraryBookStatus.Lost);
    expect(mapBookCopyDto({ status: 4 }).status).toBe(LibraryBookStatus.Damaged);
    expect(mapBookCopyDto({ status: 5 }).status).toBe(LibraryBookStatus.UnderMaintenance);
    expect(mapBookCopyDto({ status: 6 }).status).toBe(LibraryBookStatus.Removed);
    expect(mapBookCopyDto({ status: 'UnderRepair' }).status).toBe(
      LibraryBookStatus.UnderMaintenance
    );
  });

  it('maps issue statuses to the issued-book table display enum', () => {
    expect(mapIssueStatus(0)).toBe(LibraryBookStatus.Issued);
    expect(mapIssueStatus(1)).toBe(LibraryBookStatus.Returned);
    expect(mapIssueStatus(2)).toBe(LibraryBookStatus.Overdue);
  });

  it('builds return payload with optional charge and backend copy status', () => {
    const payload = buildReturnBookPayload(
      {
        accessionNo: 'ACC-1',
        returnDate: dayjs('2026-06-17'),
        chargeCategory: 'charge-category-1',
        amount: '75',
        fineDueDate: dayjs('2026-06-30'),
        copyStatus: 4,
        remarks: 'Damaged cover',
      },
      'member-1'
    );

    expect(payload).toMatchObject({
      accessionNo: 'ACC-1',
      memberId: 'member-1',
      chargeCategoryId: 'charge-category-1',
      amount: 75,
      copyStatus: 4,
      remarks: 'Damaged cover',
    });
    expect(payload.returnDate).toContain('2026-06-17');
    expect(payload.fineDueDate).toContain('2026-06-30');
  });

  it('omits charge fields for no-charge returns', () => {
    const payload = buildReturnBookPayload(
      {
        accessionNo: 'ACC-2',
        returnDate: dayjs('2026-06-17'),
        chargeCategory: 'none',
        amount: '',
        copyStatus: 0,
      },
      'member-2'
    );

    expect(payload.chargeCategoryId).toBeUndefined();
    expect(payload.amount).toBeUndefined();
    expect(payload.copyStatus).toBe(0);
  });

  it('maps charges into existing screen fields and builds create payloads', () => {
    const row = mapChargeListItemDto({
      id: 'charge-1',
      memberId: 'member-1',
      memberName: 'Asha Shah',
      role: 0,
      chargeType: 'Late Book Return',
      amount: 25,
      paymentStatus: LibraryChargeStatusType.Pending,
      remarks: 'Late by two days',
    });

    expect(row).toMatchObject({
      id: 'charge-1',
      memberId: 'member-1',
      memberName: 'Asha Shah',
      role: 'Student',
      chargeCategory: 'Late Book Return',
      fineAmount: 25,
      status: LibraryChargeStatusType.Pending,
      reason: 'Late by two days',
    });

    const payload = buildCreateChargePayload({
      memberId: 'member-1',
      chargeCategory: 'category-1',
      amount: '25',
      dueDate: dayjs('2026-06-30'),
      reason: 'Late by two days',
    });

    expect(payload).toMatchObject({
      memberId: 'member-1',
      chargeCategoryId: 'category-1',
      amount: 25,
      remarks: 'Late by two days',
    });
  });

  it('maps dashboard overview metrics for KPI and chart consumers', () => {
    const overview = mapLibraryDashboardOverviewDto({
      stockTotals: { totalBooks: 2, totalCopies: 4, availableCopies: 3 },
      circulation: { activeIssues: 1, overdueIssues: 1, issuesThisWeek: 2, returnsThisWeek: 1 },
      charges: { pendingAmount: '50', paidAmount: 100 },
      weeklyCirculation: [{ label: 'Mon', issued: 2, returned: 1 }],
      popularBooks: [{ bookId: 'book-1', title: 'Clean Code', issueCount: 5 }],
    });

    expect(overview.stockTotals.totalCopies).toBe(4);
    expect(overview.charges.pendingAmount).toBe(50);
    expect(overview.weeklyCirculation[0]).toMatchObject({ label: 'Mon', issued: 2 });
    expect(overview.popularBooks[0].title).toBe('Clean Code');
  });

  it('maps report options, preview rows, and request payloads', () => {
    const options = mapLibraryReportOptionsDto({
      reportTypes: [
        { id: 'Book Master Report', label: 'Book Master Report', category: 'Book & Inventory' },
      ],
      formats: [{ id: 'excel', label: 'Excel' }],
    });

    expect(options.reportTypes[0]).toMatchObject({
      id: 'Book Master Report',
      category: 'Book & Inventory',
    });

    const preview = mapLibraryReportPreviewDto({
      reportType: 'Book Master Report',
      totalCount: 1,
      columns: [{ id: 'title', label: 'Title' }],
      rows: [{ title: 'Physics' }],
    });

    expect(preview.columns[0].label).toBe('Title');
    expect(preview.rows[0].title).toBe('Physics');

    const payload = buildLibraryReportRequestPayload({
      reportType: 'Fine Collection Report',
      format: 'pdf',
      academicYearId: 'year-1',
      fromDate: dayjs('2026-06-01'),
      toDate: dayjs('2026-06-17'),
      chargeStatus: '0',
      page: 1,
      pageSize: 50,
    });

    expect(payload).toMatchObject({
      reportType: 'Fine Collection Report',
      format: 'pdf',
      filters: {
        academicYearId: 'year-1',
        chargeStatuses: [0],
      },
    });
    expect(payload.filters.fromDate).toContain('2026-06-01');
  });

  it('maps copy-label batches for barcode rendering', () => {
    const labels = mapLibraryCopyLabelBatchDto({
      bookId: 'book-1',
      title: 'Physics',
      labels: [
        {
          copyId: 'copy-1',
          copyNumber: 1,
          accessionNumber: 'ACC-1',
          sectionName: 'Science',
          shelfName: 'S1',
          barcodeValue: 'ACC-1',
        },
      ],
    });

    expect(labels.bookId).toBe('book-1');
    expect(labels.labels[0]).toMatchObject({
      accessionNumber: 'ACC-1',
      accessionNo: 'ACC-1',
      barcodeValue: 'ACC-1',
    });
  });

  it('maps notification settings and builds update payloads', () => {
    const settings = mapLibraryNotificationSettingsDto({
      items: [
        {
          id: 'setting-1',
          eventType: 'dueDateReminder',
          eventGroup: 'Transactions',
          eventName: 'Due-date reminder',
          recipientRole: 'Member',
          channel: 'InApp',
          isActive: true,
          isChannelAvailable: true,
          reminderOffsetDays: 2,
          subjectTemplate: 'Due soon',
          messageTemplate: 'Return {{bookTitle}}',
          lastStatus: 'Sent',
        },
      ],
      channels: [{ channel: 'Sms', label: 'SMS', isAvailable: false }],
    });

    expect(settings.items[0]).toMatchObject({
      eventType: 'dueDateReminder',
      channel: 'InApp',
      isActive: true,
      reminderOffsetDays: 2,
    });
    expect(settings.channels[0].isAvailable).toBe(false);

    const payload = buildLibraryNotificationSettingsPayload(settings.items[0], {
      isActive: false,
      subjectTemplate: 'Updated subject',
    });

    expect(payload.items[0]).toMatchObject({
      id: 'setting-1',
      isActive: false,
      subjectTemplate: 'Updated subject',
      messageTemplate: 'Return {{bookTitle}}',
    });
  });

  it('maps notification history and manual-send payloads', () => {
    const history = mapLibraryNotificationHistoryDto({
      id: 'history-1',
      eventType: 'fineDueReminder',
      eventGroup: 'MemberManagement',
      channel: 'Email',
      status: 'Skipped',
      errorMessage: 'Recipient email is missing.',
    });

    expect(history).toMatchObject({
      id: 'history-1',
      eventType: 'fineDueReminder',
      status: 'Skipped',
      errorMessage: 'Recipient email is missing.',
    });

    const payload = buildLibraryManualNotificationPayload(
      {
        communicationChannel: ['Email'],
        subject: 'Fine due',
        message: 'Please clear your fine.',
        eventType: 'fineDueReminder',
      },
      [{ name: 'Asha Shah', email: 'asha@example.test' }]
    );

    expect(payload).toMatchObject({
      eventType: 'fineDueReminder',
      channel: 'Email',
      subject: 'Fine due',
      recipients: [{ recipientName: 'Asha Shah', recipientEmail: 'asha@example.test' }],
    });
  });
});
