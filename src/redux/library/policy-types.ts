export type LibraryMemberRole = 0 | 1;
export type LibraryDayCountingMode = 0 | 1;
export type LibraryPolicyState = 0 | 1 | 2;
export type LibraryPage<T> = {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};
export type LibraryNamedOption = { id: string; name: string };
export type LibraryScopeOption = LibraryNamedOption & { parentId: string; parentName: string };

export type LibraryBorrowingTerms = {
  dueDateMode?: 0 | 1;
  maxBooksAtTime: number;
  reservationLimit: number;
  loanDays: number;
  dayCountingMode: LibraryDayCountingMode;
  maxRenewals: number;
  renewalDays: number;
  pickupWindowDays: number;
  moveDueDateToNextOpenDay: boolean;
};
export type LibraryPolicyDraftRequest = {
  policyId?: string | null;
  name: string;
  role: LibraryMemberRole;
  effectiveFrom: string;
  effectiveTo?: string | null;
  bookCategoryId?: string | null;
  sectionId?: string | null;
  educationMediumStageId?: string | null;
  standardId?: string | null;
  priority: number;
  terms: LibraryBorrowingTerms;
  concurrencyStamp?: string | null;
};
export type LibraryPolicyVersion = LibraryPolicyDraftRequest & {
  id: string;
  version: number;
  status: LibraryPolicyState;
  archivedFrom?: string | null;
  archiveReason?: string | null;
};
export type LibraryPolicyOptions = {
  bookCategories: LibraryNamedOption[];
  sections: LibraryNamedOption[];
  stages: LibraryScopeOption[];
  standards: LibraryScopeOption[];
  canManageGlobalPolicies: boolean;
};
export type LibraryPolicyResolveRequest = {
  academicYearId: string;
  role: LibraryMemberRole;
  bookId?: string;
  copyId?: string;
  memberId?: string;
  asOfDate?: string;
};
export type LibraryPolicySnapshot = {
  policyVersionId: string | null;
  policyId: string | null;
  version: number | null;
  isLegacyManualDate: boolean;
  role: LibraryMemberRole;
  terms: {
    [K in keyof LibraryBorrowingTerms]: K extends 'maxBooksAtTime' | 'reservationLimit'
      ? LibraryBorrowingTerms[K]
      : LibraryBorrowingTerms[K] | null;
  };
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  timeZoneId: string | null;
  timeZoneSource: string;
  needsCalendarConfiguration: boolean;
};
