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
  guardianAccessEnabled: true,
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
it('passes only an explicitly confirmed current guardian choice instead of reusing a sibling parent', () => {
  const current = {
    ...workspace,
    recipients: [
      {
        accountType: 'guardian' as const,
        relationship: 'guardian' as const,
        name: 'Aunt',
        email: 'aunt@example.test',
        canSend: false,
      },
    ],
  };
  expect(
    getStudentParentSiblingActivationState('case-1', current, false, '', {
      expectedEmail: 'aunt@example.test',
      confirmRecipientAccess: true,
    })
  ).toEqual({
    caseId: 'case-1',
    loaded: true,
    guardianAccessSelection: {
      expectedEmail: 'aunt@example.test',
      confirmRecipientAccess: true,
    },
  });
  expect(
    getStudentParentSiblingActivationState('case-1', current, false, '', {
      expectedEmail: 'stale@example.test',
      confirmRecipientAccess: true,
    }).blockedReason
  ).toBeTruthy();
});

it('retains an already linked guardian without creating a new activation access choice', () => {
  const current = {
    ...workspace,
    recipients: [
      {
        accountType: 'guardian' as const,
        relationship: 'guardian' as const,
        email: 'aunt@example.test',
        canSend: true,
        hasLinkedAccount: true,
      },
    ],
    parentSibling: {
      ...workspace.parentSibling!,
      status: 'NotRequired' as const,
      guardianAccessSelected: true,
      candidates: [],
    },
  };
  expect(
    getStudentParentSiblingActivationState('case-1', current, false, '', {
      expectedEmail: 'aunt@example.test',
      confirmRecipientAccess: false,
    })
  ).toEqual({ caseId: 'case-1', loaded: true });
});

it('does not make an unchecked guardian suggestion block activation when app access is not required', () => {
  const current = {
    ...workspace,
    guardianAccessEnabled: false,
    parentSibling: { ...workspace.parentSibling!, status: 'NotRequired' as const },
  };
  expect(
    getStudentParentSiblingActivationState('case-1', current, false, '', {
      expectedEmail: 'aunt@example.test',
      confirmRecipientAccess: false,
    })
  ).toEqual({ caseId: 'case-1', loaded: true });
});

it('carries a confirmed enabled guardian choice without sibling candidates and ignores an unchecked suggestion', () => {
  const current = {
    ...workspace,
    guardianAccessEnabled: true,
    parentSibling: undefined,
    recipients: [
      {
        accountType: 'guardian' as const,
        relationship: 'guardian' as const,
        email: 'aunt@example.test',
        canSend: false,
      },
    ],
  };
  const choice = { expectedEmail: 'aunt@example.test', confirmRecipientAccess: true };
  expect(getStudentParentSiblingActivationState('case-1', current, false, '', choice)).toEqual({
    caseId: 'case-1',
    loaded: true,
    guardianAccessSelection: choice,
  });
  expect(
    getStudentParentSiblingActivationState('case-1', current, false, '', {
      ...choice,
      confirmRecipientAccess: false,
    })
  ).toEqual({ caseId: 'case-1', loaded: true });
  expect(
    getStudentParentSiblingActivationState(
      'case-1',
      { ...current, guardianAccessEnabled: false },
      false,
      '',
      choice
    )
  ).toEqual({ caseId: 'case-1', loaded: true });
  const unknownPolicy = getStudentParentSiblingActivationState(
    'case-1',
    { ...current, guardianAccessEnabled: undefined },
    false,
    '',
    choice
  );
  expect(unknownPolicy.guardianAccessSelection).toBeUndefined();
  expect(unknownPolicy.blockedReason).toBeTruthy();
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
