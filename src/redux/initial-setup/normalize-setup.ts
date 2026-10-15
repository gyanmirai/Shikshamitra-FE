import type { SetupDraft, InitialSetup } from './types';

export function normalizeSetupDraft(draft: SetupDraft): SetupDraft {
  return {
    profile: draft.profile,
    yearName: draft.yearName,
    existingYearId: draft.existingYearId ?? null,
    startDate: draft.startDate,
    endDate: draft.endDate,
    boardType: draft.boardType,
    customBoardName: draft.customBoardName ?? '',
    medium: draft.medium,
    stage: draft.stage,
    className: draft.className,
    ageLowerLimit: draft.ageLowerLimit,
    divisionName: draft.divisionName,
    strength: draft.strength,
  };
}

export function normalizeInitialSetup(response: InitialSetup): InitialSetup {
  return { ...response, draft: normalizeSetupDraft(response.draft) };
}

export function normalizeSetupInput(input: Record<string, unknown>): Record<string, unknown> {
  if (!input.draft || typeof input.draft !== 'object') return input;
  return { ...input, draft: normalizeSetupDraft(input.draft as SetupDraft) };
}
