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

export function assignmentSelectionBlocker(
  student: Omit<IFeeStructureData, 'id'>,
  selectionGroup?: string
): string | undefined {
  if (!student.isActive) return 'This student’s enrollment is inactive.';
  if (student.assignmentState === 'Prepared')
    return 'This student has prepared admission fees. Review prepared fees individually.';
  if (student.assignmentState === 'NeedsAttention')
    return 'This student’s assignment needs attention. Review the issue individually.';
  const group = assignmentSelectionGroup(student);
  if (!group)
    return (
      student.structureEditBlocker ||
      'This student already has a fee structure assigned and cannot be selected for bulk editing.'
    );
  if (selectionGroup && group !== selectionGroup)
    return 'Select students with the same assignment status, fee structure and revision for this batch.';
  return undefined;
}
