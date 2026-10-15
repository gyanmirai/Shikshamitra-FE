import { hasAccessSelection, compressAcademicSelectionToScopeRows } from './academicHierarchyUtils';

import type { AccessSelection, AcademicScopeRow } from './academicHierarchyUtils';

export type BulkUserScopeAssignmentScope = AcademicScopeRow;

export type BulkUserScopeAssignmentPayload = {
  academicYearId: string;
  userIds: string[];
  scopes: BulkUserScopeAssignmentScope[];
  clearExisting: boolean;
  description?: string;
};

export type BulkUserScopeAssignmentResult = {
  deletedAssignments?: number;
  assignmentsCreated?: number;
  totalCombinations?: number;
  affectedUserIds?: string[];
  message?: string;
};

export const buildUserScopeBulkAssignPayload = ({
  academicYearId,
  userIds,
  selection,
  allBoards,
  description,
}: {
  academicYearId: string;
  userIds: string[];
  selection: AccessSelection;
  allBoards?: any[];
  description?: string;
}): BulkUserScopeAssignmentPayload => {
  const scopes = compressAcademicSelectionToScopeRows(selection, allBoards);
  if (hasAccessSelection(selection) && scopes.length === 0) {
    throw new Error(
      'The academic permission selection no longer matches the selected academic year. Reload the staff form and select permissions again.'
    );
  }

  return {
    academicYearId,
    userIds,
    scopes,
    clearExisting: scopes.length === 0,
    ...(description ? { description } : {}),
  };
};
