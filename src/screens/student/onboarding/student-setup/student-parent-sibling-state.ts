import type {
  StudentCredentialsWorkspace,
  StudentSiblingParentSelection,
  StudentGuardianAccessSelection,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { getOnboardingMessage } from './student-onboarding-messages';

export type StudentParentSiblingActivationState = {
  caseId: string;
  loaded: boolean;
  blockedReason?: string;
  selection?: StudentSiblingParentSelection;
  guardianAccessSelection?: StudentGuardianAccessSelection;
};

export function getStudentParentSiblingActivationState(
  caseId: string,
  workspace: StudentCredentialsWorkspace | undefined,
  unavailable: boolean,
  relationship: string,
  guardianAccessSelection?: StudentGuardianAccessSelection
): StudentParentSiblingActivationState {
  if (!workspace || workspace.caseId !== caseId || unavailable) return { caseId, loaded: false };
  const context = workspace.parentSibling;
  if (workspace.guardianAccessEnabled === false) return { caseId, loaded: true };
  if (guardianAccessSelection) {
    const guardian = workspace.recipients.find(
      (recipient) => recipient.accountType === 'guardian' && recipient.relationship === 'guardian'
    );
    const linked = workspace.recipients.some(
      (recipient) => recipient.accountType === 'guardian' && recipient.hasLinkedAccount
    );
    if (guardian?.hasLinkedAccount && context?.status !== 'ReviewRequired')
      return { caseId, loaded: true };
    const siblingHandoff = Boolean(context?.enabled && context.candidates.length);
    if (
      !guardianAccessSelection.confirmRecipientAccess &&
      context?.status !== 'ReviewRequired' &&
      !siblingHandoff
    )
      return { caseId, loaded: true };
    if (workspace.guardianAccessEnabled !== true)
      return {
        caseId,
        loaded: true,
        blockedReason:
          'Refresh App Login to load the saved parent/guardian access setting, then confirm the recipient.',
      };
    if (
      context?.isLinked ||
      context?.selectedRelationship ||
      linked ||
      (context?.status === 'ReviewRequired' && !context.guardianAccessSelected) ||
      !guardianAccessSelection.confirmRecipientAccess ||
      !guardian?.email ||
      guardian.email.trim() !== guardianAccessSelection.expectedEmail
    )
      return {
        caseId,
        loaded: true,
        blockedReason: 'Review the saved guardian and confirm app access before activating.',
      };
    return { caseId, loaded: true, guardianAccessSelection };
  }
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
      blockedReason: getOnboardingMessage(
        context.blockedReason,
        'Ask authorized staff to review parent linking.'
      ),
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
      blockedReason: getOnboardingMessage(
        context.blockedReason,
        'Choose Father or Mother in App Login before activating.'
      ),
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
