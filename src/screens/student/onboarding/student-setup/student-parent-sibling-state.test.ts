import type { StudentCredentialsWorkspace } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, expect } from 'vitest';

import { getStudentParentSiblingActivationState } from './student-parent-sibling-state';

const father = {
  relationship: 'father' as const,
  name: 'Raj',
  email: 'parent@example.com',
  userId: 'parent-1',
  setupStatus: 'Ready' as const,
};
const workspace: StudentCredentialsWorkspace = {
  caseId: 'case-1',
  concurrencyStamp: 'stamp',
  recipients: [],
  parentSibling: {
    enabled: true,
    familyConfirmed: true,
    isLinked: false,
    requiresSelection: false,
    canLink: true,
    status: 'Available',
    canRetrySetup: false,
    candidates: [father],
  },
};

it('never activates from a missing, stale, failed or refreshing credential context', () => {
  expect(getStudentParentSiblingActivationState('case-1', undefined, false, '').loaded).toBe(false);
  expect(getStudentParentSiblingActivationState('case-2', workspace, false, '').loaded).toBe(false);
  expect(getStudentParentSiblingActivationState('case-1', workspace, true, '').loaded).toBe(false);
});
it('passes the one existing parent account identity without creating credentials', () => {
  expect(getStudentParentSiblingActivationState('case-1', workspace, false, '')).toEqual({
    caseId: 'case-1',
    loaded: true,
    selection: {
      relationship: 'father',
      expectedEmail: father.email,
      expectedUserId: father.userId,
    },
  });
});
it('requires staff selection when both parent accounts are eligible and preserves the selected identity', () => {
  const both = {
    ...workspace,
    parentSibling: {
      ...workspace.parentSibling!,
      requiresSelection: true,
      candidates: [
        father,
        {
          ...father,
          relationship: 'mother' as const,
          email: 'mother@example.com',
          userId: 'parent-2',
        },
      ],
    },
  };
  expect(getStudentParentSiblingActivationState('case-1', both, false, '').blockedReason).toMatch(
    /Choose Father or Mother/
  );
  expect(
    getStudentParentSiblingActivationState('case-1', both, false, 'mother').selection
  ).toMatchObject({
    relationship: 'mother',
    expectedUserId: 'parent-2',
    expectedEmail: 'mother@example.com',
  });
});
it('fails closed for unconfirmed family, permissions and explicit review blockers', () => {
  [
    { familyConfirmed: false },
    { canLink: false },
    { status: 'ReviewRequired' as const, blockedReason: 'Email conflict.' },
  ].forEach((changes) => {
    const state = getStudentParentSiblingActivationState(
      'case-1',
      { ...workspace, parentSibling: { ...workspace.parentSibling!, ...changes } },
      false,
      'father'
    );
    expect(state.selection).toBeUndefined();
    expect(state.blockedReason).toBeTruthy();
  });
});
it('leaves first-parent, disabled and legacy flows manual without a sibling selection', () => {
  [
    undefined,
    { ...workspace.parentSibling!, enabled: false },
    { ...workspace.parentSibling!, status: 'NewParent' as const },
    { ...workspace.parentSibling!, status: 'NotRequired' as const },
    { ...workspace.parentSibling!, isLinked: true },
  ].forEach((context) => {
    expect(
      getStudentParentSiblingActivationState(
        'case-1',
        { ...workspace, parentSibling: context },
        false,
        ''
      )
    ).toEqual({ caseId: 'case-1', loaded: true });
  });
});
it('preserves the server-selected parent on recovery and never silently swaps the reviewed account', () => {
  const saved = {
    ...workspace,
    parentSibling: {
      ...workspace.parentSibling!,
      selectedRelationship: 'mother' as const,
      candidates: [
        father,
        {
          ...father,
          relationship: 'mother' as const,
          email: 'mother@example.com',
          userId: 'parent-2',
        },
      ],
    },
  };
  expect(
    getStudentParentSiblingActivationState('case-1', saved, false, 'father').selection
  ).toMatchObject({ relationship: 'mother', expectedUserId: 'parent-2' });
  expect(
    getStudentParentSiblingActivationState(
      'case-1',
      { ...saved, parentSibling: { ...saved.parentSibling, candidates: [father] } },
      false,
      'father'
    ).selection
  ).toBeUndefined();
});
