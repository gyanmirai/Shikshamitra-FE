export type LibraryLoanReadDto = {
  transactionId: string;
  bookId: string;
  copyId: string;
  memberId: string;
  memberName: string | null;
  memberIdentifier: string | null;
  role: number;
  bookTitle: string | null;
  accessionNo: string;
  bookCategory: string | null;
  classDivision: string | null;
  memberDisplaySource: 'LoanSnapshot' | 'CurrentAuthorizedRecord' | 'Unavailable';
  academicYearId: string | null;
  status: number;
  storedStatus: number;
  issueDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  schoolIssueDate: string | null;
  schoolDueDate: string | null;
  schoolReturnDate: string | null;
  issueDateProvenance: number;
  dueDateProvenance: number;
  returnDateProvenance: number;
  rawIssueDate: string | null;
  rawDueDate: string | null;
  rawReturnDate: string | null;
  isOverdue: boolean | null;
  overdueAsOfDate: string | null;
  overdueDateSource: 'ConfirmedLibraryClock' | 'ExplicitSchoolDate' | 'Unavailable';
  overdueUnavailableReason: string | null;
};
export type LibraryLoanReadParams = {
  page: number;
  pageSize: number;
  academicYearId?: string;
  asOfDate?: string;
};
export type LibraryLoanReadMetadata = Pick<
  LibraryLoanReadDto,
  | 'academicYearId'
  | 'storedStatus'
  | 'classDivision'
  | 'memberIdentifier'
  | 'memberDisplaySource'
  | 'schoolIssueDate'
  | 'schoolDueDate'
  | 'schoolReturnDate'
  | 'issueDateProvenance'
  | 'dueDateProvenance'
  | 'returnDateProvenance'
  | 'rawIssueDate'
  | 'rawDueDate'
  | 'rawReturnDate'
  | 'isOverdue'
  | 'overdueAsOfDate'
  | 'overdueDateSource'
  | 'overdueUnavailableReason'
>;
