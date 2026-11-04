import type { IFeeStructureData } from './type';

// Unknown editability fails closed, including responses from older servers.
export function assignmentSelectionGroup(
  student: Omit<IFeeStructureData, 'id'>
): string | undefined {
  if (!student.isActive) return undefined;
  if (student.isFeeStructureAssigned || student.assignmentState === 'Assigned')
    return student.canEditStructure && student.structureId && student.structureRevision != null
      ? JSON.stringify([student.structureId, student.structureRevision])
      : undefined;
  return ['Prepared', 'NeedsAttention'].includes(student.assignmentState ?? '')
    ? undefined
    : 'unassigned';
}
