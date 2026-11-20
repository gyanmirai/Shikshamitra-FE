import type { LibraryPaginatedList } from '../library-adapters';

export interface MemberBookRecord {
  id?: string;
  borrowId?: string;
  bookId?: string | null;
  copyId?: string | null;
  copyLinkSource?: 'CopyId' | 'LegacyAccessionCandidate' | 'Unavailable';
  requiresCopyReconciliation?: boolean;
  bookTitle?: string;
  bookCategory?: string;
  accessionNo?: string;
  author?: string;
  academicYearId?: string | null;
  issuedOn?: string | null;
  dueOn?: string | null;
  returnedOn?: string | null;
  reservedOn?: string | null;
  schoolIssueDate?: string | null;
  schoolDueDate?: string | null;
  schoolReturnDate?: string | null;
  issueDateProvenance?: number;
  dueDateProvenance?: number;
  returnDateProvenance?: number;
  storedStatus?: number | null;
  state?: number | null;
  requestedDate?: string | null;
  requestedDateProvenance?: number;
}
export interface MemberRecordPageParams {
  memberId: string;
  page?: number;
  pageSize?: number;
}
export type MemberRecordPage = LibraryPaginatedList<MemberBookRecord>;
export type MemberRecordKind = 'borrowed' | 'reserved' | 'history';
export function mapMemberBookRecord(record: MemberBookRecord): MemberBookRecord {
  return { ...record, id: record.id || record.borrowId };
}
