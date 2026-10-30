import type { StudentCredentialEmail } from 'src/redux/student/onboarding/student-onboarding-types';

// Failed resends retain the last sender-acceptance timestamp. They still need
// deliberate confirmation, including after an owner-verified address change.
// This controls the action only; the current delivery status stays authoritative.
export const requiresCredentialResendConfirmation = (delivery?: StudentCredentialEmail | null) =>
  delivery?.status === 'Sent' || Boolean(delivery?.sentAt);
