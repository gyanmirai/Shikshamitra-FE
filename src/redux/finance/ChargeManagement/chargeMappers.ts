import type { IUpdateChargeFormValues } from 'src/screens/finance/ChargesManagement/Components/UpdateChargeForm/types';

import type { IChargeAudience, IStudentSelection, StudentSelectionMode } from './chargeTypes';

const API_SELECTION_MODE = {
  AllInScope: 0,
  Explicit: 1,
} as const;

export function resolveSelectionMode(
  selectedStudentIds: string[],
  candidateStudentIds: string[]
): StudentSelectionMode {
  if (
    candidateStudentIds.length > 0 &&
    selectedStudentIds.length === candidateStudentIds.length &&
    candidateStudentIds.every((id) => selectedStudentIds.includes(id))
  ) {
    return 'AllInScope';
  }
  return 'Explicit';
}

export function buildAudiencePayload(
  values: IUpdateChargeFormValues,
  candidateStudentIds: string[]
): IChargeAudience {
	const mode: StudentSelectionMode = values.selectionMode === 'all' ? 'AllInScope' : 'Explicit';

  const selection: IStudentSelection =
    mode === 'AllInScope'
		? { mode: API_SELECTION_MODE.AllInScope }
		: { mode: API_SELECTION_MODE.Explicit, studentIds: values.studentIds };

  return {
    scope: {
      boardId: values.boardId,
      educationMediumId: values.educationMediumId,
      classIds: Array.isArray(values.standardId) ? values.standardId : [],
      divisionIds:
        values.divisionIds.length > 0 &&
        Array.isArray(values.standardId) &&
        values.standardId.length === 1
          ? values.divisionIds
          : undefined,
    },
    selection,
  };
}

export function audienceToFormFields(audience?: IChargeAudience) {
  if (!audience) {
    return {
      standardId: [] as string[],
      divisionIds: [] as string[],
      studentIds: [] as string[],
    };
  }

  return {
    standardId: audience.scope.classIds ?? [],
    divisionIds: audience.scope.divisionIds ?? [],
    studentIds:
      audience.selection.mode === 'Explicit' || audience.selection.mode === 1
        ? (audience.selection.studentIds ?? [])
        : [],
  };
}
