import type { LibraryCopyEvent } from 'src/redux/library/copy-events-types';

const events: Record<string, string> = {
  ConditionChanged: 'Condition Changed',
  Recovered: 'Copy Recovered',
  NotesChanged: 'Notes Changed',
  Moved: 'Copy Moved',
  WrittenOff: 'Copy Written Off',
  CustodyHandedOff: 'Classroom Handoff',
  CustodyReceived: 'Classroom Return',
  TransferDispatched: 'Campus Transfer Dispatched',
  TransferReceived: 'Campus Transfer Received',
};
const conditions: Record<number, string> = {
  0: 'Available',
  1: 'Issued',
  2: 'Reserved',
  3: 'Lost',
  4: 'Damaged',
  5: 'Under repair',
  6: 'Written off',
  7: 'Classroom custody',
  8: 'In transit',
};
export const copyEventLabel = (eventType: string) => events[eventType] || eventType;
export const copyConditionLabel = (status: number) => conditions[status] || `Status ${status}`;
export function copyEventChanges(event: LibraryCopyEvent) {
  const changes: { field: string; before: string; after: string }[] = [];
  if (event.previousStatus !== event.nextStatus)
    changes.push({
      field: 'Condition',
      before: copyConditionLabel(event.previousStatus),
      after: copyConditionLabel(event.nextStatus),
    });
  if (event.previousRemarks !== event.nextRemarks)
    changes.push({
      field: 'Remarks',
      before: event.previousRemarks || 'Not set',
      after: event.nextRemarks || 'Not set',
    });
  if (event.fromSectionId !== event.toSectionId)
    changes.push({ field: 'Section ID', before: event.fromSectionId, after: event.toSectionId });
  if (event.fromShelfId !== event.toShelfId)
    changes.push({ field: 'Shelf ID', before: event.fromShelfId, after: event.toShelfId });
  return changes;
}
