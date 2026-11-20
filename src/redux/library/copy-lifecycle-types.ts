export type LibraryCopyState = {
  bookId: string;
  copyId: string;
  accessionNumber: string;
  status: number;
  remarks?: string | null;
  sectionId: string;
  shelfId: string;
  revision: string;
  hasOpenLoan: boolean;
  activeLoanId?: string | null;
  loanLinkSource: 'None' | 'CopyId' | 'LegacyAccessionCandidate';
  requiresLoanReconciliation: boolean;
  canReturn: boolean;
  canEditNotes: boolean;
  canChangeCondition: boolean;
  canMove: boolean;
  canWriteOff: boolean;
  allowedConditionStatuses: number[];
  blockedReasons: string[];
};

export type CopyIdentity = { bookId: string; copyId: string };
export type LibraryCopyMoveRequest = {
  sectionId: string;
  shelfId: string;
  reason: string;
  revision: string;
};
export type LibraryCopyWriteOffRequest = { reason: string; revision: string };
export type LibraryCopyMoveOptions = {
  state: LibraryCopyState;
  sections: {
    id: string;
    sectionName: string;
    shelfDetails: { id: string; shelfName: string }[];
  }[];
};
