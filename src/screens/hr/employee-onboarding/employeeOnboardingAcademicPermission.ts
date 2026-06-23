import type { BulkUserScopeAssignmentScope } from 'src/utils/userScopeBulkAssignPayload';

export type OnboardingAcademicPermissionStageOption = {
  id: string;
  boardId?: string | null;
  mediumId?: string | null;
};

export type OnboardingAcademicPermissionScopeRowsResult = {
  scopeRows: BulkUserScopeAssignmentScope[];
  unresolvedStageIds: string[];
  isValid: boolean;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const buildOnboardingAcademicPermissionScopeRows = (
  stageIds: string[],
  organizationOptionsById: ReadonlyMap<string, OnboardingAcademicPermissionStageOption>
): OnboardingAcademicPermissionScopeRowsResult => {
  const scopeRows: BulkUserScopeAssignmentScope[] = [];
  const unresolvedStageIds: string[] = [];

  stageIds.forEach((stageId) => {
    const option = organizationOptionsById.get(stageId);

    if (
      !option ||
      !isNonEmptyString(option.id) ||
      !isNonEmptyString(option.boardId) ||
      !isNonEmptyString(option.mediumId)
    ) {
      unresolvedStageIds.push(stageId);
      return;
    }

    scopeRows.push({
      educationBoardId: option.boardId,
      educationMediumId: option.mediumId,
      educationMediumStageId: option.id,
    });
  });

  return {
    scopeRows,
    unresolvedStageIds,
    isValid: stageIds.length > 0 && unresolvedStageIds.length === 0,
  };
};
