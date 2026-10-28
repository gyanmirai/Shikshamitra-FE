// Synthetic local component fixture. These hooks never call the real backend or email sender.
import type {
  SendStudentCredentials,
  StudentCredentialsWorkspace,
  UpdateStudentCredentialsEmail,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { useSyncExternalStore } from 'react';

const scenario = new URLSearchParams(window.location.search).get('scenario') || 'ready';
const listeners = new Set<() => void>();
const requests: string[] = [];
let stamp = 1;
let parentFailed = false;
let responseLost = false;
const parent = {
  accountType: 'guardian' as const,
  relationship: 'father' as const,
  name: 'Naman',
  email: 'naman@example.test',
  canSend: scenario !== 'existing',
  canEditEmail: true,
  emailEditToken: 'profile-preview',
  isMainContact: true,
  blockedReason:
    scenario === 'existing'
      ? 'Confirm and link this existing parent in App Login before sending.'
      : null,
};

let workspace: StudentCredentialsWorkspace = {
  caseId: 'case-preview',
  concurrencyStamp: 'stamp-1',
  guardianAccessEnabled: true,
  recipients: [
    {
      accountType: 'student',
      relationship: 'self',
      name: 'Vinay Sinh',
      email: scenario === 'missing' ? null : 'vinay.sinh@example.test',
      canSend: scenario !== 'missing',
      canEditEmail: true,
      emailEditToken: 'profile-preview',
    },
    parent,
  ],
  ...(scenario === 'existing'
    ? {
        parentSibling: {
          enabled: true,
          familyConfirmed: false,
          requiresOnboardingConfirmation: true,
          isLinked: false,
          requiresSelection: false,
          status: 'Available' as const,
          canRetrySetup: false,
          canLink: true,
          candidates: [
            {
              relationship: 'father' as const,
              name: 'Naman',
              email: parent.email,
              userId: 'parent-preview',
              setupStatus: 'Ready' as const,
            },
          ],
        },
      }
    : {}),
};

if (scenario === 'empty') workspace = { ...workspace, recipients: [] };

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(next: StudentCredentialsWorkspace) {
  workspace = next;
  notify();
  return next;
}

function fixtureFailure(message: string) {
  return Object.assign(new Error(message), { data: { error: { message } } });
}

function checkStamp(value: string) {
  if (value !== workspace.concurrencyStamp) {
    throw fixtureFailure('The case changed. Refresh App Login.');
  }
}

const refetch = async () => ({ data: workspace });

export function useGetStudentOnboardingCredentialsQuery() {
  const data = useSyncExternalStore(subscribe, () => workspace);
  return {
    data: scenario === 'loading' ? undefined : data,
    currentData: scenario === 'loading' ? undefined : data,
    isLoading: scenario === 'loading',
    isFetching: scenario === 'loading',
    isError: scenario === 'error',
    refetch,
  };
}

export function useSendStudentOnboardingCredentialsMutation() {
  const send = (input: SendStudentCredentials) => ({
    unwrap: async () => {
      requests.push(`${input.accountType}:${input.concurrencyStamp}`);
      checkStamp(input.concurrencyStamp);
      if (scenario === 'partial' && input.accountType === 'guardian' && !parentFailed) {
        parentFailed = true;
        notify();
        throw fixtureFailure('The parent email request failed. Try again.');
      }
      stamp += 1;
      const result = update({
        ...workspace,
        concurrencyStamp: `stamp-${stamp}`,
        recipients: workspace.recipients.map((recipient) =>
          recipient.accountType === input.accountType &&
          recipient.relationship === input.relationship
            ? {
                ...recipient,
                canSend: false,
                delivery: {
                  id: `email-${input.accountType}`,
                  accountType: input.accountType,
                  email: input.expectedEmail,
                  status: 'Pending',
                  attemptCount: 0,
                  canSend: false,
                  emailEnabled: true,
                },
              }
            : recipient
        ),
      });
      if (scenario === 'uncertain' && input.accountType === 'student' && !responseLost) {
        responseLost = true;
        throw fixtureFailure('The response was interrupted. Refresh the saved email status.');
      }
      return result;
    },
  });
  return [send, { isLoading: false }] as const;
}

export function useLinkStudentOnboardingParentMutation() {
  const link = (input: { concurrencyStamp: string; confirmExistingParentAccess?: boolean }) => ({
    unwrap: async () => {
      checkStamp(input.concurrencyStamp);
      requests.push(`link:${String(input.confirmExistingParentAccess)}`);
      stamp += 1;
      return update({
        ...workspace,
        concurrencyStamp: `stamp-${stamp}`,
        recipients: workspace.recipients.map((recipient) =>
          recipient.accountType === 'guardian'
            ? {
                ...recipient,
                blockedReason: null,
                hasLinkedAccount: true,
                canSendExistingParentHelp: true,
              }
            : recipient
        ),
        parentSibling: {
          ...workspace.parentSibling!,
          // Direct Onboarding confirmation does not fabricate Admission family provenance.
          familyConfirmed: false,
          requiresOnboardingConfirmation: false,
          isLinked: true,
          linkedRelationship: 'father',
          selectedRelationship: 'father',
          status: 'Linked',
        },
      });
    },
  });
  return [link, { isLoading: false }] as const;
}

export function useUpdateStudentCredentialsEmailMutation() {
  const save = (input: UpdateStudentCredentialsEmail) => ({
    unwrap: async () => {
      checkStamp(input.concurrencyStamp);
      if (input.email === 'office@example.test') {
        throw fixtureFailure(
          'This email already belongs to another account. Use a different email.'
        );
      }
      requests.push(`email:${input.relationship}`);
      stamp += 1;
      return update({
        ...workspace,
        concurrencyStamp: `stamp-${stamp}`,
        recipients: workspace.recipients.map((recipient) =>
          recipient.relationship === input.relationship
            ? { ...recipient, email: input.email, canSend: true }
            : recipient
        ),
      });
    },
  });
  return [save, { isLoading: false }] as const;
}

export const useRetryStudentOnboardingParentSetupMutation = () =>
  [() => ({ unwrap: async () => workspace }), { isLoading: false }] as const;

export function useFixtureRequests() {
  useSyncExternalStore(subscribe, () => `${workspace.concurrencyStamp}:${requests.length}`);
  return requests.join(', ');
}
