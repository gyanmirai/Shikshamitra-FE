import { http, HttpResponse } from 'msw';

import { lookupBook, lookupMember } from './circulation-test-fixtures';

export const canonicalCopy = {
  ...lookupBook,
  copyId: 'saved-copy-id',
  copyStatus: 0,
  schoolContext: {
    schoolToday: null,
    confirmedTimeZoneId: null,
    isConfirmed: false,
    requiresExplicitDate: true,
    unavailableReason: 'Enter the school date explicitly.',
    academicYears: [{ id: 'year-id', name: '2026–2027' }],
  },
};
export const canonicalLoan = {
  id: 'exact-loan-id',
  copyId: canonicalCopy.copyId,
  bookId: lookupBook.bookId,
  memberId: lookupMember.id,
  canonicalMemberId: lookupMember.id,
  role: 0,
  academicYearId: 'year-id',
  status: 1,
  schoolIssueDate: null,
  schoolDueDate: null,
  originalSchoolDueDate: null,
  schoolReturnDate: null,
  issueDateProvenance: 0,
  dueDateProvenance: 0,
  returnDateProvenance: 0,
  rawIssueDate: '2026-11-01T18:30:00Z',
  rawDueDate: '2026-11-17T18:30:00Z',
  rawReturnDate: null,
  renewalCount: 0,
  revision: 'saved-loan-revision',
  canReturn: true,
  canRenew: false,
  blockedReasons: [],
  policy: null,
};
export const canonicalReturn = {
  copy: canonicalCopy,
  loan: canonicalLoan,
  borrower: {
    memberId: lookupMember.id,
    memberName: lookupMember.memberName,
    memberIdentifier: lookupMember.memberIdentifier,
    role: 0,
    displaySource: 'LoanSnapshot' as const,
  },
  schoolContext: canonicalCopy.schoolContext,
};
export const canonicalIssuePlan = {
  bookId: lookupBook.bookId,
  copyId: canonicalCopy.copyId,
  memberId: lookupMember.id,
  role: 0,
  academicYearId: 'year-id',
  issueDate: '2026-11-16',
  dueDate: '2026-11-30',
  policy: { isLegacyManualDate: true, terms: { dueDateMode: 0 } },
  canIssue: true,
  blockedReasons: [],
  revision: 'saved-plan-revision',
};
export const canonicalLookupHandlers = [
  http.get('http://library.test/api/library/books/accession', () =>
    HttpResponse.json(canonicalCopy)
  ),
  http.get('http://library.test/api/library/circulation/lookups/copy', () =>
    HttpResponse.json(canonicalCopy)
  ),
  http.get('http://library.test/api/library/returns/search', () =>
    HttpResponse.json({ bookDetails: lookupBook, memberDetails: lookupMember })
  ),
  http.get('http://library.test/api/library/circulation/lookups/return', () =>
    HttpResponse.json(canonicalReturn)
  ),
  http.get('http://library.test/api/library/circulation/members/resolve', () =>
    HttpResponse.json({
      ...lookupMember,
      role: 0,
      academicYearId: 'year-id',
      isEligibleForIssue: true,
    })
  ),
  http.post('http://library.test/api/library/circulation/issues/preview', async ({ request }) => {
    const body = (await request.json()) as {
      copyId: string;
      memberId: string;
      academicYearId: string;
      issueDate: string;
      requestedDueDate: string | null;
    };
    return HttpResponse.json({
      ...canonicalIssuePlan,
      ...body,
      dueDate: body.requestedDueDate,
      canIssue: Boolean(body.requestedDueDate),
    });
  }),
];
