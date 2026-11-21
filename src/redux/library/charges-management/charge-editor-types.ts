export type ChargeEditorPage<T> = {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export type ChargeEditorQuery = {
  academicYearId: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ChargeEditorCategory = {
  id: string;
  academicYearId: string;
  name: string;
  amount: number;
  isFixed: boolean;
};

export type ChargeEditorMember = {
  id: string;
  memberName: string;
  memberIdentifier?: string | null;
  role: number;
  hasActiveLibraryMembership: boolean;
  canAssignDirect: boolean;
  requiresLoanSource: boolean;
};

export type ChargeEditorLoan = {
  loanId: string;
  canonicalMemberId: string;
  role: number;
  copyId?: string | null;
  bookId?: string | null;
  accessionNumber: string;
  title?: string | null;
  loanAcademicYearId?: string | null;
  status: number;
  schoolIssueDate?: string | null;
  schoolDueDate?: string | null;
  issueDateProvenance: number;
  dueDateProvenance: number;
};

export type ChargeEditorAssessment = {
  id: string;
  memberId: string;
  memberName?: string | null;
  role: number;
  chargeCategoryId: string;
  chargeType: string;
  bookIssueId?: string | null;
  bookTitle?: string | null;
  accessionNo?: string | null;
  amount: number;
  academicYearId?: string | null;
  academicYearProvenance: number;
  schoolChargeDate?: string | null;
  schoolDueDate?: string | null;
  chargeDateProvenance: number;
  dueDateProvenance: number;
  chargeDate?: string | null;
  dueDate?: string | null;
  currency?: string | null;
  financeSourceLinkId?: string | null;
  sourceVersion: string;
  paymentStatus: number;
  remarks?: string | null;
};

export type ChargeEditorContext = {
  assessment: ChargeEditorAssessment;
  canAmend: boolean;
  requiresContextReview: boolean;
  amendmentBlockedReason?: string | null;
};
