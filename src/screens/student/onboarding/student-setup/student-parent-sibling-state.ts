import type {
  StudentCredentialsWorkspace,
  StudentSiblingParentSelection,
} from 'src/redux/student/onboarding/student-onboarding-types';

export type StudentParentSiblingActivationState = {
  caseId: string;
  loaded: boolean;
  blockedReason?: string;
  selection?: StudentSiblingParentSelection;
};

export function getStudentParentSiblingActivationState(
  caseId: string,
  workspace: StudentCredentialsWorkspace | undefined,
  unavailable: boolean,
  relationship: string
): StudentParentSiblingActivationState {
  if (!workspace || workspace.caseId !== caseId || unavailable) return { caseId, loaded: false };
  const context = workspace.parentSibling;
  if (
    !context?.enabled ||
    context.isLinked ||
    ['NewParent', 'NotRequired'].includes(context.status)
  )
    return { caseId, loaded: true };
  if (context.status === 'ReviewRequired' || !context.familyConfirmed || !context.canLink)
    return {
      caseId,
      loaded: true,
      blockedReason: context.blockedReason || 'Parent linking needs review by authorized staff.',
    };
  const candidates = context.candidates.filter((candidate) =>
    ['father', 'mother'].includes(candidate.relationship)
  );
  const selected = context.selectedRelationship
    ? candidates.find((candidate) => candidate.relationship === context.selectedRelationship)
    : candidates.length === 1
      ? candidates[0]
      : candidates.find((candidate) => candidate.relationship === relationship);
  if (!selected)
    return {
      caseId,
      loaded: true,
      blockedReason:
        context.blockedReason || 'Choose Father or Mother in App Login before activating.',
    };
  return {
    caseId,
    loaded: true,
    selection: {
      relationship: selected.relationship,
      expectedEmail: selected.email,
      expectedUserId: selected.userId,
    },
  };
}
