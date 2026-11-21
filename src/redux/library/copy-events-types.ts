export type LibraryCopyEvent = {
  id: string;
  sequence: number;
  bookId: string;
  copyId: string;
  eventType: string;
  occurredAt: string;
  actorId: string;
  reason: string;
  previousStatus: number;
  nextStatus: number;
  previousRemarks?: string | null;
  nextRemarks?: string | null;
  fromSectionId: string;
  fromShelfId: string;
  toSectionId: string;
  toShelfId: string;
  relatedLoanId?: string | null;
};
