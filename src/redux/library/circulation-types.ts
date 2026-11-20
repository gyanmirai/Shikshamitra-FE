import type { LibraryPolicySnapshot } from './policy-types';

export type LibrarySchoolContext = {
  schoolToday: string | null;
  confirmedTimeZoneId: string | null;
  isConfirmed: boolean;
  requiresExplicitDate: boolean;
  unavailableReason: string | null;
  academicYears: { id: string; name: string }[];
};
export type LibraryCopyLookup = {
  bookId: string;
  copyId: string;
  copyStatus: number;
  accessionNo: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  addedOn?: string;
  language?: string;
  category?: string;
  pages?: number;
  coverImage?: string | null;
  schoolContext: LibrarySchoolContext;
};
export type LibraryLoan = {
  id: string;
  copyId: string;
  bookId: string | null;
  memberId: string;
  canonicalMemberId: string | null;
  role: number;
  academicYearId: string | null;
  status: number;
  schoolIssueDate: string | null;
  schoolDueDate: string | null;
  originalSchoolDueDate: string | null;
  schoolReturnDate: string | null;
  issueDateProvenance: number;
  dueDateProvenance: number;
  returnDateProvenance: number;
  rawIssueDate: string | null;
  rawDueDate: string | null;
  rawReturnDate: string | null;
  issuedByUserId?: string | null;
  renewalCount: number;
  policy: LibraryPolicySnapshot | null;
  revision: string;
  canReturn: boolean;
  canRenew: boolean;
  schoolContext?: LibrarySchoolContext | null;
  canReviewDates?: boolean | null;
  blockedReasons: string[];
};
export type LibraryLoanBorrower = {
  memberId: string | null;
  memberName: string | null;
  memberIdentifier: string | null;
  role: number;
  classDivision?: string | null;
  displaySource: 'LoanSnapshot' | 'CurrentAuthorizedRecord' | 'Unavailable';
};
export type LibraryReturnLookup = {
  copy: LibraryCopyLookup;
  loan: LibraryLoan;
  borrower: LibraryLoanBorrower;
  schoolContext: LibrarySchoolContext;
};
export type LibraryIssuePlanRequest = {
  copyId: string;
  memberId: string;
  academicYearId?: string | null;
  issueDate: string;
  requestedDueDate?: string | null;
};
export type LibraryIssuePlan = {
  bookId: string;
  copyId: string;
  memberId: string;
  role: number;
  academicYearId: string;
  issueDate: string;
  dueDate: string | null;
  confirmedSchoolTimeZoneId?: string | null;
  policy: LibraryPolicySnapshot;
  activeLoanCount: number;
  hasOpenLoan: boolean;
  canIssue: boolean;
  blockedReasons: string[];
  revision: string;
};
export type LibraryLoanCommandResult = {
  loan: LibraryLoan;
  wasReplay: boolean;
  assessmentIds: string[];
};
