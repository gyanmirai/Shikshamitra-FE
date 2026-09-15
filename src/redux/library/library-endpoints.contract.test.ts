import { it, expect, describe } from 'vitest';

import { copiesApi } from './bookList/copies-api';
import { membersApi } from './bookList/memberApi';
import { libraryReportsApi } from './reports-api';
import { booksApi } from './bookList/bookList-api';
import { libraryDashboardApi } from './dashboard-api';
import { libraryCopyLabelsApi } from './copy-labels-api';
import { libraryNotificationsApi } from './notifications-api';
import { LibraryChargeApi } from './charges-management/charges-get-api';
import { issueAndReturnApi } from './issueAndReturnApi/issueAndReturnApi';
import { memberManagementApi } from './libraryMembers/memberManagementApi';
import { libraryChargeCategoryOptionsApi } from './charges-management/charge-category-api';

describe('library RTK endpoint contracts', () => {
  it('exposes canonical book, copy, and reservation endpoints', () => {
    expect(booksApi.endpoints.getAllBooks).toBeTruthy();
    expect(booksApi.endpoints.getBookById).toBeTruthy();
    expect(booksApi.endpoints.getBookCopies).toBeTruthy();
    expect(booksApi.endpoints.updateBookCopyStatus).toBeTruthy();
    expect(booksApi.endpoints.getBookReservations).toBeTruthy();
    expect(booksApi.endpoints.reserveBook).toBeTruthy();
    expect(booksApi.endpoints.deleteBookReservation).toBeTruthy();
    expect(booksApi.endpoints.getReservationTableView).toBeTruthy();
    expect(copiesApi.endpoints.getCopiesByBookId).toBeTruthy();
  });

  it('exposes canonical circulation endpoints', () => {
    expect(issueAndReturnApi.endpoints.getIssueReturnList).toBeTruthy();
    expect(issueAndReturnApi.endpoints.getBookDetailsByAccession).toBeTruthy();
    expect(issueAndReturnApi.endpoints.issueBook).toBeTruthy();
    expect(issueAndReturnApi.endpoints.getReturnDetails).toBeTruthy();
    expect(issueAndReturnApi.endpoints.returnBook).toBeTruthy();
    expect(issueAndReturnApi.endpoints.getMemberDetailsByAccession).toBeTruthy();
  });

  it('exposes canonical member and charge endpoints', () => {
    expect(membersApi.endpoints.getAllMembers).toBeTruthy();
    expect(memberManagementApi.endpoints.getLibraryMembers).toBeTruthy();
    expect(memberManagementApi.endpoints.getMemberDetails).toBeTruthy();
    expect(memberManagementApi.endpoints.getMemberBorrowedBooks).toBeTruthy();
    expect(memberManagementApi.endpoints.getMemberReservedBooks).toBeTruthy();
    expect(memberManagementApi.endpoints.getMemberCharges).toBeTruthy();
    expect(memberManagementApi.endpoints.getMemberBorrowHistory).toBeTruthy();
    expect(LibraryChargeApi.endpoints.getLibraryCharges).toBeTruthy();
    expect(LibraryChargeApi.endpoints.addLibraryCharge).toBeTruthy();
    expect(LibraryChargeApi.endpoints.updateLibraryCharge).toBeTruthy();
    expect(LibraryChargeApi.endpoints.deleteLibraryCharge).toBeTruthy();
    expect(libraryChargeCategoryOptionsApi.endpoints.getLibraryChargeCategoryOptions).toBeTruthy();
  });

  it('exposes Phase 3A dashboard, report, and copy label endpoints', () => {
    expect(libraryDashboardApi.endpoints.getLibraryDashboardOverview).toBeTruthy();
    expect(libraryReportsApi.endpoints.getLibraryReportOptions).toBeTruthy();
    expect(libraryReportsApi.endpoints.createLibraryAiReportPlan).toBeTruthy();
    expect(libraryReportsApi.endpoints.previewLibraryReport).toBeTruthy();
    expect(libraryReportsApi.endpoints.createLibraryReportExport).toBeTruthy();
    expect(libraryReportsApi.endpoints.getLibraryReportExports).toBeTruthy();
    expect(libraryReportsApi.endpoints.getLibraryReportExport).toBeTruthy();
    expect(libraryReportsApi.endpoints.downloadLibraryReportExport).toBeTruthy();
    expect(libraryCopyLabelsApi.endpoints.getBookCopyLabels).toBeTruthy();
  });

  it('exposes Phase 3B notification settings, history, send, and reminder endpoints', () => {
    expect(libraryNotificationsApi.endpoints.getLibraryNotificationSettings).toBeTruthy();
    expect(libraryNotificationsApi.endpoints.updateLibraryNotificationSettings).toBeTruthy();
    expect(libraryNotificationsApi.endpoints.getLibraryNotificationHistory).toBeTruthy();
    expect(libraryNotificationsApi.endpoints.sendLibraryNotification).toBeTruthy();
    expect(libraryNotificationsApi.endpoints.runLibraryNotificationReminders).toBeTruthy();
  });
});
