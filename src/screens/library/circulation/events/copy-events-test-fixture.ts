import type { LibraryCopyEvent } from 'src/redux/library/copy-events-types';

export const movedEvent: LibraryCopyEvent = {
  id: 'event-1',
  sequence: 2,
  bookId: 'book-id',
  copyId: 'copy-id',
  eventType: 'Moved',
  occurredAt: '2026-11-17T08:20:00Z',
  actorId: 'actor-1',
  reason: 'Moved to reference room',
  previousStatus: 0,
  nextStatus: 0,
  previousRemarks: null,
  nextRemarks: null,
  fromSectionId: 'section-a',
  fromShelfId: 'shelf-a',
  toSectionId: 'section-b',
  toShelfId: 'shelf-b',
  relatedLoanId: null,
};
